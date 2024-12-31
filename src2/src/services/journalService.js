// services/journalService.js
import { JournalEntry } from '../models/JournalEntry.js';
import { JournalMetric } from '../models/JournalMetric.js';
import { startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';

class JournalService {
  async getEntriesWithMetrics(userId, startDate, endDate) {
    const entries = await JournalEntry.find({
      userId,
      date: {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate)
      }
    }).sort({ date: 1 });

    const metrics = await JournalMetric.find({
      userId,
      date: {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate)
      }
    });

    // Agrupar métricas por fecha y tipo
    const metricsByDateAndType = metrics.reduce((acc, metric) => {
      const dateKey = metric.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {};
      }
      if (!acc[dateKey][metric.type]) {
        acc[dateKey][metric.type] = {};
      }
      acc[dateKey][metric.type][metric.metricId] = metric.value;
      return acc;
    }, {});

    // Combinar entradas con sus métricas correspondientes
    return entries.map(entry => {
      const dateKey = entry.date.toISOString().split('T')[0];
      return {
        ...entry.toObject(),
        metrics: metricsByDateAndType[dateKey]?.[entry.type] || {}
      };
    });
  }

  async createEntry(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Crear la entrada del diario
      const entry = new JournalEntry({
        userId: data.userId,
        date: startOfDay(data.date),
        type: data.type,
        content: data.content
      });

      await entry.save({ session });

      // Crear las métricas asociadas
      const metricPromises = Object.entries(data.metrics).map(([metricId, value]) => {
        const metric = new JournalMetric({
          userId: data.userId,
          metricId,
          value,
          date: startOfDay(data.date),
          type: data.type
        });
        return metric.save({ session });
      });

      await Promise.all(metricPromises);

      await session.commitTransaction();

      return {
        ...entry.toObject(),
        metrics: data.metrics
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateEntry(userId, date, type, data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Actualizar la entrada
      const entry = await JournalEntry.findOneAndUpdate(
        {
          userId,
          date: startOfDay(date),
          type
        },
        { content: data.content },
        { session, new: true }
      );

      if (!entry) {
        throw new Error('Entry not found');
      }

      // Actualizar métricas si se proporcionaron
      if (data.metrics) {
        const updatePromises = Object.entries(data.metrics).map(([metricId, value]) => {
          return JournalMetric.findOneAndUpdate(
            {
              userId,
              date: startOfDay(date),
              type,
              metricId
            },
            {
              value,
              updatedAt: new Date()
            },
            { 
              session,
              upsert: true,
              new: true
            }
          );
        });

        await Promise.all(updatePromises);
      }

      await session.commitTransaction();

      return {
        ...entry.toObject(),
        metrics: data.metrics || {}
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getMetricsStats(userId, startDate, endDate) {
    return JournalMetric.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfDay(startDate),
            $lte: endOfDay(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            metricId: '$metricId',
            type: '$type'
          },
          average: { $avg: '$value' },
          min: { $min: '$value' },
          max: { $max: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async deleteEntry(userId, date, type) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const deletePromises = [
        // Eliminar la entrada
        JournalEntry.deleteOne({
          userId,
          date: startOfDay(date),
          type
        }).session(session),

        // Eliminar las métricas asociadas
        JournalMetric.deleteMany({
          userId,
          date: startOfDay(date),
          type
        }).session(session)
      ];

      await Promise.all(deletePromises);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const journalService = new JournalService();
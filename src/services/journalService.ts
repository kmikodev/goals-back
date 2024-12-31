// services/journalService.js
import { JournalEntry } from '../models/JournalEntry.js';
import { JournalMetric } from '../models/JournalMetric.js';
import { startOfDay, endOfDay } from 'date-fns';

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
    let entry = null;
    let createdMetrics = [];

    try {
      // First check if entry already exists
      const existingEntry = await JournalEntry.findOne({
        userId: data.userId,
        date: startOfDay(data.date),
        type: data.type
      });

      if (existingEntry) {
        throw new Error('An entry already exists for this date and type');
      }

      // Create the entry
      entry = new JournalEntry({
        userId: data.userId,
        date: startOfDay(data.date),
        type: data.type,
        content: data.content
      });

      await entry.save();

      // Create metrics one by one and keep track of created ones
      for (const [metricId, value] of Object.entries(data.metrics)) {
        const metric = new JournalMetric({
          userId: data.userId,
          metricId,
          value,
          date: startOfDay(data.date),
          type: data.type
        });
        const savedMetric = await metric.save();
        createdMetrics.push(savedMetric);
      }

      return {
        ...entry.toObject(),
        metrics: data.metrics
      };

    } catch (error) {
      // Enhanced cleanup handling
      try {
        // Only attempt cleanup if we actually created something
        if (entry?._id) {
          await JournalEntry.deleteOne({ _id: entry._id });
        }
        
        // Clean up any metrics we created
        if (createdMetrics.length > 0) {
          await JournalMetric.deleteMany({
            _id: { $in: createdMetrics.map(m => m._id) }
          });
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }

      // If it's a duplicate key error, provide a more specific error message
      if (error.code === 11000) {
        throw new Error('An entry already exists for this date and type');
      }
      throw error;
    }
  }

  async updateEntry(userId, date, type, data) {
    try {
      // Primero verificamos si la entrada existe
      const existingEntry = await JournalEntry.findOne({
        userId,
        date: startOfDay(date),
        type
      });

      if (!existingEntry) {
        throw new Error('Entry not found');
      }

      // Actualizamos la entrada
      const entry = await JournalEntry.findOneAndUpdate(
        {
          userId,
          date: startOfDay(date),
          type
        },
        { content: data.content },
        { new: true }
      );

      // Actualizamos las métricas si se proporcionaron
      if (data.metrics) {
        // Primero eliminamos las métricas existentes
        await JournalMetric.deleteMany({
          userId,
          date: startOfDay(date),
          type
        });

        // Luego creamos las nuevas
        for (const [metricId, value] of Object.entries(data.metrics)) {
          const metric = new JournalMetric({
            userId,
            metricId,
            value,
            date: startOfDay(date),
            type
          });
          await metric.save();
        }
      }

      return {
        ...entry.toObject(),
        metrics: data.metrics || {}
      };
    } catch (error) {
      throw error;
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
    try {
      // Eliminamos tanto la entrada como las métricas
      await JournalEntry.deleteOne({
        userId,
        date: startOfDay(date),
        type
      });

      await JournalMetric.deleteMany({
        userId,
        date: startOfDay(date),
        type
      });
    } catch (error) {
      throw error;
    }
  }
}

export const journalService = new JournalService();
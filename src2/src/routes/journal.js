
import express from 'express';
import { verifyToken } from '../middleware/auth';
import { journalService } from '../services/journalService';
import { startOfDay, addDays, parseISO } from 'date-fns';

const router = express.Router();

// Obtener entradas del diario para un rango de fechas
router.get('/:startDate', verifyToken, async (req, res) => {
  try {
    const startDate = parseISO(req.params.startDate);
    const endDate = addDays(startDate, 7);
    
    const entries = await journalService.getEntriesWithMetrics(
      req.user.uid,
      startDate,
      endDate
    );

    res.json(entries);
  } catch (error) {
    console.error('Error getting journal entries:', error);
    res.status(500).json({ error: 'Failed to get journal entries' });
  }
});

// Crear nueva entrada
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, type, content, metrics } = req.body;

    const entry = await journalService.createEntry({
      userId: req.user.uid,
      date: new Date(date),
      type,
      content,
      metrics
    });

    res.json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    
    if (error.code === 11000) {
      res.status(409).json({ 
        error: 'Ya existe una entrada para esta fecha y momento del día' 
      });
    } else {
      res.status(500).json({ error: 'Failed to create journal entry' });
    }
  }
});

// Actualizar entrada existente
router.put('/:date/:type', verifyToken, async (req, res) => {
  try {
    const { date, type } = req.params;
    const { content, metrics } = req.body;

    const entry = await journalService.updateEntry(
      req.user.uid,
      new Date(date),
      type,
      { content, metrics }
    );

    res.json(entry);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Eliminar entrada
router.delete('/:date/:type', verifyToken, async (req, res) => {
  try {
    const { date, type } = req.params;

    await journalService.deleteEntry(
      req.user.uid,
      new Date(date),
      type
    );

    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// Obtener estadísticas de métricas
router.get('/stats/:startDate/:endDate', verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const stats = await journalService.getMetricsStats(
      req.user.uid,
      new Date(startDate),
      new Date(endDate)
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting metrics stats:', error);
    res.status(500).json({ error: 'Failed to get metrics stats' });
  }
});

export default router;
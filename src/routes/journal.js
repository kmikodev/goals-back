import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { JournalEntry } from '../models/JournalEntry.js';

const router = express.Router();

// Get journal entries for a week
router.get('/:date', verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.uid;
    
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const entries = await JournalEntry.find({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ date: 1 });

    res.json(entries);
  } catch (error) {
    console.error('Error getting journal entries:', error);
    res.status(500).json({ error: 'Failed to get journal entries' });
  }
});

// Create/Update journal entry
router.post('/', verifyToken, async (req, res) => {
  try {
    const { date, type, content, metrics } = req.body;
    const userId = req.user.uid;

    const entry = new JournalEntry({
      userId,
      date: new Date(date),
      type,
      content,
      metrics
    });

    await entry.save();
    res.json(entry);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

export default router;
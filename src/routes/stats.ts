import express from 'express';
import { verifyToken } from '../middleware/auth';
import { JournalEntry } from '../models/JournalEntry';
import { Challenge } from '../models/Challenge';

const router = express.Router();

// Get user stats (streak, completed challenges, mood)
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get current streak
    const entries = await JournalEntry.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    let streak = 0;
    let lastDate = new Date();

    for (const entry of entries) {
      const diffDays = Math.floor((lastDate - entry.date) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streak++;
        lastDate = entry.date;
      } else {
        break;
      }
    }

    // Get completed challenges
    const completedChallenges = await Challenge.countDocuments({
      userId,
      isCompleted: true
    });

    // Get weekly mood
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const weeklyMood = await JournalEntry.find({
      userId,
      date: { $gte: startDate }
    })
    .select('date metrics.mood')
    .sort({ date: 1 });

    res.json({
      streak,
      completedChallenges,
      weeklyMood
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
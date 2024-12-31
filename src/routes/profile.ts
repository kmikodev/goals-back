import express from 'express';
import { verifyToken } from '../middleware/auth';
import { User } from '../models/User';

const router = express.Router();

// Get user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = await User.findOne({ firebaseId: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.patch('/', verifyToken, async (req, res) => {
  try {
    const { bio, expectations, darkMode, language, notifications } = req.body;
    const userId = req.user.uid;
    
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (expectations !== undefined) updateData.expectations = expectations;
    if (darkMode !== undefined) updateData.darkMode = darkMode;
    if (language !== undefined) updateData.language = language;
    if (notifications !== undefined) updateData.notifications = notifications;

    const user = await User.findOneAndUpdate(
      { firebaseId: userId },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
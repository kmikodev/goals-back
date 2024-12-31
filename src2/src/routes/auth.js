import express from 'express';
import { auth } from '../config/firebase.js';
import { verifyAndCreateUser, createOrUpdateUser } from '../services/authService.js';
import { handleSocialAuth } from '../services/socialAuthService.js';
import { User } from '../models/User.js';

const router = express.Router();

// Email/Password Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    const user = await createOrUpdateUser({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName
    });

    const token = await auth.createCustomToken(userRecord.uid);
    res.json({ user, token });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(400).json({ error: error.message });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    const user = await verifyAndCreateUser(idToken);
    res.json({ user });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Google Sign In
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await handleSocialAuth('google', idToken);
    res.json(authResult);
  } catch (error) {
    console.error('Error in Google auth:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Apple Sign In
router.post('/apple', async (req, res) => {
  try {
    const { idToken } = req.body;
    const authResult = await handleSocialAuth('apple', idToken);
    res.json(authResult);
  } catch (error) {
    console.error('Error in Apple auth:', error);
    res.status(401).json({ error: 'Apple authentication failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const user = await User.findOne({ firebaseId: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
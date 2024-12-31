import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { corsMiddleware } from './config/cors.js';

import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import goalsRoutes from './routes/goals.js';
import statsRoutes from './routes/stats.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 3000;

// Apply CORS middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/profile', profileRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
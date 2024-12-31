import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { corsMiddleware } from './config/cors';

import authRoutes from './routes/auth';
import journalRoutes from './routes/journal';
import goalsRoutes from './routes/goals';
import statsRoutes from './routes/stats';
import profileRoutes from './routes/profile';

dotenv.config();
console.log('Hello from goals-back/src/index.ts');
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
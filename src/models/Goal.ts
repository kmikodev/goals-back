import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: String,
    enum: ['short', 'medium', 'long'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  prompt: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Goal = mongoose.model('Goal', goalSchema);
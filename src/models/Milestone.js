import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Milestone = mongoose.model('Milestone', milestoneSchema);
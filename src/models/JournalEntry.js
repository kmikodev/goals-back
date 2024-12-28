import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  },
  content: String,
  metrics: {
    mood: Number,
    energy: Number,
    motivation: Number,
    accomplishment: Number,
    reflection: Number
  }
}, {
  timestamps: true
});

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
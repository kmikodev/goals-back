
// models/JournalEntry.ts
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
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compuesto único para evitar entradas duplicadas del mismo tipo en el mismo día
journalEntrySchema.index({ userId: 1, date: 1, type: 1 }, { unique: true });

export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
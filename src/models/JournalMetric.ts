
///////////////////////////////////////////////////////////////////////////////
// models/JournalMetric.ts
import mongoose from 'mongoose';

const journalMetricSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  metricId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['morning', 'evening'],
    required: true
  }
}, {
  timestamps: true
});

// Compuesto único para evitar duplicados
journalMetricSchema.index({ userId: 1, metricId: 1, date: 1, type: 1 }, { unique: true });

export const JournalMetric = mongoose.model('JournalMetric', journalMetricSchema);

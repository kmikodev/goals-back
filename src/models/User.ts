import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  photoURL: String,
  provider: {
    type: String,
    enum: ['password', 'google', 'apple'],
    default: 'password'
  },
  bio: {
    type: String,
    default: ''
  },
  expectations: {
    type: String,
    default: ''
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['es', 'en'],
    default: 'es'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
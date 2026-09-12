import mongoose from 'mongoose';

const CATEGORIES = [
  'anxiety', 'depression', 'stress', 'exam_pressure',
  'bullying', 'loneliness', 'family_issues',
  'self_esteem', 'trauma', 'other'
];

const zenSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    default: 'New Conversation',
    maxlength: 80,
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'other',
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  // Passive mood score — set when user clicks "Feeling good 😊" (POST_STORY action)
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    default: null,
  },
}, { timestamps: true });

// Fast sidebar listing — newest first per user
zenSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ZenSession', zenSessionSchema);

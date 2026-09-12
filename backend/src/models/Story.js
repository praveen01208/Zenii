import mongoose from 'mongoose';

const CATEGORIES = [
  'anxiety', 'depression', 'stress', 'exam_pressure',
  'bullying', 'loneliness', 'family_issues',
  'self_esteem', 'trauma', 'other'
];

const storySchema = new mongoose.Schema({
  story: {
    type: String,
    required: true,
    minlength: 30,
    maxlength: 600,
  },
  author: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5,
  },
  // Community stories extension
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'other',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null = admin-seeded story
  },
  isApproved: {
    type: Boolean,
    default: false, // Admin must approve all user-submitted stories
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Index for efficient approved-story queries by category
storySchema.index({ isApproved: 1, category: 1, createdAt: -1 });

export default mongoose.model('Story', storySchema);

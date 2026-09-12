import mongoose from 'mongoose';

const dailyMoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  note: {
    type: String,
    default: '',
    maxlength: 200,
  },
  // Date without time — used to enforce one entry per day
  day: {
    type: String, // 'YYYY-MM-DD'
    required: true,
  },
}, { timestamps: true });

// One mood entry per user per day
dailyMoodSchema.index({ userId: 1, day: 1 }, { unique: true });

export default mongoose.model('DailyMood', dailyMoodSchema);

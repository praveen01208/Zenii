import mongoose from 'mongoose';

const completionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'YYYY-MM-DD' IST
}, { _id: false });

const wellnessGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:  { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    category: {
      type: String,
      enum: ['mindfulness', 'exercise', 'sleep', 'journaling', 'nutrition',
             'social', 'learning', 'breathing', 'gratitude', 'other'],
      default: 'other',
    },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    targetDays: { type: Number, default: 21, min: 1, max: 365 }, // 21-day challenge default

    completions: [completionSchema],   // list of completed dates

    // Derived fields — updated on each completion
    currentStreak:  { type: Number, default: 0 },
    longestStreak:  { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },

    isActive:   { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },

    // Goal colour (for card UI)
    color: { type: String, default: '#0d5d3a' },
  },
  { timestamps: true }
);

wellnessGoalSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('WellnessGoal', wellnessGoalSchema);

import mongoose from 'mongoose';

const weeklyInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Week identifier: ISO date of the Sunday that started this week (YYYY-MM-DD)
    weekOf: { type: String, required: true }, // e.g. '2026-05-12'

    // Raw aggregated data (stored for debugging / re-generation)
    moodSummary: {
      avgMood:       { type: Number, default: null },   // 1–5 avg of journal entries
      entryCount:    { type: Number, default: 0 },
      dominantTone:  { type: String, default: '' },     // 'positive' | 'neutral' | 'negative'
      recurringTags: [{ type: String }],                // top keyword tags across entries
    },
    goalSummary: {
      totalGoals:       { type: Number, default: 0 },
      completedThisWeek: { type: Number, default: 0 },
      completionRate:   { type: Number, default: 0 },   // 0–100 %
    },
    sessionSummary: {
      zenSessions:     { type: Number, default: 0 },    // Zeni AI chat sessions
      therapySessions: { type: Number, default: 0 },    // booked therapy sessions completed
    },
    resourceSummary: {
      viewed: { type: Number, default: 0 },
    },

    // Groq-generated 3-paragraph insight text
    aiText: {
      weekInReview:   { type: String, default: '' }, // "Your week in review: ..."
      weNoticed:      { type: String, default: '' }, // "We noticed: ..." (patterns)
      thisTryTry:     { type: String, default: '' }, // "This week, try: ..." (recommendations)
    },

    // Resource links surfaced in the recommendation paragraph
    resourceLinks: [
      {
        title: { type: String },
        type:  { type: String },
        url:   { type: String },
        id:    { type: mongoose.Schema.Types.ObjectId },
      }
    ],

    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One insight per user per week
weeklyInsightSchema.index({ userId: 1, weekOf: 1 }, { unique: true });
weeklyInsightSchema.index({ userId: 1, generatedAt: -1 });

export default mongoose.model('WeeklyInsight', weeklyInsightSchema);

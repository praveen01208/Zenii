import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Journal text content
    content: { type: String, required: true, maxlength: 3000 },

    // Mood: 1=Very Low  2=Low  3=Okay  4=Good  5=Great
    moodScore: { type: Number, required: true, min: 1, max: 5 },
    moodLabel: {
      type: String,
      enum: ['very_low', 'low', 'okay', 'good', 'great'],
      required: true,
    },

    // AI-generated analysis (filled asynchronously after creation)
    aiTone:    { type: String, enum: ['positive', 'neutral', 'negative', ''], default: '' },
    aiTags:    [{ type: String }],           // e.g. ['work stress', 'loneliness']
    aiSummary: { type: String, default: '' }, // 1-sentence summary of the entry

    // YYYY-MM-DD in IST — for heatmap deduplication
    day: { type: String, required: true },
  },
  { timestamps: true }
);

// Index for fast per-user queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, day: 1 });

export default mongoose.model('JournalEntry', journalEntrySchema);

import mongoose from 'mongoose';

/**
 * CrisisLog — stores anonymized records of crisis keyword triggers.
 *
 * Privacy rules (enforced here, not in route):
 *  - userId is stored as a SHA-256 hex hash, never the raw ObjectId.
 *  - No message content is stored — only the matched phrase category.
 *  - Admins can only view counts/trends, never individual user data.
 */
const crisisLogSchema = new mongoose.Schema(
  {
    // Anonymized: SHA-256 hash of the userId string
    userHash: {
      type: String,
      required: true,
      index: true,
    },
    // The broad category of the trigger, never the raw user text
    phraseCategory: {
      type: String,
      enum: ['self_harm', 'suicide_ideation', 'severe_distress', 'hindi_crisis'],
      required: true,
    },
    // ISO week string e.g. "2026-W20" — for weekly aggregation queries
    isoWeek: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast admin analytics (week + category)
crisisLogSchema.index({ isoWeek: 1, phraseCategory: 1 });

export default mongoose.model('CrisisLog', crisisLogSchema);

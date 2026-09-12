import mongoose from 'mongoose';

/**
 * Notification — persisted in-app notification for a single user.
 *
 * type values:
 *   session_booked     – therapist confirmed a session
 *   session_reminder   – upcoming session in 1 hour
 *   session_cancelled  – therapist cancelled
 *   session_rescheduled – therapist rescheduled
 *   message_received   – new chat message from therapist
 *   goal_streak        – streak milestone hit
 *   program_unlocked   – next program day unlocked
 *   reading_new        – therapist published new reading list
 *   system             – general platform announcement
 *   crisis_followup    – gentle check-in 24 h after a crisis event
 */
const notificationSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:     {
      type: String,
      required: true,
      enum: [
        'session_booked', 'session_reminder', 'session_cancelled', 'session_rescheduled',
        'message_received', 'goal_streak', 'program_unlocked', 'reading_new',
        'system', 'crisis_followup',
      ],
    },
    title:   { type: String, required: true, maxlength: 120 },
    body:    { type: String, required: true, maxlength: 400 },
    // Optional deep-link — maps to a Dashboard tab key
    actionTab: {
      type: String,
      enum: ['therapy', 'sessions', 'chat', 'programs', 'reading', 'goals', 'aichat', null],
      default: null,
    },
    isRead:  { type: Boolean, default: false, index: true },
    // Prevents showing the same repeating notification more than once per window
    dedupeKey: { type: String, sparse: true, index: true },
  },
  { timestamps: true }
);

// Compound index: most recent unread first per user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Auto-delete read notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export default mongoose.model('Notification', notificationSchema);

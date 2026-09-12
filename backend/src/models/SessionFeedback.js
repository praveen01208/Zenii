import mongoose from 'mongoose';

/**
 * SessionFeedback — post-session mood rating and takeaways.
 * Created by user after session status becomes 'completed'.
 */
const sessionFeedbackSchema = new mongoose.Schema(
  {
    sessionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    therapistName:{ type: String, required: true },
    sessionDate:  { type: Date, required: true },
    // 1–10 mood rating
    moodRating:   { type: Number, required: true, min: 1, max: 10 },
    // User's private takeaways text
    takeaways:    { type: String, default: '', maxlength: 3000 },
    // AI-suggested resources (array of { title, url })
    suggestedResources: [{ title: String, url: String }],
  },
  { timestamps: true }
);

export default mongoose.model('SessionFeedback', sessionFeedbackSchema);

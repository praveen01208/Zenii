import mongoose from 'mongoose';

/**
 * SessionPrep — AI-generated reflection prompts + user response
 * created when a session is < 24h away.
 */
const sessionPrepSchema = new mongoose.Schema(
  {
    sessionId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, unique: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    therapistName:{ type: String, required: true },
    specialty:    { type: String, default: '' },
    sessionDate:  { type: Date, required: true },
    // AI-generated reflection prompts (array of 3 strings)
    prompts:      { type: [String], default: [] },
    // User's written intention/response
    userResponse: { type: String, default: '', maxlength: 2000 },
    promptsSavedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('SessionPrep', sessionPrepSchema);

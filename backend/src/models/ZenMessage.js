import mongoose from 'mongoose';

const zenMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ZenSession',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Action tag detected in this message (for restoring button state)
  action: {
    type: String,
    enum: ['STORY_BUTTONS', 'POST_STORY', 'THERAPY_BUTTON', 'CRISIS', null],
    default: null,
  },
}, { timestamps: true });

// Fast sequential load of a session's messages
zenMessageSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.model('ZenMessage', zenMessageSchema);

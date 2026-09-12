import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
  },
  clearedByUserAt: {
    type: Date,
    default: null,
  },
  clearedByTherapistAt: {
    type: Date,
    default: null,
  },
  isHiddenForTherapist: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Prevent duplicate chat rooms between the same user and therapist
chatSchema.index({ user: 1, therapist: 1 }, { unique: true });

export default mongoose.model('Chat', chatSchema);

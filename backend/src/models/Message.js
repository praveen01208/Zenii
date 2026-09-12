import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  senderModel: {
    type: String,
    enum: ['User', 'Therapist'],
    required: true,
  },
  encryptedContent: {
    type: String,
    required: true,
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  deletedForEveryone: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for fast querying by chat
messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);

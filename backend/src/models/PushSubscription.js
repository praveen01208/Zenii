import mongoose from 'mongoose';

// Stores browser push subscriptions (one per user per browser)
const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
  { timestamps: true }
);

// endpoint is unique per browser — update on re-subscribe
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
pushSubscriptionSchema.index({ userId: 1 });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);

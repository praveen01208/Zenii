import mongoose from 'mongoose';

const userDownloadSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assetId:     { type: mongoose.Schema.Types.ObjectId, ref: 'StoreAsset', required: true },
    purchasedAt: { type: Date, default: Date.now },
    paymentId:   { type: String, default: '' }, // Razorpay payment_id for paid items
    orderId:     { type: String, default: '' },  // Razorpay order_id
    amountPaid:  { type: Number, default: 0 },   // INR amount actually paid
  },
  { timestamps: true }
);

// Compound unique index: a user can only "own" each asset once
userDownloadSchema.index({ userId: 1, assetId: 1 }, { unique: true });

export default mongoose.model('UserDownload', userDownloadSchema);

import mongoose from 'mongoose';

const storeAssetSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    // File stored as base64 in DB (same pattern as Resource model)
    fileData:  { type: String, default: '' }, // base64
    fileMime:  { type: String, default: '' }, // e.g. 'application/pdf'
    fileName:  { type: String, default: '' }, // original filename for download

    // Pricing: 0 = free, > 0 = paid (in INR paise for Razorpay)
    price: { type: Number, default: 0, min: 0 }, // stored in INR (e.g. 49 = ₹49)

    // Category tag for display
    category: { type: String, default: 'Wellness' },

    // Tracking
    downloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('StoreAsset', storeAssetSchema);

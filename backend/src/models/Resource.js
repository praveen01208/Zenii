import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: '', trim: true },
    type:         { type: String, enum: ['video', 'audio', 'image', 'link'], required: true },
    sourceType:   { type: String, enum: ['upload', 'youtube', 'url'], required: true },

    // For URL/YouTube resources
    url: { type: String, default: '' },

    // For uploaded files (base64 stored in DB — fine for moderate-size files)
    fileData: { type: String, default: '' },   // base64
    fileMime: { type: String, default: '' },   // e.g. 'video/mp4'

    // Thumbnail (for links / uploaded images shown as cards)
    thumbnailData: { type: String, default: '' },
    thumbnailMime: { type: String, default: '' },

    // Extracted from YouTube URL automatically
    youtubeVideoId: { type: String, default: '' },

    // Categorisation
    tags: [{ type: String, index: true }],

    // Engagement
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

resourceSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model('Resource', resourceSchema);

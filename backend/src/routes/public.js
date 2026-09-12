import { Router } from 'express';
import { z } from 'zod';
import Story from '../models/Story.js';
import SiteSettings from '../models/SiteSettings.js';
import { Therapist } from '../models/Therapist.js';

const router = Router();

/* ── GET /public/stories ── */
router.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).lean();
    return res.json(stories);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

/* ── POST /public/stories ── */
const storySchema = z.object({
  story: z.string().min(5),
  author: z.string().min(2),
  rating: z.coerce.number().min(1).max(5).optional(),
});

router.post('/stories', async (req, res) => {
  try {
    const parsed = storySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

    const newStory = await Story.create(parsed.data);
    return res.json({ ok: true, story: newStory });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create story' });
  }
});

/* ── GET /public/therapists ── */
router.get('/therapists', async (req, res) => {
  try {
    const therapists = await Therapist.aggregate([
      { $match: { isSuspended: false } },
      {
        $lookup: {
          from: 'sessions',
          let: { therapistId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$therapist', '$$therapistId'] }, rating: { $exists: true, $ne: null } } },
            { $sort: { createdAt: -1 } },
            { 
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
              }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
            { 
              $project: { 
                rating: 1, 
                review: 1, 
                date: 1,
                userName: '$userInfo.name'
              } 
            }
          ],
          as: 'reviews'
        }
      },
      {
        $addFields: {
          ratingAverage: { $avg: '$reviews.rating' },
          ratingCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          password: 0, 
          aadharNumber: 0, 
          identityCardType: 0, 
          identityCardImage: 0, 
          residentialAddress: 0
        }
      }
    ]);
    return res.json({ ok: true, therapists });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ── GET /public/settings ── */
router.get('/settings', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().lean();
    return res.json(settings || {});
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;

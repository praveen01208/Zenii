import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Story from '../models/Story.js';
import User from '../models/User.js';

const router = Router();

// ── GET /api/community-stories
// Public read — returns approved stories, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const query = { isApproved: true };
    if (category && category !== 'all') query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [stories, total] = await Promise.all([
      Story.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('story author category likes isAnonymous createdAt userId'),
      Story.countDocuments(query),
    ]);

    res.json({ stories, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// ── POST /api/community-stories
// Submit a new community story (requires auth, goes to admin pending queue)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { story, category, isAnonymous } = req.body;
    if (!story || story.trim().length < 30) {
      return res.status(400).json({ error: 'Story must be at least 30 characters' });
    }
    if (story.trim().length > 600) {
      return res.status(400).json({ error: 'Story must be under 600 characters' });
    }

    const validCategories = [
      'anxiety', 'depression', 'stress', 'exam_pressure',
      'bullying', 'loneliness', 'family_issues', 'self_esteem', 'trauma', 'other'
    ];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Fetch user name and tier for author field and limits
    const user = await User.findById(req.user.id).select('name subscriptionTier').lean();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    // Everything is free — all users can post stories

    const authorName = user.name || 'ZenMind User';

    const newStory = await Story.create({
      story: story.trim(),
      author: isAnonymous ? 'Anonymous' : authorName,
      category: category || 'other',
      userId: req.user.id,
      isAnonymous: !!isAnonymous,
      isApproved: false,
      rating: 5,
    });

    res.status(201).json({
      ok: true,
      message: 'Your story has been submitted and is pending admin review. Thank you for sharing! 💚',
      storyId: newStory._id,
    });
  } catch (err) {
    console.error('[CommunityStories] submit error:', err.message);
    res.status(500).json({ error: 'Failed to submit story' });
  }
});

// ── PATCH /api/community-stories/:id/like
// Toggle like on a story (auth required, one like per user)
router.patch('/:id/like', requireAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story || !story.isApproved) return res.status(404).json({ error: 'Story not found' });

    const userId = req.user.id;
    const hasLiked = story.likedBy.some(id => id.toString() === userId);

    if (hasLiked) {
      // Unlike
      story.likedBy = story.likedBy.filter(id => id.toString() !== userId);
      story.likes = Math.max(0, story.likes - 1);
    } else {
      // Like
      story.likedBy.push(userId);
      story.likes += 1;
    }
    await story.save();

    res.json({ ok: true, likes: story.likes, liked: !hasLiked });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

export default router;

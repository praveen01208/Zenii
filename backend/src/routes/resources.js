import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from './admin.js';
import Resource from '../models/Resource.js';
import User from '../models/User.js';

const router = Router();

/* ── helpers ── */
function extractYoutubeId(url) {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return '';
}

/* ═══════════════════════════════════════════════════════════════
   USER-FACING ROUTES
═══════════════════════════════════════════════════════════════ */

/* GET /api/resources — list all resources with optional filters */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type, sort = 'newest', search } = req.query;

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    let sortOpt = { createdAt: -1 };
    if (sort === 'oldest') sortOpt = { createdAt: 1 };
    if (sort === 'popular') sortOpt = { views: -1 };

    const resources = await Resource.find(query)
      .sort(sortOpt)
      .select('-fileData -thumbnailData') // strip heavy base64 from list
      .lean();

    // Attach lightweight flags (fileMime still included for type detection)
    // Also return hasFile so front-end knows whether to show upload player
    const mapped = resources.map(r => ({
      ...r,
      hasFile: !!(r.fileMime),          // true = uploaded file exists
      hasThumbnail: !!(r.thumbnailMime), // true = thumbnail binary exists
    }));

    res.json({ ok: true, resources: mapped });
  } catch (err) {
    console.error('[Resources] list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/* GET /api/resources/:id/file — stream the raw file (video/audio/image) */
router.get('/:id/file', requireAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).select('fileData fileMime').lean();
    if (!resource || !resource.fileData) return res.status(404).json({ error: 'File not found' });

    const buf = Buffer.from(resource.fileData, 'base64');
    res.set('Content-Type', resource.fileMime);
    res.set('Content-Length', buf.length);
    res.set('Cache-Control', 'private, max-age=3600');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: 'Failed to stream file' });
  }
});

/* GET /api/resources/:id/thumbnail — stream the thumbnail image */
router.get('/:id/thumbnail', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).select('thumbnailData thumbnailMime').lean();
    if (!resource || !resource.thumbnailData) return res.status(404).json({ error: 'Thumbnail not found' });

    const buf = Buffer.from(resource.thumbnailData, 'base64');
    res.set('Content-Type', resource.thumbnailMime);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: 'Failed to stream thumbnail' });
  }
});

/* POST /api/resources/:id/view — increment view count */
router.post('/:id/view', requireAuth, async (req, res) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record view' });
  }
});

/* POST /api/resources/:id/favourite — toggle user favourite */
router.post('/:id/favourite', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const favs = user.favouriteResources || [];
    const idx = favs.findIndex(id => id.toString() === req.params.id);

    let added;
    if (idx === -1) {
      favs.push(req.params.id);
      added = true;
    } else {
      favs.splice(idx, 1);
      added = false;
    }
    user.favouriteResources = favs;
    await user.save();

    res.json({ ok: true, added, favouriteResources: favs.map(String) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update favourite' });
  }
});

/* GET /api/resources/favourites — get current user's favourited resources */
router.get('/favourites', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favouriteResources').lean();
    const ids = user?.favouriteResources || [];
    if (!ids.length) return res.json({ ok: true, resources: [] });

    const resources = await Resource.find({ _id: { $in: ids } })
      .select('-fileData -thumbnailData')
      .lean();

    const mapped = resources.map(r => ({
      ...r,
      hasFile: !!(r.fileMime),
      hasThumbnail: !!(r.thumbnailMime),
    }));

    res.json({ ok: true, resources: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

/* GET /api/resources/my-favourites-ids — lightweight: just the IDs */
router.get('/my-favourites-ids', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favouriteResources').lean();
    res.json({ ok: true, ids: (user?.favouriteResources || []).map(String) });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   ADMIN ROUTES  (all require admin JWT)
═══════════════════════════════════════════════════════════════ */

/* GET /api/resources/admin/list — full list for admin panel (includes hasThumbnail flag, no binary) */
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .select('-fileData -thumbnailData')
      .lean();
    const mapped = resources.map(r => ({
      ...r,
      hasFile: !!(r.fileMime),
      hasThumbnail: !!(r.thumbnailMime),
    }));
    res.json({ ok: true, resources: mapped });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/* POST /api/resources/admin — create a new resource */
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const {
      title, description, type, sourceType, url,
      fileData, fileMime,
      thumbnailData, thumbnailMime,
      tags,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!['video', 'audio', 'image', 'link'].includes(type))
      return res.status(400).json({ error: 'Invalid type' });
    if (!['upload', 'youtube', 'url'].includes(sourceType))
      return res.status(400).json({ error: 'Invalid sourceType' });

    const youtubeVideoId = sourceType === 'youtube' ? extractYoutubeId(url) : '';

    const resource = await Resource.create({
      title: title.trim(),
      description: description?.trim() || '',
      type,
      sourceType,
      url: url || '',
      fileData: fileData || '',
      fileMime: fileMime || '',
      thumbnailData: thumbnailData || '',
      thumbnailMime: thumbnailMime || '',
      youtubeVideoId,
      tags: Array.isArray(tags) ? tags : [],
    });

    // Return without binary blobs
    const { fileData: _f, thumbnailData: _t, ...safe } = resource.toObject();
    res.status(201).json({ ok: true, resource: { ...safe, hasFile: !!fileMime, hasThumbnail: !!thumbnailMime } });
  } catch (err) {
    console.error('[Resources Admin] create error:', err.message);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

/* PUT /api/resources/admin/:id — update resource */
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const allowed = ['title', 'description', 'type', 'sourceType', 'url', 'fileData', 'fileMime',
                     'thumbnailData', 'thumbnailMime', 'tags'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) resource[k] = req.body[k];
    }
    if (resource.sourceType === 'youtube') {
      resource.youtubeVideoId = extractYoutubeId(resource.url);
    } else {
      resource.youtubeVideoId = '';
    }

    await resource.save();
    const { fileData: _f, thumbnailData: _t, ...safe } = resource.toObject();
    res.json({ ok: true, resource: { ...safe, hasFile: !!(resource.fileMime), hasThumbnail: !!(resource.thumbnailMime) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

/* DELETE /api/resources/admin/:id */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;

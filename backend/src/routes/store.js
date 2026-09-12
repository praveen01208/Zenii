import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from './admin.js';
import StoreAsset from '../models/StoreAsset.js';
import UserDownload from '../models/UserDownload.js';
import crypto from 'crypto';

const router = Router();

/* ════════════════════════════════════════════════════════════
   USER-FACING ROUTES
════════════════════════════════════════════════════════════ */

/* GET /api/store  — list all assets (no file data) */
router.get('/', requireAuth, async (req, res) => {
  try {
    const assets = await StoreAsset.find()
      .sort({ createdAt: -1 })
      .select('-fileData')
      .lean();

    // For each asset, check if the current user already owns it
    const userId = req.user.id;
    const ownedDocs = await UserDownload.find({ userId }).select('assetId').lean();
    const ownedSet = new Set(ownedDocs.map(d => d.assetId.toString()));

    const mapped = assets.map(a => ({
      ...a,
      hasFile: !!a.fileMime,
      owned: ownedSet.has(a._id.toString()),
    }));

    res.json({ ok: true, assets: mapped });
  } catch (err) {
    console.error('[Store] list error:', err.message);
    res.status(500).json({ error: 'Failed to fetch store assets' });
  }
});

/* GET /api/store/my-downloads  — assets the user owns */
router.get('/my-downloads', requireAuth, async (req, res) => {
  try {
    const downloads = await UserDownload.find({ userId: req.user.id })
      .populate({ path: 'assetId', select: '-fileData' })
      .sort({ purchasedAt: -1 })
      .lean();

    const assets = downloads
      .filter(d => d.assetId) // guard against orphaned refs
      .map(d => ({
        ...d.assetId,
        purchasedAt: d.purchasedAt,
        paymentId: d.paymentId,
        amountPaid: d.amountPaid,
        owned: true,
        hasFile: !!d.assetId.fileMime,
      }));

    res.json({ ok: true, assets });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

/* GET /api/store/:id/download  — stream download for owned / free assets */
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const asset = await StoreAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    if (asset.price > 0) {
      // Must own the asset
      const owned = await UserDownload.findOne({ userId: req.user.id, assetId: asset._id });
      if (!owned) return res.status(403).json({ error: 'Purchase required' });
    } else {
      // Free — auto-record ownership on first download
      await UserDownload.findOneAndUpdate(
        { userId: req.user.id, assetId: asset._id },
        { userId: req.user.id, assetId: asset._id, amountPaid: 0 },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (!asset.fileData) return res.status(404).json({ error: 'File not available' });

    // Increment download counter
    await StoreAsset.findByIdAndUpdate(asset._id, { $inc: { downloads: 1 } });

    const buf = Buffer.from(asset.fileData, 'base64');
    const safeFileName = (asset.fileName || `${asset.title}.pdf`).replace(/[^a-zA-Z0-9._\- ]/g, '_');
    
    const disposition = req.query.view === 'true' ? 'inline' : 'attachment';

    res.set('Content-Type', asset.fileMime || 'application/octet-stream');
    res.set('Content-Length', buf.length);
    res.set('Content-Disposition', `${disposition}; filename="${safeFileName}"`);
    res.set('Cache-Control', 'private, no-store'); // prevent hotlinking / CDN caching
    res.send(buf);
  } catch (err) {
    console.error('[Store] download error:', err.message);
    res.status(500).json({ error: 'Download failed' });
  }
});

/* ── Razorpay Payment Flow ── */

/* POST /api/store/:id/purchase  — create Razorpay order */
router.post('/:id/purchase', requireAuth, async (req, res) => {
  try {
    const asset = await StoreAsset.findById(req.params.id).select('-fileData');
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.price === 0) return res.status(400).json({ error: 'This item is free' });

    // Check if already purchased
    const existing = await UserDownload.findOne({ userId: req.user.id, assetId: asset._id });
    if (existing) return res.status(400).json({ error: 'Already purchased' });

    // Razorpay is optional — gracefully fail if keys are missing
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }

    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: asset.price * 100, // paise
      currency: 'INR',
      receipt: `store_${asset._id}_${req.user.id}_${Date.now()}`,
      notes: { assetId: asset._id.toString(), userId: req.user.id },
    });

    res.json({
      ok: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      asset: { _id: asset._id, title: asset.title, price: asset.price },
      keyId,
    });
  } catch (err) {
    console.error('[Store] purchase error:', err.message);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/* POST /api/store/:id/demo-purchase  — unlock asset for testing without Razorpay */
router.post('/:id/demo-purchase', requireAuth, async (req, res) => {
  try {
    const asset = await StoreAsset.findById(req.params.id).select('price');
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Grant ownership directly
    await UserDownload.findOneAndUpdate(
      { userId: req.user.id, assetId: asset._id },
      {
        userId:     req.user.id,
        assetId:    asset._id,
        paymentId:  `demo_pay_${Date.now()}`,
        orderId:    `demo_order_${Date.now()}`,
        amountPaid: asset.price,
        purchasedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, message: 'Demo payment successful. Asset unlocked!' });
  } catch (err) {
    console.error('[Store] demo-purchase error:', err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/* POST /api/store/:id/verify  — verify Razorpay signature & grant access */
router.post('/:id/verify', requireAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) return res.status(503).json({ error: 'Payment gateway not configured' });

    // Verify HMAC-SHA256 signature
    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const asset = await StoreAsset.findById(req.params.id).select('price');
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    // Grant ownership
    await UserDownload.findOneAndUpdate(
      { userId: req.user.id, assetId: asset._id },
      {
        userId:     req.user.id,
        assetId:    asset._id,
        paymentId:  razorpay_payment_id,
        orderId:    razorpay_order_id,
        amountPaid: asset.price,
        purchasedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ ok: true, message: 'Payment verified. Asset unlocked!' });
  } catch (err) {
    console.error('[Store] verify error:', err.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/* ════════════════════════════════════════════════════════════
   ADMIN ROUTES
════════════════════════════════════════════════════════════ */

/* GET /api/store/admin/list */
router.get('/admin/list', requireAdmin, async (req, res) => {
  try {
    const assets = await StoreAsset.find()
      .sort({ createdAt: -1 })
      .select('-fileData')
      .lean();
    res.json({ ok: true, assets: assets.map(a => ({ ...a, hasFile: !!a.fileMime })) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list assets' });
  }
});

/* POST /api/store/admin  — create asset */
router.post('/admin', requireAdmin, async (req, res) => {
  try {
    const { title, description, fileData, fileMime, fileName, price, category } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });

    const asset = await StoreAsset.create({
      title: title.trim(),
      description: description?.trim() || '',
      fileData: fileData || '',
      fileMime: fileMime || '',
      fileName: fileName || '',
      price: Number(price) || 0,
      category: category?.trim() || 'Wellness',
    });

    const { fileData: _f, ...safe } = asset.toObject();
    res.status(201).json({ ok: true, asset: { ...safe, hasFile: !!fileMime } });
  } catch (err) {
    console.error('[Store Admin] create error:', err.message);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

/* PUT /api/store/admin/:id  — update asset */
router.put('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const asset = await StoreAsset.findById(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const allowed = ['title', 'description', 'price', 'category', 'fileData', 'fileMime', 'fileName'];
    for (const k of allowed) {
      if (req.body[k] !== undefined) asset[k] = req.body[k];
    }
    await asset.save();

    const { fileData: _f, ...safe } = asset.toObject();
    res.json({ ok: true, asset: { ...safe, hasFile: !!asset.fileMime } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

/* DELETE /api/store/admin/:id */
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const asset = await StoreAsset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    // Also clean up download records for deleted asset
    await UserDownload.deleteMany({ assetId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;

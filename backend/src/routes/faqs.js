import { Router } from 'express';
import FAQ from '../models/FAQ.js';
import { requireAdmin } from './admin.js'; // reuse middleware

const router = Router();

// Public: get all FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 }).lean();
    res.json({ ok: true, faqs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create FAQ
router.post('/', requireAdmin, async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });
  try {
    const faq = await FAQ.create({ question, answer });
    res.json({ ok: true, faq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update FAQ
router.put('/:id', requireAdmin, async (req, res) => {
  const { question, answer } = req.body;
  if (!question && !answer) return res.status(400).json({ error: 'nothing to update' });
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, { $set: { question, answer } }, { new: true }).lean();
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ ok: true, faq });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete FAQ
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

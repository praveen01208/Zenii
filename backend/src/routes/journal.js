import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import JournalEntry from '../models/JournalEntry.js';
import { callAI } from '../utils/ai.js';

const router = Router();
router.use(requireAuth);

const todayIST = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 'YYYY-MM-DD'

/* ─────────────────────────────────────────────────────────────────────────
   STATIC NAMED ROUTES — must come BEFORE /:id wildcard
───────────────────────────────────────────────────────────────────────── */

/* ── GET /api/journal/heatmap ──────────────────────────────────────────── */
router.get('/heatmap', async (req, res) => {
  try {
    const now   = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const entries = await JournalEntry.find({
      userId:    req.user.id,
      createdAt: { $gte: start },
    }).select('day moodScore').lean();

    // For each day keep the latest mood score
    const map = {};
    entries.forEach(e => { map[e.day] = e.moodScore; });

    // Build a full 30-day array
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      days.push({ date: key, moodScore: map[key] || null });
    }

    res.json({ ok: true, days });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load heatmap.' });
  }
});

/* ── GET /api/journal/insights ─────────────────────────────────────────── */
router.get('/insights', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const entries = await JournalEntry.find({
      userId:    req.user.id,
      createdAt: { $gte: weekAgo },
    }).select('content moodScore aiTags aiTone day').lean();

    if (entries.length === 0) {
      return res.json({ ok: true, insight: null, entriesThisWeek: 0, avgMood: null });
    }

    const avgMood = entries.length
      ? Math.round((entries.reduce((s, e) => s + e.moodScore, 0) / entries.length) * 10) / 10
      : null;

    // Build summary text for AI
    const summary = entries.map(e =>
      `[Day: ${e.day}, Mood: ${e.moodScore}/5, Tags: ${(e.aiTags||[]).join(', ')}]\n"${e.content.slice(0, 200)}"`
    ).join('\n\n');

    const prompt = `You are a warm, empathetic mental wellness assistant for teenagers. 
Analyze these journal entries from the past 7 days and write a SHORT, personal weekly insight (3–4 sentences max).

Focus on:
1. Emotional patterns you noticed (e.g. "You mentioned exam stress 3 times this week")
2. One practical, gentle suggestion based on their entries
3. An encouraging closing line

Write in second person ("You..."), warm and non-clinical tone. Do NOT use bullet points.

Journal entries:
${summary}`;

    const insight = await callAI(prompt);

    res.json({
      ok:              true,
      insight:         insight || null,
      entriesThisWeek: entries.length,
      avgMood,
    });
  } catch (err) {
    console.error('[Journal] insights error:', err.message);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
});

/* ─────────────────────────────────────────────────────────────────────────
   WILDCARD / PARAMETERISED ROUTES — must come AFTER named routes
───────────────────────────────────────────────────────────────────────── */

/* ── POST /api/journal ─────────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { content, moodScore } = req.body;
    if (!content?.trim() || content.trim().length < 5)
      return res.status(400).json({ error: 'Journal entry must be at least 5 characters.' });
    if (!moodScore || moodScore < 1 || moodScore > 5)
      return res.status(400).json({ error: 'moodScore must be 1–5.' });

    const LABELS = { 1: 'very_low', 2: 'low', 3: 'okay', 4: 'good', 5: 'great' };

    const entry = await JournalEntry.create({
      userId:    req.user.id,
      content:   content.trim(),
      moodScore: Number(moodScore),
      moodLabel: LABELS[Number(moodScore)],
      day:       todayIST(),
    });

    res.status(201).json({ ok: true, entry });

    // Fire-and-forget AI analysis
    (async () => {
      try {
        const aiPrompt = `Analyze this short journal entry written by a teenager. 
Return ONLY valid JSON (no markdown, no explanation) with these exact keys:
{
  "tone": "positive" | "neutral" | "negative",
  "tags": ["keyword1", "keyword2"],
  "summary": "one sentence summary"
}
Tags should be 2–4 short emotional/situational keywords (e.g. "exam stress", "loneliness", "gratitude").

Journal entry: "${content.trim().slice(0, 500)}"`;

        const raw = await callAI(aiPrompt);
        if (!raw) return;

        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) return;
        const parsed = JSON.parse(match[0]);

        await JournalEntry.findByIdAndUpdate(entry._id, {
          aiTone:    parsed.tone    || 'neutral',
          aiTags:    Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
          aiSummary: parsed.summary || '',
        });
      } catch (e) {
        console.error('[Journal] AI analysis error:', e.message);
      }
    })();
  } catch (err) {
    console.error('[Journal] create error:', err.message);
    res.status(500).json({ error: 'Failed to save journal entry.' });
  }
});

/* ── GET /api/journal ──────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(20, Number(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      JournalEntry.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JournalEntry.countDocuments({ userId: req.user.id }),
    ]);

    res.json({ ok: true, entries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal entries.' });
  }
});

/* ── DELETE /api/journal/:id ───────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry.' });
  }
});

export default router;

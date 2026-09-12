import { Router } from 'express';
import SupportTicket from '../models/SupportTicket.js';

const router = Router();

/* ── POST /api/support ── */
router.post('/', async (req, res) => {
  try {
    const { type, subject, body, name, email, phone } = req.body;
    
    if (!type || !subject || !body || !name || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['contact', 'report'].includes(type)) {
      return res.status(400).json({ error: 'Invalid support ticket type.' });
    }

    const ticket = new SupportTicket({
      type,
      subject,
      body,
      name,
      email,
      phone
    });

    await ticket.save();
    return res.json({ ok: true, ticket });
  } catch (err) {
    console.error('Support submission error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { Therapist } from '../models/Therapist.js';

const router = express.Router();

// Custom middleware to authenticate either User or Therapist
const authenticateAny = async (req, res, next) => {
  try {
    const userToken = req.cookies?.auth_token;
    const therapistToken = req.cookies?.therapist_token;

    if (userToken) {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub).lean();
      if (user && !user.isSuspended) {
        req.user = { id: String(user._id) };
        req.userType = 'User';
        return next();
      }
    }

    if (therapistToken) {
      const decoded = jwt.verify(therapistToken, process.env.JWT_SECRET);
      if (decoded.role === 'therapist') {
        const therapist = await Therapist.findById(decoded.sub).lean();
        if (therapist && !therapist.isSuspended) {
          req.therapist = therapist;
          req.userType = 'Therapist';
          return next();
        }
      }
    }

    return res.status(401).json({ error: 'Unauthorized' });
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// GET /api/chat/user/:therapistId
// Init/fetch chat for a User communicating with a Therapist
router.get('/user/:therapistId', authenticateAny, async (req, res) => {
  if (req.userType !== 'User') return res.status(403).json({ error: 'Forbidden' });
  
  try {
    let chat = await Chat.findOne({ user: req.user.id, therapist: req.params.therapistId });
    if (!chat) {
      chat = new Chat({ user: req.user.id, therapist: req.params.therapistId });
      await chat.save();
    }
    res.json({ ok: true, chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/therapist-chats
// Fetch all chats for the authenticated Therapist
router.get('/therapist-chats', authenticateAny, async (req, res) => {
  if (req.userType !== 'Therapist') return res.status(403).json({ error: 'Forbidden' });

  try {
    const chats = await Chat.find({ therapist: req.therapist._id, isHiddenForTherapist: { $ne: true } }).populate('user', 'name avatar isOnline lastSeen age gender phone').lean();
    res.json({ ok: true, chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/:chatId/messages
// Fetch messages for a chat, decrypting them
router.get('/:chatId/messages', authenticateAny, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Authorization check
    const isUser = req.userType === 'User' && String(chat.user) === String(req.user.id);
    const isTherapist = req.userType === 'Therapist' && String(chat.therapist) === String(req.therapist._id);
    if (!isUser && !isTherapist) return res.status(403).json({ error: 'Forbidden' });

    const query = { chatId: chat._id, deletedForEveryone: false };

    // Apply clear chat logic
    if (isUser && chat.clearedByUserAt) {
      query.createdAt = { $gt: chat.clearedByUserAt };
    } else if (isTherapist && chat.clearedByTherapistAt) {
      query.createdAt = { $gt: chat.clearedByTherapistAt };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).lean();

    const currentUserId = isUser ? req.user.id : String(req.therapist._id);

    const processedMessages = messages.filter(m => {
      // Skip messages deleted for/by the current user
      if (m.deletedBy && m.deletedBy.map(id => String(id)).includes(currentUserId)) return false;
      // Auto-hide legacy AES-encrypted blobs (iv:ciphertext hex pattern) — they can't be read
      if (m.encryptedContent && /^[0-9a-f]{32}:[0-9a-f]+$/i.test(m.encryptedContent)) return false;
      return true;
    }).map(m => {
      m.content = m.encryptedContent || '';
      delete m.encryptedContent;
      return m;
    });

    res.json({ ok: true, messages: processedMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/:chatId/messages
// Send a new message
router.post('/:chatId/messages', authenticateAny, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const isUser = req.userType === 'User' && String(chat.user) === String(req.user.id);
    const isTherapist = req.userType === 'Therapist' && String(chat.therapist) === String(req.therapist._id);
    if (!isUser && !isTherapist) return res.status(403).json({ error: 'Forbidden' });

    if (isUser) {
      const therapistDoc = await Therapist.findById(chat.therapist);
      if (therapistDoc && therapistDoc.blockedUsers && therapistDoc.blockedUsers.includes(req.user.id)) {
        return res.status(403).json({ error: 'You have been blocked by this therapist.' });
      }
      
      if (chat.isHiddenForTherapist) {
        chat.isHiddenForTherapist = false;
        await chat.save();
      }
    }

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const message = new Message({
      chatId: chat._id,
      senderId: isUser ? req.user.id : req.therapist._id,
      senderModel: isUser ? 'User' : 'Therapist',
      encryptedContent: content  // field name kept for DB compatibility; stores plain text
    });

    await message.save();

    const savedMessage = message.toObject();
    savedMessage.content = content;
    delete savedMessage.encryptedContent;

    res.json({ ok: true, message: savedMessage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/messages/:messageId
// Delete a message (type: 'me' or 'everyone')
router.delete('/messages/:messageId', authenticateAny, async (req, res) => {
  try {
    const { type } = req.query; // 'me' or 'everyone'
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const currentUserId = req.userType === 'User' ? req.user.id : String(req.therapist._id);
    const isSender = String(message.senderId) === currentUserId;

    if (type === 'everyone') {
      if (!isSender) return res.status(403).json({ error: 'Cannot delete for everyone' });
      message.deletedForEveryone = true;
      // You could also physically delete from DB here if you want to save space,
      // but keeping it with a flag allows for 'This message was deleted' tombstones.
    } else {
      // 'me'
      if (!message.deletedBy.includes(currentUserId)) {
        message.deletedBy.push(currentUserId);
      }
    }

    await message.save();
    res.json({ ok: true, deletedForEveryone: message.deletedForEveryone, deletedBy: message.deletedBy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/:chatId/clear
// Clear chat for the authenticated user
router.delete('/:chatId/clear', authenticateAny, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    const isUser = req.userType === 'User' && String(chat.user) === String(req.user.id);
    const isTherapist = req.userType === 'Therapist' && String(chat.therapist) === String(req.therapist._id);
    
    if (isUser) {
      chat.clearedByUserAt = new Date();
    } else if (isTherapist) {
      chat.clearedByTherapistAt = new Date();
      chat.isHiddenForTherapist = true;
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await chat.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/:chatId/block
// Block user from sending further messages (Therapist only)
router.post('/:chatId/block', authenticateAny, async (req, res) => {
  try {
    if (req.userType !== 'Therapist') return res.status(403).json({ error: 'Forbidden' });
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    
    if (String(chat.therapist) !== String(req.therapist._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const therapistDoc = await Therapist.findById(req.therapist._id);
    if (!therapistDoc.blockedUsers) therapistDoc.blockedUsers = [];
    
    if (!therapistDoc.blockedUsers.includes(chat.user)) {
      therapistDoc.blockedUsers.push(chat.user);
      await therapistDoc.save();
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/:chatId/unblock
// Unblock a previously blocked user
router.post('/:chatId/unblock', authenticateAny, async (req, res) => {
  try {
    if (req.userType !== 'Therapist') return res.status(403).json({ error: 'Forbidden' });
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    
    if (String(chat.therapist) !== String(req.therapist._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const therapistDoc = await Therapist.findById(req.therapist._id);
    if (therapistDoc.blockedUsers) {
      therapistDoc.blockedUsers = therapistDoc.blockedUsers.filter(u => String(u) !== String(chat.user));
      await therapistDoc.save();
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

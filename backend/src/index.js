import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env and root/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { setDefaultResultOrder } from 'dns';
// Force IPv4 DNS resolution — prevents ENETUNREACH on Render (IPv6 not routable to smtp.gmail.com)
setDefaultResultOrder('ipv4first');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import cron from 'node-cron';
import { clerkMiddleware } from '@clerk/express';

import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';

import adminRoutes from './routes/admin.js';
import publicRoutes from './routes/public.js';
import Admin from './models/Admin.js';
import Story from './models/Story.js';
import SiteSettings from './models/SiteSettings.js';
import { Therapist } from './models/Therapist.js';
import Resource from './models/Resource.js';
import { Circle, CircleMessage } from './models/Circle.js';
import bcrypt from 'bcryptjs';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'self'", "https:"],
    },
  },
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again in 15 minutes!' }
});
app.use('/api', limiter);

const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin
    ? (origin, cb) => {
        // Allow requests with no origin (same-origin, Postman) or matching origin
        if (!origin || origin === allowedOrigin) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    : true, // dev fallback — allow everything
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '5mb' })); // Reduced from 50mb to 5mb

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Clerk Authentication Middleware
const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (clerkPublishableKey) {
  process.env.CLERK_PUBLISHABLE_KEY = clerkPublishableKey;
}

if (clerkSecretKey) {
  process.env.CLERK_SECRET_KEY = clerkSecretKey;
}

app.use(clerkMiddleware({
  publishableKey: clerkPublishableKey,
  secretKey: clerkSecretKey,
}));

// Ensure uploads folder is served
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
import therapistRoutes from './routes/therapist.js';
app.use('/api/therapist', therapistRoutes);
import sessionRoutes from './routes/session.js';
app.use('/api/sessions', sessionRoutes);
import supportRoutes from './routes/support.js';
app.use('/api/support', supportRoutes);
import chatRoutes from './routes/chat.js';
app.use('/api/chat', chatRoutes);
import zenChatRoute from './routes/zenChat.js';
app.use('/api/zen-chat', zenChatRoute);
import zenSessionsRoute from './routes/zenSessions.js';
app.use('/api/zen-sessions', zenSessionsRoute);
import communityStoriesRoute from './routes/communityStories.js';
app.use('/api/community-stories', communityStoriesRoute);
import zenProgressRoute from './routes/zenProgress.js';
app.use('/api/zen-progress', zenProgressRoute);
import resourcesRoute from './routes/resources.js';
app.use('/api/resources', resourcesRoute);
import journalRoute from './routes/journal.js';
app.use('/api/journal', journalRoute);
import circlesRoute from './routes/circles.js';
app.use('/api/circles', circlesRoute);
import goalsRoute from './routes/goals.js';
app.use('/api/goals', goalsRoute);
import pushRoute from './routes/push.js';
app.use('/api/push', pushRoute);
import readingListsRoute from './routes/readingLists.js';
app.use('/api/reading-lists', readingListsRoute);
import wellnessProgramsRoute from './routes/wellnessPrograms.js';
app.use('/api/wellness-programs', wellnessProgramsRoute);
import companyRoutes from './routes/companyRoutes.js';
app.use('/api', companyRoutes);
import notificationsRoute from './routes/notifications.js';
app.use('/api/notifications', notificationsRoute);
import sessionPrepRoute from './routes/sessionPrep.js';
app.use('/api/session-prep', sessionPrepRoute);
app.use('/api/admin/analytics', sessionPrepRoute); // admin mood analytics sub-route
import faqsRoute from './routes/faqs.js';
app.use('/api/faqs', faqsRoute);
import adminAnalyticsRoute from './routes/adminAnalytics.js';
app.use('/api/admin-analytics', adminAnalyticsRoute);
import insightsRoute from './routes/insights.js';
import { generateInsightForUser } from './routes/insights.js';
app.use('/api/insights', insightsRoute);
import storeRoute from './routes/store.js';
app.use('/api/store', storeRoute);
import { Job } from './models/Job.js';

// 404 Handler for undefined API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found or method not allowed' });
});

// Global Centralized Error Handling Middleware
app.use((err, _req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error. Please try again later.'
    : err.message || 'An unexpected error occurred';

  if (statusCode >= 500) {
    console.error(`[Unhandled Error] ${err.name || 'Error'}: ${err.message}\n`, err.stack || '');
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});




const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in env');
}

await mongoose.connect(mongoUri);
// eslint-disable-next-line no-console
console.log('MongoDB connected');

// Seed default Admin
const adminCount = await Admin.countDocuments();
if (adminCount === 0) {
  const passwordHash = await bcrypt.hash('adminZEN', 10);
  await Admin.create({ username: 'AdminZ', passwordHash });
  console.log('Default Admin created: AdminZ / adminZEN');
}

// Seed default Stories
const storyCount = await Story.countDocuments();
if (storyCount === 0) {
  await Story.insertMany([
    { story: "I felt lost and alone until I found ZenMind. The chatbot helped me understand that my feelings were valid, and the stories inspired me to keep going.", author: "Sarah, 16", rating: 5, category: 'loneliness', isApproved: true },
    { story: "The therapy sessions changed my life. Having someone who truly understands what I'm going through made all the difference.", author: "Michael, 17", rating: 5, category: 'depression', isApproved: true },
    { story: "I love how the platform shares stories when I need them most. It's like having a friend who always knows what to say.", author: "Emma, 15", rating: 5, category: 'anxiety', isApproved: true },
    { story: "I started journaling after each chat and now I can actually notice my progress week by week. It feels empowering.", author: "Aarav, 16", rating: 5, category: 'stress', isApproved: true },
    { story: "The stories made me feel less alone. I realized so many teens are dealing with the same thoughts and emotions.", author: "Noah, 15", rating: 5, category: 'loneliness', isApproved: true },
    { story: "Whenever I feel overwhelmed, ZenMind gives me practical coping steps immediately. It helps me calm down fast.", author: "Mia, 17", rating: 5, category: 'anxiety', isApproved: true },
    { story: "Exam season used to break me every year. After talking to Zeni about it, I realized it was burnout, not weakness. I rested and came back stronger.", author: "Rohan, 17", rating: 5, category: 'exam_pressure', isApproved: true },
    { story: "I was bullied for two years and never told anyone. Opening up here was the hardest thing I've done — and the most freeing.", author: "Priya, 15", rating: 5, category: 'bullying', isApproved: true },
    { story: "My parents' fights used to keep me up at night. Talking about it helped me see that their problems aren't mine to carry.", author: "Arjun, 16", rating: 5, category: 'family_issues', isApproved: true },
    { story: "I never felt good enough — not smart enough, not pretty enough. Slowly I'm learning that I am enough, just as I am.", author: "Divya, 14", rating: 5, category: 'self_esteem', isApproved: true }
  ]);
  console.log('Default Stories seeded');
} else {
  // Migrate existing stories: mark admin-seeded ones as approved if not already
  await Story.updateMany({ userId: null, isApproved: false }, { $set: { isApproved: true } });
}

// Seed default Site Settings
const settingsCount = await SiteSettings.countDocuments();
if (settingsCount === 0) {
  await SiteSettings.create({
    activeUsers: '50000',
    satisfactionRate: '98',
    therapistsCount: '1000',
    supportAvailable: '24'
  });
  console.log('Default Site Settings seeded');
}

// Seed Wellness Resources
const resourceCount = await Resource.countDocuments();
if (resourceCount === 0) {
  await Resource.insertMany([
    {
      title: 'Box Breathing for Instant Calm',
      description: 'A simple 4-4-4-4 box breathing technique to quickly reduce anxiety and reset your nervous system.',
      type: 'video', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      youtubeVideoId: 'tEmt1Znux58',
      tags: ['Anxiety', 'Breathing', 'Stress'],
    },
    {
      title: '10-Minute Body Scan Meditation',
      description: 'A guided body scan meditation to release tension and bring deep relaxation before sleep.',
      type: 'audio', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=u4gZgnmkskw',
      youtubeVideoId: 'u4gZgnmkskw',
      tags: ['Mindfulness', 'Sleep', 'Relaxation'],
    },
    {
      title: 'The Surprising Science of Happiness — TED Talk',
      description: 'Dan Gilbert challenges the idea that we\'ll be miserable if we don\'t get what we want.',
      type: 'link', sourceType: 'url',
      url: 'https://www.ted.com/talks/dan_gilbert_the_surprising_science_of_happiness',
      tags: ['Motivation', 'Happiness'],
    },
    {
      title: 'Sleep Hygiene: A Complete Guide',
      description: 'Evidence-based tips from the Sleep Foundation to help you get better, deeper sleep every night.',
      type: 'link', sourceType: 'url',
      url: 'https://www.sleepfoundation.org/sleep-hygiene',
      tags: ['Sleep', 'Wellness'],
    },
    {
      title: 'Progressive Muscle Relaxation — Full Session',
      description: 'Systematically tense and relax muscle groups to melt away physical stress and anxiety.',
      type: 'audio', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=1nZEdqcGvsE',
      youtubeVideoId: '1nZEdqcGvsE',
      tags: ['Anxiety', 'Relaxation', 'Stress'],
    },
    {
      title: 'Why Gratitude Is So Powerful',
      description: 'Science-backed reasons why keeping a gratitude journal can rewire your brain for positivity.',
      type: 'video', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=WPPPFqsECz0',
      youtubeVideoId: 'WPPPFqsECz0',
      tags: ['Motivation', 'Mindfulness', 'Happiness'],
    },
    {
      title: 'Understanding Panic Attacks',
      description: 'Clear, compassionate explanation of what panic attacks are, why they happen, and how to cope.',
      type: 'link', sourceType: 'url',
      url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/panic-attacks/',
      tags: ['Anxiety', 'Education'],
    },
    {
      title: 'Lo-fi Beats to Calm Your Mind',
      description: 'Gentle lo-fi music to help you focus, study, or simply decompress after a long day.',
      type: 'audio', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      youtubeVideoId: 'jfKfPfyJRdk',
      tags: ['Focus', 'Relaxation', 'Sleep'],
    },
    {
      title: 'Daily Affirmations for Self-Worth',
      description: 'Start your morning with these powerful affirmations to build confidence and silence your inner critic.',
      type: 'video', sourceType: 'youtube',
      url: 'https://www.youtube.com/watch?v=iRoI2vxOoqU',
      youtubeVideoId: 'iRoI2vxOoqU',
      tags: ['Self-Esteem', 'Motivation'],
    },
    {
      title: 'How to Stop Overthinking',
      description: 'Practical strategies from therapists to break the cycle of rumination and quiet a racing mind.',
      type: 'link', sourceType: 'url',
      url: 'https://www.verywellmind.com/how-to-stop-overthinking-6742852',
      tags: ['Anxiety', 'Stress', 'Education'],
    },
  ]);
  console.log('Default Wellness Resources seeded (10 items)');
}

// Seed Peer Support Circles
const circleCount = await Circle.countDocuments();
if (circleCount === 0) {
  await Circle.insertMany([
    { name: 'Anxiety Support',    description: 'A safe space to share your anxiety experiences and coping tips.',     category: 'anxiety',       icon: '🫶', gradientFrom: '#7c3aed', gradientTo: '#a78bfa' },
    { name: 'Exam & Study Stress', description: 'Surviving exams together — study tips, venting, and motivation.',    category: 'exam_pressure', icon: '📚', gradientFrom: '#0369a1', gradientTo: '#38bdf8' },
    { name: 'Sleep Struggles',    description: 'For those battling insomnia, nightmares, or restless nights.',         category: 'sleep',         icon: '🌙', gradientFrom: '#1e40af', gradientTo: '#6366f1' },
    { name: 'Loneliness & Connection', description: 'You are not alone. Connect with others who understand.',          category: 'loneliness',    icon: '🌿', gradientFrom: '#0d5d3a', gradientTo: '#10b981' },
    { name: 'Self-Esteem & Confidence', description: 'Building self-worth, one day at a time.',                       category: 'self_esteem',   icon: '✨', gradientFrom: '#b45309', gradientTo: '#f59e0b' },
    { name: 'Family & Relationships', description: 'Navigating family tensions, friendships, and heartbreak.',          category: 'family',        icon: '🏠', gradientFrom: '#be123c', gradientTo: '#fb7185' },
    { name: 'Motivation & Goals',  description: 'Accountability, habit building, and staying on track.',                category: 'motivation',    icon: '🚀', gradientFrom: '#065f46', gradientTo: '#34d399' },
    { name: 'General Wellness',   description: 'Anything and everything about mental wellness — open to all.',          category: 'general',       icon: '💬', gradientFrom: '#374151', gradientTo: '#6b7280' },
  ]);
  console.log('Default Peer Support Circles seeded (8 circles)');
}

// Seed exactly 12 Therapists (7 online, 5 offline)
const therapistCount = await Therapist.countDocuments();
if (therapistCount !== 12) {
  console.log('Resetting therapists database to exactly 12...');
  await Therapist.deleteMany({});
  
  const firstNames = ['Amit', 'Sneha', 'Rahul', 'Neha', 'Vikram', 'Pooja', 'Suresh', 'Kavita', 'Ramesh', 'Anjali', 'Karan', 'Meera'];
  const lastNames = ['Singh', 'Patel', 'Kumar', 'Gupta', 'Desai', 'Joshi', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Das', 'Sen'];
  const specs = ['Clinical Psychologist', 'Adolescent & Teen Therapist', 'Anxiety & Depression Specialist', 'Cognitive Behavioural Therapist', 'Trauma & PTSD Specialist', 'Relationship Counsellor', 'Child Psychologist'];
  const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'];

  const generated = [];
  for (let i = 0; i < 12; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i];
    const city = cities[i % cities.length];
    const spec = specs[i % specs.length];
    const isOffline = i >= 7; // First 7 are online, remaining 5 are offline

    generated.push({
      name: `Dr. ${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@zenmind.com`,
      password: 'therapist123',
      phone: '+91 ' + Math.floor(6000000000 + Math.random() * 3999999999),
      specialization: spec,
      experience: Math.floor(Math.random() * 15) + 2,
      education: `M.D. Psychiatry or Ph.D., ${city} University`,
      clinicAddress: `Clinic ${Math.floor(Math.random()*100)}, Wellness St, ${city}`,
      sessionTime: Math.random() > 0.5 ? 45 : 60,
      sessionCost: Math.floor(Math.random() * 15 + 5) * 100,
      sessionType: isOffline ? 'offline' : 'online'
    });
  }

  for (const data of generated) {
    const t = new Therapist(data);
    await t.save();
  }
  console.log('Generated exactly 12 therapists (7 Online, 5 Offline).');
}

// Seed Wellness Programs
import { WellnessProgram } from './models/WellnessProgram.js';
const wpCount = await WellnessProgram.countDocuments();
if (wpCount === 0) {
  await WellnessProgram.insertMany([
    {
      title: '7-Day Anxiety Relief',
      description: 'A gentle daily program combining breathing exercises, journaling, and mindfulness to quieten anxious thoughts and build calm confidence.',
      category: 'anxiety', difficulty: 'beginner', durationDays: 7,
      coverGradientFrom: '#7c3aed', coverGradientTo: '#a78bfa',
      steps: [
        { dayNumber: 1, title: 'Welcome & Box Breathing', content: 'Today we start with the 4-4-4-4 box breathing technique. Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times. This activates your parasympathetic nervous system instantly.', exerciseType: 'breathing', durationMinutes: 10 },
        { dayNumber: 2, title: 'Body Scan Awareness', content: 'Lie down comfortably. Close your eyes and slowly scan your body from head to toe. Notice tension without judgement. Breathe into each area of tightness and release on the exhale.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 3, title: 'Worry Journal', content: 'Write down every worry currently on your mind. Then next to each one write: "Is this in my control?" If yes, write one small action step. If no, write "I release this."', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 4, title: '5-4-3-2-1 Grounding', content: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Practice this technique 3 times today even when calm — your brain learns best in calm states.', exerciseType: 'reflection', durationMinutes: 10 },
        { dayNumber: 5, title: 'Progressive Muscle Relaxation', content: 'Tense each muscle group for 5 seconds, then release for 10 seconds. Start with your feet, move up to calves, thighs, abdomen, hands, arms, shoulders, and face.', exerciseType: 'movement', durationMinutes: 20 },
        { dayNumber: 6, title: 'Compassionate Letter', content: 'Write a letter to yourself as if you were your own best friend. Acknowledge your anxiety with kindness, not criticism. Remind yourself of past challenges you overcame.', exerciseType: 'journaling', durationMinutes: 25 },
        { dayNumber: 7, title: 'Reflection & Toolkit', content: 'Look back at your week. Which tool helped most? Write your personalised anxiety toolkit — your top 3 go-to techniques. Celebrate completing 7 days!', exerciseType: 'reflection', durationMinutes: 15 },
      ],
    },
    {
      title: '10-Day Deep Sleep Reset',
      description: 'Science-backed sleep hygiene habits, relaxation rituals, and mindset shifts to help you fall asleep faster and wake up restored.',
      category: 'sleep', difficulty: 'beginner', durationDays: 10,
      coverGradientFrom: '#1e40af', coverGradientTo: '#6366f1',
      steps: [
        { dayNumber: 1, title: 'Sleep Audit', content: 'Track your sleep for the past week mentally. What time did you sleep and wake? How many hours? Write a brief audit — awareness is the first step to change.', exerciseType: 'journaling', durationMinutes: 10 },
        { dayNumber: 2, title: 'Screen-Free Hour', content: 'Starting tonight, put all screens away 1 hour before bed. The blue light suppresses melatonin. Replace it with reading, light stretching, or soft music.', exerciseType: 'other', durationMinutes: 60 },
        { dayNumber: 3, title: '4-7-8 Sleep Breath', content: 'Breathe in for 4 counts, hold for 7 counts, exhale slowly for 8 counts. This technique was designed specifically to induce sleepiness. Practice 4 cycles before bed.', exerciseType: 'breathing', durationMinutes: 10 },
        { dayNumber: 4, title: 'Evening Body Scan', content: 'Perform a slow body scan from your toes to your head while in bed. Visualise each body part becoming heavy and sinking into the mattress.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 5, title: 'Gratitude Wind-Down', content: 'Write 3 specific things that went well today and why. Research shows gratitude journaling reduces pre-sleep cognitive arousal — the racing thoughts that keep you awake.', exerciseType: 'journaling', durationMinutes: 10 },
        { dayNumber: 6, title: 'Temperature Hack', content: 'Take a warm shower 1-2 hours before bed. As your body cools down afterward, core temperature drops, triggering sleepiness. Keep your bedroom cool (18-20 degrees is optimal).', exerciseType: 'other', durationMinutes: 20 },
        { dayNumber: 7, title: 'Sleep Worry Dump', content: 'Keep a notepad by your bed. Write tomorrow\'s to-do list before sleep to offload it from your brain. Your mind can rest when it trusts things are recorded.', exerciseType: 'journaling', durationMinutes: 10 },
        { dayNumber: 8, title: 'Yoga Nidra Introduction', content: 'Yoga Nidra (yogic sleep) is a guided meditation that puts your body to sleep while keeping awareness. Listen to a 20-minute Yoga Nidra recording tonight as you lie in bed.', exerciseType: 'meditation', durationMinutes: 20 },
        { dayNumber: 9, title: 'Consistent Wake Time', content: 'Set one consistent wake time for the next 7 days — even on weekends. Your circadian rhythm needs regularity. A fixed wake time is more powerful than a fixed bedtime.', exerciseType: 'other', durationMinutes: 5 },
        { dayNumber: 10, title: 'Your Sleep Ritual', content: 'Design your personalised 30-minute pre-sleep ritual using what worked this week. Write it down and commit to it for 21 days to cement it as a habit. Congratulations!', exerciseType: 'reflection', durationMinutes: 15 },
      ],
    },
    {
      title: '14-Day Mindfulness Journey',
      description: 'Build a sustainable daily meditation and mindfulness practice from scratch — no experience needed. Cultivate presence, reduce reactivity, and find stillness within.',
      category: 'mindfulness', difficulty: 'beginner', durationDays: 14,
      coverGradientFrom: '#0d5d3a', coverGradientTo: '#10b981',
      steps: [
        { dayNumber: 1, title: 'What Is Mindfulness?', content: 'Mindfulness is simply paying attention to the present moment without judgement. Today, spend 5 minutes observing your breath — just notice it, do not try to change it.', exerciseType: 'meditation', durationMinutes: 5 },
        { dayNumber: 2, title: 'Mindful Morning', content: 'Before checking your phone, take 3 deep breaths and set an intention for the day. Eat breakfast in silence, noticing every taste and texture.', exerciseType: 'reflection', durationMinutes: 10 },
        { dayNumber: 3, title: 'Breath as Anchor', content: 'Practice 10 minutes of breath-focused meditation. Count each exhale from 1 to 10, then start again. Notice when you lose count — that is awareness!', exerciseType: 'breathing', durationMinutes: 10 },
        { dayNumber: 4, title: 'Mindful Walking', content: 'Take a 10-minute walk with no phone, no music. Feel each footstep, notice the air, sounds, colours around you. Walking meditation trains mindfulness in movement.', exerciseType: 'movement', durationMinutes: 10 },
        { dayNumber: 5, title: 'RAIN Technique', content: 'Recognise what you feel, Allow it to be present, Investigate with curiosity, Nurture with self-compassion. Apply RAIN to one emotion you notice today.', exerciseType: 'reflection', durationMinutes: 15 },
        { dayNumber: 6, title: 'Loving Kindness', content: 'Sit quietly and silently repeat: "May I be happy. May I be healthy. May I be safe." Then extend these wishes to someone you love, a neutral person, and someone difficult.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 7, title: 'Week 1 Reflection', content: 'Journal: What did you notice this week? Were there moments of genuine presence? What pulled you out of the present? Recognising patterns is the foundation of mindfulness progress.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 8, title: 'Expanding Awareness', content: 'Extend your meditation to 15 minutes. After 5 minutes of breath focus, expand awareness to sounds, then body sensations, then thoughts — watching each arise and pass like clouds.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 9, title: 'The STOP Practice', content: 'Stop, Take a breath, Observe (thoughts, feelings, sensations), Proceed with awareness. Set 3 alarms today and practice STOP for 2 minutes each time.', exerciseType: 'reflection', durationMinutes: 6 },
        { dayNumber: 10, title: 'Mindful Listening', content: 'In your next conversation, practice truly listening — no planning your response, no phone. Just full presence. Notice how this changes the quality of connection.', exerciseType: 'other', durationMinutes: 20 },
        { dayNumber: 11, title: 'Observing Thoughts', content: 'Thoughts are not facts. Today, practice observing thoughts as mental events rather than truths. Label them: "planning thought," "worry thought," "judgement thought."', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 12, title: 'Compassion for Difficulty', content: 'Bring to mind something challenging in your life. Instead of problem-solving, sit with it in meditation — breathing into the discomfort, meeting it with compassion.', exerciseType: 'meditation', durationMinutes: 20 },
        { dayNumber: 13, title: 'Gratitude Meditation', content: 'Sit quietly and recall 5 things you are genuinely grateful for. Stay with each one for 30 seconds, letting warmth arise naturally. Gratitude and mindfulness reinforce each other powerfully.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 14, title: 'Your Mindfulness Commitment', content: 'You have built a 14-day foundation! Journal your experience and write a realistic commitment for daily mindfulness going forward — even 5 minutes daily is transformative over months.', exerciseType: 'journaling', durationMinutes: 20 },
      ],
    },
    {
      title: '5-Day Stress Detox',
      description: 'A rapid 5-day intensive to release built-up stress, regulate your nervous system, and create immediate relief strategies you can use for life.',
      category: 'stress', difficulty: 'beginner', durationDays: 5,
      coverGradientFrom: '#b45309', coverGradientTo: '#f59e0b',
      steps: [
        { dayNumber: 1, title: 'Stress Inventory', content: 'List every current stressor in your life. Rate each from 1-10. Then circle only the ones you have some control over. Focus goes only there.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 2, title: 'Movement Medicine', content: 'Stress hormones need to be physically discharged. Today: 20 minutes of any movement — walk, dance, yoga, anything. Movement is the most direct biological stress relief.', exerciseType: 'movement', durationMinutes: 20 },
        { dayNumber: 3, title: 'Digital Detox Half-Day', content: 'From noon to 6pm, no social media, no news, no unnecessary apps. Notice the relief — and the discomfort. Constant information consumption is a primary stress amplifier.', exerciseType: 'other', durationMinutes: 360 },
        { dayNumber: 4, title: 'Say No Practice', content: 'Overwhelm comes from over-commitment. Identify one thing on your plate this week you can decline, delegate, or defer. Write the message you will send. Boundaries are stress prevention.', exerciseType: 'reflection', durationMinutes: 15 },
        { dayNumber: 5, title: 'Your Stress Response Plan', content: 'Create your personalised Stress SOS — a 3-step response for when stress spikes: immediate (2 min), short-term (20 min), longer reset. You now have a stress management system.', exerciseType: 'journaling', durationMinutes: 20 },
      ],
    },
    {
      title: '21-Day Self-Esteem Builder',
      description: 'Rebuild your relationship with yourself through self-compassion practices, cognitive reframing, values work, and identity-level shifts over 3 transformative weeks.',
      category: 'self_esteem', difficulty: 'intermediate', durationDays: 21,
      coverGradientFrom: '#be123c', coverGradientTo: '#fb7185',
      steps: [
        { dayNumber: 1, title: 'Your Inner Critic', content: 'Tune into your self-talk today. Write down the 3 most common critical thoughts you have about yourself. Awareness precedes change.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 2, title: 'Self-Compassion Break', content: 'When you notice self-criticism, pause and ask: "What would I say to a dear friend in this situation?" Then say exactly that to yourself. Practise 3 times today.', exerciseType: 'reflection', durationMinutes: 10 },
        { dayNumber: 3, title: 'Strength Inventory', content: 'List 10 genuine strengths — skills, character traits, things you do well. We systematically undercount our strengths and overcount our flaws.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 4, title: 'Values Clarification', content: 'List your top 5 core values. Reflect: are your current daily actions aligned with these values? Low self-esteem often comes from living against our values.', exerciseType: 'reflection', durationMinutes: 20 },
        { dayNumber: 5, title: 'Mirror Practice', content: 'Look at yourself in the mirror for 2 minutes. Notice judgements arising. Then say aloud three times: "I am enough exactly as I am." Uncomfortable means effective.', exerciseType: 'other', durationMinutes: 5 },
        { dayNumber: 6, title: 'Accomplishment Timeline', content: 'Create a timeline of your life achievements. Include learning to ride a bike, a kind thing you did, a hard time you survived. Your evidence of capability is far greater than you realise.', exerciseType: 'journaling', durationMinutes: 25 },
        { dayNumber: 7, title: 'Week 1 Check-In', content: 'Journal: How has your self-talk shifted this week? Rate your self-esteem from 1-10 honestly. Celebrate any movement upward — small shifts compound powerfully.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 8, title: 'Cognitive Reframing', content: 'Take your 3 critical thoughts from Day 1. For each, write a realistic, compassionate reframe. Not toxic positivity — just fair, evidence-based perspective.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 9, title: 'Say Yes to Something Scary', content: 'Low self-esteem is maintained by avoidance. Today, do one small thing outside your comfort zone. Self-esteem is built through action, not affirmations alone.', exerciseType: 'other', durationMinutes: 30 },
        { dayNumber: 10, title: 'Body Appreciation', content: 'Write 10 things your body does for you that have nothing to do with appearance — breathing, healing, sensing, moving. Shift from criticising to appreciating.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 11, title: 'Social Comparison Audit', content: 'Who do you compare yourself to most, and where? Identify 2 practical ways to reduce your comparison triggers this week. Comparison is self-esteem\'s biggest enemy.', exerciseType: 'reflection', durationMinutes: 15 },
        { dayNumber: 12, title: 'The Best Friend Letter', content: 'Write a full letter from your best friend to you — one who loves you completely. What would they say about your worth and your journey? Read it aloud.', exerciseType: 'journaling', durationMinutes: 25 },
        { dayNumber: 13, title: 'Forgiveness Practice', content: 'Choose one thing you have been punishing yourself for. Write: what you learned, what you would do differently, and that you forgive yourself. Forgiveness is power.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 14, title: 'Week 2 Review', content: 'Journal: What has shifted? What is still hard? Rate self-esteem 1-10 again. Celebrate any upward movement. Change this deep takes time and consistency.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 15, title: 'Role Model Meditation', content: 'Think of someone who embodies the confidence you want. Meditate on that person — how they carry themselves, speak, respond to criticism. You are activating those qualities in yourself.', exerciseType: 'meditation', durationMinutes: 15 },
        { dayNumber: 16, title: 'Contribution Focus', content: 'Self-esteem rises when we feel useful. Today, do one thing to contribute to another person\'s wellbeing — listen fully, help with a task, send encouragement. Notice how it feels.', exerciseType: 'other', durationMinutes: 20 },
        { dayNumber: 17, title: 'Identity Statement', content: 'Write 5 "I am" statements that reflect who you are choosing to become — not who you have been told you are. Read them every morning for the remaining days.', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 18, title: 'Boundaries as Self-Respect', content: 'Every boundary you set is a statement that your needs matter. Identify one relationship or situation where you need a boundary. Write clearly what it is and how you will communicate it.', exerciseType: 'reflection', durationMinutes: 20 },
        { dayNumber: 19, title: 'Celebrating Imperfection', content: 'Perfectionism and low self-esteem are deeply linked. Today, intentionally do something imperfectly — and let it be enough. Done is better than perfect.', exerciseType: 'other', durationMinutes: 15 },
        { dayNumber: 20, title: 'Integration Meditation', content: 'Sit in meditation for 20 minutes. Let images from the past 20 days arise — your strengths, values, forgiveness, identity. Let them weave together into a felt sense of wholeness.', exerciseType: 'meditation', durationMinutes: 20 },
        { dayNumber: 21, title: 'Letter to Future You', content: 'Write a letter to yourself 1 year from now — describing the self-esteem you have built, how you treat yourself, how you show up. Seal it. You have completed 21 Days. This is extraordinary.', exerciseType: 'journaling', durationMinutes: 25 },
      ],
    },
    {
      title: '7-Day Motivation Reboot',
      description: 'When motivation is low, willpower alone will not save you. This 7-day program rebuilds drive from the inside — through purpose, habit design, environment, and energy management.',
      category: 'motivation', difficulty: 'beginner', durationDays: 7,
      coverGradientFrom: '#065f46', coverGradientTo: '#34d399',
      steps: [
        { dayNumber: 1, title: 'Why Motivation Disappears', content: 'Motivation is not a character trait — it is a biological state influenced by sleep, dopamine, meaning, and environment. Journal: When do you feel most energised? What is present in those moments?', exerciseType: 'journaling', durationMinutes: 15 },
        { dayNumber: 2, title: 'Your North Star', content: 'Write your North Star — your deepest why for this period of your life. Not what you should want — what you actually care about. Return to this when momentum dips.', exerciseType: 'reflection', durationMinutes: 20 },
        { dayNumber: 3, title: 'The 2-Minute Rule', content: 'The hardest part of any task is starting. Commit to just 2 minutes on your most avoided task. Usually you will continue beyond 2 minutes. Implement this today on one thing you have been procrastinating.', exerciseType: 'other', durationMinutes: 20 },
        { dayNumber: 4, title: 'Energy Audit', content: 'Track your energy levels every 2 hours today — rate from 1-10. Identify your peak energy windows. Schedule important work during peak windows. Audit what drains you.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 5, title: 'Environment Design', content: 'Your environment shapes your behaviour more than your willpower. Redesign one space for motivation: clear your workspace, put your goals visible, remove one distraction.', exerciseType: 'other', durationMinutes: 30 },
        { dayNumber: 6, title: 'Wins Compilation', content: 'List every meaningful accomplishment from the past 12 months — no matter how small. Low motivation often comes from not recognising what we have already done.', exerciseType: 'journaling', durationMinutes: 20 },
        { dayNumber: 7, title: 'Your Motivation System', content: 'Design your personalised motivation system: your morning activation ritual, clear goals for the next 30 days, one accountability mechanism, and your recovery plan for low days.', exerciseType: 'reflection', durationMinutes: 25 },
      ],
    },
  ]);
  console.log('Default Wellness Programs seeded (6 programs)');
}

// Seed Jobs — MUST be after mongoose.connect
// NOTE: Use individual .save() calls (not insertMany) so the pre-save slug hook fires
// Clean up any partially-seeded jobs with null slugs from failed previous attempts
await Job.deleteMany({ slug: null });
const jobCount = await Job.countDocuments();
if (jobCount === 0) {
  const jobsToSeed = [
    {
      title: 'Frontend Developer (React)', department: 'Engineering', location: 'Remote / Bangalore',
      employmentType: 'Full-time', experience: '1–3 Years', salary: '₹6–10 LPA',
      shortDescription: 'Build beautiful, accessible UI for a platform that impacts thousands of adolescents every day.',
      description: 'As a Frontend Developer at ZenMind, you will craft pixel-perfect, highly performant interfaces that make mental health care feel approachable and safe for young users across India.',
      responsibilities: ['Develop and maintain React components', 'Implement smooth animations and micro-interactions', 'Collaborate with designers on Figma-to-code workflows', 'Optimise performance for mobile users', 'Write clean, maintainable TypeScript code'],
      requirements: ['1+ years with React and TypeScript', 'Strong understanding of CSS and responsive design', 'Experience with REST APIs and state management', 'Passion for mental health or social impact'],
      benefits: ['Fully remote work', 'Flexible working hours', 'Learning & development budget', 'Equity options for early joiners', 'Mental wellness subscription'],
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'REST APIs'], openings: 2, status: 'active', featured: true,
    },
    {
      title: 'Backend Developer (Node.js)', department: 'Engineering', location: 'Remote',
      employmentType: 'Full-time', experience: '1–3 Years', salary: '₹7–12 LPA',
      shortDescription: 'Power the backend of a real-time mental wellness platform serving users across India.',
      description: 'Build robust, secure APIs and real-time services that keep ZenMind running reliably for thousands of users every day.',
      responsibilities: ['Design and build RESTful APIs', 'Maintain MongoDB schemas and queries', 'Implement real-time features using Socket.IO', 'Ensure API security and data privacy compliance', 'Write backend tests and documentation'],
      requirements: ['1+ years with Node.js and Express', 'Strong MongoDB knowledge', 'Familiarity with JWT authentication', 'Understanding of real-time communication (WebSockets)'],
      benefits: ['Fully remote work', 'Flexible working hours', 'Learning & development budget', 'Equity options for early joiners'],
      skills: ['Node.js', 'Express', 'MongoDB', 'Socket.IO', 'REST APIs'], openings: 1, status: 'active', featured: false,
    },
    {
      title: 'UI/UX Designer', department: 'Design', location: 'Remote / Hybrid',
      employmentType: 'Full-time', experience: '1–2 Years', salary: '₹5–8 LPA',
      shortDescription: 'Design calming, accessible experiences that make mental health feel approachable and safe.',
      description: 'At ZenMind, design is not just about aesthetics — it is about empathy. You will create interfaces that feel safe, trustworthy, and calming for adolescents navigating real mental health challenges.',
      responsibilities: ['Design mobile-first screens in Figma', 'Build and maintain a consistent design system', 'Conduct user research and usability testing', 'Work closely with the engineering team', 'Create micro-interaction prototypes'],
      requirements: ['Strong Figma skills', '1+ years of product design experience', 'Portfolio with mobile app designs', 'Understanding of accessibility standards'],
      benefits: ['Fully remote work', 'Flexible hours', 'Creative freedom', 'Mental wellness subscription'],
      skills: ['Figma', 'Prototyping', 'Design Systems', 'Mobile UI', 'User Research'], openings: 1, status: 'active', featured: false,
    },
    {
      title: 'Mental Health Content Writer', department: 'Marketing', location: 'Remote',
      employmentType: 'Full-time', experience: '0–2 Years', salary: '₹3–5 LPA',
      shortDescription: 'Write blogs, wellness guides, and in-app content that genuinely helps adolescents navigate mental health.',
      description: 'Your words will be the first thing thousands of struggling students read. You will create empathetic, accurate, and engaging content that educates, inspires, and comforts.',
      responsibilities: ['Write weekly blog articles on adolescent mental health', 'Create in-app wellness program content', 'Research and cite credible mental health sources', 'Collaborate with therapists on content accuracy', 'Optimise content for SEO'],
      requirements: ['Strong English writing skills', 'Interest or background in psychology or mental health', 'Ability to write with empathy and clarity', 'Basic SEO knowledge'],
      benefits: ['Fully remote', 'Flexible schedule', 'Published byline on ZenMind blog', 'Access to premium wellness resources'],
      skills: ['Content Writing', 'SEO', 'Mental Health Knowledge', 'Storytelling', 'Research'], openings: 1, status: 'active', featured: false,
    },
    {
      title: 'Clinical Psychology Intern', department: 'Clinical', location: 'Remote',
      employmentType: 'Internship', experience: '0 Years', salary: '₹8,000–15,000 / month',
      shortDescription: 'Work alongside our clinical team to review therapeutic content and shape the wellness roadmap.',
      description: 'Final year psychology students and fresh graduates — this is your chance to contribute meaningfully to a platform changing how adolescents access mental health care in India.',
      responsibilities: ['Review and validate AI-generated wellness content', 'Assist in designing new wellness program steps', 'Provide feedback on chatbot response quality', 'Contribute to research on adolescent mental health trends'],
      requirements: ["Final year or completed Bachelor's/Master's in Psychology", 'Strong understanding of CBT and mindfulness', 'Empathy and attention to detail', 'Ability to commit 20+ hours/week'],
      benefits: ['Internship certificate', 'Mentorship from licensed psychologists', 'Letter of recommendation', 'Potential full-time conversion'],
      skills: ['Psychology', 'CBT', 'Mindfulness', 'Research', 'Content Review'], openings: 2, status: 'active', featured: false,
    },
    {
      title: 'Growth & Marketing Intern', department: 'Marketing', location: 'Remote',
      employmentType: 'Internship', experience: '0 Years', salary: '₹5,000–10,000 / month',
      shortDescription: 'Help ZenMind reach thousands more students through creative growth strategies and social campaigns.',
      description: "If you love social media, storytelling, and making a real difference — this is your role. You'll help ZenMind grow and bring mental health conversations to college campuses across India.",
      responsibilities: ["Manage ZenMind's Instagram and LinkedIn presence", 'Create engaging social media content about mental wellness', 'Run community outreach campaigns in colleges', 'Track analytics and report on growth metrics', 'Ideate viral campaigns around mental health awareness'],
      requirements: ['Passion for social media and digital marketing', 'Creative mindset with strong communication skills', 'Basic Canva / graphic design skills', 'Ability to commit 15+ hours/week'],
      benefits: ['Internship certificate', 'Portfolio-worthy campaigns', 'Letter of recommendation', 'Flexible schedule'],
      skills: ['Social Media', 'Canva', 'Content Strategy', 'Analytics', 'Community Building'], openings: 2, status: 'active', featured: true,
    },
  ];
  for (const jobData of jobsToSeed) {
    await new Job(jobData).save();
  }
  console.log('Default Jobs seeded (6 positions)');
}

// Seed Wellness Store
import StoreAsset from './models/StoreAsset.js';
const storeCount = await StoreAsset.countDocuments();
if (storeCount === 0) {
  await StoreAsset.insertMany([
    {
      title: '7-Day Anxiety Journal Template',
      description: 'A structured daily journaling template with prompts designed to help you identify anxiety triggers, track your mood, and build self-awareness over 7 days.',
      fileMime: 'application/pdf',
      fileName: '7-day-anxiety-journal.pdf',
      price: 0,
      category: 'Anxiety',
      fileData: '',
    },
    {
      title: 'Sleep Hygiene Checklist',
      description: 'A science-backed 20-point evening checklist to help you wind down, limit screen exposure, and prepare your body and mind for deep, restorative sleep.',
      fileMime: 'application/pdf',
      fileName: 'sleep-hygiene-checklist.pdf',
      price: 0,
      category: 'Sleep',
      fileData: '',
    },
    {
      title: 'Guided Meditation Script: Morning Reset',
      description: 'A soothing 10-minute morning meditation script to set a positive intention for your day, calm the nervous system, and cultivate presence before the world demands your attention.',
      fileMime: 'application/pdf',
      fileName: 'morning-reset-meditation.pdf',
      price: 0,
      category: 'Mindfulness',
      fileData: '',
    },
    {
      title: 'Affirmation Card Pack — 30 Cards',
      description: 'A beautifully designed pack of 30 printable affirmation cards covering self-worth, resilience, focus, and compassion. Print, cut, and place where you need them most.',
      fileMime: 'application/pdf',
      fileName: 'affirmation-cards-30.pdf',
      price: 49,
      category: 'Self-Esteem',
      fileData: '',
    },
    {
      title: 'Deep Sleep Story: The Quiet Forest',
      description: 'A calming bedtime story audio script read at a gentle pace, designed to slow racing thoughts and guide you into a deep, peaceful sleep within minutes.',
      fileMime: 'application/pdf',
      fileName: 'deep-sleep-story-quiet-forest.pdf',
      price: 29,
      category: 'Sleep',
      fileData: '',
    },
  ]);
  console.log('Default Wellness Store seeded (5 items)');
}

// Seed FAQs
import FAQ from './models/FAQ.js';
const faqCount = await FAQ.countDocuments();
if (faqCount === 0) {
  await FAQ.insertMany([
    { question: "How do I know the therapists are qualified?", answer: "Every therapist undergoes a stringent vetting process by the ZenMind administration. We manually verify medical licenses, educational backgrounds, and clinic details before they are allowed on the platform. We ensure you are speaking with a certified professional." },
    { question: "What happens if I miss my session?", answer: "We have a strict 10-minute grace period rule. If you do not join the video room within 10 minutes of the scheduled start time, the session is automatically cancelled and is subject to our late cancellation policy (which yields a 70% refund)." },
    { question: "What if the therapist doesn't show up?", answer: "In the rare event that a therapist fails to join the room within the 10-minute grace period, the system will automatically cancel the session and you will be issued a 100% refund immediately." },
    { question: "How secure is my data and video call?", answer: "Extremely secure. All video calls use WebRTC with end-to-end encryption. We do not record or store your video sessions. Your chat logs with the AI companion are encrypted and anonymized to ensure complete privacy." },
    { question: "How long does a refund take to process?", answer: "Once a cancellation occurs, the refund is initiated automatically from our end. It typically takes 5-7 business days for the funds to reflect in your original payment method, depending on your bank's processing times." },
    { question: "How does the new pricing structure work?", answer: "Our core platform remains free, including limited AI chat credits and basic journaling. Upgrade to ZenPlatinum to unlock unlimited AI chat, full access to premium Wellness Store assets, free therapy sessions, and advanced Wellness Programs." },
    { question: "What is the Wellness Store?", answer: "The Wellness Store offers a variety of digital assets to support your mental health journey — both free and premium content, including guided meditations, cognitive behavioral workbooks, and exclusive therapeutic exercises." },
    { question: "What are Wellness Programs?", answer: "Wellness Programs are structured courses designed by mental health professionals to tackle specific challenges like test anxiety or social skills. Join a program, track your progress, and complete actionable milestones at your own pace." },
  ]);
  console.log('Default FAQs seeded (8 items)');
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin
      ? (origin, cb) => {
          if (!origin || origin === allowedOrigin) return cb(null, true);
          cb(new Error(`CORS: origin ${origin} not allowed`));
        }
      : true,
    credentials: true
  }
});


io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // --- Chat Logic ---

  socket.on('join-chat', (chatId) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('send-chat-message', (data) => {
    // data: { chatId, message }
    socket.to(`chat_${data.chatId}`).emit('receive-chat-message', data.message);
  });

  socket.on('delete-chat-message', (data) => {
    // data: { chatId, messageId, deletedForEveryone, deletedBy }
    socket.to(`chat_${data.chatId}`).emit('chat-message-deleted', data);
  });
  // ------------------

  // --- Peer Support Circles ---
  socket.on('join-circle', (circleId) => {
    socket.join(`circle_${circleId}`);
  });

  socket.on('leave-circle', (circleId) => {
    socket.leave(`circle_${circleId}`);
  });

  socket.on('circle-message', (data) => {
    // data: { circleId, message } — broadcast to everyone in the circle room (including sender)
    io.to(`circle_${data.circleId}`).emit('circle-new-message', data.message);
  });

  socket.on('circle-message-deleted', (data) => {
    // data: { circleId, messageId } — admin moderation
    io.to(`circle_${data.circleId}`).emit('circle-message-removed', data.messageId);
  });
  // ----------------------------

  // --- Video Conference Logic ---
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.to(roomId).emit('user-connected', socket.id);
  });

  socket.on('offer', (data, roomId) => {
    socket.to(roomId).emit('offer', data);
  });

  socket.on('answer', (data, roomId) => {
    socket.to(roomId).emit('answer', data);
  });

  socket.on('ice-candidate', (data, roomId) => {
    socket.to(roomId).emit('ice-candidate', data);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    // Video disconnect logic
    if (socket.roomId) {
      socket.to(socket.roomId).emit('user-disconnected', socket.id);
    }
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API and Socket.IO listening on port ${port}`);
});

// ── Weekly Insights Cron — every Sunday at 8:00 AM IST (UTC+5:30 = 02:30 UTC) ──
// Cron format: minute hour day-of-month month day-of-week
cron.schedule('30 2 * * 0', async () => {
  console.log('[Cron] Generating weekly insights for all users…');
  try {
    const User = (await import('./models/User.js')).default;
    const users = await User.find({}).select('_id').lean();
    let success = 0, failed = 0;
    for (const user of users) {
      try {
        await generateInsightForUser(user._id);
        success++;
      } catch (e) {
        console.error(`[Cron] Insight failed for user ${user._id}:`, e.message);
        failed++;
      }
      // Small delay to avoid Groq rate limits
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`[Cron] Weekly insights done. Success: ${success}, Failed: ${failed}`);
  } catch (err) {
    console.error('[Cron] Weekly insights cron error:', err.message);
  }
}, { timezone: 'Asia/Kolkata' });



server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${port} is already in use. Kill the process using that port and restart.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Graceful shutdown on SIGINT / SIGTERM
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] HTTP and Socket.IO server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('[Database] MongoDB connection cleanly closed.');
    } catch (e) {
      console.error('[Database] Error closing MongoDB connection:', e);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

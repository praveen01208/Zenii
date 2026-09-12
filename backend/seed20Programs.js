import 'dotenv/config';
import mongoose from 'mongoose';
import { WellnessProgram } from './src/models/WellnessProgram.js';

const GRADIENTS = [
  ['#7c3aed', '#a78bfa'], ['#1e40af', '#6366f1'], ['#0d5d3a', '#10b981'],
  ['#b45309', '#f59e0b'], ['#be123c', '#fb7185'], ['#065f46', '#34d399'],
  ['#374151', '#6b7280'], ['#0369a1', '#38bdf8']
];

const SEED_PROGRAMS = [
  {
    title: "7 Days to Better Sleep",
    description: "A foundational program designed to help you build an evening routine that promotes deep, restorative sleep. Learn to quiet your mind before bed.",
    category: "sleep",
    difficulty: "beginner",
    durationDays: 7,
    coverGradientFrom: "#1e40af", coverGradientTo: "#6366f1",
    steps: [
      { dayNumber: 1, title: "The Sleep Audit", content: "Review your current sleep environment and habits.", exerciseType: "reflection", durationMinutes: 10 },
      { dayNumber: 2, title: "Digital Detox", content: "Implement a 60-minute no-screen rule before bed.", exerciseType: "other", durationMinutes: 60 },
      { dayNumber: 3, title: "Deep Breathing for Sleep", content: "Practice the 4-7-8 breathing technique.", exerciseType: "breathing", durationMinutes: 10 },
      { dayNumber: 4, title: "Evening Journaling", content: "Write down any lingering thoughts to clear your mind.", exerciseType: "journaling", durationMinutes: 15 },
      { dayNumber: 5, title: "Body Scan Meditation", content: "A progressive muscle relaxation exercise.", exerciseType: "meditation", durationMinutes: 20 },
      { dayNumber: 6, title: "Optimizing Your Bedroom", content: "Adjust temperature, light, and noise for optimal rest.", exerciseType: "other", durationMinutes: 15 },
      { dayNumber: 7, title: "Maintaining the Routine", content: "Reflect on improvements and set a lasting sleep schedule.", exerciseType: "reflection", durationMinutes: 10 }
    ]
  },
  {
    title: "Anxiety Relief Kickstart",
    description: "When overwhelm hits, use this 5-day emergency toolkit to ground yourself and regain control over racing thoughts.",
    category: "anxiety",
    difficulty: "intermediate",
    durationDays: 5,
    coverGradientFrom: "#7c3aed", coverGradientTo: "#a78bfa",
    steps: [
      { dayNumber: 1, title: "Identify the Triggers", content: "Note down situations that sparked anxiety today.", exerciseType: "journaling", durationMinutes: 10 },
      { dayNumber: 2, title: "Box Breathing", content: "Inhale 4s, hold 4s, exhale 4s, hold 4s.", exerciseType: "breathing", durationMinutes: 5 },
      { dayNumber: 3, title: "The 5-4-3-2-1 Grounding Method", content: "Find 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.", exerciseType: "meditation", durationMinutes: 10 },
      { dayNumber: 4, title: "Challenging Anxious Thoughts", content: "Write an anxious thought and provide evidence against it.", exerciseType: "journaling", durationMinutes: 15 },
      { dayNumber: 5, title: "Gentle Movement", content: "Release physical tension through 15 minutes of stretching.", exerciseType: "movement", durationMinutes: 15 }
    ]
  },
  {
    title: "14-Day Mindfulness Masterclass",
    description: "Deep dive into the art of being present. You will learn to detach from the noise of daily life and find stillness in any situation.",
    category: "mindfulness",
    difficulty: "advanced",
    durationDays: 14,
    coverGradientFrom: "#0d5d3a", coverGradientTo: "#10b981",
    steps: Array.from({ length: 14 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Mindful Day ${i + 1}`,
      content: `Today's focus is observing your breath for 20 minutes without judgment. If your mind wanders, gently bring it back.`,
      exerciseType: "meditation",
      durationMinutes: 20
    }))
  },
  {
    title: "Morning Motivation Boost",
    description: "Start your day with purpose. A 3-day quick start guide to waking up energized and ready to tackle your goals.",
    category: "motivation",
    difficulty: "beginner",
    durationDays: 3,
    coverGradientFrom: "#b45309", coverGradientTo: "#f59e0b",
    steps: [
      { dayNumber: 1, title: "Setting Intentions", content: "Write down your 3 primary goals for the week.", exerciseType: "journaling", durationMinutes: 10 },
      { dayNumber: 2, title: "Energizing Breathwork", content: "Practice rapid, energizing breathing (Breath of Fire).", exerciseType: "breathing", durationMinutes: 5 },
      { dayNumber: 3, title: "Visualizing Success", content: "Spend 10 minutes mentally walking through a successful day.", exerciseType: "meditation", durationMinutes: 10 }
    ]
  },
  {
    title: "Stress Detox Weekend",
    description: "A 2-day immersive reset for the weekend to completely disconnect from work and academic stress.",
    category: "stress",
    difficulty: "beginner",
    durationDays: 2,
    coverGradientFrom: "#0369a1", coverGradientTo: "#38bdf8",
    steps: [
      { dayNumber: 1, title: "Nature Walk", content: "Spend 30 minutes walking outdoors without your phone.", exerciseType: "movement", durationMinutes: 30 },
      { dayNumber: 2, title: "Brain Dump", content: "Write out every stressful thought on paper, then rip it up.", exerciseType: "journaling", durationMinutes: 15 }
    ]
  },
  {
    title: "Building Core Self-Esteem",
    description: "Transform your inner critic into an inner coach over 10 days of guided reflection and cognitive reframing.",
    category: "self_esteem",
    difficulty: "intermediate",
    durationDays: 10,
    coverGradientFrom: "#be123c", coverGradientTo: "#fb7185",
    steps: Array.from({ length: 10 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Self-Love Day ${i + 1}`,
      content: `List three things you appreciate about yourself today. Avoid physical traits; focus on character.`,
      exerciseType: "reflection",
      durationMinutes: 10
    }))
  },
  {
    title: "Breathing Through Panic",
    description: "A short, intense 3-day program focusing purely on breath control to immediately down-regulate your nervous system.",
    category: "anxiety",
    difficulty: "beginner",
    durationDays: 3,
    coverGradientFrom: "#374151", coverGradientTo: "#6b7280",
    steps: [
      { dayNumber: 1, title: "Diaphragmatic Breathing", content: "Breathe deep into your belly for 5 minutes.", exerciseType: "breathing", durationMinutes: 5 },
      { dayNumber: 2, title: "Physiological Sigh", content: "Two quick inhales followed by a long exhale. Repeat for 3 minutes.", exerciseType: "breathing", durationMinutes: 3 },
      { dayNumber: 3, title: "Alternate Nostril Breathing", content: "Balance your nervous system with this 5-minute practice.", exerciseType: "breathing", durationMinutes: 5 }
    ]
  },
  {
    title: "The Gratitude Challenge",
    description: "Shift your perspective over 7 days by actively hunting for the good in your life, no matter how small.",
    category: "mindfulness",
    difficulty: "beginner",
    durationDays: 7,
    coverGradientFrom: "#065f46", coverGradientTo: "#34d399",
    steps: Array.from({ length: 7 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Gratitude Journal - Day ${i + 1}`,
      content: `Write down 3 new things you are grateful for today. Be specific!`,
      exerciseType: "journaling",
      durationMinutes: 5
    }))
  },
  {
    title: "Burnout Recovery Plan",
    description: "A gentle 5-day reintroduction to productivity without triggering exhaustion or anxiety.",
    category: "stress",
    difficulty: "advanced",
    durationDays: 5,
    coverGradientFrom: "#1e40af", coverGradientTo: "#38bdf8",
    steps: [
      { dayNumber: 1, title: "Acknowledge the Burnout", content: "Journal about what led to your current state of exhaustion.", exerciseType: "journaling", durationMinutes: 20 },
      { dayNumber: 2, title: "Absolute Rest", content: "Engage in 30 minutes of completely passive rest (no sleep, no screens).", exerciseType: "meditation", durationMinutes: 30 },
      { dayNumber: 3, title: "Micro-Tasks", content: "Complete just one tiny task today. Celebrate it.", exerciseType: "other", durationMinutes: 5 },
      { dayNumber: 4, title: "Setting Boundaries", content: "Write down three hard boundaries you will enforce going forward.", exerciseType: "reflection", durationMinutes: 15 },
      { dayNumber: 5, title: "Sustainable Pacing", content: "Create a new daily schedule that includes mandatory rest periods.", exerciseType: "other", durationMinutes: 20 }
    ]
  },
  {
    title: "Finding Your Purpose",
    description: "A 7-day deep dive into your core values and long-term vision. Ideal for students feeling lost in their academic journey.",
    category: "motivation",
    difficulty: "intermediate",
    durationDays: 7,
    coverGradientFrom: "#b45309", coverGradientTo: "#f59e0b",
    steps: Array.from({ length: 7 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Vision Crafting Day ${i + 1}`,
      content: `Reflect on the moments you felt most alive. How can you incorporate that into your daily life?`,
      exerciseType: "reflection",
      durationMinutes: 15
    }))
  },
  {
    title: "Digital Minimalism Reboot",
    description: "Break the cycle of doom-scrolling with this 4-day digital diet designed to clear mental fog.",
    category: "mindfulness",
    difficulty: "intermediate",
    durationDays: 4,
    coverGradientFrom: "#374151", coverGradientTo: "#6b7280",
    steps: [
      { dayNumber: 1, title: "Screen Time Audit", content: "Review your screen time stats and identify the biggest time sinks.", exerciseType: "reflection", durationMinutes: 10 },
      { dayNumber: 2, title: "App Purge", content: "Delete 3 apps that do not serve your mental health.", exerciseType: "other", durationMinutes: 10 },
      { dayNumber: 3, title: "Grayscale Day", content: "Turn your phone display to grayscale to reduce dopamine loops.", exerciseType: "other", durationMinutes: 5 },
      { dayNumber: 4, title: "Analog Evening", content: "Spend the last 2 hours of your day completely screen-free.", exerciseType: "other", durationMinutes: 120 }
    ]
  },
  {
    title: "Overcoming Imposter Syndrome",
    description: "A 5-day cognitive behavioral approach to owning your achievements and silencing the fraud feeling.",
    category: "self_esteem",
    difficulty: "advanced",
    durationDays: 5,
    coverGradientFrom: "#7c3aed", coverGradientTo: "#fb7185",
    steps: [
      { dayNumber: 1, title: "Cataloging Success", content: "Write a list of 10 things you have genuinely accomplished.", exerciseType: "journaling", durationMinutes: 20 },
      { dayNumber: 2, title: "Fact vs Feeling", content: "Learn to separate the feeling of inadequacy from the facts of your competence.", exerciseType: "reflection", durationMinutes: 15 },
      { dayNumber: 3, title: "Owning Your Part", content: "Identify how your specific actions led to your successes.", exerciseType: "reflection", durationMinutes: 15 },
      { dayNumber: 4, title: "The 'Yet' Mindset", content: "Reframe 'I can't do this' to 'I can't do this yet.'", exerciseType: "other", durationMinutes: 10 },
      { dayNumber: 5, title: "Accepting Compliments", content: "Practice saying just 'Thank you' without deflecting.", exerciseType: "other", durationMinutes: 5 }
    ]
  },
  {
    title: "Sleep Hygiene Deep Dive",
    description: "A 10-day rigorous overhaul of your sleep environment, habits, and circadian rhythm.",
    category: "sleep",
    difficulty: "advanced",
    durationDays: 10,
    coverGradientFrom: "#1e40af", coverGradientTo: "#6b7280",
    steps: Array.from({ length: 10 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Sleep Optimization Day ${i + 1}`,
      content: `Ensure you get 15 minutes of direct morning sunlight today to reset your circadian clock.`,
      exerciseType: "movement",
      durationMinutes: 15
    }))
  },
  {
    title: "Quick-Fix Stress Melter",
    description: "Only have 5 days? Use this rapid intervention protocol to melt away acute academic stress before exams.",
    category: "stress",
    difficulty: "beginner",
    durationDays: 5,
    coverGradientFrom: "#0d5d3a", coverGradientTo: "#34d399",
    steps: Array.from({ length: 5 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Stress Melter - Day ${i + 1}`,
      content: `Perform 10 minutes of progressive muscle relaxation before studying.`,
      exerciseType: "meditation",
      durationMinutes: 10
    }))
  },
  {
    title: "The Procrastination Cure",
    description: "A 6-day program using the Pomodoro technique and psychological reframing to beat task paralysis.",
    category: "motivation",
    difficulty: "intermediate",
    durationDays: 6,
    coverGradientFrom: "#b45309", coverGradientTo: "#fb7185",
    steps: [
      { dayNumber: 1, title: "The 2-Minute Rule", content: "Find a task you've been avoiding and do just 2 minutes of it.", exerciseType: "other", durationMinutes: 2 },
      { dayNumber: 2, title: "Forgiving the Delay", content: "Journal about why you delayed, forgive yourself, and move on.", exerciseType: "journaling", durationMinutes: 10 },
      { dayNumber: 3, title: "Breaking It Down", content: "Take a huge project and break it into ridiculously small micro-tasks.", exerciseType: "other", durationMinutes: 15 },
      { dayNumber: 4, title: "Pomodoro Practice", content: "Work for 25 minutes, then force a 5-minute break.", exerciseType: "other", durationMinutes: 30 },
      { dayNumber: 5, title: "Removing Friction", content: "Set up your workspace so starting your work takes zero effort.", exerciseType: "other", durationMinutes: 10 },
      { dayNumber: 6, title: "Reward Systems", content: "Plan a healthy reward for completing your next big task.", exerciseType: "reflection", durationMinutes: 10 }
    ]
  },
  {
    title: "Social Anxiety Toolkit",
    description: "Prepare for social interactions with this 4-day prep course. Build confidence before events.",
    category: "anxiety",
    difficulty: "advanced",
    durationDays: 4,
    coverGradientFrom: "#7c3aed", coverGradientTo: "#38bdf8",
    steps: [
      { dayNumber: 1, title: "Pre-Event Visualization", content: "Visualize the event going smoothly for 10 minutes.", exerciseType: "meditation", durationMinutes: 10 },
      { dayNumber: 2, title: "Safe Exits", content: "Plan a graceful exit strategy so you don't feel trapped.", exerciseType: "reflection", durationMinutes: 5 },
      { dayNumber: 3, title: "Curiosity Mindset", content: "Prepare 3 open-ended questions to ask others.", exerciseType: "other", durationMinutes: 10 },
      { dayNumber: 4, title: "Post-Event Decompression", content: "Journal about what went well instead of dwelling on awkward moments.", exerciseType: "journaling", durationMinutes: 15 }
    ]
  },
  {
    title: "Emotional Regulation 101",
    description: "Learn to ride the waves of intense emotions over 7 days rather than being consumed by them.",
    category: "other",
    difficulty: "intermediate",
    durationDays: 7,
    coverGradientFrom: "#be123c", coverGradientTo: "#b45309",
    steps: Array.from({ length: 7 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Emotion Surfing - Day ${i + 1}`,
      content: `Notice an emotion today. Name it out loud. Sit with it for 2 minutes without trying to change it.`,
      exerciseType: "meditation",
      durationMinutes: 2
    }))
  },
  {
    title: "Mindful Eating Basics",
    description: "A 5-day journey to repair your relationship with food by introducing slow, intentional eating practices.",
    category: "mindfulness",
    difficulty: "beginner",
    durationDays: 5,
    coverGradientFrom: "#0d5d3a", coverGradientTo: "#065f46",
    steps: Array.from({ length: 5 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Intentional Bite - Day ${i + 1}`,
      content: `Eat your first meal today completely without screens or distractions. Chew slowly.`,
      exerciseType: "other",
      durationMinutes: 20
    }))
  },
  {
    title: "Confidence in the Classroom",
    description: "Struggle to speak up in class? This 3-day micro-program helps you build the courage to raise your hand.",
    category: "self_esteem",
    difficulty: "beginner",
    durationDays: 3,
    coverGradientFrom: "#0369a1", coverGradientTo: "#1e40af",
    steps: [
      { dayNumber: 1, title: "The Fear Analysis", content: "Write down the absolute worst-case scenario of answering a question wrong.", exerciseType: "journaling", durationMinutes: 10 },
      { dayNumber: 2, title: "The Low-Stakes Win", content: "Ask a simple clarifying question in class today.", exerciseType: "other", durationMinutes: 5 },
      { dayNumber: 3, title: "Offering an Opinion", content: "Share a brief thought or opinion during a discussion.", exerciseType: "other", durationMinutes: 5 }
    ]
  },
  {
    title: "The Ultimate Reset",
    description: "Our longest program. 30 days covering all aspects of mental wellness: sleep, anxiety, stress, and self-esteem.",
    category: "other",
    difficulty: "advanced",
    durationDays: 30,
    coverGradientFrom: "#7c3aed", coverGradientTo: "#10b981",
    steps: Array.from({ length: 30 }, (_, i) => ({
      dayNumber: i + 1,
      title: `Ultimate Reset - Day ${i + 1}`,
      content: `Today's objective: Spend 10 minutes journaling your progress, followed by 5 minutes of stretching.`,
      exerciseType: "journaling",
      durationMinutes: 15
    }))
  }
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Optionally: delete all official programs before seeding so there are no duplicates.
    // We will leave custom programs (isCustom: true) alone.
    await WellnessProgram.deleteMany({ isCustom: false });
    console.log('Cleared existing official wellness programs.');

    // Enforce schema compliance before inserting
    const programsToInsert = SEED_PROGRAMS.map(p => ({
      ...p,
      isPublished: true,
      isCustom: false,
      enrollmentCount: Math.floor(Math.random() * 500) + 50 // fake some enrollments
    }));

    await WellnessProgram.insertMany(programsToInsert);
    console.log(`Successfully seeded ${programsToInsert.length} wellness programs!`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();

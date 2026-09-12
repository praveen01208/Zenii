import mongoose from 'mongoose';
import 'dotenv/config';
import FAQ from './models/FAQ.js';

const faqsToSeed = [
  {
    question: "How do I know the therapists are qualified?",
    answer: "Every therapist undergoes a stringent vetting process by the ZenMind administration. We manually verify medical licenses, educational backgrounds, and clinic details before they are allowed on the platform. We ensure you are speaking with a certified professional."
  },
  {
    question: "What happens if I miss my session?",
    answer: "We have a strict 10-minute grace period rule. If you do not join the video room within 10 minutes of the scheduled start time, the session is automatically cancelled and is subject to our late cancellation policy (which yields a 70% refund)."
  },
  {
    question: "What if the therapist doesn't show up?",
    answer: "In the rare event that a therapist fails to join the room within the 10-minute grace period, the system will automatically cancel the session and you will be issued a 100% refund immediately."
  },
  {
    question: "How secure is my data and video call?",
    answer: "Extremely secure. All video calls use WebRTC with end-to-end encryption. We do not record or store your video sessions. Furthermore, your chat logs with the AI companion are encrypted and anonymized to ensure complete privacy."
  },
  {
    question: "How long does a refund take to process?",
    answer: "Once a cancellation occurs, the refund is initiated automatically from our end. It typically takes 5-7 business days for the funds to reflect in your original payment method, depending on your bank's processing times."
  },
  {
    question: "How does the new pricing structure work?",
    answer: "Our core platform remains free, including limited AI chat credits and basic journaling. If you need more support, you can upgrade to our Premium tiers like ZenPlatinum, which unlocks unlimited AI chat, full access to premium Wellness Store assets, free therapy sessions, and advanced Wellness Programs."
  },
  {
    question: "What is the Wellness Store?",
    answer: "The Wellness Store offers a variety of digital assets to support your mental health journey. You can find both free resources and premium content, including guided meditations, cognitive behavioral workbooks, and exclusive therapeutic exercises."
  },
  {
    question: "What are Wellness Programs?",
    answer: "Wellness Programs are structured courses designed by mental health professionals to tackle specific challenges like test anxiety or social skills. You can join a program, track your progress, and complete actionable milestones at your own pace."
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zenmind')
  .then(async () => {
    console.log('Connected to MongoDB');
    for (const faq of faqsToSeed) {
      await new FAQ(faq).save();
    }
    console.log('Successfully seeded FAQs');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding FAQs:', err);
    process.exit(1);
  });

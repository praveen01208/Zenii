import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, BookOpen, Users, Shield, Zap, LineChart, HeartHandshake, PenLine, ShoppingBag, Activity } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI-Powered Chatbot',
    description: 'Share your thoughts and feelings with our empathetic AI companion that listens without judgment, available 24/7.',
    video: '/asset/page2/ai.mp4',
    isFirst: true,
  },
  {
    icon: BookOpen,
    title: 'Inspirational Stories',
    description: 'Receive personalized, real-time stories that resonate with your experiences and provide hope and inspiration.',
    video: '/asset/page2/story.mp4',
  },
  {
    icon: Users,
    title: 'Professional Therapists',
    description: 'Connect with licensed therapists who specialize in adolescent mental health for guided support.',
    video: '/asset/page2/therapiest.mp4',
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Your conversations are completely confidential and protected with end-to-end encryption.',
    video: '/asset/page2/privacy.mp4',
  },
  {
    icon: Zap,
    title: 'Instant Support',
    description: 'Get immediate help when you need it most, with crisis support and coping strategies.',
    video: '/asset/page2/support.mp4',
  },
  {
    icon: LineChart,
    title: 'Weekly & Monthly Analysis',
    description: 'Track trends in mood, habits, and progress with clear weekly and monthly wellness analysis.',
    video: '/asset/page2/graph.mp4',
  },
  {
    icon: HeartHandshake,
    title: 'Peer Circle',
    description: 'Connect with a supportive community to share experiences and grow together in a safe space.',
    video: '/asset/page2/peer.mp4',
  },
  {
    icon: PenLine,
    title: 'Mood Journaling',
    description: 'Express your feelings through mood journaling and receive personalized, actionable AI suggestions.',
    video: '/asset/page2/moodjournaling.mp4',
  },
  {
    icon: ShoppingBag,
    title: 'Wellness Store',
    description: 'Explore our wellness store for both free and premium digital assets to support your journey.',
    video: '/asset/page2/store.mp4',
  },
  {
    icon: Activity,
    title: 'Wellness Programs',
    description: 'Join, participate in, and complete specialized wellness programs tailored for your mental health.',
    video: '/asset/page2/wellness.mp4',
  },
];

/* ── Each card manages its OWN video — plays only when in viewport ── */
function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const Icon = feature.icon;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1, rootMargin: '60px' }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="min-w-[82%] sm:min-w-[60%] lg:min-w-[42%] xl:min-w-[36%] snap-start w-full mx-auto flex"
    >
      <div
        className="w-full h-full flex flex-col rounded-xl border border-[#0d5d3a] dark:border-[#10b981] bg-white dark:bg-[#111111] shadow-sm group"
        style={{ padding: '2rem' }}
      >
        {feature.isFirst ? (
          /* ── AI Chatbot card — full height matching others ── */
          <div className="zen-chat-container" style={{ minHeight: '18rem' }}>
            <div className="zen-chat-box">
              <div className="zen-chat-inner">
                <div style={{ position: 'relative', display: 'flex' }}>
                  <textarea className="zen-chat-textarea" placeholder="Share how you're feeling... ˚" style={{ height: 90 }} />
                </div>
                <div className="zen-chat-options">
                  <div className="zen-chat-btns">
                    <button title="Attach">
                      <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v8a5 5 0 1 0 10 0V6.5a3.5 3.5 0 1 0-7 0V15a2 2 0 0 0 4 0V8" /></svg>
                    </button>
                    <button title="Add">
                      <svg viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg"><path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zm0-8h6m-3-3v6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" fill="none" /></svg>
                    </button>
                    <button title="Language">
                      <svg viewBox="0 0 24 24" height={20} width={20} xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.01 8.01 0 0 0 5.648 6.667M10.03 13c.151 2.439.848 4.73 1.97 6.752A15.9 15.9 0 0 0 13.97 13zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.01 8.01 0 0 0 19.938 13M4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333A8.01 8.01 0 0 0 4.062 11m5.969 0h3.938A15.9 15.9 0 0 0 12 4.248A15.9 15.9 0 0 0 10.03 11m4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.01 8.01 0 0 0-5.648-6.667" fill="currentColor" /></svg>
                    </button>
                  </div>
                  <button className="zen-chat-submit" title="Send">
                    <i>
                      <svg viewBox="0 0 512 512" width={18} height={18}><path fill="currentColor" d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05" /></svg>
                    </i>
                  </button>
                </div>
              </div>
            </div>
            <div className="zen-chat-tags">
              <span>Mood Check</span>
              <span>Talk to Zeni</span>
              <span>More</span>
            </div>
          </div>
        ) : (
          /* ── Standard card: clean video, no mask ── */
          <div className="h-[15rem] md:h-[18rem] rounded-xl overflow-hidden relative bg-neutral-900">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover rounded-xl"
              src={feature.video}
              muted
              loop
              playsInline
              preload="none"
              style={{ transform: 'translateZ(0)', willChange: 'transform' }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/30 to-transparent rounded-b-xl pointer-events-none" />

          </div>
        )}

        <p className="text-lg font-semibold text-[#0d5d3a] dark:text-[#10b981] py-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          {feature.title}
        </p>
        <p className="text-sm font-normal text-[#4a7c5d] dark:text-gray-400 max-w-sm">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleScrollCards = useCallback((direction: 'left' | 'right') => {
    const slider = sliderRef.current;
    if (!slider) return;
    const amount = Math.min(slider.clientWidth * 0.85, 520);
    slider.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-8 sm:py-10 lg:py-12 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e8f5e9] dark:bg-[#10b981] rounded-full blur-3xl opacity-50 dark:opacity-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c8e6c9] dark:bg-[#059669] rounded-full blur-3xl opacity-30 dark:opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-medium">Features</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
              Thrive
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4">
            Our comprehensive platform provides multiple pathways to support your mental wellness journey.
          </p>
        </motion.div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleScrollCards('left')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0d5d3a]/25 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0d5d3a] dark:text-gray-300 text-xl leading-none transition hover:border-[#0d5d3a] dark:hover:border-white/20 hover:bg-[#0d5d3a] dark:hover:bg-[#222222] hover:text-white dark:hover:text-white"
            aria-label="Scroll features left"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => handleScrollCards('right')}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#0d5d3a]/25 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0d5d3a] dark:text-gray-300 text-xl leading-none transition hover:border-[#0d5d3a] dark:hover:border-white/20 hover:bg-[#0d5d3a] dark:hover:bg-[#222222] hover:text-white dark:hover:text-white"
            aria-label="Scroll features right"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { apiFetch } from '../api/client';

export default function Statistics() {
  const [statsData, setStatsData] = useState<any>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    apiFetch<any>('/public/settings').then(res => setStatsData(res)).catch(console.error);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const dynamicStats = [
    { value: statsData?.activeUsers || '50K+', label: 'Active Users' },
    { value: statsData?.satisfactionRate || '98%', label: 'Satisfaction Rate' },
    { value: statsData?.therapistsCount || '100+', label: 'Therapists' },
    { value: statsData?.supportAvailable || '24/7', label: 'Support Available' },
  ];

  return (
    <section ref={sectionRef} className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-[#e8f5e9] to-white dark:from-[#0a2617] dark:to-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZDVkM2EiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMgMTItMTJ6bS0yNCAwYzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMgMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40 dark:opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Trusted by{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4">
            Join a growing community committed to mental wellness and personal growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {dynamicStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-[#111111] border-2 border-[#0d5d3a] dark:border-[#10b981] shadow-sm flex flex-col items-center justify-center text-center min-h-[130px] transition-transform duration-200"
              style={{
                padding: '28px 20px',
                borderRadius: 24,
              }}
            >
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>
                <span
                  className="text-[#0d5d3a] dark:text-[#10b981]"
                  style={{
                    fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
                    opacity: hasAnimated ? 1 : 0,
                    transform: hasAnimated ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 1s ease',
                    display: 'inline-block',
                  }}
                >
                  {stat.value}
                </span>
              </div>
              <p className="text-[#4a7c5d] dark:text-gray-400" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


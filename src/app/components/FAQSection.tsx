import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { apiFetch } from '../api/client';


export default function FAQSection({ onGetStarted }: { onGetStarted?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [open, setOpen] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);

  useEffect(() => {
    apiFetch<any>('/faqs')
      .then(res => {
        if (res.faqs && res.faqs.length > 0) {
          setFaqs(res.faqs.map((f: any) => ({ q: f.question, a: f.answer })));
        }
      })
      .catch(err => console.error('Failed to load FAQs:', err));
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 sm:py-28 bg-white dark:bg-[#050505]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0d5d3a]/08 dark:bg-[#10b981]/10 border border-[#0d5d3a]/15 dark:border-[#10b981]/20 mb-5">
            <HelpCircle className="w-3.5 h-3.5 text-[#0d5d3a] dark:text-[#10b981]" />
            <span className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0a2617] dark:text-white mb-4 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Questions? We have answers.
          </h2>
          <p className="text-base sm:text-lg text-[#4a7c5d] dark:text-gray-400 max-w-xl mx-auto">
            Everything you need to know before you take the first step.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#0d5d3a]/30 dark:border-[#10b981]/30 bg-[#f0fbf4] dark:bg-[#0d1f14]'
                    : 'border-[#0d5d3a]/10 dark:border-white/08 bg-white dark:bg-[#111111] hover:border-[#0d5d3a]/20 dark:hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={`font-semibold text-sm sm:text-base leading-snug transition-colors ${
                    isOpen ? 'text-[#0d5d3a] dark:text-[#10b981]' : 'text-[#0a2617] dark:text-gray-100'
                  }`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isOpen
                      ? 'bg-[#0d5d3a] dark:bg-[#10b981] text-white'
                      : 'bg-[#0d5d3a]/08 dark:bg-white/08 text-[#0d5d3a] dark:text-[#10b981]'
                  }`}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 text-sm text-[#4a7c5d] dark:text-gray-400 leading-relaxed border-t border-[#0d5d3a]/10 dark:border-white/08 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-14 text-center"
        >
          <p className="text-[#4a7c5d] dark:text-gray-400 text-sm mb-5">
            Still have questions? Our team responds within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="px-7 py-3 bg-[#0d5d3a] text-white rounded-full font-semibold text-sm shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition"
            >
              Start for Free
            </motion.button>
            <motion.a
              href="mailto:hello@zenmind.in"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3 border border-[#0d5d3a]/25 dark:border-white/15 text-[#0d5d3a] dark:text-gray-300 rounded-full font-semibold text-sm hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition"
            >
              Email Us
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

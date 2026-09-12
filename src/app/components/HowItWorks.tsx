import { motion } from 'motion/react';
import { UserPlus, MessageSquare, Lightbulb, TrendingUp } from 'lucide-react';
import Stepper, { Step } from './Stepper';

const steps = [
  { number: '01', icon: UserPlus,      title: 'Create Your Account', description: 'Sign up in minutes with complete privacy and security. Your journey begins here.' },
  { number: '02', icon: MessageSquare, title: 'Start Chatting',       description: 'Share your thoughts with our AI companion. Feel heard, understood, and supported.' },
  { number: '03', icon: Lightbulb,     title: 'Get Inspired',         description: 'Receive personalized stories and insights tailored to your experiences.' },
  { number: '04', icon: TrendingUp,    title: 'Track Your Growth',    description: 'Connect with therapists, monitor progress, and celebrate your wellness journey.' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 sm:py-10 lg:py-12 bg-gradient-to-br from-[#f8fdf9] to-[#e8f5e9] dark:from-[#050505] dark:to-[#111111] transition-colors duration-300 relative overflow-hidden">
      <style>{`
        /* ── Stepper card override — green neumorphic theme ── */
        .zen-stepper-wrap [class*="rounded"] {
          background: #ffffff !important;
          border: 2px solid #0d5d3a !important;
          box-shadow: 0 4px 12px rgba(13,93,58,0.08) !important;
          background-image: none !important;
        }
        .dark .zen-stepper-wrap [class*="rounded"] {
          background: #111111 !important;
          border-color: #10b981 !important;
          box-shadow: 0 4px 12px rgba(16,185,129,0.08) !important;
        }
        /* Nav prev/next buttons */
        .zen-step-nav-btn {
          cursor: pointer; border-radius: 16px; border: none;
          padding: 2px;
          background: #0d5d3a;
          position: relative; font-size: 14px; font-weight: 600;
          transition: transform 0.2s ease;
        }
        .dark .zen-step-nav-btn {
          background: #10b981;
        }
        .zen-step-nav-btn::after, .zen-step-nav-blob, .zen-step-nav-inner::before {
          display: none;
        }
        .zen-step-nav-inner {
          padding: 10px 22px; border-radius: 14px; color: #ffffff;
          z-index: 3; position: relative;
          background: #0d5d3a;
          font-weight: 600;
        }
        .dark .zen-step-nav-inner {
          background: #10b981;
          color: #064e3b;
        }
        .zen-step-nav-btn:hover { transform: translateY(-2px); }
        .zen-step-nav-btn:active { transform: translateY(1px); }
        /* Step number & text colour inside the dark card */
        .zen-stepper-wrap .text-\\[\\#0a2617\\] { color: #0d5d3a !important; }
        .zen-stepper-wrap .text-\\[\\#4a7c5d\\] { color: #4a7c5d !important; }
        .zen-stepper-wrap .dark\\:text-white  { color: #10b981 !important; }
        .zen-stepper-wrap .dark\\:text-gray-400 { color: rgba(167,243,208,0.65) !important; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }} viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-medium">How It Works</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Your Path to{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">Wellness</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4">
            Four simple steps to start your transformative journey toward better mental health.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }} viewport={{ once: true, amount: 0.25 }}
          className="zen-stepper-wrap"
        >
          <Stepper
            initialStep={1}
            onStepChange={() => {}}
            onFinalStepCompleted={() => {}}
            backButtonText="← Previous"
            nextButtonText="Next →"
            backButtonStyle={{
              cursor: 'pointer', borderRadius: '16px', border: 'none', padding: '2px',
              background: 'radial-gradient(circle 80px at 80% -10%, #34d399, #0a2617)',
              position: 'relative', fontSize: '14px', fontWeight: 600,
            }}
            nextButtonStyle={{
              cursor: 'pointer', borderRadius: '16px', border: 'none', padding: '2px',
              background: 'radial-gradient(circle 80px at 80% -10%, #34d399, #0a2617)',
              position: 'relative', fontSize: '14px', fontWeight: 600,
            }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Step key={step.number}>
                  <div className="flex flex-col items-center justify-center py-6 text-center min-h-[220px] sm:min-h-[240px]">
                    <span
                      className="text-5xl sm:text-6xl opacity-20 mb-4 text-[#0d5d3a] dark:text-[#10b981]"
                      style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                      }}
                    >
                      {step.number}
                    </span>
                    <div 
                      className="bg-[#0d5d3a] dark:bg-[#10b981] shadow-md shadow-[#0d5d3a]/20 dark:shadow-none"
                      style={{
                        width: 52, height: 52, borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                      }}>
                      <Icon className="w-6 h-6 text-white dark:text-[#064e3b]" />
                    </div>
                    <h3 className="text-xl sm:text-2xl mb-3 text-[#0d5d3a] dark:text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto text-[#4a7c5d] dark:text-gray-400">
                      {step.description}
                    </p>
                  </div>
                </Step>
              );
            })}
          </Stepper>
        </motion.div>
      </div>
    </section>
  );
}

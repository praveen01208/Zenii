import { useEffect, useRef, useState } from 'react';
import logo from '../../../asset/logo.png';

interface Props {
  apiReady: boolean;      // set true when backend responds
  onComplete: () => void; // called when bar reaches 100
}

export default function LoadingScreen({ apiReady, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  /* Progress tied to apiReady */
  useEffect(() => {
    const id = setInterval(() => {
      if (doneRef.current) return;
      let p = progressRef.current;

      if (apiReady) {
        // Backend responded — race to 100
        p = Math.min(100, p + 6);
      } else {
        // Crawl towards 88 — stop and wait
        const maxWait = 88;
        const inc = p < 25 ? 2.8 : p < 55 ? 1.8 : p < 78 ? 0.9 : 0.12;
        p = Math.min(maxWait, p + inc + Math.random() * 0.4);
      }

      progressRef.current = p;
      setProgress(Math.floor(p));

      if (p >= 100 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(id);
        setTimeout(onComplete, 350);
      }
    }, 180);
    return () => clearInterval(id);
  }, [apiReady, onComplete]);

  const dots = 4;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-[#0a2617] text-white p-8 select-none font-sans overflow-hidden">
      
      {/* Keyframe Animations */}
      <style>{`
        @keyframes gravity-bounce {
          0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
          50% { transform: translateY(-40px); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
          100% { transform: translateY(0); }
        }

        @keyframes rubber-morph {
          0% { transform: scale(1.4, 0.6); }
          5% { transform: scale(0.9, 1.1); }
          15% { transform: scale(1, 1); }
          50% { transform: scale(1, 1); }
          85% { transform: scale(0.9, 1.1); }
          100% { transform: scale(1.4, 0.6); }
        }

        @keyframes shadow-breathe {
          0% { transform: scale(1.4); opacity: 0.6; }
          50% { transform: scale(0.5); opacity: 0.1; }
          100% { transform: scale(1.4); opacity: 0.6; }
        }

        @keyframes ripple-expand {
          0% { transform: scale(0.5); opacity: 0; border-width: 4px; }
          5% { opacity: 0.8; }
          30% { transform: scale(1.5); opacity: 0; border-width: 0px; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      {/* Top Header Logo */}
      <div className="pt-6 flex items-center gap-3">
        <img src={logo} alt="ZenMind" className="w-8 h-8 object-contain" />
        <span className="text-xl font-extrabold tracking-tight text-white" style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}>
          ZenMind
        </span>
      </div>

      {/* Center Kinetic Dots Animation Stage */}
      <div className="flex flex-col items-center justify-center gap-8 my-auto">
        <div className="flex gap-6 items-center justify-center">
          {[...Array(dots)].map((_, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center justify-end h-20 w-6"
            >
              {/* 1. THE BOUNCING DOT */}
              <div
                className="relative w-5 h-5 z-10"
                style={{
                  animation: 'gravity-bounce 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                  animationDelay: `${i * 0.15}s`,
                  willChange: 'transform'
                }}
              >
                <div 
                  className="w-full h-full rounded-full bg-gradient-to-b from-[#fde68a] to-[#d97706] shadow-[0_0_15px_rgba(217,119,6,0.6)]"
                  style={{
                    animation: 'rubber-morph 1.4s linear infinite',
                    animationDelay: `${i * 0.15}s`,
                    willChange: 'transform'
                  }} 
                />
                
                {/* Specular highlight for liquid look */}
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/70 rounded-full blur-[0.5px]" />
              </div>

              {/* 2. FLOOR RIPPLE (Shockwave on impact) */}
              <div 
                 className="absolute bottom-0 w-10 h-3 border border-[#d97706]/40 rounded-[100%] opacity-0"
                 style={{
                   animation: 'ripple-expand 1.4s linear infinite',
                   animationDelay: `${i * 0.15}s`,
                 }}
              />

              {/* 3. REFLECTIVE SHADOW */}
              <div 
                className="absolute -bottom-1 w-5 h-1.5 rounded-[100%] bg-[#d97706]/40 blur-sm"
                style={{
                  animation: 'shadow-breathe 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Minimalist Progress Number */}
        <div className="text-[#fde68a] font-extrabold text-sm tracking-[0.2em] uppercase">
          {progress}%
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-xs pb-6">
        <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#d97706] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}

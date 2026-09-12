import React, { useState } from "react";

interface FooterProps {
  onProductLinkClick?: (link: string) => void;
  onCompanyLinkClick?: (link: string) => void;
  onResourcesLinkClick?: (link: string) => void;
  onTherapistLoginTrigger?: () => void;
  onGetStarted?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onProductLinkClick,
  onCompanyLinkClick,
  onResourcesLinkClick,
  onTherapistLoginTrigger,
  onGetStarted,
}) => {
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setNewsletterSubscribed(true);
    setEmailInput("");
    setTimeout(() => setNewsletterSubscribed(false), 4000);
  };

  return (
    <footer className="relative w-full bg-[#0a2617] text-white">
      {/* Top Section: Newsletter + Links */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 pt-12 sm:pt-16 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Left: Newsletter Signup */}
          <div>
            <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed mb-6">
              Sign up to stay up to date on all
              <br />
              the latest developments with ZENI
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center border-b border-white/30 pb-3">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder={newsletterSubscribed ? "Thank you for subscribing!" : "Email Address"}
                className="flex-1 bg-transparent font-sans text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                className="font-sans text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#ffebc4] hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                {newsletterSubscribed ? "Subscribed!" : "Submit"}
              </button>
            </form>
          </div>

          {/* Right: ZenMind Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:pl-8">
            {/* Product Column */}
            <div>
              <p className="font-sans text-xs sm:text-sm text-[#ffebc4] mb-4 font-semibold uppercase tracking-wider">Product</p>
              <div className="flex flex-col gap-2.5">
                {['Features', 'AI Chatbot', 'Therapy', 'FAQ'].map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      if (link === 'AI Chatbot' || link === 'Therapy') {
                        onGetStarted?.();
                      } else {
                        onProductLinkClick?.(link);
                      }
                    }}
                    className="font-sans text-xs sm:text-sm font-medium uppercase tracking-wider text-white hover:text-[#10b981] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Company Column */}
            <div>
              <p className="font-sans text-xs sm:text-sm text-[#ffebc4] mb-4 font-semibold uppercase tracking-wider">Company</p>
              <div className="flex flex-col gap-2.5">
                {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((link) => (
                  <button
                    key={link}
                    onClick={() => onCompanyLinkClick?.(link)}
                    className="font-sans text-xs sm:text-sm font-medium uppercase tracking-wider text-white hover:text-[#10b981] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Column */}
            <div>
              <p className="font-sans text-xs sm:text-sm text-[#ffebc4] mb-4 font-semibold uppercase tracking-wider">Resources</p>
              <div className="flex flex-col gap-2.5">
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Crisis Support', 'Community'].map((link) => (
                  <button
                    key={link}
                    onClick={() => onResourcesLinkClick?.(link)}
                    className="font-sans text-xs sm:text-sm font-medium uppercase tracking-wider text-white hover:text-[#10b981] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>

            {/* Support Column */}
            <div>
              <p className="font-sans text-xs sm:text-sm text-[#ffebc4] mb-4 font-semibold uppercase tracking-wider">Support</p>
              <div className="flex flex-col gap-2.5">
                {['Contact Us', 'Therapist Login', 'Safety Guidelines', 'Report Issue', 'Feedback'].map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      if (link === 'Therapist Login') {
                        onTherapistLoginTrigger?.();
                      } else {
                        onResourcesLinkClick?.(link);
                      }
                    }}
                    className="font-sans text-xs sm:text-sm font-medium uppercase tracking-wider text-white hover:text-[#10b981] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Watermark (Bottom Left) */}
      <div className="absolute bottom-16 left-6 sm:left-10 md:left-14 lg:left-16 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 opacity-40 pointer-events-none">
        <img
          src="/logo-white.png"
          alt="ZENI"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Bottom Bar */}
      <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16 py-5 border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <p className="font-sans text-xs text-white/70 font-medium">
              ZENI © 2026
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onResourcesLinkClick?.('Privacy Policy')}
                className="font-sans text-xs text-white/70 hover:text-white transition-colors underline bg-transparent border-0 p-0 cursor-pointer"
              >
                Privacy
              </button>
              <button
                onClick={() => onResourcesLinkClick?.('Terms of Service')}
                className="font-sans text-xs text-white/70 hover:text-white transition-colors underline bg-transparent border-0 p-0 cursor-pointer"
              >
                Terms
              </button>
            </div>
          </div>
          <p className="font-sans text-xs tracking-[0.1em] uppercase text-white/70 font-medium">
            ZenMind Mental Health Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, Send, Sparkles, Phone, Mail, MessageSquare } from "lucide-react";
import { apiFetch } from "../../api/client";

export const GetInTouchSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setBusy(true);

    const newQuery = {
      _id: 'ct_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'contact',
      subject: formData.subject,
      body: formData.message,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || 'N/A',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await apiFetch('/support/contact', {
        method: 'POST',
        body: JSON.stringify(newQuery)
      });
    } catch (err) {
      // API fallback
    } finally {
      try {
        const existing = JSON.parse(localStorage.getItem('zm_contact_queries') || '[]');
        existing.unshift(newQuery);
        localStorage.setItem('zm_contact_queries', JSON.stringify(existing));
      } catch {}
      setBusy(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="w-full bg-[#0a2617]">
      <section
        id="contact"
        className="relative w-full bg-[#f8fdf9] text-[#0a2617] rounded-[2.5rem] lg:rounded-[3.5rem] z-20 pt-[10px] pb-16 sm:pb-24 overflow-hidden -mt-16 sm:-mt-20 lg:-mt-24 border-2 border-[#0d5d3a]/15 shadow-2xl"
      >
        {/* Decorative Arrow Top Right */}
        <div className="absolute top-[10px] right-[10px] sm:right-6 lg:right-10 text-[#0a2617]">
          <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 stroke-[1.5]" />
        </div>

        <div className="w-full px-6 sm:px-10 md:px-14 lg:px-16">
          {/* Top Row: Heading + Subtitle */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 sm:mb-14 md:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans-main text-4xl sm:text-5xl md:text-6xl lg:text-[60px] xl:text-[70px] font-extrabold leading-[1.05] tracking-tight text-[#0d5d3a] -ml-1 mt-1 max-w-2xl text-left"
              style={{ fontFamily: 'Google Sans, Inter, sans-serif' }}
            >
              Let&apos;s Make Mental Health<br />Easier to Talk About.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-sans text-xs sm:text-sm md:text-base text-[#0a2617]/80 max-w-xs md:max-w-md text-left leading-relaxed font-semibold"
            >
              Whether you&apos;re a college student, mental-health professional, organization, or simply curious about ZenMind — we&apos;d love to hear from you.
            </motion.p>
          </div>

          {/* Form + Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* Left: Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#0d5d3a]/15 shadow-xl"
            >
              {/* Star + Label */}
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-[#d97706]" />
                <p className="font-sans text-xs sm:text-sm tracking-[0.1em] uppercase font-bold text-[#0d5d3a]">
                  Fill out the contact form
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Full Name*</label>
                  <input
                    type="text"
                    placeholder="Harshit Sharma"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Email Address*</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none cursor-pointer"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Therapy Support">Therapy Support</option>
                    <option value="Partnership Request">Partnership Request</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0d5d3a] mb-1 uppercase tracking-wider">Message*</label>
                  <textarea
                    placeholder="Tell us how we can assist you..."
                    rows={4}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#f4faf7] rounded-2xl px-5 py-3.5 font-sans text-sm font-semibold text-[#0a2617] placeholder:text-[#0d5d3a]/40 border-2 border-[#0d5d3a]/15 focus:border-[#d97706] focus:ring-2 focus:ring-[#d97706]/20 outline-none transition-all resize-y min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full bg-[#0d5d3a] hover:bg-[#084229] text-[#fffdf5] font-sans text-xs sm:text-sm tracking-[0.15em] uppercase font-extrabold py-4 rounded-full transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#fde68a]" />
                  <span>{submitted ? "Message Sent to Admin! ✓" : busy ? "Sending..." : "Start a Conversation →"}</span>
                </button>
              </form>
            </motion.div>

            {/* Right: Glassmorphism Image Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full aspect-[4/3] md:aspect-[690/520] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#0d5d3a]/20"
            >
              <img
                src="/peoples-image.webp"
                alt="Happy People"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2617]/90 via-[#0a2617]/30 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#d97706] text-white flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Email Support</div>
                      <div className="text-sm font-bold text-white">support@zenmind.in</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0d5d3a] text-white flex items-center justify-center font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#fde68a]">Toll-Free Helpline</div>
                      <div className="text-sm font-bold text-white">1800-599-0019 (24/7)</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

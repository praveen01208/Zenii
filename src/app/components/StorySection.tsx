import { motion, AnimatePresence } from 'motion/react';
import { Quote, Star, Clock, X, ChevronRight } from 'lucide-react';
import LogoLoop from './LogoLoop';

import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const StoryCard = ({ item }: { item: any }) => (
  <article className="w-[280px] sm:w-[320px] h-[240px] sm:h-[250px] bg-gradient-to-br from-white to-[#f8fdf9] dark:from-[#111111] dark:to-[#1a1a1a] rounded-2xl p-5 sm:p-6 shadow-md border border-[#0d5d3a]/15 dark:border-white/10 ring-1 ring-inset ring-[#0d5d3a]/10 dark:ring-white/5 flex flex-col shrink-0 text-left">
    <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-[#0d5d3a] dark:text-[#10b981] opacity-20 mb-3 sm:mb-4 flex-shrink-0" />
    <p
      className="text-[#0a2617] dark:text-gray-100 text-sm sm:text-[15px] leading-relaxed mb-3 sm:mb-4 flex-1 overflow-hidden"
      style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
    >
      "{item.story}"
    </p>
    <div className="mt-auto">
      <div className="flex items-center justify-between pt-3 border-t border-[#0d5d3a]/10 dark:border-white/10 mb-2">
        <span className="text-[#4a7c5d] dark:text-gray-400 font-bold text-xs sm:text-sm">{item.author}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < (item.rating ?? 5) ? 'fill-[#0d5d3a] dark:fill-[#10b981] text-[#0d5d3a] dark:text-[#10b981]' : 'fill-transparent text-[#0d5d3a]/30 dark:text-white/20'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#0d5d3a]/60 dark:text-gray-500 font-semibold uppercase tracking-wider">
        <Clock size={12} />
        {item.createdAt ? new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
      </div>
    </div>
  </article>
);

const ViewAllStoriesModal = ({ stories, onClose }: { stories: any[]; onClose: () => void }) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'recent' | 'old'>('all');
  
  const filtered = stories.filter(s => {
    if (filter === 'all') return true;
    const date = new Date(s.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (filter === 'today') return diffDays < 1;
    if (filter === 'recent') return diffDays >= 1 && diffDays <= 7;
    if (filter === 'old') return diffDays > 7;
    return true;
  });

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#050505] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      <header className="flex items-center justify-between p-4 sm:p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] shadow-sm relative z-10">
        <h2 className="text-2xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>All Stories of Hope</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition">
          <X size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      </header>
      
      <div className="p-4 sm:p-6 flex gap-2 sm:gap-3 overflow-x-auto border-b border-[#0d5d3a]/5 dark:border-white/5 bg-[#fbfdfb] dark:bg-[#0a0a0a]">
        <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'all' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>All Stories</button>
        <button onClick={() => setFilter('today')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'today' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Today</button>
        <button onClick={() => setFilter('recent')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'recent' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Recent (7 Days)</button>
        <button onClick={() => setFilter('old')} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition border ${filter === 'old' ? 'bg-[#0d5d3a] text-white border-[#0d5d3a] shadow-md shadow-[#0d5d3a]/20' : 'bg-white dark:bg-[#1a1a1a] text-[#4a7c5d] dark:text-gray-400 border-[#0d5d3a]/15 hover:border-[#0d5d3a]/30'}`}>Old</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto justify-items-center pb-20">
          {filtered.map(s => <div key={s._id} className="w-full max-w-[320px]"><StoryCard item={s} /></div>)}
          {filtered.length === 0 && <p className="col-span-full text-[#4a7c5d] dark:text-gray-500 font-bold py-16 text-lg">No stories match this filter.</p>}
        </div>
      </div>
    </div>
  );
};

const AddStoryForm = ({ onAdd }: { onAdd: (s: any) => void }) => {
  const [form, setForm] = useState({ author: '', story: '', rating: 5 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const res = await apiFetch<any>('/public/stories', { method: 'POST', body: JSON.stringify(form) });
      onAdd(res.story);
      setForm({ author: '', story: '', rating: 5 });
      setMsg('Thank you for sharing your story!');
      setTimeout(() => setMsg(''), 5000);
    } catch(err: any) {
      setMsg(err.message || 'Failed to submit.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-20 max-w-2xl mx-auto flex justify-center">
      <style>{`
        .zen-story-form-wrap {
          width: 100%;
          max-width: 520px;
          padding: 28px;
          background: #ffffff;
          border-radius: 24px;
          border: 2px solid #0d5d3a;
          box-shadow: 0 4px 12px rgba(13,93,58,0.08);
        }
        .dark .zen-story-form-wrap {
          background: #111111;
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16,185,129,0.08);
        }
        .zen-story-form-title {
          font-size: 20px; font-weight: 800; color: #0d5d3a;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 6px;
          font-family: 'Syne', sans-serif;
        }
        .dark .zen-story-form-title { color: #10b981; }
        .zen-story-form-subtitle {
          font-size: 13px; color: #4a7c5d; margin-bottom: 20px;
        }
        .zen-story-form-group { margin-bottom: 14px; }
        .zen-story-form-label {
          display: block; color: #0d5d3a; font-size: 11px;
          font-weight: 700; margin-bottom: 7px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .dark .zen-story-form-label { color: rgba(167,243,208,0.7); }
        .zen-story-form-input, .zen-story-form-select, .zen-story-form-textarea {
          width: 100%; padding: 12px 14px; border: 1px solid rgba(13,93,58,0.2);
          background: #f8fdf9;
          border-radius: 12px; font-size: 14px; color: #0a2617;
          font-weight: 500;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          outline: none; box-sizing: border-box;
        }
        .dark .zen-story-form-input, .dark .zen-story-form-select, .dark .zen-story-form-textarea {
          background: rgba(16,185,129,0.05);
          border-color: rgba(16,185,129,0.2);
          color: #ffffff;
        }
        .zen-story-form-input::placeholder, .zen-story-form-textarea::placeholder {
          color: rgba(13,93,58,0.4);
        }
        .dark .zen-story-form-input::placeholder, .dark .zen-story-form-textarea::placeholder {
          color: rgba(167,243,208,0.45);
        }
        .zen-story-form-input:focus, .zen-story-form-select:focus, .zen-story-form-textarea:focus {
          border-color: #0d5d3a;
          box-shadow: 0 0 0 2px rgba(13,93,58,0.2);
        }
        .dark .zen-story-form-input:focus, .dark .zen-story-form-select:focus, .dark .zen-story-form-textarea:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
        }
        .zen-story-form-textarea { height: 90px; resize: none; }
        .zen-story-form-select option { background: #ffffff; color: #0a2617; }
        .dark .zen-story-form-select option { background: #111111; color: #ffffff; }
        .zen-story-form-btn {
          width: 100%; padding: 13px;
          background: #0d5d3a;
          border: none; border-radius: 12px;
          color: #ffffff; font-size: 14px; font-weight: 800;
          letter-spacing: 0.8px; text-transform: uppercase;
          cursor: pointer; margin-top: 12px;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        .dark .zen-story-form-btn {
          background: #10b981;
          color: #064e3b;
        }
        .zen-story-form-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .zen-story-form-btn:active { transform: translateY(1px); }
        .zen-story-form-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
      <div className="zen-story-form-wrap">
        <div className="zen-story-form-title">Share Your Journey</div>
        <div className="zen-story-form-subtitle">Your story could be the light someone else needs right now.</div>
        <form onSubmit={submit}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="zen-story-form-group" style={{ flex: 1, minWidth: 140 }}>
              <label className="zen-story-form-label">First Name or Initial</label>
              <input required type="text" value={form.author}
                onChange={e => setForm({...form, author: e.target.value})}
                placeholder="e.g. Name, Age"
                className="zen-story-form-input" />
            </div>
            <div className="zen-story-form-group" style={{ width: 130 }}>
              <label className="zen-story-form-label">Rating</label>
              <select value={form.rating}
                onChange={e => setForm({...form, rating: Number(e.target.value)})}
                className="zen-story-form-select">
                <option value={5}>5 Stars </option>
                <option value={4}>4 Stars </option>
                <option value={3}>3 Stars </option>
                <option value={2}>2 Stars </option>
                <option value={1}>1 Star </option>
              </select>
            </div>
          </div>
          <div className="zen-story-form-group">
            <label className="zen-story-form-label">Your Story</label>
            <textarea required value={form.story}
              onChange={e => setForm({...form, story: e.target.value})}
              placeholder="How has ZenMind helped you?"
              className="zen-story-form-textarea" />
          </div>
          <button type="submit" disabled={busy} className="zen-story-form-btn">
            {busy ? 'Submitting...' : ' Submit Story'}
          </button>
          {msg && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, fontWeight: 700, color: '#6ee7b7' }}>{msg}</p>}
        </form>
      </div>
    </div>
  );
};

export default function StorySection() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    apiFetch<any[]>('/public/stories')
      .then(res => setStories(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Display recent 24 stories in the landing page loops
  const recent24 = stories.slice(0, 24);
  const half = Math.ceil(recent24.length / 2);
  const topRow = recent24.slice(0, half).map((item, index) => ({
    node: <StoryCard item={item} />,
    title: `story-top-${item._id || index}`,
  }));

  const bottomRow = recent24.slice(half).map((item, index) => ({
    node: <StoryCard item={item} />,
    title: `story-bottom-${item._id || index}`,
  }));

  return (
    <section id="stories" className="py-8 sm:py-10 lg:py-14 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] dark:from-[#10b981] dark:to-[#059669] rounded-full blur-[120px] opacity-20 dark:opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-[#0d5d3a] dark:text-[#10b981] uppercase tracking-wider text-xs sm:text-sm font-bold">Real Stories</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#0a2617] dark:text-white mt-4 mb-4 sm:mb-6" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            Stories of{' '}
            <span className="bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] dark:from-[#10b981] dark:to-[#34d399] bg-clip-text text-transparent">
              Hope & Healing
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-[#4a7c5d] dark:text-gray-400 max-w-2xl mx-auto px-4 mb-8">
            Hear from adolescents who found their path to wellness through ZenMind.
          </p>
          
          <button 
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-[#0d5d3a]/20 text-[#0d5d3a] hover:bg-[#0d5d3a] hover:text-white font-bold transition-colors group"
          >
            View All Stories <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {!loading && recent24.length > 0 ? (
          <div className="space-y-5 sm:space-y-6">
            <div className="relative overflow-hidden">
              <LogoLoop logos={topRow} speed={70} direction="left" gap={20} pauseOnHover ariaLabel="Stories row one" />
            </div>
            {bottomRow.length > 0 && (
              <div className="relative overflow-hidden">
                <LogoLoop logos={bottomRow} speed={70} direction="right" gap={20} pauseOnHover ariaLabel="Stories row two" />
              </div>
            )}
          </div>
        ) : !loading ? (
          <p className="text-center text-[#4a7c5d] font-bold py-10">No stories yet. Be the first to share yours!</p>
        ) : (
          <div className="h-[500px] flex items-center justify-center text-[#0d5d3a] font-bold">Loading stories...</div>
        )}

        <AddStoryForm onAdd={(s) => setStories([s, ...stories])} />
      </div>

      <AnimatePresence>
        {showAll && <ViewAllStoriesModal stories={stories} onClose={() => setShowAll(false)} />}
      </AnimatePresence>
    </section>
  );
}

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, Play, ExternalLink, Search, X, ChevronDown,
  Video, Music, Image as ImageIcon, Link2, BookOpen,
  Eye, Loader2, Volume2, Maximize2
} from 'lucide-react';
import { apiFetch } from '../api/client';

/* ────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────── */
type ResourceType = 'video' | 'audio' | 'image' | 'link';
type SourceType   = 'upload' | 'youtube' | 'url';

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: ResourceType;
  sourceType: SourceType;
  url: string;
  youtubeVideoId: string;
  tags: string[];
  views: number;
  hasFile: boolean;
  hasThumbnail: boolean;
  createdAt: string;
}

const API = (path: string) => `/api${path}`;

/* ────────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────────── */
function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function typeColor(t: ResourceType) {
  return {
    video: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    audio: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    image: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    link:  'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  }[t];
}

function TypeIcon({ t, className = 'w-3.5 h-3.5' }: { t: ResourceType; className?: string }) {
  if (t === 'video') return <Video className={className} />;
  if (t === 'audio') return <Music className={className} />;
  if (t === 'image') return <ImageIcon className={className} />;
  return <Link2 className={className} />;
}

function typeLabel(t: ResourceType) {
  return { video: 'Video', audio: 'Audio', image: 'Image', link: 'Link' }[t];
}

/* ────────────────────────────────────────────────────────────────
   Thumbnail component
──────────────────────────────────────────────────────────────── */
function CardThumbnail({ r }: { r: Resource }) {
  const [imgErr, setImgErr] = useState(false);

  const gradients: Record<ResourceType, string> = {
    video: 'from-emerald-600 to-teal-700',
    audio: 'from-purple-600 to-violet-700',
    image: 'from-blue-500 to-indigo-600',
    link:  'from-orange-500 to-amber-600',
  };

  if (r.youtubeVideoId && !imgErr) {
    return (
      <img
        src={ytThumb(r.youtubeVideoId)}
        alt={r.title}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (r.hasThumbnail && !imgErr) {
    return (
      <img
        src={API(`/resources/${r._id}/thumbnail`)}
        alt={r.title}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  if (r.type === 'image' && r.hasFile && !imgErr) {
    return (
      <img
        src={API(`/resources/${r._id}/file`)}
        alt={r.title}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[r.type]} flex items-center justify-center`}>
      <TypeIcon t={r.type} className="w-10 h-10 text-white/70" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Media Player Modal
──────────────────────────────────────────────────────────────── */
function PlayerModal({ resource, onClose }: { resource: Resource; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // increment view count
    apiFetch(`/resources/${resource._id}/view`, { method: 'POST' }).catch(() => {});
  }, [resource._id]);

  // Keyboard close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  const renderContent = () => {
    /* YouTube embed */
    if (resource.sourceType === 'youtube' && resource.youtubeVideoId) {
      const src = `https://www.youtube-nocookie.com/embed/${resource.youtubeVideoId}?autoplay=1&rel=0`;
      return (
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={src}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-xl"
            title={resource.title}
          />
        </div>
      );
    }

    /* Uploaded video */
    if (resource.type === 'video' && resource.hasFile) {
      return (
        <video
          ref={videoRef}
          src={API(`/resources/${resource._id}/file`)}
          controls
          autoPlay
          className="w-full rounded-xl max-h-[70vh] bg-black"
        />
      );
    }

    /* Uploaded audio */
    if (resource.type === 'audio' && resource.hasFile) {
      return (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
            <Volume2 className="w-12 h-12 text-white" />
          </div>
          <p className="text-center text-white/80 text-sm">{resource.title}</p>
          <audio
            ref={audioRef}
            src={API(`/resources/${resource._id}/file`)}
            controls
            autoPlay
            className="w-full"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      );
    }

    /* Image lightbox */
    if (resource.type === 'image' && resource.hasFile) {
      return (
        <img
          src={API(`/resources/${resource._id}/file`)}
          alt={resource.title}
          className="w-full max-h-[75vh] object-contain rounded-xl"
        />
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl bg-[#0a1a11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-4 border-b border-white/10">
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold mb-1.5 ${typeColor(resource.type)}`}>
                <TypeIcon t={resource.type} /> {typeLabel(resource.type)}
              </div>
              <h3 className="text-white font-bold text-base leading-snug line-clamp-2">{resource.title}</h3>
            </div>
            <button onClick={onClose} className="shrink-0 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {renderContent()}
            {resource.description && (
              <p className="mt-4 text-white/60 text-sm leading-relaxed">{resource.description}</p>
            )}
            {resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {resource.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────
   Single Resource Card
──────────────────────────────────────────────────────────────── */
function ResourceCard({
  resource, isFav, onToggleFav, onOpen
}: {
  resource: Resource;
  isFav: boolean;
  onToggleFav: (id: string) => void;
  onOpen: (r: Resource) => void;
}) {
  const isExternal = resource.type === 'link';

  const handleAction = () => {
    if (isExternal) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
      apiFetch(`/resources/${resource._id}/view`, { method: 'POST' }).catch(() => {});
    } else {
      onOpen(resource);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="zen-anim-border cursor-pointer"
      style={{ borderRadius: 16 }}
      onClick={handleAction}
    >
      <div className="zen-anim-border-content flex flex-col" style={{ borderRadius: 14, minHeight: 220 }}>
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 100, borderRadius: '14px 14px 0 0' }}>
          <CardThumbnail r={resource} />
          <span className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${typeColor(resource.type)}`}>
            <TypeIcon t={resource.type} className="w-2.5 h-2.5" /> {typeLabel(resource.type)}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFav(resource._id); }}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-black/50 shadow"
          >
            <Heart className={`w-3 h-3 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3">
          <h3
            className="font-bold text-[#0a2617] dark:text-white text-xs leading-snug mb-2 flex-1"
            style={{ fontFamily: 'Syne, sans-serif', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}
          >
            {resource.title}
          </h3>

          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {resource.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 rounded-full bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] text-[9px] font-semibold">{tag}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-[#4a7c5d] dark:text-gray-500 text-[10px] mb-2">
            <Eye className="w-3 h-3" /> {resource.views || 0} views
          </div>

          <button
            onClick={e => { e.stopPropagation(); handleAction(); }}
            className="w-full py-1.5 rounded-lg bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-[10px] flex items-center justify-center gap-1.5 hover:opacity-90 transition"
          >
            {isExternal
              ? <><ExternalLink className="w-3 h-3" /> Open Link</>
              : <><Play className="w-3 h-3 fill-white" /> {resource.type === 'image' ? 'View' : 'Play'}</>
            }
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Dropdown helper
──────────────────────────────────────────────────────────────── */
function Dropdown({ label, value, onChange, options }: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 text-[#0a2617] dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a7c5d] pointer-events-none" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main ResourceHub Component
──────────────────────────────────────────────────────────────── */
export default function ResourceHub() {
  const [resources, setResources]   = useState<Resource[]>([]);
  const [favIds, setFavIds]         = useState<Set<string>>(new Set());
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('newest');
  const [search, setSearch]         = useState('');
  const [playing, setPlaying]       = useState<Resource | null>(null);
  const [showFavs, setShowFavs]     = useState(true);

  /* load resources + fav IDs in parallel */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortFilter });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (search.trim()) params.set('search', search.trim());

      const [resData, favData] = await Promise.all([
        apiFetch<any>(`/resources?${params}`),
        apiFetch<any>('/resources/my-favourites-ids'),
      ]);
      setResources(resData.resources || []);
      setFavIds(new Set((favData.ids || []) as string[]));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, sortFilter, search]);

  useEffect(() => { load(); }, [load]);

  const toggleFav = async (id: string) => {
    // Optimistic
    setFavIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await apiFetch(`/resources/${id}/favourite`, { method: 'POST' });
    } catch {
      // revert
      setFavIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const favResources   = resources.filter(r => favIds.has(r._id));
  const filteredOthers = resources.filter(r => !favIds.has(r._id));

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── STICKY HEADER BAR ── */}
      <div className="flex-shrink-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur border-b border-[#0d5d3a]/10 dark:border-white/10 px-4 py-2.5 z-20">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#0a2617] dark:text-gray-100 font-bold text-sm mr-1">
            <BookOpen className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
            Resource Hub
          </div>

          <Dropdown
            label="Type"
            value={typeFilter}
            onChange={v => setTypeFilter(v)}
            options={[
              { value: 'all',   label: 'All Types' },
              { value: 'video', label: ' Video' },
              { value: 'audio', label: ' Audio' },
              { value: 'image', label: '️ Image' },
              { value: 'link',  label: ' Link' },
            ]}
          />
          <Dropdown
            label="Sort"
            value={sortFilter}
            onChange={v => setSortFilter(v)}
            options={[
              { value: 'newest',  label: 'Most Recent' },
              { value: 'oldest',  label: 'Oldest First' },
              { value: 'popular', label: 'Most Viewed' },
            ]}
          />

          {/* Search */}
          <div className="relative flex-1 min-w-[140px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4a7c5d]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search resources…"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 text-[#0a2617] dark:text-white text-xs font-medium outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 dark:focus:ring-[#1a8a5a]/50 placeholder-[#4a7c5d]/60"
            />
          </div>

          {loading && <Loader2 className="w-4 h-4 text-[#0d5d3a] animate-spin ml-auto" />}
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

        {error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* ── MY FAVOURITES strip ── */}
        {favResources.length > 0 && (
          <section>
            <button
              onClick={() => setShowFavs(v => !v)}
              className="flex items-center gap-2 mb-3 group"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-sm font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                My Favourites
              </span>
              <span className="text-xs text-[#4a7c5d] dark:text-gray-400 bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 px-1.5 py-0.5 rounded-full font-semibold">
                {favResources.length}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#4a7c5d] transition-transform ${showFavs ? '' : '-rotate-90'}`} />
            </button>

            {showFavs && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {favResources.map(r => (
                  <ResourceCard key={r._id} resource={r} isFav={true} onToggleFav={toggleFav} onOpen={setPlaying} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── ALL RESOURCES ── */}
        {!loading && resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4"></div>
            <div className="text-lg font-bold text-[#0a2617] dark:text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
              No resources yet
            </div>
            <p className="text-sm text-[#4a7c5d] dark:text-gray-400">
              Check back soon — our team is curating content for you.
            </p>
          </div>
        ) : (
          <section>
            {favResources.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
                <span className="text-sm font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                  All Resources
                </span>
                <span className="text-xs text-[#4a7c5d] dark:text-gray-400 bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 px-1.5 py-0.5 rounded-full font-semibold">
                  {filteredOthers.length}
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {(favResources.length > 0 ? filteredOthers : resources).map(r => (
                <ResourceCard key={r._id} resource={r} isFav={favIds.has(r._id)} onToggleFav={toggleFav} onOpen={setPlaying} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MEDIA PLAYER MODAL ── */}
      {playing && <PlayerModal resource={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

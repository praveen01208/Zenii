import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Trash2, CheckCircle, AlertTriangle, X, ChevronDown, Inbox, ExternalLink, Clock, Briefcase, Mail, Phone, FileText } from 'lucide-react';
import { apiFetch } from '../api/client';

const STATUS_STYLES: Record<string, string> = {
  new:         'bg-blue-100  dark:bg-blue-500/20  text-blue-700  dark:text-blue-300',
  reviewed:    'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  shortlisted: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  rejected:    'bg-red-100   dark:bg-red-500/20   text-red-600   dark:text-red-400',
};

const STATUS_OPTIONS = ['new', 'reviewed', 'shortlisted', 'rejected'];

export default function ApplicationsAdmin() {
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats]               = useState({ total: 0, new: 0, shortlisted: 0, rejected: 0 });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState<any>(null);
  const [msg, setMsg]                   = useState<{ text: string; ok: boolean } | null>(null);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const q = status && status !== 'all' ? `?status=${status}` : '';
      const r = await apiFetch<any>(`/admin/applications${q}`);
      setApplications(r.applications || []);
      setStats(r.stats || { total: 0, new: 0, shortlisted: 0, rejected: 0 });
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    try {
      await apiFetch(`/admin/applications/${appId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      if (selected?._id === appId) setSelected((p: any) => ({ ...p, status: newStatus }));
      // Refresh stats
      const r = await apiFetch<any>('/admin/applications');
      setStats(r.stats);
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Delete this application permanently?')) return;
    setDeletingId(appId);
    try {
      await apiFetch(`/admin/applications/${appId}`, { method: 'DELETE' });
      setApplications(prev => prev.filter(a => a._id !== appId));
      if (selected?._id === appId) setSelected(null);
      setStats(s => ({ ...s, total: Math.max(0, s.total - 1) }));
      setMsg({ text: 'Application deleted.', ok: true });
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setDeletingId(null); }
  };

  const handleFilterChange = (s: string) => {
    setStatusFilter(s);
    load(s);
  };

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.jobTitle?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Msg */}
      {msg && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />} {msg.text}
          <button onClick={() => setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: stats.total,       color: 'text-[#0a2617] dark:text-white',          bg: 'bg-white dark:bg-[#111111]' },
          { label: 'New',         value: stats.new,         color: 'text-blue-600 dark:text-blue-400',         bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'text-green-600 dark:text-green-400',       bg: 'bg-green-50 dark:bg-green-500/10' },
          { label: 'Rejected',    value: stats.rejected,    color: 'text-red-600 dark:text-red-400',           bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-[#0d5d3a]/10 dark:border-white/10`}>
            <div className={`text-2xl font-black mb-0.5 ${s.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
            <div className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicant name, email, or job title..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#111111] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => handleFilterChange(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black capitalize transition-all ${statusFilter === s ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow' : 'bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 hover:border-[#0d5d3a]/40'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Two-pane layout */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 480 }}>
        {/* List */}
        <div className={`${selected ? 'lg:w-2/5' : 'w-full'} flex flex-col gap-2 overflow-y-auto`} style={{ maxHeight: 600 }}>
          {loading ? (
            <div className="text-center py-16 text-[#4a7c5d] dark:text-gray-400 font-semibold">Loading applications...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10">
              <Inbox size={40} className="text-[#0d5d3a]/30 mb-3" />
              <p className="font-bold text-[#0a2617] dark:text-white mb-1">No applications found</p>
              <p className="text-xs text-[#4a7c5d] dark:text-gray-400">Applications from the Careers page will appear here.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((app, i) => (
                <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(selected?._id === app._id ? null : app)}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${selected?._id === app._id ? 'border-[#0d5d3a] bg-[#f0fbf4] dark:bg-[#0d5d3a]/10' : 'border-[#0d5d3a]/10 dark:border-white/10 bg-white dark:bg-[#111111] hover:border-[#0d5d3a]/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#0d5d3a]/10 dark:bg-[#10b981]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] font-black text-sm flex-shrink-0">
                        {app.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-[#0a2617] dark:text-white text-sm truncate" style={{ fontFamily: 'Syne, sans-serif' }}>{app.name}</p>
                        <p className="text-[11px] text-[#4a7c5d] dark:text-gray-400 truncate">{app.email}</p>
                        <p className="text-[11px] font-bold text-[#0d5d3a] dark:text-[#10b981] truncate mt-0.5"> {app.jobTitle || 'Unknown Role'}</p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[app.status] || STATUS_STYLES.new}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 gap-2">
                    <span className="text-[10px] text-[#4a7c5d] dark:text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex gap-1">
                      <select value={app.status} onClick={e => e.stopPropagation()}
                        onChange={e => { e.stopPropagation(); handleStatusChange(app._id, e.target.value); }}
                        disabled={updatingId === app._id}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white outline-none cursor-pointer disabled:opacity-50">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{updatingId === app._id && app.status === s ? '...' : s}</option>)}
                      </select>
                      <button onClick={e => { e.stopPropagation(); handleDelete(app._id); }} disabled={deletingId === app._id}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Detail pane */}
        <AnimatePresence>
          {selected && (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="lg:flex-1 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 p-5 overflow-y-auto" style={{ maxHeight: 600 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0d5d3a]/10 dark:bg-[#10b981]/20 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981] font-black text-lg">
                    {selected.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-[#0a2617] dark:text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{selected.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400">
                  <X size={16} />
                </button>
              </div>

              {/* Job role */}
              <div className="flex items-center gap-2 p-3 bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 rounded-xl mb-4">
                <Briefcase size={15} className="text-[#0d5d3a] dark:text-[#10b981] shrink-0" />
                <span className="text-sm font-bold text-[#0a2617] dark:text-white">{selected.jobTitle || 'Unknown Role'}</span>
              </div>

              {/* Contact info */}
              <div className="space-y-2 mb-4">
                <DetailRow icon={Mail} label="Email" value={selected.email} link={`mailto:${selected.email}`} />
                {selected.phone && <DetailRow icon={Phone} label="Phone" value={selected.phone} link={`tel:${selected.phone}`} />}
                {selected.portfolioUrl && <DetailRow icon={ExternalLink} label="Portfolio / LinkedIn" value={selected.portfolioUrl} link={selected.portfolioUrl} />}
                <DetailRow icon={Clock} label="Applied on" value={new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
              </div>

              {/* Cover letter */}
              {selected.coverLetter && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs font-black text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider mb-2">
                    <FileText size={13} /> Cover Letter
                  </div>
                  <p className="text-sm text-[#0a2617] dark:text-gray-300 leading-relaxed bg-[#f8fdf9] dark:bg-[#1a1a1a] rounded-xl p-4 italic border border-[#0d5d3a]/10 dark:border-white/10">
                    "{selected.coverLetter}"
                  </p>
                </div>
              )}

              {/* Resume */}
              {selected.resumeBase64 && (
                <a href={`data:${selected.resumeMime || 'application/pdf'};base64,${selected.resumeBase64}`}
                  download={`${selected.name?.replace(' ', '_')}_resume`}
                  className="flex items-center gap-2 w-full py-3 px-4 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 text-sm font-bold text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/10 transition mb-4">
                  <FileText size={15} /> Download Resume
                </a>
              )}

              {/* Status update */}
              <div>
                <p className="text-xs font-black text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => handleStatusChange(selected._id, s)} disabled={updatingId === selected._id}
                      className={`py-2.5 rounded-xl text-xs font-black capitalize transition-all ${selected.status === s ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow' : 'border border-[#0d5d3a]/20 dark:border-white/10 text-[#4a7c5d] dark:text-gray-400 hover:border-[#0d5d3a]/50 hover:text-[#0d5d3a] dark:hover:text-white'}`}>
                      {updatingId === selected._id ? '...' : s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => handleDelete(selected._id)} disabled={deletingId === selected._id}
                className="mt-4 w-full py-2.5 rounded-xl text-xs font-black text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/10 transition disabled:opacity-50">
                {deletingId === selected._id ? 'Deleting...' : 'Delete Application'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, link }: { icon: any; label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={14} className="text-[#4a7c5d] dark:text-gray-400 shrink-0" />
      <span className="text-[#4a7c5d] dark:text-gray-400 text-xs font-bold w-24 shrink-0">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#0d5d3a] dark:text-[#10b981] font-semibold text-xs hover:underline truncate">{value}</a>
      ) : (
        <span className="text-[#0a2617] dark:text-white font-semibold text-xs truncate">{value}</span>
      )}
    </div>
  );
}

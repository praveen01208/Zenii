import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ChevronLeft, Ticket, AlertTriangle, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { apiFetch } from '../api/client';

const TICKET_CATEGORIES = [
  { value: 'profile_update', label: 'Profile Update Request' },
  { value: 'tech', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing / Payment' },
  { value: 'account', label: 'Account Query' },
  { value: 'other', label: 'Other' },
];

const REPORT_TYPES = [
  { value: 'misbehaviour', label: 'User Misbehaviour / Harassment' },
  { value: 'no_show', label: 'No-Show Abuse' },
  { value: 'fraud', label: 'Fake Booking / Fraud' },
  { value: 'tech_failure', label: 'Technical Failure' },
  { value: 'suspension_request', label: 'Request User Suspension' },
  { value: 'other', label: 'Other' },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:          { label: 'Open',           color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300', icon: <Clock size={12}/> },
  in_review:     { label: 'In Review',      color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',        icon: <Search size={12}/> },
  resolved:      { label: 'Resolved',       color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',    icon: <CheckCircle size={12}/> },
  rejected:      { label: 'Rejected',       color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',            icon: <XCircle size={12}/> },
  submitted:     { label: 'Submitted',      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300', icon: <Clock size={12}/> },
  investigating: { label: 'Investigating',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',        icon: <Search size={12}/> },
  action_taken:  { label: 'Action Taken',   color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',    icon: <CheckCircle size={12}/> },
  closed:        { label: 'Closed',         color: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400',        icon: <XCircle size={12}/> },
};

const URGENCY_META: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  high:   'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${m.color}`}>
      {m.icon}{m.label}
    </span>
  );
}

export default function TherapistSupportDesk() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'reports'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Ticket form state
  const [tCategory, setTCategory] = useState('profile_update');
  const [tSubject, setTSubject] = useState('');
  const [tMessage, setTMessage] = useState('');
  const [tSubmitting, setTSubmitting] = useState(false);

  // Report form state
  const [rType, setRType] = useState('misbehaviour');
  const [rUrgency, setRUrgency] = useState('normal');
  const [rUserEmail, setRUserEmail] = useState('');
  const [rUserName, setRUserName] = useState('');
  const [rSession, setRSession] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rSubmitting, setRSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        apiFetch<any>('/therapist/tickets'),
        apiFetch<any>('/therapist/reports'),
      ]);
      setTickets(tRes.tickets || []);
      setReports(rRes.reports || []);
    } catch (e: any) {
      setMsg({ text: e.message, ok: false });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submitTicket = async () => {
    if (!tSubject.trim() || !tMessage.trim()) return setMsg({ text: 'Subject and message required', ok: false });
    setTSubmitting(true);
    try {
      await apiFetch('/therapist/tickets', { method: 'POST', body: JSON.stringify({ category: tCategory, subject: tSubject, message: tMessage }) });
      setMsg({ text: ' Ticket submitted! Admin will respond shortly.', ok: true });
      setTSubject(''); setTMessage(''); setTCategory('profile_update');
      setShowTicketForm(false);
      load();
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setTSubmitting(false); setTimeout(() => setMsg(null), 4000); }
  };

  const submitReport = async () => {
    if (!rDesc.trim()) return setMsg({ text: 'Description required', ok: false });
    setRSubmitting(true);
    try {
      await apiFetch('/therapist/reports', { method: 'POST', body: JSON.stringify({ reportType: rType, urgency: rUrgency, involvedUserEmail: rUserEmail, involvedUserName: rUserName, sessionReference: rSession, description: rDesc }) });
      setMsg({ text: ' Report submitted successfully.', ok: true });
      setRType('misbehaviour'); setRUrgency('normal'); setRUserEmail(''); setRUserName(''); setRSession(''); setRDesc('');
      setShowReportForm(false);
      load();
    } catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setRSubmitting(false); setTimeout(() => setMsg(null), 4000); }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25';
  const labelCls = 'block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide';

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[500] px-5 py-3 rounded-2xl text-sm font-bold shadow-lg ${msg.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail view */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
            className="fixed inset-0 z-[200] bg-[#f7fbf8] dark:bg-[#050505] overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm mb-6 hover:opacity-75 transition">
                <ChevronLeft size={16}/> Back
              </button>
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>
                    {selected.subject || `${selected.reportType?.replace(/_/g,' ')} Report`}
                  </h2>
                  <StatusBadge status={selected.status} />
                </div>
                {selected.urgency && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize ${URGENCY_META[selected.urgency]}`}>
                    {selected.urgency} urgency
                  </span>
                )}
                <div>
                  <div className={labelCls}>Your Message</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selected.message || selected.description}</p>
                </div>
                {selected.involvedUserEmail && (
                  <div>
                    <div className={labelCls}>Involved User</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selected.involvedUserName} — {selected.involvedUserEmail}</p>
                  </div>
                )}
                {selected.adminReply && (
                  <div className="bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 rounded-2xl p-4 border border-[#0d5d3a]/20 dark:border-[#0d5d3a]/40">
                    <div className={labelCls}>Admin Reply</div>
                    <p className="text-sm text-[#0a2617] dark:text-[#10b981] font-medium">{selected.adminReply}</p>
                  </div>
                )}
                {selected.therapistNote && (
                  <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4 border border-blue-200 dark:border-blue-500/30">
                    <div className={labelCls}>Admin Note for You</div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{selected.therapistNote}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">Submitted {new Date(selected.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0 px-4 sm:px-6 pt-5">
        <div className="flex gap-1 p-1 bg-[#f0fbf4] dark:bg-[#0d1f14] rounded-2xl w-fit">
          {(['tickets','reports'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition capitalize ${activeTab === t ? 'bg-[#0d5d3a] text-white shadow-sm' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/10'}`}>
              {t === 'tickets' ? 'My Tickets' : 'Incident Reports'}
            </button>
          ))}
        </div>
        <button
          onClick={() => activeTab === 'tickets' ? setShowTicketForm(true) : setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-xs hover:bg-[#0a4a2e] transition shadow-md shrink-0">
          <Plus size={14}/> {activeTab === 'tickets' ? 'New Ticket' : 'New Report'}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin"/></div>
        ) : activeTab === 'tickets' ? (
          tickets.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3"/>
              <p className="text-gray-400 font-semibold">No tickets yet. Submit one if you need help!</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {tickets.map(t => (
                <motion.div key={t._id} whileHover={{ y: -1 }} onClick={() => setSelected(t)}
                  className="bg-white dark:bg-[#111] rounded-2xl p-4 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm cursor-pointer hover:border-[#0d5d3a]/30 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#0a2617] dark:text-white text-sm truncate">{t.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{TICKET_CATEGORIES.find(c => c.value === t.category)?.label} · {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={t.status}/>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{t.message}</p>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          reports.length === 0 ? (
            <div className="text-center py-16">
              <AlertTriangle size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3"/>
              <p className="text-gray-400 font-semibold">No reports submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {reports.map(r => (
                <motion.div key={r._id} whileHover={{ y: -1 }} onClick={() => setSelected(r)}
                  className="bg-white dark:bg-[#111] rounded-2xl p-4 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm cursor-pointer hover:border-[#0d5d3a]/30 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#0a2617] dark:text-white text-sm capitalize">{r.reportType?.replace(/_/g,' ')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={r.status}/>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${URGENCY_META[r.urgency]}`}>{r.urgency}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.description}</p>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Ticket Form Modal */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowTicketForm(false)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white dark:bg-[#111] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>New Support Ticket</h3>
                <button onClick={() => setShowTicketForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Category</label>
                  <select value={tCategory} onChange={e => setTCategory(e.target.value)} className={inputCls}>
                    {TICKET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Subject</label>
                  <input value={tSubject} onChange={e => setTSubject(e.target.value)} placeholder="Brief title for your request" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>Message</label>
                  <textarea value={tMessage} onChange={e => setTMessage(e.target.value)} rows={4} placeholder="Describe your request in detail..." className={`${inputCls} resize-none`}/>
                </div>
                <button onClick={submitTicket} disabled={tSubmitting}
                  className="w-full py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition shadow-md disabled:opacity-60">
                  {tSubmitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowReportForm(false)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white dark:bg-[#111] rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>Submit Incident Report</h3>
                <button onClick={() => setShowReportForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"><X size={18}/></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Report Type</label>
                    <select value={rType} onChange={e => setRType(e.target.value)} className={inputCls}>
                      {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Urgency</label>
                    <select value={rUrgency} onChange={e => setRUrgency(e.target.value)} className={inputCls}>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>User Name (optional)</label>
                    <input value={rUserName} onChange={e => setRUserName(e.target.value)} placeholder="Your Name" className={inputCls}/>
                  </div>
                  <div>
                    <label className={labelCls}>User Email (optional)</label>
                    <input value={rUserEmail} onChange={e => setRUserEmail(e.target.value)} placeholder="user@email.com" className={inputCls}/>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Session Reference (optional)</label>
                  <input value={rSession} onChange={e => setRSession(e.target.value)} placeholder="e.g. May 16 @ 3:00 PM" className={inputCls}/>
                </div>
                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea value={rDesc} onChange={e => setRDesc(e.target.value)} rows={4} placeholder="Describe the incident in detail..." className={`${inputCls} resize-none`}/>
                </div>
                <button onClick={submitReport} disabled={rSubmitting}
                  className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition shadow-md disabled:opacity-60">
                  {rSubmitting ? 'Submitting…' : ' Submit Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

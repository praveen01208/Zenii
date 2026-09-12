import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, CheckCircle, XCircle, Search, Clock, AlertTriangle, ShieldAlert, Send, Trash2 } from 'lucide-react';
import { apiFetch } from '../api/client';

const STATUS_META: Record<string, { label: string; color: string }> = {
  open:          { label: 'Open',          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
  in_review:     { label: 'In Review',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' },
  resolved:      { label: 'Resolved',      color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
  rejected:      { label: 'Rejected',      color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' },
  submitted:     { label: 'Submitted',     color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300' },
  investigating: { label: 'Investigating', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' },
  action_taken:  { label: 'Action Taken',  color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' },
  closed:        { label: 'Closed',        color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};
const URGENCY_COLOR: Record<string, string> = {
  normal: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  high:   'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};
const CATEGORY_LABEL: Record<string, string> = {
  profile_update: 'Profile Update', tech: 'Technical Issue', billing: 'Billing', account: 'Account Query', other: 'Other',
};
const REPORT_LABEL: Record<string, string> = {
  misbehaviour: 'Misbehaviour', no_show: 'No-Show Abuse', fraud: 'Fraud', tech_failure: 'Tech Failure', suspension_request: 'Suspension Request', other: 'Other',
};

function Badge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.open;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.color}`}>{m.label}</span>;
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/15 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25';
const labelCls = 'block text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 uppercase tracking-wide';

export default function TherapistInboxAdmin() {
  const [tab, setTab] = useState<'tickets' | 'reports'>('tickets');
  const [tickets, setTickets] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [mode, setMode] = useState<'ticket' | 'report'>('ticket');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  // Bulk Delete State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Ticket edit state
  const [tStatus, setTStatus] = useState('');
  const [tReply, setTReply] = useState('');
  const [tNote, setTNote] = useState('');

  // Report edit state
  const [rStatus, setRStatus] = useState('');
  const [rAction, setRAction] = useState('none');
  const [rNote, setRNote] = useState('');
  const [rThNote, setRThNote] = useState('');
  const [suspendDur, setSuspendDur] = useState('7d');
  const [suspending, setSuspending] = useState(false);

  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, rRes] = await Promise.all([
        apiFetch<any>('/admin/therapist-tickets'),
        apiFetch<any>('/admin/therapist-reports'),
      ]);
      setTickets(tRes.tickets || []);
      setReports(rRes.reports || []);
    } catch (e: any) { toast(e.message, false); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openTicket = (t: any) => {
    setSelected(t); setMode('ticket');
    setTStatus(t.status); setTReply(t.adminReply || ''); setTNote(t.adminNote || '');
  };
  const openReport = (r: any) => {
    setSelected(r); setMode('report');
    setRStatus(r.status); setRAction(r.actionTaken || 'none'); setRNote(r.adminNote || ''); setRThNote(r.therapistNote || '');
  };

  const saveTicket = async () => {
    setSaving(true);
    try {
      await apiFetch(`/admin/therapist-tickets/${selected._id}`, { method: 'PATCH', body: JSON.stringify({ status: tStatus, adminReply: tReply, adminNote: tNote }) });
      toast('Ticket updated!');
      setSelected(null); load();
    } catch (e: any) { toast(e.message, false); }
    finally { setSaving(false); }
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      await apiFetch(`/admin/therapist-reports/${selected._id}`, { method: 'PATCH', body: JSON.stringify({ status: rStatus, actionTaken: rAction, adminNote: rNote, therapistNote: rThNote }) });
      toast('Report updated!');
      setSelected(null); load();
    } catch (e: any) { toast(e.message, false); }
    finally { setSaving(false); }
  };

  const suspendUser = async () => {
    if (!selected?.involvedUserEmail) return toast('No user email in report', false);
    setSuspending(true);
    try {
      await apiFetch(`/admin/therapist-reports/${selected._id}/suspend-user`, { method: 'POST', body: JSON.stringify({ duration: suspendDur }) });
      toast(` User suspended for ${suspendDur}`);
      setSelected(null); load();
    } catch (e: any) { toast(e.message, false); }
    finally { setSuspending(false); }
  };

  const toggleSelectAll = () => {
    const list = tab === 'tickets' ? tickets : reports;
    if (selectedItems.length === list.length) setSelectedItems([]);
    else setSelectedItems(list.map(i => i._id));
  };

  const toggleSelect = (e: any, id: string) => {
    e.stopPropagation();
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bulkDelete = async () => {
    if (!selectedItems.length) return;
    if (!confirm(`Delete ${selectedItems.length} selected items?`)) return;
    setDeleting(true);
    try {
      const endpoint = tab === 'tickets' ? '/admin/therapist-tickets/bulk-delete' : '/admin/therapist-reports/bulk-delete';
      await apiFetch(endpoint, { method: 'POST', body: JSON.stringify({ ids: selectedItems }) });
      toast('Deleted successfully');
      setSelectedItems([]);
      load();
    } catch (e: any) { toast(e.message, false); }
    finally { setDeleting(false); }
  };

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

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
            className="fixed inset-0 z-[200] bg-[#f7fbf8] dark:bg-[#050505] overflow-y-auto">
            <div className="max-w-2xl mx-auto p-6 space-y-5">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:opacity-75 transition">
                <ChevronLeft size={16}/> Back to Inbox
              </button>

              {/* Info card */}
              <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>
                      {mode === 'ticket' ? selected.subject : `${REPORT_LABEL[selected.reportType] || selected.reportType} Report`}
                    </p>
                    <p className="text-xs text-[#4a7c5d] mt-0.5">
                      {selected.therapistName} · {selected.therapistEmail} · {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge status={selected.status}/>
                </div>
                {mode === 'ticket' && <p className="text-xs font-semibold text-[#4a7c5d]">Category: {CATEGORY_LABEL[selected.category]}</p>}
                {mode === 'report' && selected.urgency && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold capitalize ${URGENCY_COLOR[selected.urgency]}`}>{selected.urgency} urgency</span>
                )}
                <div className="bg-[#f0fbf4] dark:bg-[#0d1f14] rounded-2xl p-4">
                  <div className={labelCls}>{mode === 'ticket' ? 'Message' : 'Description'}</div>
                  <p className="text-sm text-[#0a2617] dark:text-gray-200 leading-relaxed">{selected.message || selected.description}</p>
                </div>
                {mode === 'report' && selected.involvedUserEmail && (
                  <div className="text-sm">
                    <span className="font-bold text-[#0a2617] dark:text-white">Involved: </span>
                    <span className="text-gray-600 dark:text-gray-300">{selected.involvedUserName} ({selected.involvedUserEmail})</span>
                    {selected.sessionReference && <span className="text-gray-400"> · Session: {selected.sessionReference}</span>}
                  </div>
                )}
              </div>

              {/* Edit panel */}
              {mode === 'ticket' ? (
                <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-[#0a2617] dark:text-white text-sm">Manage Ticket</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={tStatus} onChange={e => setTStatus(e.target.value)} className={inputCls}>
                        {['open','in_review','resolved','rejected'].map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Reply to Therapist (visible to them)</label>
                    <textarea value={tReply} onChange={e => setTReply(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Type your response…"/>
                  </div>
                  <div>
                    <label className={labelCls}>Internal Admin Note (not visible to therapist)</label>
                    <textarea value={tNote} onChange={e => setTNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Internal notes…"/>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveTicket} disabled={saving}
                      className="flex-1 py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition disabled:opacity-60 flex items-center justify-center gap-2">
                      <Send size={14}/> {saving ? 'Saving…' : 'Save & Reply'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#111] rounded-3xl p-6 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="font-black text-[#0a2617] dark:text-white text-sm">Manage Report</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={rStatus} onChange={e => setRStatus(e.target.value)} className={inputCls}>
                        {['submitted','investigating','action_taken','closed'].map(s => <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Action Taken</label>
                      <select value={rAction} onChange={e => setRAction(e.target.value)} className={inputCls}>
                        {['none','warned','suspended_7d','suspended_30d','suspended_perm','no_action'].map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Note for Therapist (visible to them)</label>
                    <textarea value={rThNote} onChange={e => setRThNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="What action did you take?"/>
                  </div>
                  <div>
                    <label className={labelCls}>Internal Admin Note</label>
                    <textarea value={rNote} onChange={e => setRNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Internal notes…"/>
                  </div>
                  <button onClick={saveReport} disabled={saving}
                    className="w-full py-3 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm hover:bg-[#0a4a2e] transition disabled:opacity-60 flex items-center justify-center gap-2">
                    <Send size={14}/> {saving ? 'Saving…' : 'Save Report'}
                  </button>

                  {/* Suspend user section */}
                  {selected.involvedUserEmail && (
                    <div className="border-t border-red-200 dark:border-red-500/20 pt-4 space-y-3">
                      <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1"><ShieldAlert size={13}/> Suspend Involved User</p>
                      <div className="flex gap-3">
                        <select value={suspendDur} onChange={e => setSuspendDur(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-red-400/30">
                          <option value="7d">7 Days</option>
                          <option value="30d">30 Days</option>
                          <option value="permanent">Permanent</option>
                        </select>
                        <button onClick={suspendUser} disabled={suspending}
                          className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm transition disabled:opacity-60">
                          {suspending ? 'Suspending…' : ' Suspend'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-5 pb-3 border-b border-[#0d5d3a]/10 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-[#f0fbf4] dark:bg-[#0d1f14] rounded-2xl w-fit">
          {(['tickets','reports'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedItems([]); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${tab === t ? 'bg-[#0d5d3a] text-white shadow-sm' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/10'}`}>
              {t === 'tickets' ? ` Support Tickets (${tickets.length})` : ` Reports (${reports.filter(r => r.urgency === 'critical').length > 0 ? ' ' : ''}${reports.length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button onClick={bulkDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition disabled:opacity-50">
              <Trash2 size={16} /> {deleting ? 'Deleting...' : `Delete (${selectedItems.length})`}
            </button>
          )}
          <button onClick={toggleSelectAll} className="px-4 py-2 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 text-sm font-bold text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#0d5d3a]/5 transition">
            {(tab === 'tickets' && selectedItems.length === tickets.length && tickets.length > 0) || (tab === 'reports' && selectedItems.length === reports.length && reports.length > 0) ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-10 h-10 border-4 border-[#0d5d3a]/20 border-t-[#0d5d3a] rounded-full animate-spin"/></div>
        ) : tab === 'tickets' ? (
          tickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-semibold">No tickets yet</div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {tickets.map(t => (
                <motion.div key={t._id} whileHover={{ y: -1 }} onClick={() => openTicket(t)}
                  className={`flex gap-3 bg-white dark:bg-[#111] rounded-2xl p-4 border shadow-sm cursor-pointer transition ${selectedItems.includes(t._id) ? 'border-[#0d5d3a] ring-1 ring-[#0d5d3a]' : 'border-[#0d5d3a]/10 dark:border-white/10 hover:border-[#0d5d3a]/30'}`}>
                  <div className="pt-1">
                    <input type="checkbox" checked={selectedItems.includes(t._id)} onChange={(e) => toggleSelect(e, t._id)} onClick={e => e.stopPropagation()} className="w-4 h-4 accent-[#0d5d3a] cursor-pointer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-[#0a2617] dark:text-white text-sm truncate">{t.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{t.therapistName} · {CATEGORY_LABEL[t.category]} · {new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge status={t.status}/>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-1">{t.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400 font-semibold">No reports yet</div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              {reports.map(r => (
                <motion.div key={r._id} whileHover={{ y: -1 }} onClick={() => openReport(r)}
                  className={`flex gap-3 bg-white dark:bg-[#111] rounded-2xl p-4 border shadow-sm cursor-pointer transition ${selectedItems.includes(r._id) ? 'border-[#0d5d3a] ring-1 ring-[#0d5d3a]' : r.urgency === 'critical' ? 'border-red-300 dark:border-red-500/40 hover:border-red-400' : 'border-[#0d5d3a]/10 dark:border-white/10 hover:border-[#0d5d3a]/30'}`}>
                  <div className="pt-1">
                    <input type="checkbox" checked={selectedItems.includes(r._id)} onChange={(e) => toggleSelect(e, r._id)} onClick={e => e.stopPropagation()} className="w-4 h-4 accent-[#0d5d3a] cursor-pointer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                      <p className="font-bold text-[#0a2617] dark:text-white text-sm capitalize flex items-center gap-1.5">
                        {r.urgency === 'critical' && <AlertTriangle size={13} className="text-red-500 shrink-0"/>}
                        {REPORT_LABEL[r.reportType] || r.reportType}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.therapistName} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge status={r.status}/>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${URGENCY_COLOR[r.urgency]}`}>{r.urgency}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-1">{r.description}</p>
                  {r.involvedUserEmail && <p className="text-xs text-[#4a7c5d] mt-1">User: {r.involvedUserEmail}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

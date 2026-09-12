import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Trash2, BookOpen, X, AlertTriangle, Eye } from 'lucide-react';
import { apiFetch } from '../api/client';

const TYPE_EMOJI: Record<string,string> = { book:'', article:'', video:'', podcast:'', tool:'️' };

export default function ReadingListsAdmin() {
  const [lists, setLists]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<'all'|'pending'|'approved'>('pending');
  const [msg, setMsg]             = useState<{text:string;ok:boolean}|null>(null);
  const [detail, setDetail]       = useState<any|null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<any|null>(null);
  const [stats, setStats]         = useState({ pending:0, approved:0 });

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch<any>(`/reading-lists/admin?status=${filter}`);
      setLists(r.lists || []);
      setStats({ pending: r.pendingCount || 0, approved: r.approvedCount || 0 });
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filter]);

  const review = async (id:string, approved:boolean, reason='') => {
    try {
      const r = await apiFetch<any>(`/reading-lists/admin/${id}/review`, {
        method:'PATCH', body: JSON.stringify({ approved, reason })
      });
      setLists(p => p.filter(l => l._id !== id));
      setDetail(null); setRejectTarget(null); setRejectReason('');
      setMsg({ text: approved ? ' List approved — now live for users!' : ' List rejected.', ok: approved });
      setStats(s => ({
        pending: s.pending - 1,
        approved: approved ? s.approved + 1 : s.approved,
      }));
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
  };

  const deleteList = async (id:string) => {
    if (!confirm('Permanently delete this reading list?')) return;
    try {
      await apiFetch(`/reading-lists/admin/${id}`, { method:'DELETE' });
      setLists(p => p.filter(l => l._id !== id));
      setMsg({ text:'List deleted.',ok:true });
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
  };

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 text-sm ${msg.ok?'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200':'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200'}`}>
          {msg.ok?<CheckCircle size={16}/>:<AlertTriangle size={16}/>} {msg.text}
          <button onClick={()=>setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Header (Filters + stats) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <div className="flex gap-2">
          {(['pending','approved','all'] as const).map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition border ${filter===f?'border-[#0d5d3a] bg-[#0d5d3a] text-white shadow-sm':'border-transparent bg-[#f0fbf4] dark:bg-[#0d1f14] text-[#4a7c5d] dark:text-gray-400 hover:bg-[#0d5d3a]/10'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/20">
             {stats.pending} pending
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-500/20">
             {stats.approved} approved
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#4a7c5d] font-bold">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">
          <div className="text-5xl mb-3"></div>
          <div className="font-bold text-[#0a2617] dark:text-white">No {filter} lists</div>
          <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">
            {filter==='pending' ? 'All lists have been reviewed.' : 'No lists in this category.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {lists.map(list => (
            <div key={list._id} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-3xl shadow-md shrink-0">{list.coverEmoji||''}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-black text-[#0a2617] dark:text-white">{list.title}</h3>
                      <p className="text-xs text-[#10b981] font-semibold">by {list.therapistName}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{list.category} · {list.items?.length||0} items · {list.saveCount||0} saves</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {list.isApproved
                        ? <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"> Approved</span>
                        : <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"> Pending</span>
                      }
                    </div>
                  </div>
                  {list.description && <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-2 line-clamp-2">{list.description}</p>}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {(list.tags||[]).map((t:string)=>(
                      <span key={t} className="px-2 py-0.5 rounded-full bg-[#e6f4ea] dark:bg-[#0d5d3a]/15 text-[#0d5d3a] dark:text-[#10b981] text-[10px] font-bold">{t}</span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap mt-4">
                    <button onClick={()=>setDetail(list)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#e6f4ea] dark:hover:bg-[#0d5d3a]/10 transition">
                      <Eye size={12}/> Preview
                    </button>
                    {!list.isApproved && (
                      <button onClick={()=>review(list._id, true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition">
                        <CheckCircle size={12}/> Approve
                      </button>
                    )}
                    {!list.isApproved && (
                      <button onClick={()=>setRejectTarget(list)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-200 transition">
                        <XCircle size={12}/> Reject
                      </button>
                    )}
                    {list.isApproved && (
                      <button onClick={()=>review(list._id, false, 'Revoked by admin.')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 transition">
                        <XCircle size={12}/> Revoke Approval
                      </button>
                    )}
                    <button onClick={()=>deleteList(list._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition ml-auto">
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {detail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setDetail(null)}>
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.96}}
              onClick={e=>e.stopPropagation()}
              className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden">
              <div className="p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-3xl shadow-md shrink-0">{detail.coverEmoji||''}</div>
                <div className="flex-1">
                  <h2 className="font-black text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>{detail.title}</h2>
                  <p className="text-sm text-[#10b981] font-semibold">by {detail.therapistName}</p>
                  {detail.description && <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">{detail.description}</p>}
                </div>
                <button onClick={()=>setDetail(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"><X size={18}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {(detail.items||[]).map((item:any,i:number)=>(
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/8 dark:border-white/5">
                    <span className="text-xl shrink-0">{TYPE_EMOJI[item.type]||''}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#0a2617] dark:text-white">{item.title}</div>
                      {item.author && <div className="text-[11px] text-[#4a7c5d]">{item.author}</div>}
                      {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                      {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0d5d3a] hover:underline font-bold"> {item.url.slice(0,60)}</a>}
                    </div>
                    <span className="text-[10px] text-gray-400 capitalize shrink-0">{item.type}</span>
                  </div>
                ))}
              </div>
              {!detail.isApproved && (
                <div className="p-4 border-t border-[#0d5d3a]/10 dark:border-white/10 flex gap-3">
                  <button onClick={()=>{review(detail._id,true);setDetail(null);}} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <CheckCircle size={15}/> Approve List
                  </button>
                  <button onClick={()=>{setRejectTarget(detail);setDetail(null);}} className="flex-1 py-2.5 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 font-bold text-sm hover:bg-red-200 transition flex items-center justify-center gap-2">
                    <XCircle size={15}/> Reject
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-[#0d5d3a]/15 dark:border-white/10">
              <h3 className="font-black text-[#0a2617] dark:text-white mb-1" style={{fontFamily:'Syne,sans-serif'}}>Reject Reading List</h3>
              <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mb-4">Provide a reason so the therapist can improve and resubmit.</p>
              <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3}
                placeholder="e.g. Contains unverified sources. Please add reputable citations."
                className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-300 text-[#0a2617] dark:text-white resize-none mb-4"/>
              <div className="flex gap-3">
                <button onClick={()=>{setRejectTarget(null);setRejectReason('');}} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button onClick={()=>review(rejectTarget._id, false, rejectReason||'Does not meet guidelines.')}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition">
                  Send Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

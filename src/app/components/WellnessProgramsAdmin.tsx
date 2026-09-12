import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../api/client';

const CATS = ['anxiety','stress','sleep','self_esteem','mindfulness','motivation','other'];
const DIFFS = ['beginner','intermediate','advanced'];
const EX_TYPES = ['breathing','journaling','meditation','movement','reading','reflection','other'];
const CAT_EMOJI: Record<string,string> = { anxiety:'', stress:'', sleep:'', self_esteem:'', mindfulness:'', motivation:'', other:'' };
const GRADIENTS = [
  ['#7c3aed','#a78bfa'],['#1e40af','#6366f1'],['#0d5d3a','#10b981'],
  ['#b45309','#f59e0b'],['#be123c','#fb7185'],['#065f46','#34d399'],
  ['#374151','#6b7280'],['#0369a1','#38bdf8'],
];

const emptyStep = () => ({ dayNumber: 1, title: '', content: '', exerciseType: 'reflection', durationMinutes: 10 });
const emptyForm = () => ({
  title:'', description:'', category:'anxiety', difficulty:'beginner',
  durationDays:7, isPublished:true, coverGradientFrom:'#0d5d3a', coverGradientTo:'#10b981', steps:[emptyStep()],
});

export default function WellnessProgramsAdmin() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{text:string;ok:boolean}|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any|null>(null);
  const [form, setForm] = useState<any>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [deletingId, setDeletingId] = useState<string|null>(null);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/wellness-programs/admin/list');
      setPrograms(res.programs || []);
      setTotalEnrollments(res.totalEnrollments || 0);
    } catch(e:any) { setMsg({text:e.message,ok:false}); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const flash = (text:string, ok=true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3500); };

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (p:any) => {
    setEditing(p);
    setForm({ title:p.title, description:p.description, category:p.category, difficulty:p.difficulty,
      durationDays:p.durationDays, isPublished:p.isPublished,
      coverGradientFrom:p.coverGradientFrom, coverGradientTo:p.coverGradientTo,
      steps: p.steps?.length ? p.steps : [emptyStep()] });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { flash('Title is required.', false); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/wellness-programs/admin/${editing._id}`, { method:'PUT', body:JSON.stringify(form) });
        flash(' Program updated successfully!');
      } else {
        await apiFetch('/wellness-programs/admin', { method:'POST', body:JSON.stringify(form) });
        flash(' Program created successfully!');
      }
      setShowForm(false); load();
    } catch(e:any) { flash(e.message||'Failed to save', false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id:string) => {
    setDeletingId(id);
    try {
      await apiFetch(`/wellness-programs/admin/${id}`, { method:'DELETE' });
      flash('Program deleted.'); load();
    } catch(e:any) { flash(e.message||'Failed', false); }
    finally { setDeletingId(null); }
  };

  const handleToggle = async (id:string) => {
    try {
      const res = await apiFetch<any>(`/wellness-programs/admin/${id}/toggle`, { method:'PATCH' });
      setPrograms(prev => prev.map(p => p._id===id ? {...p, isPublished:res.isPublished} : p));
    } catch(e:any) { flash(e.message||'Failed', false); }
  };

  const setStep = (idx:number, field:string, val:any) => {
    setForm((f:any) => { const steps=[...f.steps]; steps[idx]={...steps[idx],[field]:val}; return {...f,steps}; });
  };
  const addStep = () => setForm((f:any) => ({ ...f, steps:[...f.steps, {...emptyStep(), dayNumber:f.steps.length+1}] }));
  const removeStep = (idx:number) => setForm((f:any) => ({ ...f, steps:f.steps.filter((_:any,i:number)=>i!==idx) }));

  if (loading) return <div className="py-20 text-center text-[#4a7c5d] font-bold">Loading programs...</div>;

  return (
    <div className="space-y-6 pb-20">
      {msg && (
        <div className={`p-4 rounded-2xl font-semibold flex items-center gap-2 ${msg.ok?'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200 dark:border-[#10b981]/20':'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
          {msg.ok?<CheckCircle size={16}/>:<AlertTriangle size={16}/>} {msg.text}
          <button onClick={()=>setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Total Programs', val:programs.length, sub:`${programs.filter(p=>p.isPublished).length} published`, icon:'' },
          { label:'Total Enrollments', val:totalEnrollments, sub:'Across all programs', icon:'' },
          { label:'Active Programs', val:programs.filter(p=>p.isPublished).length, sub:`${programs.filter(p=>!p.isPublished).length} drafts`, icon:'' },
        ].map(s=>(
          <div key={s.label} className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-3xl font-black text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>{s.val}</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1 font-semibold">{s.label}</div>
            <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] font-semibold">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>All Programs ({programs.length})</h2>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold text-sm hover:bg-[#0a4a2e] transition shadow-md">
          <Plus size={16}/> New Program
        </button>
      </div>

      {/* Program list */}
      <div className="space-y-3">
        {programs.map(p => (
          <div key={p._id} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-5">
              <div className="w-2 self-stretch rounded-full shrink-0" style={{background:`linear-gradient(${p.coverGradientFrom},${p.coverGradientTo})`}}/>
              <div className="text-2xl">{CAT_EMOJI[p.category]||''}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#0a2617] dark:text-white">{p.title}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.isPublished?'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400':'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                    {p.isPublished?'Published':'Draft'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-3">
                  <span className="flex items-center gap-1"><Clock size={10}/>{p.durationDays} days</span>
                  <span className="flex items-center gap-1"><Users size={10}/>{p.enrollmentCount||0} enrolled</span>
                  <span className="capitalize">{p.difficulty}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={()=>handleToggle(p._id)} title={p.isPublished?'Unpublish':'Publish'}
                  className={`p-2 rounded-lg transition ${p.isPublished?'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10':'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                  {p.isPublished?<ToggleRight size={20}/>:<ToggleLeft size={20}/>}
                </button>
                <button onClick={()=>openEdit(p)} className="p-2 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#e6f4ea] dark:hover:bg-[#0d5d3a]/20 rounded-lg transition"><Edit2 size={15}/></button>
                <button onClick={()=>handleDelete(p._id)} disabled={deletingId===p._id} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"><Trash2 size={15}/></button>
                <button onClick={()=>setExpandedId(expandedId===p._id?null:p._id)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition">
                  {expandedId===p._id?<ChevronUp size={15}/>:<ChevronDown size={15}/>}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {expandedId===p._id && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  className="border-t border-[#0d5d3a]/10 dark:border-white/5 px-5 pb-5 pt-4 overflow-hidden">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{p.description}</p>
                  <div className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-2">DAY PLAN ({p.steps?.length||0} steps)</div>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {(p.steps||[]).map((s:any)=>(
                      <div key={s._id} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-50 dark:border-white/5 last:border-0">
                        <span className="w-6 h-6 rounded-full bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] flex items-center justify-center font-black shrink-0">{s.dayNumber}</span>
                        <span className="font-semibold text-[#0a2617] dark:text-white">{s.title}</span>
                        <span className="text-gray-400 ml-auto">{s.durationMinutes}m</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {programs.length===0 && (
          <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/5">
            <div className="text-4xl mb-3"></div>
            <div className="font-bold text-[#4a7c5d] dark:text-gray-400">No programs yet. Create your first one!</div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{scale:0.95,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:20}}
              className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl w-full max-w-2xl my-8 border border-[#0d5d3a]/10 dark:border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-[#0d5d3a]/10 dark:border-white/10">
                <h3 className="text-xl font-black text-[#0a2617] dark:text-white" style={{fontFamily:'Syne,sans-serif'}}>
                  {editing?'Edit Program':'New Wellness Program'}
                </h3>
                <button onClick={()=>setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"><X size={18}/></button>
              </div>

              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="sm:col-span-2 block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Title *</span>
                    <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. 7-Day Anxiety Relief"
                      className="mt-1 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>
                  </label>
                  <label className="sm:col-span-2 block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Description</span>
                    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Describe what participants will gain..."
                      className="mt-1 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white resize-none"/>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Category</span>
                    <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                      className="mt-1 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white">
                      {CATS.map(c=><option key={c} value={c}>{CAT_EMOJI[c]} {c.replace('_',' ')}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Difficulty</span>
                    <select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}
                      className="mt-1 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white">
                      {DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Duration (days)</span>
                    <div className="mt-1 w-full bg-gray-100 dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 font-bold cursor-not-allowed">
                      {form.steps.length} {form.steps.length === 1 ? 'day' : 'days'} (Based on steps added below)
                    </div>
                  </label>
                  <label className="flex items-center gap-3 pt-6 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} className="w-4 h-4 rounded accent-[#0d5d3a]"/>
                    <span className="text-sm font-semibold text-[#0a2617] dark:text-white">Publish immediately</span>
                  </label>
                </div>

                {/* Color gradient picker */}
                <div>
                  <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Cover Gradient</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {GRADIENTS.map(([from,to])=>(
                      <button key={from} onClick={()=>setForm({...form,coverGradientFrom:from,coverGradientTo:to})}
                        className={`w-10 h-10 rounded-xl transition-all ${form.coverGradientFrom===from?'ring-2 ring-offset-2 ring-[#0a2617] dark:ring-white scale-110':''}`}
                        style={{background:`linear-gradient(135deg,${from},${to})`}}/>
                    ))}
                  </div>
                </div>

                {/* Day steps */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wide">Daily Steps ({form.steps.length})</span>
                    <button onClick={addStep} className="flex items-center gap-1 text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] hover:underline"><Plus size={12}/>Add Day</button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {form.steps.map((step:any,idx:number)=>(
                      <div key={idx} className="bg-[#fbfdfb] dark:bg-[#1a1a1a] rounded-xl border border-[#0d5d3a]/10 dark:border-white/5 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-black text-[#0d5d3a] dark:text-[#10b981]">Day {idx+1}</span>
                          {form.steps.length>1 && (
                            <button onClick={()=>removeStep(idx)} className="text-red-400 hover:text-red-600 p-1"><X size={13}/></button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input value={step.title} onChange={e=>setStep(idx,'title',e.target.value)} placeholder="Step title"
                            className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-[#0a2617] dark:text-white"/>
                          <select value={step.exerciseType} onChange={e=>setStep(idx,'exerciseType',e.target.value)}
                            className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-[#0a2617] dark:text-white">
                            {EX_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                          </select>
                          <textarea value={step.content} onChange={e=>setStep(idx,'content',e.target.value)} placeholder="Instructions for this day..." rows={3}
                            className="sm:col-span-2 bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-[#0a2617] dark:text-white resize-none"/>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-400"/>
                            <input type="number" min={1} value={step.durationMinutes} onChange={e=>setStep(idx,'durationMinutes',Number(e.target.value))}
                              className="w-20 bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-lg px-2 py-2 text-sm outline-none text-[#0a2617] dark:text-white"/>
                            <span className="text-xs text-gray-400">minutes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-[#0d5d3a]/10 dark:border-white/10">
                <button onClick={()=>setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[#0a2617] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold hover:bg-[#0a4a2e] transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
                  <Save size={15}/> {saving?'Saving...':editing?'Update Program':'Create Program'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

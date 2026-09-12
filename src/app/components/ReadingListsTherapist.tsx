import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit3, Eye, CheckCircle, XCircle, BookOpen, ChevronDown, ChevronUp, X, Save } from 'lucide-react';
import { apiFetch } from '../api/client';

const CATS = ['general','anxiety','depression','trauma','relationships','teen','stress','sleep','self-esteem','mindfulness'];
const TYPES = ['book','article','video','podcast','tool'];
const COVER_EMOJIS = ['','','','','','','','','','','','','️','',''];
const TYPE_EMOJI: Record<string,string> = { book:'', article:'', video:'', podcast:'', tool:'️' };

const emptyItem = () => ({ type:'book', title:'', author:'', description:'', url:'', coverEmoji:'' });

export default function ReadingListsTherapist() {
  const [lists, setLists]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState<{text:string;ok:boolean}|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any|null>(null);
  const [expanded, setExpanded] = useState<string|null>(null);

  // Form state
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [cat, setCat]           = useState('general');
  const [tags, setTags]         = useState('');
  const [emoji, setEmoji]       = useState('');
  const [items, setItems]       = useState<any[]>([emptyItem()]);
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch<any>('/reading-lists/therapist'); setLists(r.lists||[]); }
    catch(e:any){ setMsg({text:e.message,ok:false}); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openEdit = (list:any) => {
    setEditing(list);
    setTitle(list.title); setDesc(list.description); setCat(list.category);
    setTags((list.tags||[]).join(', ')); setEmoji(list.coverEmoji||'');
    setItems(list.items?.length ? list.items : [emptyItem()]);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null); setTitle(''); setDesc(''); setCat('general');
    setTags(''); setEmoji(''); setItems([emptyItem()]); setShowForm(false);
  };

  const addItem = () => setItems(p => [...p, emptyItem()]);
  const removeItem = (i:number) => setItems(p => p.filter((_,j) => j!==i));
  const updateItem = (i:number, k:string, v:string) => setItems(p => p.map((it,j) => j===i ? {...it,[k]:v} : it));

  const submit = async (publish:boolean) => {
    if (!title.trim()) return;
    setSaving(true); setMsg(null);
    try {
      const body = {
        title, description:desc, category:cat,
        tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
        coverEmoji: emoji,
        items: items.filter(it=>it.title.trim()),
        isPublished: publish,
      };
      if (editing) {
        const r = await apiFetch<any>(`/reading-lists/therapist/${editing._id}`, { method:'PUT', body:JSON.stringify(body) });
        setLists(p => p.map(l => l._id===editing._id ? r.list : l));
      } else {
        const r = await apiFetch<any>('/reading-lists/therapist', { method:'POST', body:JSON.stringify(body) });
        setLists(p => [r.list, ...p]);
        // If publishing, update isPublished separately
        if (publish) {
          const r2 = await apiFetch<any>(`/reading-lists/therapist/${r.list._id}`, { method:'PUT', body:JSON.stringify({isPublished:true}) });
          setLists(p => p.map(l => l._id===r2.list._id ? r2.list : l));
        }
      }
      setMsg({text: publish ? ' List published & sent for admin review!' : ' Draft saved.', ok:true});
      resetForm();
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
    finally { setSaving(false); }
  };

  const deleteList = async (id:string) => {
    if (!confirm('Delete this reading list?')) return;
    try {
      await apiFetch(`/reading-lists/therapist/${id}`, { method:'DELETE' });
      setLists(p => p.filter(l => l._id!==id));
      setMsg({text:'List deleted.',ok:true});
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
  };

  const togglePublish = async (list:any) => {
    try {
      const r = await apiFetch<any>(`/reading-lists/therapist/${list._id}`, {
        method:'PUT', body:JSON.stringify({isPublished:!list.isPublished})
      });
      setLists(p => p.map(l => l._id===list._id ? r.list : l));
    } catch(e:any){ setMsg({text:e.message,ok:false}); }
  };

  return (
    <div className="flex flex-col gap-6">
      {msg && (
        <div className={`p-4 rounded-xl font-semibold flex items-center gap-2 text-sm ${msg.ok?'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981] border border-green-200':'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-200'}`}>
          {msg.ok?<CheckCircle size={16}/>:<XCircle size={16}/>} {msg.text}
          <button onClick={()=>setMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14}/></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#f0fbf4] dark:bg-[#0d1f14] border border-[#0d5d3a]/10 dark:border-white/5 text-xs text-[#4a7c5d] dark:text-gray-400 font-medium flex items-center gap-2">
            <BookOpen size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> Create curated lists for your patients · published lists go for admin review
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5d3a] text-white font-bold text-xs hover:bg-[#0a4a2e] transition shadow-md shrink-0">
          <Plus size={14}/> New List
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0,y:-12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}}
            className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/15 dark:border-white/10 p-6 flex flex-col gap-5 shadow-sm">
            <h3 className="font-black text-[#0a2617] dark:text-white">{editing ? 'Edit List' : 'Create New Reading List'}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block col-span-full">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Title *</span>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Books for Overcoming Anxiety"
                  className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>
              </label>
              <label className="block col-span-full">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Description</span>
                <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="What will patients gain from this list?"
                  className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white resize-none"/>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Category</span>
                <select value={cat} onChange={e=>setCat(e.target.value)}
                  className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none text-[#0a2617] dark:text-white capitalize">
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Tags (comma-separated)</span>
                <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="e.g. anxiety, CBT, self-help"
                  className="mt-1.5 w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 text-[#0a2617] dark:text-white"/>
              </label>
              <div className="col-span-full">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide block mb-2">Cover Emoji</span>
                <div className="flex flex-wrap gap-2">{COVER_EMOJIS.map(e=>(
                  <button key={e} type="button" onClick={()=>setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl border-2 transition ${emoji===e?'border-[#0d5d3a] bg-[#e6f4ea] dark:bg-[#0d5d3a]/30':'border-transparent bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {e}
                  </button>
                ))}</div>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#4a7c5d] uppercase tracking-wide">Resources ({items.length})</span>
                <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-[#0d5d3a] hover:underline"><Plus size={12}/> Add Resource</button>
              </div>
              <div className="flex flex-col gap-3">
                {items.map((item,i)=>(
                  <div key={i} className="bg-[#fbfdfb] dark:bg-[#1a1a1a] rounded-xl p-4 border border-[#0d5d3a]/10 dark:border-white/8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        {TYPES.map(t=>(
                          <button key={t} type="button" onClick={()=>updateItem(i,'type',t)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${item.type===t?'bg-[#0d5d3a] text-white':'bg-gray-100 dark:bg-white/10 text-gray-500 hover:bg-gray-200'}`}>
                            {TYPE_EMOJI[t]} {t}
                          </button>
                        ))}
                      </div>
                      <button type="button" onClick={()=>removeItem(i)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input value={item.title} onChange={e=>updateItem(i,'title',e.target.value)} placeholder="Title *"
                        className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/12 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white"/>
                      <input value={item.author} onChange={e=>updateItem(i,'author',e.target.value)} placeholder="Author / By"
                        className="w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/12 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white"/>
                      <input value={item.url} onChange={e=>updateItem(i,'url',e.target.value)} placeholder="URL (optional)"
                        className="sm:col-span-2 w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/12 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white"/>
                      <textarea value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} placeholder="Short description" rows={2}
                        className="sm:col-span-2 w-full bg-white dark:bg-[#111111] border border-[#0d5d3a]/12 dark:border-white/8 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white resize-none"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end flex-wrap">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
              <button type="button" disabled={saving||!title.trim()} onClick={()=>submit(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0d5d3a] text-[#0d5d3a] font-bold text-sm hover:bg-[#e6f4ea] transition disabled:opacity-50">
                <Save size={14}/> Save Draft
              </button>
              <button type="button" disabled={saving||!title.trim()} onClick={()=>submit(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0d5d3a] text-white font-bold text-sm hover:bg-[#0a4a2e] transition disabled:opacity-50">
                <Eye size={14}/> Publish for Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lists */}
      {loading ? <div className="text-center py-16 text-[#4a7c5d] font-bold">Loading…</div> : (
        <div className="flex flex-col gap-3">
          {lists.map(list => (
            <div key={list._id} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/12 dark:border-white/8 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={()=>setExpanded(expanded===list._id ? null : list._id)}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-2xl shadow-md shrink-0">{list.coverEmoji||''}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-[#0a2617] dark:text-white text-sm">{list.title}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{list.items?.length||0} items · {list.category}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {/* Status badges */}
                  {!list.isPublished && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500">Draft</span>}
                  {list.isPublished && !list.isApproved && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"> Pending Review</span>}
                  {list.isPublished && list.isApproved && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"> Live</span>}
                  {list.rejectionReason && <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-500/10 text-red-500"> Rejected</span>}
                  <button onClick={e=>{e.stopPropagation();openEdit(list);}} className="p-2 rounded-lg hover:bg-[#e6f4ea] dark:hover:bg-white/10 text-[#4a7c5d] transition"><Edit3 size={14}/></button>
                  <button onClick={e=>{e.stopPropagation();deleteList(list._id);}} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition"><Trash2 size={14}/></button>
                  {expanded===list._id ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
                </div>
              </div>
              {expanded===list._id && (
                <div className="px-5 pb-5 border-t border-[#0d5d3a]/08 dark:border-white/06 pt-4 space-y-2">
                  {list.rejectionReason && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium mb-3">
                      <strong>Rejection reason:</strong> {list.rejectionReason}
                      <button onClick={()=>togglePublish(list)} className="ml-3 font-bold underline">Resubmit</button>
                    </div>
                  )}
                  {(list.items||[]).map((item:any,i:number)=>(
                    <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/06 dark:border-white/04">
                      <span className="text-lg">{TYPE_EMOJI[item.type]||''}</span>
                      <div>
                        <div className="font-bold text-sm text-[#0a2617] dark:text-white">{item.title}</div>
                        {item.author && <div className="text-[11px] text-[#4a7c5d]">{item.author}</div>}
                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#0d5d3a] hover:underline font-bold">{item.url.slice(0,50)}…</a>}
                      </div>
                    </div>
                  ))}
                  {(!list.items||list.items.length===0) && <div className="text-center py-6 text-gray-400 text-sm">No items yet — click Edit to add resources.</div>}
                </div>
              )}
            </div>
          ))}
          {lists.length===0 && (
            <div className="flex flex-col items-center py-20 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/08 dark:border-white/08">
              <div className="text-5xl mb-3"></div>
              <div className="font-bold text-[#0a2617] dark:text-white">No reading lists yet</div>
              <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Click "New List" to create your first curated reading list.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

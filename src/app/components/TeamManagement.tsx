import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, CheckCircle, AlertTriangle, Users, ExternalLink } from 'lucide-react';
import { apiFetch } from '../api/client';

const EMPTY = { name: '', role: '', bio: '', imageBase64: '', imageUrl: '', linkedinUrl: '', twitterUrl: '', profileLink: '', order: 0, isActive: true };

export default function TeamManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null); // null = list, {} = new, {_id:...} = edit
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch<any>('/admin/team'); setMembers(r.members || []); }
    catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...EMPTY }); setEditing({}); };
  const openEdit = (m: any) => { setForm({ ...m }); setEditing(m); };
  const close = () => { setEditing(null); setMsg(null); };

  const handleImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setForm((p: any) => ({ ...p, imageBase64: String(reader.result) }));
    reader.readAsDataURL(f);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name || !form.role) { setMsg({ text: 'Name and Role are required', ok: false }); return; }
    setSaving(true); setMsg(null);
    try {
      if (editing?._id) {
        await apiFetch(`/admin/team/${editing._id}`, { method: 'PUT', body: JSON.stringify(form) });
        setMsg({ text: 'Member updated!', ok: true });
      } else {
        await apiFetch('/admin/team', { method: 'POST', body: JSON.stringify(form) });
        setMsg({ text: 'Member added!', ok: true });
      }
      await load(); close();
    } catch (e: any) { setMsg({ text: e.message || 'Failed', ok: false }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this team member?')) return;
    setDeleting(id);
    try { await apiFetch(`/admin/team/${id}`, { method: 'DELETE' }); await load(); }
    catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setDeleting(null); }
  };

  const f = (key: string) => ({ value: form[key] ?? '', onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.value })) });
  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-[#f8fdf9] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30';

  if (editing !== null) return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          {editing._id ? 'Edit Member' : 'Add Team Member'}
        </h2>
        <button onClick={close} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500"><X size={18} /></button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Photo */}
        <div>
          <span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 block mb-2">Profile Photo</span>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#e8f5e9] dark:bg-[#1a2a1f] overflow-hidden flex items-center justify-center border border-[#0d5d3a]/15">
              {form.imageBase64 ? <img src={form.imageBase64} alt="" className="w-full h-full object-cover" /> : <Users size={24} className="text-[#0d5d3a]/40" />}
            </div>
            <button type="button" onClick={() => imgRef.current?.click()} className="px-4 py-2 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#f0fbf4] transition">
              Upload Photo
            </button>
            <input ref={imgRef} type="file" accept="image/*" onChange={handleImg} className="hidden" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Full Name *</span><input {...f('name')} required className={inputCls} placeholder="Your Name" /></label>
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Role / Title *</span><input {...f('role')} required className={inputCls} placeholder="Co-founder & CEO" /></label>
        </div>
        <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Bio</span><textarea {...f('bio')} rows={3} className={inputCls + ' resize-none'} placeholder="Short bio..." /></label>
        <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">LinkedIn URL</span><input {...f('linkedinUrl')} className={inputCls} placeholder="https://linkedin.com/in/..." /></label>
        <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Twitter / X URL</span><input {...f('twitterUrl')} className={inputCls} placeholder="https://twitter.com/..." /></label>
        <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Card Click URL (portfolio / profile)</span><input {...f('profileLink')} className={inputCls} placeholder="https://..." /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Display Order</span><input type="number" {...f('order')} className={inputCls} /></label>
          <label className="flex items-center gap-3 pt-5 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm((p: any) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 accent-[#0d5d3a]" />
            <span className="text-sm font-bold text-[#0a2617] dark:text-white">Visible on site</span>
          </label>
        </div>
        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#0a4a2e] transition">
          <Save size={16} /> {saving ? 'Saving...' : (editing._id ? 'Save Changes' : 'Add Member')}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      {msg && <div className={`p-3 rounded-xl text-sm font-semibold ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#f0fbf4] dark:bg-[#0d1f14] border border-[#0d5d3a]/10 dark:border-white/5 text-xs text-[#4a7c5d] dark:text-gray-400 font-medium flex items-center gap-2">
            <Users size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> Manage the About Us page founder cards
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold text-xs hover:bg-[#0a4a2e] transition shadow-md shrink-0">
          <Plus size={14} /> Add Member
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-[#4a7c5d] font-semibold">Loading...</div>
        : members.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10">
            <Users size={40} className="text-[#0d5d3a]/30 mx-auto mb-3" />
            <p className="font-bold text-[#0a2617] dark:text-white mb-1">No team members yet</p>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mb-4">Add your co-founders to display on the About Us page</p>
            <button onClick={openNew} className="px-5 py-2.5 rounded-xl bg-[#0d5d3a] text-white font-bold text-sm hover:bg-[#0a4a2e] transition">Add First Member</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {members.map(m => {
                const img = m.imageBase64 ? (m.imageBase64.startsWith('data:') ? m.imageBase64 : `data:image/jpeg;base64,${m.imageBase64}`) : m.imageUrl;
                return (
                  <motion.div key={m._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-5 flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-[#e8f5e9] dark:bg-[#1a2a1f] overflow-hidden flex-shrink-0">
                      {img ? <img src={img} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#0d5d3a] text-xl font-black">{m.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-[#0a2617] dark:text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{m.name}</p>
                          <p className="text-xs font-bold text-[#0d5d3a] dark:text-[#10b981]">{m.role}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {m.profileLink && <a href={m.profileLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-[#4a7c5d] hover:bg-[#f0fbf4] transition"><ExternalLink size={13} /></a>}
                          <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-[#4a7c5d] hover:bg-[#f0fbf4] dark:hover:bg-white/10 transition"><Edit2 size={13} /></button>
                          <button onClick={() => handleDelete(m._id)} disabled={deleting === m._id} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {m.bio && <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1.5 line-clamp-2">{m.bio}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>{m.isActive ? 'Visible' : 'Hidden'}</span>
                        <span className="text-[10px] text-[#4a7c5d] dark:text-gray-500">Order: {m.order}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Save, CheckCircle, AlertTriangle, Briefcase, Eye, Users, ToggleLeft, ToggleRight, Star, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { apiFetch } from '../api/client';

const EMPTY_JOB = {
  title: '', department: '', location: '', employmentType: 'Full-time', experience: '',
  salary: '', shortDescription: '', description: '',
  responsibilities: '', requirements: '', benefits: '', skills: '',
  openings: 1, applyUrl: '', applyEmail: '', status: 'active', featured: false,
};

type View = 'list' | 'form' | 'applications';

export default function JobsManagement() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [appsJob, setAppsJob] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch<any>('/admin/jobs'); setJobs(r.jobs || []); }
    catch (e: any) { setMsg({ text: e.message, ok: false }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...EMPTY_JOB }); setEditing(null); setView('form'); setMsg(null); };
  const openEdit = (j: any) => {
    setForm({
      ...j,
      responsibilities: (j.responsibilities || []).join('\n'),
      requirements:     (j.requirements || []).join('\n'),
      benefits:         (j.benefits || []).join('\n'),
      skills:           (j.skills || []).join(', '),
    });
    setEditing(j); setView('form'); setMsg(null);
  };
  const openApps = async (j: any) => {
    setAppsJob(j);
    try { const r = await apiFetch<any>(`/admin/jobs/${j._id}/applications`); setApps(r.applications || []); }
    catch { setApps([]); }
    setView('applications');
  };

  const toLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title) { setMsg({ text: 'Title is required', ok: false }); return; }
    setSaving(true); setMsg(null);
    const payload = {
      ...form,
      responsibilities: toLines(form.responsibilities),
      requirements:     toLines(form.requirements),
      benefits:         toLines(form.benefits),
      skills:           form.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    try {
      if (editing) { await apiFetch(`/admin/jobs/${editing._id}`, { method: 'PUT', body: JSON.stringify(payload) }); }
      else { await apiFetch('/admin/jobs', { method: 'POST', body: JSON.stringify(payload) }); }
      await load(); setView('list'); setMsg(null);
    } catch (e: any) { setMsg({ text: e.message || 'Failed to save', ok: false }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this job?')) return;
    try { await apiFetch(`/admin/jobs/${id}`, { method: 'DELETE' }); await load(); }
    catch (e: any) { setMsg({ text: e.message, ok: false }); }
  };

  const toggleStatus = async (j: any) => {
    try { const r = await apiFetch<any>(`/admin/jobs/${j._id}/status`, { method: 'PATCH' }); setJobs(prev => prev.map(x => x._id === j._id ? { ...x, status: r.status } : x)); }
    catch (e: any) { setMsg({ text: e.message, ok: false }); }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-[#f8fdf9] dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/30';
  const f = (key: string, type?: string) => ({
    value: form[key] ?? '',
    onChange: (e: any) => setForm((p: any) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value })),
  });

  /* ── APPLICATIONS VIEW ── */
  if (view === 'applications') return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button onClick={() => setView('list')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-[#4a7c5d] transition"><ArrowLeft size={18} /></button>
        <div>
          <h2 className="text-lg font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Applications — {appsJob?.title}</h2>
          <p className="text-xs text-[#4a7c5d] dark:text-gray-400">{apps.length} application{apps.length !== 1 ? 's' : ''} received</p>
        </div>
      </div>
      {apps.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10">
          <Users size={36} className="text-[#0d5d3a]/30 mx-auto mb-3" />
          <p className="font-bold text-[#0a2617] dark:text-white">No applications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a: any) => (
            <div key={a._id} className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <p className="font-black text-[#0a2617] dark:text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{a.name}</p>
                  <p className="text-xs text-[#4a7c5d] dark:text-gray-400">{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                  {a.portfolioUrl && <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0d5d3a] dark:text-[#10b981] hover:underline">{a.portfolioUrl}</a>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${a.status === 'new' ? 'bg-blue-100 text-blue-700' : a.status === 'shortlisted' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                  <select value={a.status} onChange={async e => { await apiFetch(`/admin/applications/${a._id}/status`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) }); setApps(prev => prev.map(x => x._id === a._id ? { ...x, status: e.target.value } : x)); }}
                    className="text-xs px-2 py-1 rounded-lg border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-white outline-none">
                    {['new','reviewed','shortlisted','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {a.coverLetter && <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-3 leading-relaxed line-clamp-3 italic">"{a.coverLetter}"</p>}
              <p className="text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-2">{new Date(a.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── FORM VIEW ── */
  if (view === 'form') return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('list')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-[#4a7c5d] transition"><ArrowLeft size={18} /></button>
        <h2 className="text-xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          {editing ? 'Edit Job' : 'Post New Job'}
        </h2>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${msg.ok ? 'bg-green-50 dark:bg-[#10b981]/10 text-green-700 dark:text-[#10b981]' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
          {msg.ok ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <SectionBlock title="Basic Info">
          <label className="block col-span-2"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Job Title *</span><input {...f('title')} required className={inputCls} placeholder="Frontend Developer" /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Department</span><input {...f('department')} className={inputCls} placeholder="Engineering" /></label>
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Location</span><input {...f('location')} className={inputCls} placeholder="Bangalore / Remote" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Employment Type</span>
              <select {...f('employmentType')} className={inputCls}>
                {['Full-time','Part-time','Internship','Contract'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Experience</span><input {...f('experience')} className={inputCls} placeholder="2-4 Years" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Salary Range</span><input {...f('salary')} className={inputCls} placeholder="₹8-12 LPA" /></label>
            <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Openings</span><input type="number" min="1" {...f('openings', 'number')} className={inputCls} /></label>
          </div>
        </SectionBlock>

        <SectionBlock title="Description">
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Short Description (card preview)</span><textarea {...f('shortDescription')} rows={2} className={inputCls + ' resize-none'} placeholder="Brief summary for job card..." /></label>
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Full Description</span><textarea {...f('description')} rows={4} className={inputCls + ' resize-none'} placeholder="Full job description..." /></label>
        </SectionBlock>

        <SectionBlock title="Details (one item per line)">
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Responsibilities</span><textarea {...f('responsibilities')} rows={4} className={inputCls + ' resize-none'} placeholder="Build scalable React components&#10;Collaborate with design team&#10;Write unit tests" /></label>
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Requirements</span><textarea {...f('requirements')} rows={4} className={inputCls + ' resize-none'} placeholder="2+ years React experience&#10;Bachelor's degree in CS or equivalent&#10;Strong problem-solving skills" /></label>
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Benefits</span><textarea {...f('benefits')} rows={3} className={inputCls + ' resize-none'} placeholder="Health insurance&#10;Flexible working hours&#10;Learning & development budget" /></label>
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">Skills (comma separated)</span><input {...f('skills')} className={inputCls} placeholder="React, TypeScript, Node.js, Figma" /></label>
        </SectionBlock>

        <SectionBlock title="Application Settings">
          <label className="block"><span className="text-xs font-bold text-[#4a7c5d] dark:text-gray-400 mb-1 block">External Apply URL (leave blank for internal form)</span><input {...f('applyUrl')} className={inputCls} placeholder="https://forms.google.com/..." /></label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setForm((p: any) => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-[#0d5d3a]" />
              <span className="text-sm font-bold text-[#0a2617] dark:text-white"> Featured Job</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.status === 'active'} onChange={e => setForm((p: any) => ({ ...p, status: e.target.checked ? 'active' : 'closed' }))} className="w-4 h-4 accent-[#0d5d3a]" />
              <span className="text-sm font-bold text-[#0a2617] dark:text-white">Active (visible on site)</span>
            </label>
          </div>
        </SectionBlock>

        <button type="submit" disabled={saving} className="w-full py-3.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#0a4a2e] transition shadow-lg">
          <Save size={16} /> {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Post Job')}
        </button>
      </form>
    </div>
  );

  /* ── LIST VIEW ── */
  return (
    <div className="flex flex-col gap-5">
      {msg && <div className={`p-3 rounded-xl text-sm font-semibold ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-xs font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
            <Briefcase size={14} /> 
            {jobs.filter(j => j.status === 'active').length} active
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#f0fbf4] dark:bg-[#0d1f14] border border-[#0d5d3a]/10 dark:border-white/5 text-xs text-[#4a7c5d] dark:text-gray-400 hidden sm:block font-medium">
            {jobs.length} total postings
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-xs font-bold hover:bg-[#0a4a2e] transition shadow-md shrink-0">
          <Plus size={14} /> Post New Job
        </button>
      </div>

      {loading ? <div className="text-center py-12 text-[#4a7c5d] font-semibold">Loading...</div>
        : jobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10">
            <Briefcase size={40} className="text-[#0d5d3a]/30 mx-auto mb-3" />
            <p className="font-bold text-[#0a2617] dark:text-white mb-1">No job postings yet</p>
            <button onClick={openNew} className="mt-3 px-5 py-2.5 rounded-xl bg-[#0d5d3a] text-white font-bold text-sm">Post First Job</button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {jobs.map(j => (
                <motion.div key={j._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {j.featured && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${j.status === 'active' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>{j.status}</span>
                        {j.department && <span className="text-[10px] font-bold text-[#4a7c5d] dark:text-gray-400 bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 px-2 py-0.5 rounded-full">{j.department}</span>}
                      </div>
                      <h3 className="font-black text-[#0a2617] dark:text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{j.title}</h3>
                      <p className="text-xs text-[#4a7c5d] dark:text-gray-400">{[j.location, j.employmentType, j.experience].filter(Boolean).join(' · ')}</p>
                      {j.shortDescription && <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1 line-clamp-1">{j.shortDescription}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0 flex-wrap">
                      <button onClick={() => openApps(j)} title="View Applications" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] hover:bg-[#e0f5e8] transition"><Eye size={13} /> Apps</button>
                      <button onClick={() => toggleStatus(j)} title="Toggle Status" className="p-1.5 rounded-lg text-[#4a7c5d] hover:bg-[#f0fbf4] dark:hover:bg-white/10 transition">
                        {j.status === 'active' ? <ToggleRight size={18} className="text-[#0d5d3a] dark:text-[#10b981]" /> : <ToggleLeft size={18} />}
                      </button>
                      <button onClick={() => openEdit(j)} className="p-1.5 rounded-lg text-[#4a7c5d] hover:bg-[#f0fbf4] dark:hover:bg-white/10 transition"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(j._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 font-black text-[#0a2617] dark:text-white text-sm hover:bg-[#f8fdf9] dark:hover:bg-white/5 transition">
        {title}
        {open ? <ChevronUp size={16} className="text-[#4a7c5d]" /> : <ChevronDown size={16} className="text-[#4a7c5d]" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

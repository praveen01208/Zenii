import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Plus, Trash2, Upload, FileText, IndianRupee,
  CheckCircle, X, RefreshCw, Download, Edit2, Save, Tag
} from 'lucide-react';
import { apiFetch } from '../api/client';

type StoreAsset = {
  _id: string;
  title: string;
  description: string;
  fileMime: string;
  fileName: string;
  price: number;
  category: string;
  downloads: number;
  hasFile: boolean;
  createdAt: string;
};

const CATEGORIES = ['Wellness', 'Anxiety', 'Sleep', 'Mindfulness', 'Self-Esteem', 'Stress', 'Relationships', 'Other'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WellnessStoreAdmin() {
  const [assets, setAssets]     = useState<StoreAsset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [price, setPrice]       = useState('0');
  const [category, setCat]      = useState('Wellness');
  const [file, setFile]         = useState<File | null>(null);
  const [saving, setSaving]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [delId, setDelId]       = useState<string | null>(null);
  const [delBusy, setDelBusy]   = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ assets: StoreAsset[] }>('/store/admin/list');
      setAssets(res.assets);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setTitle(''); setDesc(''); setPrice('0'); setCat('Wellness'); setFile(null);
    setEditId(null); setShowForm(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openEdit = (a: StoreAsset) => {
    setTitle(a.title); setDesc(a.description);
    setPrice(String(a.price)); setCat(a.category);
    setFile(null); setEditId(a._id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { showToast('Title is required', false); return; }
    setSaving(true);
    try {
      let fileData = '';
      let fileMime = '';
      let fileName = '';

      if (file) {
        const b64 = await fileToBase64(file);
        fileData  = b64.split(',')[1] || '';
        fileMime  = file.type;
        fileName  = file.name;
      }

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        category: category.trim(),
      };
      if (file) { payload.fileData = fileData; payload.fileMime = fileMime; payload.fileName = fileName; }

      if (editId) {
        await apiFetch(`/store/admin/${editId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('Asset updated');
      } else {
        if (!file) { showToast('Please select a file to upload', false); setSaving(false); return; }
        await apiFetch('/store/admin', { method: 'POST', body: JSON.stringify(payload) });
        showToast('Asset created');
      }
      resetForm();
      load();
    } catch (e: any) {
      showToast(e.message || 'Save failed', false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!delId) return;
    setDelBusy(true);
    try {
      await apiFetch(`/store/admin/${delId}`, { method: 'DELETE' });
      setAssets(prev => prev.filter(a => a._id !== delId));
      showToast('Asset deleted');
    } catch (e: any) {
      showToast(e.message || 'Delete failed', false);
    } finally {
      setDelBusy(false);
      setDelId(null);
    }
  };

  const totalDownloads = assets.reduce((s, a) => s + a.downloads, 0);
  const freeCount      = assets.filter(a => a.price === 0).length;
  const paidCount      = assets.filter(a => a.price > 0).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.ok ? 'bg-[#0d5d3a] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {delId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDelId(null)}
          >
            <motion.div
              initial={{ scale: 0.94 }} animate={{ scale: 1 }}
              className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl p-7 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-black text-center text-[#0a2617] dark:text-white text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Delete Asset?</h3>
              <p className="text-sm text-[#4a7c5d] dark:text-gray-400 text-center mb-6">This will permanently remove the file and all associated download records.</p>
              <div className="flex gap-3">
                <button onClick={() => setDelId(null)} disabled={delBusy} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button onClick={handleDelete} disabled={delBusy} className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition disabled:opacity-60">
                  {delBusy ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: assets.length, icon: ShoppingBag, color: 'from-[#0d5d3a] to-[#10b981]' },
          { label: 'Free Items',   value: freeCount,      icon: CheckCircle,  color: 'from-emerald-500 to-teal-500' },
          { label: 'Paid Items',   value: paidCount,      icon: IndianRupee,  color: 'from-amber-500 to-orange-500' },
          { label: 'Downloads',    value: totalDownloads, icon: Download,     color: 'from-blue-500 to-indigo-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-[#111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</div>
            <div className="text-xs text-[#4a7c5d] dark:text-gray-400 font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Store Assets</h3>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Upload / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-[#111] border border-[#0d5d3a]/10 dark:border-white/10 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-black text-[#0a2617] dark:text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {editId ? 'Edit Asset' : 'Upload New Asset'}
                </h4>
                <button onClick={resetForm} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-1.5">Title *</label>
                  <input
                    value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. 7-Day Anxiety Journal Template"
                    className="w-full px-4 py-3 rounded-2xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-1.5">Description</label>
                  <textarea
                    value={description} onChange={e => setDesc(e.target.value)}
                    rows={3} placeholder="Describe what the user will get…"
                    className="w-full px-4 py-3 rounded-2xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-1.5">Category</label>
                  <select
                    value={category} onChange={e => setCat(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 cursor-pointer"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-1.5">Price (₹) — 0 = Free</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a7c5d] dark:text-gray-400" />
                    <input
                      type="number" min="0" value={price} onChange={e => setPrice(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20"
                    />
                  </div>
                </div>

                {/* File upload */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#0a2617] dark:text-gray-300 mb-1.5">
                    File (PDF / Audio / Image){editId ? ' — leave blank to keep existing' : ' *'}
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border-2 border-dashed border-[#0d5d3a]/20 dark:border-white/10 cursor-pointer hover:border-[#0d5d3a]/40 transition">
                    <Upload className="w-5 h-5 text-[#4a7c5d] dark:text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-[#4a7c5d] dark:text-gray-400">
                      {file ? file.name : 'Click to upload file…'}
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.mp3,.wav,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-5 justify-end">
                <button onClick={resetForm} className="px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  Cancel
                </button>
                <button
                  onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white text-sm font-bold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] disabled:opacity-60 transition"
                >
                  {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> {editId ? 'Update' : 'Upload'}</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Table — horizontally scrollable on mobile */}
      <div className="bg-white dark:bg-[#111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-[#4a7c5d] font-bold">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <ShoppingBag className="w-10 h-10 text-[#4a7c5d]/30" />
            <p className="text-[#4a7c5d] dark:text-gray-400 text-sm font-semibold">No assets yet. Upload one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              {/* Table header */}
              <thead>
                <tr className="border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a]">
                  <th className="text-left text-[10px] font-black uppercase tracking-widest text-[#4a7c5d] dark:text-gray-400 px-5 py-3 w-[40%]">Asset</th>
                  <th className="text-center text-[10px] font-black uppercase tracking-widest text-[#4a7c5d] dark:text-gray-400 px-3 py-3 w-[18%]">Category</th>
                  <th className="text-center text-[10px] font-black uppercase tracking-widest text-[#4a7c5d] dark:text-gray-400 px-3 py-3 w-[14%]">Price</th>
                  <th className="text-center text-[10px] font-black uppercase tracking-widest text-[#4a7c5d] dark:text-gray-400 px-3 py-3 w-[10%]">DLs</th>
                  <th className="text-right text-[10px] font-black uppercase tracking-widest text-[#4a7c5d] dark:text-gray-400 px-5 py-3 w-[18%]">Actions</th>
                </tr>
              </thead>

              {/* Table body */}
              <tbody className="divide-y divide-[#0d5d3a]/5 dark:divide-white/5">
                {assets.map(asset => (
                  <tr key={asset._id} className="hover:bg-[#f7fbf8] dark:hover:bg-white/[0.02] transition">
                    {/* Asset info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-[#0d5d3a] dark:text-[#10b981]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#0a2617] dark:text-white truncate max-w-[180px]">{asset.title}</div>
                          <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate max-w-[180px]">{asset.fileName || 'No file'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-4 text-center">
                      <span className="inline-block text-[10px] font-bold bg-[#f0fbf4] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] px-2.5 py-1 rounded-full whitespace-nowrap">
                        {asset.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-4 text-center">
                      {asset.price === 0 ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-0.5 text-xs font-bold text-[#0a2617] dark:text-white whitespace-nowrap">
                          <IndianRupee className="w-3 h-3 flex-shrink-0" />{asset.price}
                        </span>
                      )}
                    </td>

                    {/* Downloads */}
                    <td className="px-3 py-4 text-center">
                      <span className="text-sm font-bold text-[#4a7c5d] dark:text-gray-400">{asset.downloads}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(asset)}
                          className="p-2 rounded-xl hover:bg-[#f0fbf4] dark:hover:bg-[#0d5d3a]/20 text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-[#10b981] transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDelId(asset._id)}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-[#4a7c5d] dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

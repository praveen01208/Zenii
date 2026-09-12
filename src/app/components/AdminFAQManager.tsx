import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, HelpCircle, Save, X, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api/client';

type FAQ = {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export default function AdminFAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [busy, setBusy] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<any>('/faqs');
      setFaqs(res.faqs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ question: '', answer: '' });
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingId(faq._id);
    setForm({ question: faq.question, answer: faq.answer });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;

    setBusy(true);
    try {
      if (editingId) {
        await apiFetch(`/faqs/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      } else {
        await apiFetch('/faqs', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }
      setModalOpen(false);
      loadFaqs();
    } catch (err: any) {
      alert(err.message || 'Failed to save FAQ');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBusy(true);
      await apiFetch(`/faqs/${id}`, { method: 'DELETE' });
      setDeleteConfirm(null);
      loadFaqs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete FAQ');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#4a7c5d] font-bold">Loading FAQs...</div>;

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-200">
          Error: {error}
        </div>
      )}

      <div className="flex justify-between items-center bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>FAQ Content</h2>
          <p className="text-sm text-[#4a7c5d] dark:text-gray-400 mt-1">Manage the Frequently Asked Questions shown on the landing page.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0d5d3a] text-white rounded-xl font-semibold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition"
        >
          <Plus size={18} />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
        {faqs.length === 0 ? (
          <div className="p-10 text-center text-[#4a7c5d] dark:text-gray-400 font-medium">
            No FAQs found. Create the first one!
          </div>
        ) : (
          <div className="divide-y divide-[#0d5d3a]/10 dark:divide-white/10">
            {faqs.map(faq => (
              <div key={faq._id} className="p-5 hover:bg-[#f0fbf4]/50 dark:hover:bg-white/5 transition group">
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#0d5d3a]/10 dark:bg-white/10 flex items-center justify-center text-[#0d5d3a] dark:text-[#10b981]">
                    <HelpCircle size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0a2617] dark:text-gray-100 text-lg mb-2">{faq.question}</h3>
                    <p className="text-[#4a7c5d] dark:text-gray-400 text-sm whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(faq)}
                      className="p-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(faq._id)}
                      className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#0a2617] text-lg">Delete FAQ?</h3>
                <p className="text-sm text-[#4a7c5d] mt-1">This will permanently remove this question from the landing page. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setDeleteConfirm(null)} disabled={busy} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={busy} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">
                {busy ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-[#0a2617] dark:text-gray-100" style={{ fontFamily: 'Syne, sans-serif' }}>
                {editingId ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">Question</span>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="e.g., Is ZenMind free to use?"
                  className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm font-medium text-[#0a2617] dark:text-white"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-1.5 block">Answer</span>
                <textarea
                  required
                  rows={5}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  placeholder="Detailed answer..."
                  className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#0d5d3a]/30 text-sm font-medium text-[#0a2617] dark:text-white resize-y"
                />
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={busy}
                  className="flex-1 px-5 py-3 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 px-5 py-3 rounded-xl bg-[#0d5d3a] text-white font-bold flex justify-center items-center gap-2 hover:bg-[#0a4a2e] transition shadow-lg shadow-[#0d5d3a]/20"
                >
                  <Save size={18} />
                  {busy ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

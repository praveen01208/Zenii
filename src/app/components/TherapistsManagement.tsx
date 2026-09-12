import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Trash2, Edit2, ShieldAlert, UserCheck, UserX, AlertTriangle, X, Camera, Filter, ChevronDown } from 'lucide-react';
import { apiFetch } from '../api/client';
import { getImgSrc } from '../utils/image';

export default function TherapistsManagement() {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All Specializations');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');
  const [cityFilter, setCityFilter] = useState('All Cities');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', experience: '', education: '', clinicAddress: '',
    sessionTime: '30', sessionCost: '500',
    about: '', languages: '', aadharNumber: '', identityCardType: 'Aadhaar'
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string>('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string>('');
  
  const [viewingTherapist, setViewingTherapist] = useState<any | null>(null);

  const loadTherapists = async () => {
    try {
      const res = await apiFetch<any>('/admin/therapists');
      setTherapists(res.therapists || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load therapists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTherapists(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', education: '', clinicAddress: '', sessionTime: '30', sessionCost: '500', about: '', languages: '', aadharNumber: '', identityCardType: 'Aadhaar' });
    setProfilePic(null);
    setPreview('');
    setLicenseFile(null);
    setLicensePreview('');
    setIdFile(null);
    setIdPreview('');
    setShowAddModal(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t._id);
    setFormData({
      name: t.name, email: t.email, password: '', phone: t.phone,
      specialization: t.specialization, experience: t.experience.toString(),
      education: t.education, clinicAddress: t.clinicAddress,
      sessionTime: t.sessionTime.toString(), sessionCost: t.sessionCost.toString(),
      about: t.about || '', languages: t.languages?.join(', ') || '',
      aadharNumber: t.aadharNumber || '', identityCardType: t.identityCardType || 'Aadhaar'
    });
    setProfilePic(null);
    setPreview(t.profilePicture ? getImgSrc(t.profilePicture) : '');
    setLicenseFile(null);
    setLicensePreview(t.licenseImage ? getImgSrc(t.licenseImage) : '');
    setIdFile(null);
    setIdPreview(t.identityCardImage ? getImgSrc(t.identityCardImage) : '');
    setShowAddModal(true);
  };

  const fetchAndOpenView = async (id: string) => {
    try {
      setBusy(true);
      const res = await apiFetch<any>(`/admin/therapists/${id}`);
      setViewingTherapist(res.therapist);
    } catch (err: any) {
      alert('Error loading therapist: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setIdPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v) form.append(k, v);
      });
      if (profilePic) {
        form.append('profilePicture', profilePic);
      }
      if (licenseFile) {
        form.append('licenseImage', licenseFile);
      }
      if (idFile) {
        form.append('identityCardImage', idFile);
      }

      if (editingId) {
        await apiFetch(`/admin/therapists/${editingId}`, { method: 'PUT', body: form, isFormData: true });
      } else {
        await apiFetch('/admin/therapists', { method: 'POST', body: form, isFormData: true });
      }
      setShowAddModal(false);
      loadTherapists();
    } catch (err: any) {
      setError(err.message || 'Failed to save therapist');
    } finally {
      setBusy(false);
    }
  };

  const toggleSuspend = async (id: string) => {
    try {
      const res = await apiFetch<any>(`/admin/therapists/${id}/suspend`, { method: 'PUT' });
      setTherapists(prev => prev.map(t => t._id === id ? { ...t, isSuspended: res.isSuspended } : t));
    } catch (err: any) {
      alert('Error suspending: ' + err.message);
    }
  };

  const deleteTherapist = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete Dr. ${name}?`)) return;
    try {
      await apiFetch(`/admin/therapists/${id}`, { method: 'DELETE' });
      setTherapists(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Collect unique specializations
  const specs = useMemo(() => {
    const set = new Set<string>(therapists.map(t => t.specialization));
    return ['All Specializations', ...Array.from(set)];
  }, [therapists]);

  // Extract cities roughly from clinicAddress
  const cities = useMemo(() => {
    const arr = therapists.map(t => {
      if (!t.clinicAddress) return '';
      const parts = t.clinicAddress.split(',');
      return parts[parts.length - 1].trim().replace(/\d/g, '').trim();
    }).filter(Boolean);
    const set = new Set<string>(arr);
    return ['All Cities', ...Array.from(set)];
  }, [therapists]);

  const filtered = useMemo(() => {
    return therapists.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q);
      const matchSpec = specFilter === 'All Specializations' || t.specialization.toLowerCase().includes(specFilter.toLowerCase());
      
      const st = t.sessionType || 'online';
      const matchSession = sessionFilter === 'All Sessions' || 
                           (sessionFilter === 'Online' && (st === 'online' || st === 'both')) ||
                           (sessionFilter === 'Offline' && (st === 'offline' || st === 'both'));
      
      let matchCity = true;
      if (sessionFilter === 'Offline' && cityFilter !== 'All Cities' && t.clinicAddress) {
        matchCity = t.clinicAddress.toLowerCase().includes(cityFilter.toLowerCase());
      }

      return matchSearch && matchSpec && matchSession && matchCity;
    });
  }, [therapists, search, specFilter, sessionFilter, cityFilter]);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold shrink-0">
          {error}
        </div>
      )}

      {/* Filters row (fixed at top) */}
      <div className="flex flex-wrap items-center gap-2 shrink-0 border-b border-[#0d5d3a]/10 dark:border-white/10 pb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7c5d] dark:text-gray-400" />
          <input type="text" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-lg outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 dark:focus:ring-[#1a8a5a]/40 shadow-sm font-medium text-xs text-[#0a2617] dark:text-white" />
        </div>
        
        <div className="relative shrink-0">
          <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
            className="pl-3 pr-7 py-1.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-lg text-xs font-semibold text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 shadow-sm cursor-pointer appearance-none max-w-[150px] truncate">
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a7c5d] pointer-events-none" />
        </div>

        <div className="relative shrink-0">
          <select value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}
            className="pl-3 pr-7 py-1.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-lg text-xs font-semibold text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 shadow-sm cursor-pointer appearance-none">
            <option value="All Sessions">All Sessions</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a7c5d] pointer-events-none" />
        </div>

        {sessionFilter === 'Offline' && (
          <div className="relative shrink-0">
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              className="pl-3 pr-7 py-1.5 bg-white dark:bg-[#111111] border border-[#0d5d3a]/15 dark:border-white/10 rounded-lg text-xs font-semibold text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/25 shadow-sm cursor-pointer appearance-none">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a7c5d] pointer-events-none" />
          </div>
        )}

        <button onClick={openAdd} className="shrink-0 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#0a4a2e] transition shadow-sm">
          <Plus size={14} /> Add Therapist
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <div className="min-w-[900px] flex-1 flex flex-col">
            <div className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-[#fbfdfb] dark:bg-[#1a1a1a] text-xs font-bold text-[#4a7c5d] dark:text-gray-400 uppercase tracking-wider shrink-0">
              <div className="col-span-4">Therapist Profile</div>
              <div className="col-span-4">Medical Details</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            
            {loading ? (
              <div className="p-10 text-center font-bold text-[#4a7c5d]">Loading therapists...</div>
            ) : (
              <div className="overflow-y-auto flex-1 divide-y divide-[#0d5d3a]/5 dark:divide-white/5">
                {filtered.map(t => (
                  <div key={t._id} className="grid grid-cols-12 gap-4 px-6 py-6 items-center hover:bg-[#fbfdfb] dark:hover:bg-[#1a1a1a] transition-colors">
                    <div className="col-span-4 flex items-center gap-4 overflow-hidden">
                      {t.profilePicture ? (
                        <img src={getImgSrc(t.profilePicture)} alt={t.name} className="w-16 h-16 rounded-full object-cover shrink-0 border border-[#0d5d3a]/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#0d5d3a]/10 flex items-center justify-center text-[#0d5d3a] text-lg font-bold shrink-0">{t.name.charAt(0)}</div>
                      )}
                      <div className="truncate">
                        <div className="font-bold text-[#0a2617] dark:text-white text-base truncate">{t.name}</div>
                        <div className="text-sm text-[#4a7c5d] dark:text-gray-400 truncate">{t.email}</div>
                        <div className="text-sm text-[#4a7c5d] dark:text-gray-400 truncate">{t.phone}</div>
                      </div>
                    </div>
                    
                    <div className="col-span-4 flex flex-col justify-center overflow-hidden">
                      <div className="font-bold text-[#0d5d3a] dark:text-[#10b981] text-sm truncate">{t.specialization}</div>
                      <div className="text-xs text-[#4a7c5d] dark:text-gray-400 truncate">{t.education} • {t.experience} Yrs Exp</div>
                      <div className="text-xs text-gray-500 truncate">₹{t.sessionCost} / {t.sessionTime} min</div>
                    </div>

                    <div className="col-span-2 flex justify-center items-center">
                      {t.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold">
                          <UserX size={12} /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
                          <UserCheck size={12} /> Active
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button onClick={() => toggleSuspend(t._id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${t.isSuspended ? 'bg-[#0d5d3a]/10 text-[#0d5d3a]' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                        {t.isSuspended ? 'Activate' : 'Suspend'}
                      </button>
                      <button onClick={() => fetchAndOpenView(t._id)} className="p-1.5 text-[#0d5d3a] hover:bg-[#0d5d3a]/10 rounded-lg transition" title="View Full Profile">
                        <Search size={16} />
                      </button>
                      <button onClick={() => openEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteTherapist(t._id, t.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="p-10 text-center font-bold text-[#4a7c5d]">No therapists found.</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                {editingId ? 'Edit Therapist' : 'Onboard New Therapist'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Pic Upload */}
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                {/* Photo */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border-2 border-dashed border-[#0d5d3a]/30 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-400 mb-1" size={24} />
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400">Profile Photo</span>
                </div>

                {/* License Image */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border-2 border-dashed border-[#0d5d3a]/30 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    {licensePreview ? (
                      <img src={licensePreview} alt="License" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldAlert className="text-gray-400 mb-1" size={24} />
                    )}
                    <input type="file" accept="image/*,application/pdf" onChange={handleLicenseChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400">License / Certificate</span>
                </div>

                {/* Identity Card Image */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-xl bg-gray-100 dark:bg-[#1a1a1a] border-2 border-dashed border-[#0d5d3a]/30 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    {idPreview ? (
                      <img src={idPreview} alt="ID" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldAlert className="text-gray-400 mb-1" size={24} />
                    )}
                    <input type="file" accept="image/*,application/pdf" onChange={handleIdChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="text-xs font-semibold text-[#4a7c5d] dark:text-gray-400">ID Proof</span>
                </div>

                <div className="text-sm text-[#4a7c5d] dark:text-gray-400 self-center">
                  <p className="font-bold text-[#0a2617] dark:text-gray-200 mb-1">Upload Documents</p>
                  <p>Profile: professional headshot (max 5MB)</p>
                  <p>License: medical certificate</p>
                  <p>ID Proof: government ID</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Full Name (with Title)</span>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" placeholder="Dr. Your Name" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Email Address</span>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">{editingId ? 'New Password (Optional)' : 'Password'}</span>
                  <input required={!editingId} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Phone Number</span>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
              </div>

              <div className="border-t border-[#0d5d3a]/10 dark:border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Specialization</span>
                  <input required type="text" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" placeholder="e.g. Clinical Psychologist" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Experience (Years)</span>
                  <input required type="number" min="0" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Education / Degrees</span>
                  <input required type="text" value={formData.education} onChange={e => setFormData({...formData, education: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" placeholder="Ph.D. in Psychology, Harvard University" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Languages Spoken (comma separated)</span>
                  <input required type="text" value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" placeholder="English, Hindi, Gujarati" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">About / Bio</span>
                  <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white min-h-[60px]" placeholder="Brief professional biography..." />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Clinic Address</span>
                  <textarea required value={formData.clinicAddress} onChange={e => setFormData({...formData, clinicAddress: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white min-h-[60px]" />
                </label>
              </div>

              <div className="border-t border-[#0d5d3a]/10 dark:border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Identity Card Type</span>
                  <select value={formData.identityCardType} onChange={e => setFormData({...formData, identityCardType: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white">
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Passport">Passport</option>
                    <option value="PAN">PAN</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Identity Number</span>
                  <input type="text" value={formData.aadharNumber} onChange={e => setFormData({...formData, aadharNumber: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
              </div>

              <div className="border-t border-[#0d5d3a]/10 dark:border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Session Cost (₹)</span>
                  <input required type="number" min="0" value={formData.sessionCost} onChange={e => setFormData({...formData, sessionCost: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1 block">Session Duration (Mins)</span>
                  <input required type="number" min="15" step="15" value={formData.sessionTime} onChange={e => setFormData({...formData, sessionTime: e.target.value})} className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#0d5d3a] text-[#0a2617] dark:text-white" />
                </label>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-xl font-bold border border-[#0d5d3a]/20 text-[#0a2617] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={busy} className="flex-1 py-3.5 rounded-xl font-bold bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-70">
                  {busy ? 'Saving...' : (editingId ? 'Save Changes' : 'Onboard Therapist')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {viewingTherapist && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Therapist Profile: {viewingTherapist.name}
              </h3>
              <button onClick={() => setViewingTherapist(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={20} className="text-gray-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-2">Personal Details</h4>
                  <p className="text-sm"><strong>Email:</strong> {viewingTherapist.email}</p>
                  <p className="text-sm"><strong>Phone:</strong> {viewingTherapist.phone}</p>
                  <p className="text-sm"><strong>Address:</strong> {viewingTherapist.residentialAddress || 'Not provided'}</p>
                  
                  <h4 className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-2 mt-4">Professional Details</h4>
                  <p className="text-sm"><strong>Specialization:</strong> {viewingTherapist.specialization}</p>
                  <p className="text-sm"><strong>Experience:</strong> {viewingTherapist.experience} years</p>
                  <p className="text-sm"><strong>Education:</strong> {viewingTherapist.education}</p>
                  <p className="text-sm"><strong>Clinic:</strong> {viewingTherapist.clinicAddress}</p>
                  <p className="text-sm"><strong>Languages:</strong> {viewingTherapist.languages?.join(', ')}</p>
                  <p className="text-sm"><strong>Session:</strong> ₹{viewingTherapist.sessionCost} / {viewingTherapist.sessionTime} min</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-bold text-[#4a7c5d] uppercase tracking-wider mb-2">Identity Verification</h4>
                  <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 p-4 rounded-xl mb-4">
                    <p className="text-sm text-orange-800 dark:text-orange-300 font-bold">Secret Info (Not public)</p>
                    <p className="text-sm mt-1"><strong>ID Type:</strong> {viewingTherapist.identityCardType}</p>
                    <p className="text-sm"><strong>ID Number:</strong> {viewingTherapist.aadharNumber}</p>
                  </div>
                  
                  {viewingTherapist.identityCardImage && (
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-500 mb-1">ID Proof Image</p>
                      <a href={getImgSrc(viewingTherapist.identityCardImage)} target="_blank" rel="noreferrer">
                        <img src={getImgSrc(viewingTherapist.identityCardImage)} alt="ID Proof" className="w-full h-32 object-cover rounded-lg border" />
                      </a>
                    </div>
                  )}

                  {viewingTherapist.licenseImage && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">Medical License</p>
                      <a href={getImgSrc(viewingTherapist.licenseImage)} target="_blank" rel="noreferrer">
                        <img src={getImgSrc(viewingTherapist.licenseImage)} alt="License" className="w-full h-32 object-cover rounded-lg border" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

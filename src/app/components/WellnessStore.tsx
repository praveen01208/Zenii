import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Download, Lock, CheckCircle, Search, Filter,
  FileText, RefreshCw, X, IndianRupee, Package, CreditCard
} from 'lucide-react';
import { apiFetch } from '../api/client';
import AssetViewerModal from '../components/AssetViewerModal';

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
  owned: boolean;
  createdAt: string;
  purchasedAt?: string;
};

type Tab = 'all' | 'mine';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Anxiety:     { bg: 'bg-violet-100 dark:bg-violet-500/20',  text: 'text-violet-700 dark:text-violet-300',  border: 'border-violet-200 dark:border-violet-500/30' },
  Sleep:       { bg: 'bg-indigo-100 dark:bg-indigo-500/20',  text: 'text-indigo-700 dark:text-indigo-300',  border: 'border-indigo-200 dark:border-indigo-500/30' },
  Mindfulness: { bg: 'bg-teal-100 dark:bg-teal-500/20',      text: 'text-teal-700 dark:text-teal-300',      border: 'border-teal-200 dark:border-teal-500/30' },
  'Self-Esteem': { bg: 'bg-pink-100 dark:bg-pink-500/20',    text: 'text-pink-700 dark:text-pink-300',      border: 'border-pink-200 dark:border-pink-500/30' },
  Stress:      { bg: 'bg-orange-100 dark:bg-orange-500/20',  text: 'text-orange-700 dark:text-orange-300',  border: 'border-orange-200 dark:border-orange-500/30' },
  Wellness:    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' },
};

const getCategoryStyle = (cat: string) =>
  CATEGORY_COLORS[cat] ?? { bg: 'bg-gray-100 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-500/30' };

// ── decorative gradient backgrounds per category ──
const CARD_GRADIENTS: Record<string, string> = {
  Anxiety:     'from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10',
  Sleep:       'from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10',
  Mindfulness: 'from-teal-50 to-emerald-50 dark:from-teal-900/10 dark:to-emerald-900/10',
  'Self-Esteem': 'from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10',
  Stress:      'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10',
  Wellness:    'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
};

const getCardGradient = (cat: string) =>
  CARD_GRADIENTS[cat] ?? 'from-gray-50 to-slate-50 dark:from-gray-900/10 dark:to-slate-900/10';

export default function WellnessStore({ userTier = 'free', onUpgradeClick }: { userTier?: string, onUpgradeClick?: () => void }) {
  const [assets, setAssets]         = useState<StoreAsset[]>([]);
  const [myAssets, setMyAssets]     = useState<StoreAsset[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>('all');
  const [search, setSearch]         = useState('');
  const [categoryFilter, setCat]    = useState('All');
  const [sortOrder, setSortOrder]   = useState<'newest' | 'oldest'>('newest');
  const [downloading, setDL]        = useState<string | null>(null);
  const [fakePayAsset, setFakePay]  = useState<StoreAsset | null>(null);
  const [fakePayBusy, setFakePayBusy] = useState(false);
  const [cardNum, setCardNum]       = useState('');
  const [cardExp, setCardExp]       = useState('');
  const [cardCvv, setCvv]           = useState('');
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);
  const [viewAsset, setViewAsset]   = useState<StoreAsset | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storeRes, dlRes] = await Promise.all([
        apiFetch<{ assets: StoreAsset[] }>('/store'),
        apiFetch<{ assets: StoreAsset[] }>('/store/my-downloads'),
      ]);
      setAssets(storeRes.assets);
      setMyAssets(dlRes.assets);
    } catch (e: any) {
      showToast(e.message || 'Failed to load store', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (asset: StoreAsset) => {
    if (downloading) return;
    setDL(asset._id);
    try {
      const token = document.cookie.match(/auth_token=([^;]+)/)?.[1] || document.cookie.match(/token=([^;]+)/)?.[1] || '';
      const res = await fetch(`/api/store/${asset._id}/download?token=${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Download failed' }));
        throw new Error(err.error);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = asset.fileName || `${asset.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Delay revoking the object URL to allow the browser time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      // Refresh to reflect updated owned state
      load();
      showToast(`"${asset.title}" downloaded!`);
    } catch (e: any) {
      showToast(e.message || 'Download failed', false);
    } finally {
      setDL(null);
    }
  };

  const handleFakePayment = async () => {
    if (!fakePayAsset) return;
    if (!cardNum.trim() || !cardExp.trim() || !cardCvv.trim()) {
      showToast('Please fill in all card details', false); return;
    }
    setFakePayBusy(true);
    setFakePayBusy(true);
    try {
      await apiFetch(`/store/${fakePayAsset._id}/demo-purchase`, { method: 'POST' });
      showToast(`"${fakePayAsset.title}" unlocked! (demo payment)`);
      // Mark as owned locally so UI updates
      setAssets(prev => prev.map(a => a._id === fakePayAsset._id ? { ...a, owned: true } : a));
      setMyAssets(prev => [...prev, { ...fakePayAsset, owned: true }]);
    } catch (err: any) {
      showToast(err.message || 'Payment failed', false);
    } finally {
      setFakePayBusy(false);
      setFakePay(null);
      setCardNum(''); setCardExp(''); setCvv('');
    }
  };

  // Derive category list from all assets
  const categories = ['All', ...Array.from(new Set(assets.map(a => a.category)))];

  const displayed = (tab === 'mine' ? myAssets : assets)
    .filter(a => {
      const q = search.toLowerCase();
      const matchSearch = a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      const matchCat    = categoryFilter === 'All' || a.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      const dateA = new Date(a.purchasedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.purchasedAt || b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.ok ? 'bg-[#0d5d3a] text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fake Payment Modal ── */}
      <AnimatePresence>
        {fakePayAsset && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!fakePayBusy) { setFakePay(null); setCardNum(''); setCardExp(''); setCvv(''); } }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-[#0d5d3a]/10 dark:border-white/10 w-full max-w-sm p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Secure Checkout</div>
                    <div className="text-xs text-[#4a7c5d] dark:text-gray-400">Demo payment — no real charge</div>
                  </div>
                </div>
                {!fakePayBusy && (
                  <button onClick={() => { setFakePay(null); setCardNum(''); setCardExp(''); setCvv(''); }} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Order summary */}
              <div className="bg-[#f0fbf4] dark:bg-[#0d5d3a]/10 rounded-2xl px-4 py-3 mb-5 border border-[#0d5d3a]/10 dark:border-[#0d5d3a]/30">
                <div className="text-xs text-[#4a7c5d] dark:text-gray-400 font-semibold mb-0.5">Purchasing</div>
                <div className="text-sm font-black text-[#0a2617] dark:text-white">{fakePayAsset.title}</div>
                <div className="flex items-center gap-0.5 text-lg font-black text-[#0d5d3a] dark:text-[#10b981] mt-1">
                  <IndianRupee className="w-4 h-4" />{fakePayAsset.price}
                </div>
              </div>

              {/* Card fields */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-xs font-bold text-[#0a2617] dark:text-gray-300 block mb-1.5">Card Number</label>
                  <input
                    value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#0a2617] dark:text-gray-300 block mb-1.5">Expiry</label>
                    <input
                      value={cardExp} onChange={e => setCardExp(e.target.value.slice(0,5))}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0a2617] dark:text-gray-300 block mb-1.5">CVV</label>
                    <input
                      value={cardCvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,3))}
                      placeholder="123" type="password"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 text-sm text-[#0a2617] dark:text-white outline-none focus:ring-2 focus:ring-[#0d5d3a]/20"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleFakePayment}
                disabled={fakePayBusy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] hover:from-[#0a4a2e] text-white text-sm font-black transition-all shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60"
              >
                {fakePayBusy
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><CreditCard className="w-4 h-4" /> Pay ₹{fakePayAsset.price}</>}
              </button>
              <p className="text-center text-[10px] text-[#4a7c5d] dark:text-gray-500 mt-3">This is a demo checkout. No real payment is made.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toolbar: tabs + filter on one row, search below ── */}
      <div className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-3 space-y-2">
        {/* Row 1: tabs + filter dropdown */}
        <div className="flex items-center gap-2">
          {/* Tab pills */}
          <div className="flex gap-1 bg-[#f0fbf4] dark:bg-white/5 p-1 rounded-2xl border border-[#0d5d3a]/10 dark:border-white/10 flex-shrink-0">
            {([['all', 'All Items', ShoppingBag], ['mine', 'My Downloads', Download]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key as Tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tab === key ? 'bg-[#0d5d3a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden xs:inline sm:inline">{label}</span>
                <span className="xs:hidden sm:hidden">{key === 'all' ? 'All' : 'Mine'}</span>
                {key === 'mine' && myAssets.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${tab === 'mine' ? 'bg-white/20' : 'bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981]'}`}>
                    {myAssets.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filters — grows to fill remaining space */}
          <div className="flex gap-2 flex-1">
            <select
              value={categoryFilter}
              onChange={e => setCat(e.target.value)}
              className="w-full pl-3 pr-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white cursor-pointer"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full pl-3 pr-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Row 2: search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a7c5d] dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search resources…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/12 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#1a8a5a]/40 text-[#0a2617] dark:text-white placeholder:text-[#4a7c5d]/50 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-[#4a7c5d] font-bold">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading store…
          </div>
        ) : displayed.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-48 gap-3"
          >
            <Package className="w-10 h-10 text-[#4a7c5d]/40" />
            <p className="text-[#4a7c5d] dark:text-gray-400 font-semibold text-sm">
              {tab === 'mine' ? 'No downloads yet. Grab a free resource below!' : 'No items match your search.'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayed.map((asset, idx) => (
                <StoreCard
                  key={asset._id}
                  asset={asset}
                  index={idx}
                  downloading={downloading === asset._id}
                  onDownload={() => handleDownload(asset)}
                  onPurchase={() => setFakePay(asset)}
                  onView={() => setViewAsset(asset)}
                  userTier={userTier}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Asset Viewer Modal ── */}
      {viewAsset && (
        <AssetViewerModal
          asset={viewAsset}
          onClose={() => setViewAsset(null)}
        />
      )}
    </div>
  );
}

/* ── Individual Store Card ── */
function StoreCard({
  asset,
  index,
  downloading,
  onDownload,
  onPurchase,
  onView,
  userTier,
}: {
  asset: StoreAsset;
  index: number;
  downloading: boolean;
  onDownload: () => void;
  onPurchase: () => void;
  onView: () => void;
  userTier: string;
}) {
  const catStyle = getCategoryStyle(asset.category);
  const gradient = getCardGradient(asset.category);
  const isFree   = true;
  const isOwned  = asset.owned;

  // Calculate discount
  const getDiscountedPrice = (price: number, tier: string) => 0;

  const finalPrice = 0;
  const hasDiscount = false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
      className={`group relative flex flex-col rounded-3xl border bg-gradient-to-br ${gradient} overflow-hidden
        border-[#0d5d3a]/10 dark:border-white/8 hover:border-[#0d5d3a]/30 dark:hover:border-white/15
        shadow-sm hover:shadow-md transition-all duration-300`}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0d5d3a] to-[#10b981] opacity-60" />

      <div className="flex flex-col gap-3 p-5 flex-1">
        {/* Category + Price */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {asset.category}
          </span>
          {!isOwned && (
            isFree ? (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] border border-[#0d5d3a]/20">
                Free
              </span>
            ) : (
              <div className="flex flex-col items-end">
                {hasDiscount && (
                  <span className="text-[10px] line-through text-gray-400 font-bold mb-0.5">₹{asset.price}</span>
                )}
                <span className="flex items-center gap-0.5 text-xs font-black text-[#0a2617] dark:text-white bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 px-2.5 py-1 rounded-full shadow-sm">
                  <IndianRupee className="w-3 h-3" />{finalPrice}
                </span>
              </div>
            )
          )}
        </div>

        {/* Icon + Title */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/10 dark:border-white/8 flex items-center justify-center shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-[#0d5d3a] dark:text-[#10b981]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-[#0a2617] dark:text-white leading-snug" style={{ fontFamily: 'Syne, sans-serif' }}>
              {asset.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#4a7c5d] dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
          {asset.description}
        </p>

        {/* Download count */}
        {asset.downloads > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-[#4a7c5d] dark:text-gray-500 font-semibold">
            <Download className="w-3 h-3" />
            {asset.downloads} download{asset.downloads !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <div className="flex gap-2">
          {/* Open Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            disabled={!isOwned && !isFree}
            title={(!isOwned && !isFree) ? 'Purchase to open' : 'Open asset'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white dark:bg-[#1a1a1a] text-[#0d5d3a] dark:text-[#10b981] text-sm font-bold border border-[#0d5d3a]/20 dark:border-white/10 hover:bg-[#f0fbf4] dark:hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5" /> Open
          </button>
          
          {/* Download/Unlock Button */}
          {isOwned ? (
            <button
              onClick={e => { e.stopPropagation(); onDownload(); }}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#0d5d3a] hover:bg-[#0a4a2e] text-white text-sm font-bold transition-all shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60"
            >
              {downloading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> ...</>
                : <><Download className="w-3.5 h-3.5" /> Download</>}
            </button>
          ) : isFree ? (
            <button
              onClick={onDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] hover:from-[#0a4a2e] text-white text-sm font-bold transition-all shadow-lg shadow-[#0d5d3a]/20 disabled:opacity-60"
            >
              {downloading
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> ...</>
                : <><Download className="w-3.5 h-3.5" /> Download</>}
            </button>
          ) : (
            <button
              onClick={onPurchase}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" /> ₹{finalPrice}
            </button>
          )}
        </div>
      </div>

      {/* Owned badge */}
      {isOwned && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-[#0d5d3a] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-md">
            <CheckCircle className="w-2.5 h-2.5" /> Owned
          </div>
        </div>
      )}
    </motion.div>
  );
}

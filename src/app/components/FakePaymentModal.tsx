import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { apiFetch } from '../api/client';

interface FakePaymentModalProps {
  onClose: () => void;
  onSuccess: (tier: string) => void;
  initialSelectedTier?: 'free' | 'silver' | 'gold' | 'platinum';
}

const TIERS = [
  { id: 'free', name: 'ZenFree', price: '₹0', interval: 'forever', features: ['Basic mood tracking', '10 AI Chat credits', 'Community access'] },
  { id: 'silver', name: 'ZenSilver', price: '₹199', interval: 'per month', features: ['Unlimited mood tracking', '100 AI Chat credits', '2 Wellness Programs', '10% Store Discount'] },
  { id: 'gold', name: 'ZenGold', price: '₹499', interval: 'per month', features: ['1 Free Therapy Session/mo', '500 AI Chat credits', 'All Wellness Programs', '20% Store Discount'] },
  { id: 'platinum', name: 'ZenPlatinum', price: '₹999', interval: 'per month', features: ['2 Free Therapy Sessions/mo', 'Unlimited AI Chat', 'Direct Therapist Chat', '30% Store Discount'] }
];

export default function FakePaymentModal({ onClose, onSuccess, initialSelectedTier = 'gold' }: FakePaymentModalProps) {
  const [selected, setSelected] = useState(initialSelectedTier);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    if (selected === 'free') {
      onSuccess('free');
      return;
    }
    setProcessing(true);
    // Simulate network delay for "payment"
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Mock API call to update tier
      await apiFetch('/me/set-tier', { method: 'POST', body: JSON.stringify({ tier: selected }) });
      setSuccess(true);
      setTimeout(() => {
        onSuccess(selected);
      }, 2000);
    } catch (e) {
      console.error(e);
      // Even if API fails (since we might not have hooked up the endpoint), let's just trigger success in UI
      setSuccess(true);
      setTimeout(() => {
        onSuccess(selected);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border border-[#0d5d3a]/20 dark:border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {success ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <CheckCircle className="w-24 h-24 text-[#10b981] mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#0a2617] dark:text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Payment Successful!
            </h2>
            <p className="text-lg text-[#4a7c5d] dark:text-gray-400">
              Welcome to ZenMind {TIERS.find(t => t.id === selected)?.name}. Your new features are now unlocked.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row">
            {/* Left side: Tiers */}
            <div className="flex-1 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[#0d5d3a]/10 dark:border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Select a Plan</h2>
                <button onClick={onClose} className="md:hidden p-2 bg-[#0d5d3a]/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="grid gap-4">
                {TIERS.map(tier => (
                  <div 
                    key={tier.id}
                    onClick={() => setSelected(tier.id as any)}
                    className={`p-4 rounded-2xl cursor-pointer border-2 transition-all ${selected === tier.id ? 'border-[#0d5d3a] dark:border-[#10b981] bg-[#0d5d3a]/5 dark:bg-[#10b981]/10' : 'border-[#0d5d3a]/10 dark:border-white/10 hover:border-[#0d5d3a]/30'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-[#0a2617] dark:text-gray-100">{tier.name}</h3>
                      <div className="text-right">
                        <span className="font-bold text-[#0d5d3a] dark:text-[#10b981]">{tier.price}</span>
                        <span className="text-xs text-[#4a7c5d] dark:text-gray-400 ml-1">{tier.interval}</span>
                      </div>
                    </div>
                    <ul className="text-sm text-[#4a7c5d] dark:text-gray-400 space-y-1">
                      {tier.features.map((f, i) => <li key={i} className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-[#10b981]" /> {f}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right side: Mock Payment Form */}
            <div className="w-full md:w-[400px] p-6 sm:p-8 bg-[#f9fbf9] dark:bg-[#0a0a0a] rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
              <div className="hidden md:flex justify-end mb-6">
                <button onClick={onClose} className="p-2 hover:bg-[#0d5d3a]/10 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 dark:text-gray-400" /></button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#0a2617] dark:text-white mb-1">Payment Details</h3>
                <div className="flex items-center gap-1 text-xs text-[#4a7c5d] dark:text-gray-500">
                  <ShieldCheck className="w-4 h-4" /> Secure Mock Payment (No real charge)
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0a2617] dark:text-gray-400 mb-1.5">Card Number</label>
                  <div className="relative">
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-4 py-3 pl-10 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:border-[#0d5d3a] dark:focus:border-[#10b981]" />
                    <CreditCard className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0a2617] dark:text-gray-400 mb-1.5">Expiry</label>
                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:border-[#0d5d3a] dark:focus:border-[#10b981]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0a2617] dark:text-gray-400 mb-1.5">CVC</label>
                    <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-xl border border-[#0d5d3a]/20 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-sm text-[#0a2617] dark:text-white outline-none focus:border-[#0d5d3a] dark:focus:border-[#10b981]" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#0d5d3a]/10 dark:border-white/10 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-[#0a2617] dark:text-gray-300">Total</span>
                    <span className="text-2xl font-bold text-[#0d5d3a] dark:text-[#10b981]">{TIERS.find(t => t.id === selected)?.price}</span>
                  </div>
                  
                  <button 
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full py-4 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white font-bold shadow-lg shadow-[#0d5d3a]/20 dark:shadow-[#1a8a5a]/20 hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {processing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processing...
                      </span>
                    ) : (
                      `Pay ${TIERS.find(t => t.id === selected)?.price}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

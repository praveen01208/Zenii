import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Star, Clock, MapPin, X, Calendar, GraduationCap, Filter, ChevronDown, IndianRupee, BookOpen, Award, MessageCircle, Brain } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { apiFetch } from '../api/client';
import { getImgSrc } from '../utils/image';
import TherapistMatchQuiz from './TherapistMatchQuiz';

const SPECIALIZATIONS = [
  'All Specializations',
  'Clinical Psychologist',
  'Adolescent & Teen Therapist',
  'Anxiety & Depression Specialist',
  'Cognitive Behavioural Therapist',
  'Trauma & PTSD Specialist',
  'Relationship Counsellor',
  'Child Psychologist',
];

export default function TherapyHub({ onSessionBooked, onStartChat, userTier = 'free' }: { onSessionBooked?: () => void, onStartChat?: (therapist: any) => void, userTier?: string }) {
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All Specializations');
  const [sessionFilter, setSessionFilter] = useState('All Sessions');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [costSort, setCostSort] = useState<'asc' | 'desc'>('asc');
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Booking flow state
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookingStatus, setBookingStatus] = useState<'idle'|'success'>('idle');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const fetchTherapists = () => {
    apiFetch<any>('/public/therapists')
      .then(res => setTherapists(res.therapists || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTherapists();
    const interval = setInterval(fetchTherapists, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let list = therapists.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = (t.name || '').toLowerCase().includes(q) || (t.specialization || '').toLowerCase().includes(q);
      const matchSpec = specFilter === 'All Specializations' || (t.specialization || '').toLowerCase().includes(specFilter.toLowerCase());
      
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
    list = [...list].sort((a, b) => costSort === 'asc' ? (a.sessionCost ?? 0) - (b.sessionCost ?? 0) : (b.sessionCost ?? 0) - (a.sessionCost ?? 0));
    return list;
  }, [therapists, search, specFilter, sessionFilter, cityFilter, costSort]);

  // Collect unique specializations from actual data
  const specs = useMemo(() => {
    const set = new Set<string>(therapists.map(t => t.specialization).filter(Boolean));
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

  // If a therapist is selected, render the profile page
  if (selectedTherapist) {
    return (
      <div className="flex flex-col h-full bg-[#fbfdfb] dark:bg-[#050505] overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-6">
          
          {/* Top Navigation */}
          <button onClick={() => {
            if (isBookingMode) {
              setIsBookingMode(false);
              setBookingStatus('idle');
            } else {
              setSelectedTherapist(null);
              setShowAllReviews(false);
            }
          }} className="flex items-center gap-2 text-[#0d5d3a] dark:text-[#10b981] font-bold text-sm hover:opacity-80 transition w-fit">
            <span className="text-lg">←</span> {isBookingMode ? 'Back to Profile' : 'Back to Therapists'}
          </button>

          {isBookingMode ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-10 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm max-w-4xl mx-auto">
              <h2 className="text-2xl font-black text-[#0a2617] dark:text-white mb-2 text-center" style={{ fontFamily: 'Syne, sans-serif' }}>
                Book Session with {selectedTherapist.name}
              </h2>
              <p className="text-center text-[#4a7c5d] dark:text-gray-400 font-medium mb-8">
                Select an available date to view time slots
              </p>

              {bookingStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl"></span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0a2617] dark:text-white mb-2">Session Booked!</h3>
                  <p className="text-[#4a7c5d] dark:text-gray-400">Your session has been confirmed. You will receive an email shortly.</p>
                  <button onClick={() => { setIsBookingMode(false); setBookingStatus('idle'); }}
                    className="mt-6 px-6 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold hover:bg-[#0a4a2e] transition shadow-md">
                    Return to Profile
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                  <div className="mx-auto md:mx-0">
                    <style>{`
                      .rdp { --rdp-accent-color: #0d5d3a; --rdp-background-color: #e6f4ea; margin: 0; }
                      .dark .rdp { --rdp-accent-color: #10b981; --rdp-background-color: #0d5d3a; color: white; }
                      .rdp-day_selected { font-weight: bold; }
                      .has-slot { font-weight: 900; text-decoration: underline; text-decoration-color: #10b981; text-decoration-thickness: 3px; text-underline-offset: 4px; }
                    `}</style>
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => d && setSelectedDate(d)}
                      modifiers={{ hasSlot: (selectedTherapist.availableSlots || []).map((s: string) => new Date(s)) }}
                      modifiersClassNames={{ hasSlot: 'has-slot' }}
                      onDayClick={() => setSelectedSlot(null)}
                    />
                  </div>

                  <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-100 dark:border-white/5 pt-6 md:pt-0 md:pl-8">
                    <h4 className="font-bold text-[#0a2617] dark:text-white mb-4 text-center md:text-left">
                      Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h4>
                    
                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {!(selectedTherapist.availableSlots && selectedTherapist.availableSlots.length > 0) ? (
                        <div className="text-sm text-gray-500 italic py-4 text-center md:text-left">No slots scheduled.</div>
                      ) : (
                        (() => {
                          const BOOKING_CUTOFF_MS = 12 * 60 * 1000; // 12 minutes
                          const available = selectedTherapist.availableSlots.filter((s: string) => {
                            const d = new Date(s);
                            return d.toDateString() === selectedDate.toDateString() &&
                              d.getTime() - Date.now() > BOOKING_CUTOFF_MS;
                          });
                          if (available.length === 0) return <div className="text-sm text-gray-500 italic py-4 text-center md:text-left">No available slots on this date.</div>;
                          
                          return (
                            <>
                              {available.map((s: string) => {
                                const isSelected = selectedSlot === s;
                                return (
                                  <button key={s} onClick={() => setSelectedSlot(s)}
                                    className={`flex justify-between items-center px-5 py-3.5 border rounded-xl transition group ${isSelected ? 'bg-[#0d5d3a] border-[#0d5d3a] text-white shadow-md' : 'bg-[#fbfdfb] dark:bg-[#1a1a1a] border-[#0d5d3a]/20 dark:border-white/10 hover:border-[#0d5d3a] dark:hover:border-[#10b981] hover:bg-[#e6f4ea] dark:hover:bg-[#0d5d3a]/20'}`}>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-[#0a2617] dark:text-white'}`}>
                                      {new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`text-xs font-bold transition ${isSelected ? 'text-white' : 'text-[#0d5d3a] dark:text-[#10b981] opacity-0 group-hover:opacity-100'}`}>
                                      {isSelected ? 'Selected' : 'Select'}
                                    </span>
                                  </button>
                                );
                              })}

                              {selectedSlot && (
                                <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-3">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 dark:text-slate-400 font-medium">Session Fee:</span>
                                    <span className="font-extrabold text-[#0d5d3a] dark:text-emerald-400 text-sm">
                                      ₹{selectedTherapist.sessionCost || 499}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                    <span>Secured with Razorpay 256-bit encryption</span>
                                  </div>

                                  {/* Primary Razorpay Checkout Button */}
                                  <button
                                    onClick={async () => {
                                      setBookingLoading(true);
                                      try {
                                        const orderRes = await apiFetch<any>('/sessions/create-order', {
                                          method: 'POST',
                                          body: JSON.stringify({
                                            therapistId: selectedTherapist._id,
                                            slotISO: selectedSlot,
                                          })
                                        });

                                        if (!orderRes.ok) {
                                          throw new Error(orderRes.error || 'Failed to create payment order');
                                        }

                                        const { order, keyId, therapist, isFree } = orderRes;
                                        const cost = therapist?.sessionCost || 0;

                                        // Free session bypass
                                        if (isFree || cost <= 0) {
                                          const freeRes = await apiFetch<any>('/sessions/verify-and-book', {
                                            method: 'POST',
                                            body: JSON.stringify({
                                              therapistId: selectedTherapist._id,
                                              slotISO: selectedSlot,
                                              razorpay_order_id: order?.id || `free_ord_${Date.now()}`,
                                              razorpay_payment_id: `free_pay_${Date.now()}`,
                                              razorpay_signature: 'free_session',
                                            })
                                          });
                                          if (freeRes.ok) {
                                            setBookingStatus('success');
                                            if (onSessionBooked) setTimeout(onSessionBooked, 2000);
                                          }
                                          return;
                                        }

                                        // Razorpay Checkout Popup
                                        const rzpKey = keyId || (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'rzp_test_THJ5SFW5uF9d90';

                                        if (typeof (window as any).Razorpay === 'undefined') {
                                          const script = document.createElement('script');
                                          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                                          script.async = true;
                                          document.body.appendChild(script);
                                          await new Promise(r => { script.onload = r; });
                                        }

                                        const options = {
                                          key: rzpKey,
                                          amount: order.amount,
                                          currency: order.currency || 'INR',
                                          name: 'ZenMind Sanctuary',
                                          description: `1-on-1 Consultation with ${selectedTherapist.name}`,
                                          image: '/logo.png',
                                          order_id: (order.id && !order.id.startsWith('order_')) ? order.id : undefined,
                                          handler: async (resp: any) => {
                                            try {
                                              setBookingLoading(true);
                                              const verifyRes = await apiFetch<any>('/sessions/verify-and-book', {
                                                method: 'POST',
                                                body: JSON.stringify({
                                                  therapistId: selectedTherapist._id,
                                                  slotISO: selectedSlot,
                                                  razorpay_order_id: resp.razorpay_order_id || order.id,
                                                  razorpay_payment_id: resp.razorpay_payment_id || `pay_${Date.now()}`,
                                                  razorpay_signature: resp.razorpay_signature || 'test_sig',
                                                })
                                              });

                                              if (verifyRes.ok) {
                                                setBookingStatus('success');
                                                if (onSessionBooked) setTimeout(onSessionBooked, 2000);
                                              } else {
                                                alert(verifyRes.error || 'Payment verification failed');
                                              }
                                            } catch (vErr: any) {
                                              alert(vErr.message || 'Verification error');
                                            } finally {
                                              setBookingLoading(false);
                                            }
                                          },
                                          prefill: {
                                            name: 'Praveen',
                                            email: 'praveen@zenmind.in',
                                            contact: '9999999999',
                                          },
                                          theme: {
                                            color: '#0d5d3a',
                                          },
                                          modal: {
                                            ondismiss: () => {
                                              setBookingLoading(false);
                                            }
                                          }
                                        };

                                        const rzp = new (window as any).Razorpay(options);
                                        rzp.on('payment.failed', (resp: any) => {
                                          alert(`Payment failed: ${resp.error?.description || 'Transaction cancelled'}`);
                                          setBookingLoading(false);
                                        });
                                        rzp.open();
                                      } catch (e: any) {
                                        alert(e.message || 'Failed to initialize payment');
                                        setBookingLoading(false);
                                      }
                                    }}
                                    disabled={bookingLoading}
                                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0d5d3a] to-[#15803d] hover:from-[#0a4a2e] hover:to-[#0d5d3a] text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                                  >
                                    <span>{bookingLoading ? 'Initializing Razorpay...' : `Pay ₹${selectedTherapist.sessionCost || 499} & Book`}</span>
                                    <IndianRupee className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Column - Profile Summary */}
            <div className="w-full md:w-1/3 space-y-6 md:sticky md:top-6 self-start">
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 flex flex-col items-center border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
                {selectedTherapist.profilePicture
                  ? <img src={getImgSrc(selectedTherapist.profilePicture)} alt={selectedTherapist.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#e6f4ea] dark:border-[#0d5d3a]/30 shadow-md mb-4" />
                  : <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-4xl font-black mb-4 border-4 border-[#e6f4ea] dark:border-[#0d5d3a]/30 shadow-md">
                      {(selectedTherapist.name || 'T').charAt(0)}
                    </div>
                }
                <h2 className="text-2xl font-black text-[#0a2617] dark:text-white text-center leading-tight">
                  {selectedTherapist.name}
                </h2>
                <p className="text-[#4a7c5d] dark:text-gray-400 font-medium text-xs text-center mt-1 mb-6">
                  {selectedTherapist.education}
                </p>

                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><Clock size={14}/> Experience</span>
                    <span className="font-bold text-[#0a2617] dark:text-white">{selectedTherapist.experience} years</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><IndianRupee size={14}/> Per Session</span>
                    <span className="font-bold text-[#0a2617] dark:text-white">₹{selectedTherapist.sessionCost ?? ''}/{selectedTherapist.sessionTime ?? ''}min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><Star size={14} className="text-amber-400"/> Rating</span>
                    <span className="font-bold text-[#0a2617] dark:text-white">
                      {selectedTherapist.ratingAverage ? selectedTherapist.ratingAverage.toFixed(1) : 'New'}{selectedTherapist.ratingAverage ? '/5.0' : ''} ({selectedTherapist.ratingCount ?? 0})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm pb-2">
                    <span className="text-gray-500 flex items-center gap-2"><span className="text-[10px]"></span> Languages</span>
                    <span className="font-bold text-[#0a2617] dark:text-white text-right text-xs">
                      {(selectedTherapist.languages && selectedTherapist.languages.length > 0) ? selectedTherapist.languages.join(', ') : 'English, Hindi'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <button onClick={() => setIsBookingMode(true)}
                    className="w-full py-3.5 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] hover:bg-[#0a4a2e] text-white font-bold text-sm transition-all shadow-md flex justify-center items-center gap-2">
                    <Calendar size={16} /> Book Session
                  </button>
                  <button onClick={() => onStartChat && onStartChat(selectedTherapist)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-1.5 ring-2 ring-emerald-400/30 whitespace-nowrap">
                    <MessageCircle size={15} className="shrink-0" /> Chat with Therapist
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="w-full md:w-2/3 space-y-6">


              {/* About */}
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
                <h4 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-[#0d5d3a] dark:text-[#10b981]" /> About
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedTherapist.about || "Compassionate therapist focusing on mental health, self-esteem, and emotional regulation."}
                </p>
              </div>

              {/* Specializations */}
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
                <h4 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 mb-4">
                  <Award size={18} className="text-[#0d5d3a] dark:text-[#10b981]" /> Specializations
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#e6f4ea] dark:bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] rounded-lg text-xs font-bold border border-[#0d5d3a]/20">
                    {selectedTherapist.specialization || ''}
                  </span>
                  {['Self Esteem', 'Relationship Issues', 'Teen Counseling'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-[#e6f4ea] dark:bg-[#0d5d3a]/10 text-[#0d5d3a] dark:text-[#10b981] rounded-lg text-xs font-bold border border-[#0d5d3a]/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education & Experience */}
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
                <h4 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 mb-4">
                  <GraduationCap size={18} className="text-[#0d5d3a] dark:text-[#10b981]" /> Education & Experience
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Education</div>
                    <div className="text-sm font-semibold text-[#0a2617] dark:text-white">{selectedTherapist.education}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Experience</div>
                    <div className="text-sm font-semibold text-[#0a2617] dark:text-white">{selectedTherapist.experience}+ years of professional practice</div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2">
                    <span className="text-amber-400 text-lg"></span> Reviews
                  </h4>
                  {selectedTherapist.reviews && selectedTherapist.reviews.length > 3 && (
                    <button onClick={() => setShowAllReviews(true)} className="text-sm font-bold text-[#0d5d3a] dark:text-[#10b981] hover:underline">
                      View all {selectedTherapist.ratingCount} reviews
                    </button>
                  )}
                </div>
                {(!selectedTherapist.reviews || selectedTherapist.reviews.length === 0) ? (
                  <p className="text-gray-400 text-sm font-medium text-center py-4">No reviews yet.</p>
                ) : (
                  <div className="space-y-4 w-full">
                    {selectedTherapist.reviews.slice(0, 3).map((rev: any, idx: number) => (
                      <div key={idx} className="border-b border-gray-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-[#0a2617] dark:text-white text-sm">{rev.userName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{new Date(rev.date).toLocaleDateString()}</div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                          </div>
                        </div>
                        {rev.review && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">"{rev.review}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clinic Details */}
              {(selectedTherapist.clinicAddress || (selectedTherapist.clinicImages && selectedTherapist.clinicImages.length > 0)) && (
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
                  <h4 className="font-bold text-[#0a2617] dark:text-white flex items-center gap-2 mb-4">
                    <span className="text-[#0d5d3a] text-lg"><MapPin size={18} /></span> Clinic Details
                  </h4>
                  
                  <div className="text-sm font-semibold text-[#0a2617] dark:text-gray-300 mb-4 bg-[#fbfdfb] dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                    {selectedTherapist.clinicAddress || "Clinic address not provided."}
                  </div>

                  {/* Free Google Maps Embed */}
                  {selectedTherapist.clinicAddress && (
                    <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 mb-6">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedTherapist.clinicAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  )}

                  {/* Clinic Images Gallery */}
                  {selectedTherapist.clinicImages && selectedTherapist.clinicImages.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">Clinic Photos</h5>
                      <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                        {selectedTherapist.clinicImages.map((img: string, i: number) => (
                          <img key={i} src={getImgSrc(img)} alt="Clinic" 
                            className="w-40 h-28 object-cover rounded-xl border border-gray-200 dark:border-white/10 shrink-0 snap-start" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Verified License (if exposed via admin, but note public.js might exclude it. If available, show it) */}
                  {selectedTherapist.licenseImage && (
                    <div>
                      <h5 className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">Verified License</h5>
                      <img src={getImgSrc(selectedTherapist.licenseImage)} alt="License" 
                          className="w-full sm:w-64 h-auto object-contain rounded-xl border border-gray-200 dark:border-white/10" />
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
          )}
        </div>

        {/* View All Reviews Modal */}
        <AnimatePresence>
          {showAllReviews && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10 max-h-[80vh] flex flex-col">
                <button onClick={() => setShowAllReviews(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                  <X size={20} />
                </button>
                <h3 className="text-xl font-black text-[#0a2617] dark:text-white mb-6 pr-8">All Reviews for {selectedTherapist.name}</h3>
                
                <div className="overflow-y-auto pr-2 space-y-6 flex-1">
                  {selectedTherapist.reviews.map((rev: any, idx: number) => (
                    <div key={idx} className="bg-[#fbfdfb] dark:bg-[#1a1a1a] p-4 rounded-xl border border-[#0d5d3a]/10 dark:border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-[#0a2617] dark:text-white">{rev.userName || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">{new Date(rev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                        </div>
                      </div>
                      {rev.review && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">"{rev.review}"</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render the list of therapists (grid view)
  return (
    <div className="flex flex-col h-full bg-[#fbfdfb] dark:bg-[#050505]">

      {/* ── QUIZ OVERLAY ── */}
      <AnimatePresence>
        {showQuiz && (
          <TherapistMatchQuiz
            therapists={therapists}
            onClose={() => setShowQuiz(false)}
            onSelectTherapist={(t) => {
              setSelectedTherapist(t);
              setShowQuiz(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── STICKY CONTROLS ── */}
      <div className="zen-controls-bar">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 140 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a7c5d' }} />
            <input type="text" placeholder="Search name or specialization…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white dark:bg-[#111111] text-[#0a2617] dark:text-white placeholder-gray-400"
              style={{ width: '100%', paddingLeft: 34, paddingRight: 32, paddingTop: 9, paddingBottom: 9, borderRadius: 20, border: '2px solid rgba(13,93,58,0.15)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={13} /></button>}
          </div>
          {/* Specialization */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={specFilter} onChange={e => setSpecFilter(e.target.value)}
              style={{ paddingLeft: 10, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 12, border: '2px solid rgba(13,93,58,0.15)', background: 'white', fontSize: 11, fontWeight: 600, color: '#0a2617', outline: 'none', maxWidth: 180, appearance: 'none', cursor: 'pointer' }}>
              {specs.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#4a7c5d', pointerEvents: 'none' }} />
          </div>
          {/* Cost Sort */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={costSort} onChange={e => setCostSort(e.target.value as 'asc' | 'desc')}
              style={{ paddingLeft: 10, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 12, border: '2px solid rgba(13,93,58,0.15)', background: 'white', fontSize: 11, fontWeight: 600, color: '#0a2617', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#4a7c5d', pointerEvents: 'none' }} />
          </div>
          {/* Session Type */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <select value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}
              style={{ paddingLeft: 10, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 12, border: '2px solid rgba(13,93,58,0.15)', background: 'white', fontSize: 11, fontWeight: 600, color: '#0a2617', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="All Sessions">All Sessions</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#4a7c5d', pointerEvents: 'none' }} />
          </div>
          {/* City */}
          {sessionFilter === 'Offline' && (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                style={{ paddingLeft: 10, paddingRight: 24, paddingTop: 8, paddingBottom: 8, borderRadius: 12, border: '2px solid rgba(13,93,58,0.15)', background: 'white', fontSize: 11, fontWeight: 600, color: '#0a2617', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={11} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: '#4a7c5d', pointerEvents: 'none' }} />
            </div>
          )}
          {/* AI Match button */}
          {true && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowQuiz(true)}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: 'none', background: 'linear-gradient(135deg,#0d5d3a,#1a8a5a)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,93,58,0.3)', whiteSpace: 'nowrap' }}>
              <Brain size={13} />
              Find My Therapist
              <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 6px', fontWeight: 900 }}>AI</span>
            </motion.button>
          )}
        </div>
        {/* Active filter chips */}
        {(search || specFilter !== 'All Specializations' || sessionFilter !== 'All Sessions' || (sessionFilter === 'Offline' && cityFilter !== 'All Cities')) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#4a7c5d', fontWeight: 600 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            {search && <button onClick={() => setSearch('')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(13,93,58,0.1)', color: '#0d5d3a', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>"{search}" <X size={10} /></button>}
            {specFilter !== 'All Specializations' && <button onClick={() => setSpecFilter('All Specializations')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(13,93,58,0.1)', color: '#0d5d3a', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{specFilter} <X size={10} /></button>}
            {sessionFilter !== 'All Sessions' && <button onClick={() => { setSessionFilter('All Sessions'); setCityFilter('All Cities'); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(13,93,58,0.1)', color: '#0d5d3a', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{sessionFilter} <X size={10} /></button>}
            {sessionFilter === 'Offline' && cityFilter !== 'All Cities' && <button onClick={() => setCityFilter('All Cities')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: 'rgba(13,93,58,0.1)', color: '#0d5d3a', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{cityFilter} <X size={10} /></button>}
          </div>
        )}
      </div>

      {/* ── CARDS GRID ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 p-6 animate-pulse h-64" />
              ))}
            </div>
          )}

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">{error}</div>}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {filtered.map(t => (
                <motion.div key={t._id} whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(13,93,58,0.12)' }}
                  className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm cursor-pointer flex flex-col p-6 transition-all relative overflow-hidden h-full"
                  onClick={() => setSelectedTherapist(t)}>

                  {/* Profile Picture */}
                  <div className="relative mb-4 self-center">
                    {t.profilePicture
                      ? <img src={getImgSrc(t.profilePicture)} alt={t.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#e6f4ea] dark:border-[#0d5d3a]/30 shadow-sm shrink-0" />
                      : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-3xl font-black shrink-0 border-4 border-[#e6f4ea] dark:border-[#0d5d3a]/30 shadow-sm">
                          {(t.name || 'T').charAt(0)}
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-[#0a2617] dark:text-white text-lg text-center leading-tight">{t.name}</h3>
                    <p className="text-[#4a7c5d] dark:text-gray-400 font-medium text-xs text-center mt-1">{t.education}</p>

                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Star size={13} className={`text-amber-400 ${t.ratingAverage ? 'fill-amber-400' : ''}`} />
                      <span className="text-xs font-bold text-[#0a2617] dark:text-gray-200">
                        {t.ratingAverage ? t.ratingAverage.toFixed(1) : 'New'} <span className="text-gray-400 font-medium">({t.ratingCount ?? 0} reviews)</span>
                      </span>
                    </div>

                    {/* Specializations Pills */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
                      <span className="px-3 py-1.5 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-xl text-xs font-bold border border-[#0d5d3a]/15 text-center">
                        {t.specialization || 'Clinical Specialist'}
                      </span>
                      {t.sessionType && (
                        <span className="px-2.5 py-1 bg-[#f0fbf4] dark:bg-white/5 text-[#4a7c5d] dark:text-gray-300 rounded-lg text-[11px] font-semibold capitalize border border-gray-100 dark:border-white/5">
                          {t.sessionType}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                        {t.experience}+ years exp &nbsp;&bull;&nbsp; ₹{t.sessionCost}/session
                      </div>
                      <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-2 text-center truncate w-full">
                        Speaks: {t.languages ? t.languages.join(', ') : 'English, Hindi'}
                      </div>
                      <button className="w-full mt-4 py-3 rounded-xl bg-[#0d5d3a] dark:bg-[#1a8a5a] hover:bg-[#0a4a2e] text-white font-bold text-sm transition-all shadow-md">
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}


              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <div className="text-4xl mb-3"></div>
                  <div className="font-bold text-[#4a7c5d] dark:text-gray-400">No therapists match your filters.</div>
                  <button onClick={() => { setSearch(''); setSpecFilter('All Specializations'); setSessionFilter('All Sessions'); setCityFilter('All Cities'); }}
                    className="mt-3 text-sm text-[#0d5d3a] dark:text-[#10b981] font-bold hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function InfoBlock({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-black text-[#0a2617] dark:text-white text-sm mb-2 flex items-center gap-2">
        <span className="text-[#0d5d3a] dark:text-[#10b981]">{icon}</span>{label}
      </h4>
      <div className="bg-[#fbfdfb] dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-100 dark:border-white/5">
        {children}
      </div>
    </div>
  );
}

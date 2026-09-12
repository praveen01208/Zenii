import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, PlayCircle, ExternalLink, RefreshCw, BarChart2 } from 'lucide-react';
import { apiFetch } from '../api/client';

type ResourceLink = {
  id: string;
  title: string;
  type: string;
  url: string;
};

type WeeklyInsight = {
  _id: string;
  weekOf: string;
  aiText: {
    weekInReview: string;
    weNoticed: string;
    thisTryTry: string;
  };
  resourceLinks: ResourceLink[];
  generatedAt: string;
};

export default function WeeklyInsightsBanner({ onPreFillChat }: { onPreFillChat?: (text: string) => void }) {
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First one expanded by default
  const [isOpen, setIsOpen] = useState(false); // To toggle the entire section
  const [hasNewInsight, setHasNewInsight] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await apiFetch<{ insights: WeeklyInsight[] }>('/insights/weekly');
      setInsights(data.insights || []);
      
      // Check if there's an insight generated in the last 2 days
      if (data.insights && data.insights.length > 0) {
        const latest = new Date(data.insights[0].generatedAt);
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        if (latest > twoDaysAgo) {
          setHasNewInsight(true);
        }
      }
    } catch (e) {
      console.error('Failed to load insights:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiFetch('/insights/weekly/generate', { method: 'POST' });
      await fetchInsights();
      setExpandedIndex(0);
      setIsOpen(true);
      setHasNewInsight(true);
    } catch (e) {
      console.error('Failed to generate insight:', e);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  };

  if (loading) return null;

  // Banner view (collapsed)
  if (!isOpen) {
    return (
      <div 
        onClick={() => { setIsOpen(true); setHasNewInsight(false); }}
        className="mx-5 my-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#0d5d3a]/10 to-[#10b981]/10 border border-[#0d5d3a]/20 dark:border-white/10 cursor-pointer hover:bg-[#0d5d3a]/15 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white relative">
            <BarChart2 size={16} />
            {hasNewInsight && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>
              Zeni's Weekly Insights
            </h3>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400">
              {hasNewInsight ? 'Your new weekly summary is ready!' : 'Review your mood and wellness patterns.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {insights.length === 0 && (
             <button 
                onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
                disabled={generating}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#0d5d3a] rounded-lg hover:bg-[#0a4a2e] transition flex items-center gap-1"
             >
                {generating ? <RefreshCw size={12} className="animate-spin" /> : 'Generate Now'}
             </button>
          )}
          <ChevronDown className="text-[#0d5d3a] dark:text-[#10b981] group-hover:translate-y-0.5 transition-transform" size={18} />
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="mx-5 my-4 rounded-3xl bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 shadow-lg overflow-hidden flex flex-col max-h-[60vh]">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(false)}
        className="px-5 py-4 border-b border-[#0d5d3a]/10 dark:border-white/10 bg-gradient-to-r from-[#f0fbf4] to-white dark:from-[#1a2e23] dark:to-[#111111] cursor-pointer flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#10b981] flex items-center justify-center text-white shadow-md">
            <BarChart2 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne,sans-serif' }}>
              My Weekly Insights
            </h2>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400">Personalised patterns and gentle recommendations.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
             disabled={generating}
             title="Force generate new insight now"
             className="w-8 h-8 rounded-full flex items-center justify-center text-[#0d5d3a] hover:bg-[#0d5d3a]/10 transition disabled:opacity-50"
          >
             <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
          </button>
          <ChevronUp className="text-[#4a7c5d] dark:text-gray-400 hover:text-[#0d5d3a] transition-colors" size={20} />
        </div>
      </div>

      {/* Body: List of insights */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#fbfdfc] dark:bg-[#0a0a0a]">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3"></div>
            <p className="text-sm font-semibold text-[#0a2617] dark:text-white">No insights generated yet.</p>
            <p className="text-xs text-[#4a7c5d] dark:text-gray-400 mt-1 mb-4">Chat with Zeni and track your mood to get your first report.</p>
            <button 
               onClick={handleGenerate}
               disabled={generating}
               className="px-5 py-2.5 bg-[#0d5d3a] text-white text-sm font-bold rounded-xl hover:bg-[#0a4a2e] transition shadow-md inline-flex items-center gap-2"
            >
               {generating ? <RefreshCw size={16} className="animate-spin" /> : 'Generate Manually'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div key={insight._id} className={`rounded-2xl border transition-all duration-300 ${isExpanded ? 'border-[#0d5d3a]/30 shadow-md bg-white dark:bg-[#1a1a1a]' : 'border-[#0d5d3a]/10 dark:border-white/5 bg-[#f4f9f6] dark:bg-[#111111] hover:border-[#0d5d3a]/20 cursor-pointer'}`}>
                  
                  {/* Card Header */}
                  <div 
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="px-5 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <span className="font-bold text-sm text-[#0a2617] dark:text-gray-200">
                        Week of {formatDate(insight.weekOf)}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-[#4a7c5d]" /> : <ChevronDown size={18} className="text-[#4a7c5d]" />}
                  </div>

                  {/* Card Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 space-y-4">
                          {/* 3 Paragraphs */}
                          <div className="space-y-3 text-sm leading-relaxed text-[#1e3a2b] dark:text-gray-300">
                            <p><span className="font-semibold text-[#0d5d3a] dark:text-[#10b981]">Your week in review:</span> {insight.aiText.weekInReview.replace(/^Your week in review:\s*/i, '')}</p>
                            <p><span className="font-semibold text-[#0d5d3a] dark:text-[#10b981]">We noticed:</span> {insight.aiText.weNoticed.replace(/^We noticed:\s*/i, '')}</p>
                            <p><span className="font-semibold text-[#0d5d3a] dark:text-[#10b981]">This week, try:</span> {insight.aiText.thisTryTry.replace(/^This week, try:\s*/i, '')}</p>
                          </div>

                          {/* Resources */}
                          {insight.resourceLinks && insight.resourceLinks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#0d5d3a]/10 dark:border-white/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#4a7c5d] dark:text-gray-500 mb-2">Suggested Resources</p>
                              <div className="flex flex-wrap gap-2">
                                {insight.resourceLinks.map(res => (
                                  <a key={res.id} href={res.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f0fbf4] dark:bg-white/5 border border-[#0d5d3a]/15 hover:bg-[#e0f5ea] dark:hover:bg-white/10 transition text-xs font-semibold text-[#0d5d3a] dark:text-[#10b981]"
                                  >
                                    {res.type === 'video' ? <PlayCircle size={12} /> : <ExternalLink size={12} />}
                                    <span className="truncate max-w-[150px]">{res.title}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CTA */}
                          {onPreFillChat && (
                            <div className="mt-4 pt-3 flex justify-end">
                              <button
                                onClick={() => {
                                  onPreFillChat(`About my insights for the week of ${formatDate(insight.weekOf)}: `);
                                  setIsOpen(false);
                                }}
                                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#0d5d3a] text-white hover:bg-[#0a4a2e] transition shadow-sm"
                              >
                                Ask Zeni about this
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

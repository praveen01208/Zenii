import React, { useState } from 'react';
import {
  MessageCircle,
  Stethoscope,
  Calendar,
  BarChart2,
  BookHeart,
  Users2,
  Target,
  Globe2,
  Dumbbell,
  Library,
  BookMarked,
  ShoppingBag,
  Settings,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  Sparkles,
  FolderHeart,
  Plus,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Care & Support',
    icon: <HeartPulse className="w-4 h-4 flex-shrink-0 text-[#0d5d3a]" />,
    items: [
      { key: 'aichat', label: 'AI Chat', icon: <MessageCircle className="w-4 h-4 flex-shrink-0" /> },
      { key: 'therapy', label: 'Therapy Hub', icon: <Stethoscope className="w-4 h-4 flex-shrink-0" /> },
      { key: 'sessions', label: 'My Sessions', icon: <Calendar className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'My Journey',
    icon: <Sparkles className="w-4 h-4 flex-shrink-0 text-[#d97706]" />,
    items: [
      { key: 'progress', label: 'My Progress', icon: <BarChart2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'journal', label: 'Mood Journal', icon: <BookHeart className="w-4 h-4 flex-shrink-0" /> },
      { key: 'goals', label: 'My Goals', icon: <Target className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'Wellness Hub',
    icon: <FolderHeart className="w-4 h-4 flex-shrink-0 text-[#0d5d3a]" />,
    items: [
      { key: 'resources', label: 'Resources', icon: <Library className="w-4 h-4 flex-shrink-0" /> },
      { key: 'reading', label: 'Reading Lists', icon: <BookMarked className="w-4 h-4 flex-shrink-0" /> },
      { key: 'programs', label: 'Wellness Programs', icon: <Dumbbell className="w-4 h-4 flex-shrink-0" /> },
      { key: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  {
    title: 'Community',
    icon: <Globe2 className="w-4 h-4 flex-shrink-0 text-[#d97706]" />,
    items: [
      { key: 'community', label: 'Community', icon: <Globe2 className="w-4 h-4 flex-shrink-0" /> },
      { key: 'circles', label: 'Peer Circles', icon: <Users2 className="w-4 h-4 flex-shrink-0" /> },
    ],
  },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 flex-shrink-0" /> },
];

export default function SidebarNav({ tab, navigateToTab, collapsed, setCollapsed }: any) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const handleGroupClick = (groupTitle: string, hasItems: boolean) => {
    if (!hasItems && setCollapsed) {
      return;
    }
    if (collapsed && setCollapsed) setCollapsed(false);
    setExpandedGroup(prev => (prev === groupTitle ? null : groupTitle));
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Golden & Emerald Floating "+ New Check-in" Action Button */}
      <div className="relative mb-2 px-1">
        <button
          type="button"
          onClick={() => {
            if (collapsed && setCollapsed) setCollapsed(false);
            setShowQuickMenu(prev => !prev);
          }}
          className={`flex items-center gap-3 bg-white text-[#0d5d3a] hover:bg-[#fef8ec] shadow-md hover:shadow-lg border-2 border-[#d97706]/40 rounded-2xl transition-all duration-200 ${
            collapsed ? 'w-12 h-12 justify-center p-0 mx-auto' : 'px-5 py-3.5 w-full'
          }`}
          title="New Quick Action"
        >
          <div className="w-6 h-6 rounded-full bg-[#d97706] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-wide text-[#0d5d3a]">
              New Check-in
            </span>
          )}
        </button>

        {/* Quick Action Menu */}
        {showQuickMenu && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-[#d97706]/30 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#d97706] px-3 py-1.5">
              Quick Actions
            </div>
            <button
              onClick={() => { navigateToTab('aichat'); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#0d5d3a] hover:bg-[#e6f4ea] rounded-xl transition"
            >
              <MessageCircle className="w-4 h-4 text-[#0d5d3a]" />
              <span>Start AI Chat</span>
            </button>
            <button
              onClick={() => { navigateToTab('journal'); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#0d5d3a] hover:bg-[#fef3c7] rounded-xl transition"
            >
              <BookHeart className="w-4 h-4 text-[#d97706]" />
              <span>Record Mood Journal</span>
            </button>
            <button
              onClick={() => { navigateToTab('therapy'); setShowQuickMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#0d5d3a] hover:bg-[#e6f4ea] rounded-xl transition"
            >
              <Stethoscope className="w-4 h-4 text-[#0d5d3a]" />
              <span>Book Therapy Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Groups (Green, White & Gold Palette) */}
      <div className="flex flex-col gap-1.5">
        {NAV_GROUPS.map((group: any) => {
          if (!group.items) {
            const active = tab === group.key;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => navigateToTab(group.key)}
                title={collapsed ? group.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-0 h-10' : 'gap-3 px-4 py-2.5'} rounded-full transition-all duration-200 text-sm font-semibold ${
                  active
                    ? 'bg-[#0d5d3a] text-white font-bold shadow-md border-r-4 border-[#d97706]'
                    : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
                }`}
              >
                {group.icon}
                {!collapsed && <span className="whitespace-nowrap overflow-hidden">{group.label}</span>}
              </button>
            );
          }

          const isGroupActive = group.items.some((i: any) => i.key === tab);
          const isExpanded = expandedGroup === group.title || isGroupActive;

          return (
            <div key={group.title} className="flex flex-col gap-0.5">
              {/* Group header */}
              <button
                type="button"
                onClick={() => handleGroupClick(group.title, true)}
                title={collapsed ? group.title : undefined}
                className={`w-full flex items-center justify-between ${collapsed ? 'px-0 justify-center h-10' : 'px-4 py-2'} rounded-full transition-all text-[#0d5d3a]/80 hover:bg-[#e6f4ea]`}
              >
                <div className="flex items-center gap-3">
                  {group.icon}
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden text-xs font-bold uppercase tracking-wider text-[#0d5d3a]">
                      {group.title}
                    </span>
                  )}
                </div>
                {collapsed ? null : isExpanded ? (
                  <ChevronDown size={14} className="text-[#0d5d3a]" />
                ) : (
                  <ChevronRight size={14} className="text-[#0d5d3a]" />
                )}
              </button>

              {/* Group items */}
              {isExpanded && !collapsed && (
                <div className="flex flex-col gap-1 pl-3 my-0.5">
                  {group.items.map((item: any) => {
                    const active = tab === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => navigateToTab(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-full transition-all text-xs font-bold ${
                          active
                            ? 'bg-[#0d5d3a] text-white shadow-sm border-r-4 border-[#d97706]'
                            : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
                        }`}
                      >
                        <div className={active ? 'text-[#ffebc4]' : 'text-[#0d5d3a]'}>
                          {item.icon}
                        </div>
                        <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gold & Emerald Status Widget */}
      {!collapsed && (
        <div className="mt-4 mx-1 p-3.5 bg-gradient-to-br from-[#fef3c7] to-[#ffffff] rounded-2xl border-2 border-[#d97706]/30 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#78350f]">ZenMind Status</span>
            <span className="text-[10px] font-bold text-[#0d5d3a] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#0d5d3a]/20">
              Unlimited Access
            </span>
          </div>
          <div className="w-full bg-[#fde68a] h-2 rounded-full overflow-hidden">
            <div className="bg-[#0d5d3a] h-full w-full rounded-full" />
          </div>
          <span className="text-[11px] font-medium text-[#92400e]">
            100% Free • Green, White & Gold Palette
          </span>
        </div>
      )}
    </div>
  );
}

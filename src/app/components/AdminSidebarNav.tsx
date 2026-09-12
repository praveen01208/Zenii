import React, { useState } from 'react';
import { Settings, Activity, Users, Shield, Edit2, HelpCircle, MessageSquare, ShieldAlert, BookOpen, Brain, ShoppingBag, LifeBuoy, AlertTriangle, Bell, TrendingUp, UserCircle, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import NavItem from './NavItem';

export default function AdminSidebarNav({
  tab,
  navigateToTab,
  collapsed,
}: {
  tab: string;
  navigateToTab: (t: string) => void;
  collapsed: boolean;
  setCollapsed?: (c: boolean) => void;
}) {
  const groups = [
    {
      label: 'Analytics',
      items: [{ icon: Activity, label: 'Analytics', id: 'analytics' }],
    },
    {
      label: 'Management',
      items: [
        { icon: Users, label: 'Members Directory', id: 'users' },
        { icon: Shield, label: 'Therapists Directory', id: 'therapists' },
        { icon: Edit2, label: 'Content Mgmt', id: 'content' },
        { icon: HelpCircle, label: 'FAQs Management', id: 'faqs' },
        { icon: MessageSquare, label: 'Peer Circles', id: 'circles' },
        { icon: ShieldAlert, label: 'Flagged Content', id: 'flagged' },
        { icon: BookOpen, label: 'Reading Lists', id: 'reading' },
        { icon: Brain, label: 'Wellness Programs', id: 'programs' },
        { icon: ShoppingBag, label: 'Wellness Store', id: 'store' },
        { icon: Brain, label: 'Quiz Questions', id: 'quiz' },
        { icon: LifeBuoy, label: 'Support Tickets', id: 'support' },
        { icon: ShieldAlert, label: 'Therapist Inbox', id: 'therapist_inbox' },
        { icon: AlertTriangle, label: 'Crisis Monitor', id: 'crisis' },
        { icon: Bell, label: 'Notifications', id: 'notifications' },
        { icon: TrendingUp, label: 'Session Insights', id: 'session_insights' },
        { icon: UserCircle, label: 'Team Members', id: 'team' },
        { icon: Briefcase, label: 'Job Postings', id: 'jobs' },
        { icon: Users, label: 'Applications', id: 'applications' },
      ],
    },
    {
      label: 'Settings',
      items: [{ icon: Settings, label: 'Settings', id: 'settings' }],
    },
  ];

  const [expandedGroups, setExpandedGroups] = useState(() =>
    groups.reduce((acc, g) => ({ ...acc, [g.label]: true }), {})
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group, groupIdx) => (
        <div key={group.label} className="flex flex-col gap-1">
          {!collapsed ? (
            <button
              type="button"
              onClick={() => toggleGroup(group.label)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#78350f]"
            >
              <span>{group.label}</span>
              {expandedGroups[group.label] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            groupIdx > 0 && <div className="h-px bg-[#0d5d3a]/15 my-2 w-8 mx-auto" />
          )}

          {(collapsed || expandedGroups[group.label]) &&
            group.items.map(item => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => navigateToTab(item.id)}
                expanded={!collapsed}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

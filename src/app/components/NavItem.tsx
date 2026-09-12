import React from 'react';

export default function NavItem({ icon: Icon, label, active, onClick, expanded }: any) {
  if (!expanded) {
    return (
      <button
        onClick={onClick}
        className={`w-11 h-11 my-1 mx-auto flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
          active
            ? 'bg-[#0d5d3a] text-white shadow-md ring-2 ring-[#d97706]'
            : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
        }`}
        title={label}
      >
        <Icon size={22} className="shrink-0" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
        active
          ? 'bg-[#0d5d3a] text-white shadow-sm border-r-4 border-[#d97706]'
          : 'text-[#0d5d3a] hover:bg-[#e6f4ea]'
      }`}
      title={label}
    >
      <Icon size={20} className="shrink-0" />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
    </button>
  );
}

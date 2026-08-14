import React from 'react';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export const NotificationFilters = ({ activeFilter, onFilterChange, counts = {} }) => {
  return (
    <div className="flex items-center space-x-1.5 border-b border-zinc-800 pb-3 overflow-x-auto [scrollbar-width:none]">
      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        const countVal = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
              isActive
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'bg-zinc-900 text-slate-400 border border-zinc-800 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {countVal !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                  isActive ? 'bg-zinc-200 text-slate-950' : 'bg-zinc-800 text-slate-400'
                }`}
              >
                {countVal}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationFilters;

import React from 'react';
import { Filter } from 'lucide-react';

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
    <div className="flex items-center space-x-2 border-b border-zinc-900 overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-bold mr-2 uppercase tracking-wider shrink-0">
        <Filter className="w-3.5 h-3.5 text-emerald-400" />
        <span>Filter:</span>
      </div>

      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        const countVal = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 border ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-extrabold shadow-sm'
                : 'bg-[#09090B] text-slate-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {countVal !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-900 text-slate-500'
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

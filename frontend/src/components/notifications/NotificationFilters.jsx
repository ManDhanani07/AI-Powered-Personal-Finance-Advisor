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
    <div className="flex items-center space-x-2 border-b border-border-subtle overflow-x-auto pb-2 scrollbar-none [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-bold mr-2 uppercase tracking-wider shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span>Filter:</span>
      </div>

      {FILTER_TABS.map((tab) => {
        const isActive = activeFilter === tab.id;
        const countVal = counts[tab.id];

        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 whitespace-nowrap flex items-center space-x-1.5 border ${
              isActive
                ? 'bg-primary-500 text-white border-primary-400 shadow-md shadow-primary-500/25 scale-105'
                : 'bg-bg-card/60 text-slate-400 border-border-subtle hover:border-border-strong hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {countVal !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
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

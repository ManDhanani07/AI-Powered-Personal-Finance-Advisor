import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  Tag,
  Plus,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

export const CategoryTreeAccordion = ({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParentIds, setExpandedParentIds] = useState([]);

  // Group categories into parent -> subcategory hierarchy
  const hierarchy = useMemo(() => {
    const parentMap = {};
    const standalone = [];

    // Filter by search
    const filtered = categories.filter((cat) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        cat.category_name.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    });

    filtered.forEach((cat) => {
      if (cat.parent_id) {
        if (!parentMap[cat.parent_id]) parentMap[cat.parent_id] = [];
        parentMap[cat.parent_id].push(cat);
      } else {
        standalone.push(cat);
      }
    });

    return { parentMap, standalone };
  }, [categories, searchQuery]);

  const toggleExpand = (parentId, e) => {
    e.stopPropagation();
    if (expandedParentIds.includes(parentId)) {
      setExpandedParentIds(expandedParentIds.filter((id) => id !== parentId));
    } else {
      setExpandedParentIds([...expandedParentIds, parentId]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-surface border border-border-strong rounded-3xl p-5 shadow-glass space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
              Taxonomy Hierarchy
            </h3>
            <p className="text-[11px] text-slate-400">{categories.length} total categories</p>
          </div>
        </div>

        <button
          onClick={onAddCategory}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Search className="h-3.5 w-3.5" />
        </div>
        <input
          type="text"
          placeholder="Filter categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-border-strong bg-bg-elevated/70 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Tree Accordion Canvas */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[560px]">
        {hierarchy.standalone.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No categories match your search.
          </div>
        ) : (
          hierarchy.standalone.map((cat) => {
            const subcats = hierarchy.parentMap[cat.id] || [];
            const hasSubs = subcats.length > 0;
            const isExpanded = expandedParentIds.includes(cat.id);
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Parent Node Item */}
                <div
                  onClick={() => onSelectCategory(cat)}
                  className={`group flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/10 shadow-md shadow-primary-500/10'
                      : 'border-border-subtle bg-bg-elevated/50 hover:bg-bg-elevated'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#6366F1' }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {cat.category_name}
                    </span>
                    {cat.is_default && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-500">
                        Default
                      </span>
                    )}
                  </div>

                  {hasSubs && (
                    <button
                      onClick={(e) => toggleExpand(cat.id, e)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-bg-surface transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Subcategory Nested Children Accordion */}
                <AnimatePresence>
                  {hasSubs && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pl-5 space-y-1 overflow-hidden"
                    >
                      {subcats.map((sub) => {
                        const isSubSelected = selectedCategoryId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={() => onSelectCategory(sub)}
                            className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer text-xs transition-all ${
                              isSubSelected
                                ? 'border-primary-500 bg-primary-500/15 text-primary-500 font-bold'
                                : 'border-transparent hover:bg-bg-elevated text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2 min-w-0">
                              <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{sub.category_name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryTreeAccordion;

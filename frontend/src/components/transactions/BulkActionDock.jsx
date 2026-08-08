import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Scissors, Trash2, Download, X, CheckSquare } from 'lucide-react';

export const BulkActionDock = ({
  selectedCount = 0,
  onClearSelection,
  onBulkCategorize,
  onBulkSplit,
  onBulkDelete,
  onExportSelected,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-3xl border border-border-strong bg-bg-surface/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/40 flex items-center space-x-3 sm:space-x-4 max-w-full overflow-x-auto"
        >
          {/* Selected Count Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-bold whitespace-nowrap">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedCount} selected</span>
          </div>

          <div className="h-5 w-[1px] bg-border-subtle flex-shrink-0" />

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Categorize Bulk */}
            <button
              onClick={onBulkCategorize}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Categorize Bulk</span>
            </button>

            {/* Split */}
            <button
              onClick={onBulkSplit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-elevated hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Split</span>
            </button>

            {/* Delete */}
            <button
              onClick={onBulkDelete}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            {/* Export Selected */}
            <button
              onClick={onExportSelected}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-border-subtle flex-shrink-0" />

          {/* Close / Clear Selection */}
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionDock;

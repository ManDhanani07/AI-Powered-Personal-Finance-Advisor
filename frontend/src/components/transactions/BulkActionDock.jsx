import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

export const BulkActionDock = ({
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-950/95 backdrop-blur-xl shadow-2xl"
        >
          {/* Selected count */}
          <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            {selectedCount} selected
          </span>

          <div className="h-4 w-px bg-zinc-700" />

          {/* Delete */}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Clear */}
          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionDock;

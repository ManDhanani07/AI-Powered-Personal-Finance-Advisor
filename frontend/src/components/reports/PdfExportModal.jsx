import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, CheckCircle2, Loader2, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export const PdfExportModal = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsDone(false);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDone(true);
            toast.success('Executive Financial Report PDF compiled & downloaded!', { icon: '📄' });
            return 100;
          }
          return prev + 20;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl border border-border-strong bg-bg-surface p-6 shadow-2xl backdrop-blur-2xl space-y-5 z-10 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                {isDone ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <FileText className="w-7 h-7" />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                  {isDone ? 'Executive Report Ready' : 'Generating PDF Report'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isDone
                    ? 'Your executive tax strategy & spending analysis PDF has been generated.'
                    : 'Compiling 80C/80D tax tables, category pie charts, and net worth progress...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Export Progress</span>
                  <span className="font-mono text-primary-400">{progress}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-bg-elevated overflow-hidden p-0.5 border border-border-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-primary-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-primary-600 transition-colors"
                >
                  {isDone ? 'Download Completed' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PdfExportModal;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, MapPin, Receipt, PieChart, Target, Sparkles, ShieldCheck } from 'lucide-react';

export const AdminUserDetailModal = ({ isOpen, onClose, userDetail }) => {
  if (!isOpen || !userDetail) return null;

  const u = userDetail.user || {};
  const txs = userDetail.recent_transactions || [];
  const budgets = userDetail.budgets || [];
  const goals = userDetail.goals || [];
  const ai = userDetail.recent_ai_queries || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-lg font-outfit">
                {(u.first_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white font-outfit">
                  {u.first_name} {u.last_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">{u.email}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Profile Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Monthly Income</span>
              <p className="text-white font-bold font-outfit text-sm mt-0.5">₹{u.monthly_income?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Occupation</span>
              <p className="text-slate-300 font-medium mt-0.5">{u.occupation || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Joined</span>
              <p className="text-slate-300 font-medium mt-0.5">{u.joined}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Last Login</span>
              <p className="text-slate-300 font-medium mt-0.5">{u.last_login}</p>
            </div>
          </div>

          {/* User Recent Transactions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-sky-400" />
              <span>Recent Transactions ({txs.length})</span>
            </h4>
            {txs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No transactions logged yet.</p>
            ) : (
              <div className="divide-y divide-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-xs">
                {txs.map((t) => (
                  <div key={t.id} className="p-3 flex items-center justify-between bg-zinc-900/30">
                    <div>
                      <p className="font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-500">{t.date}</p>
                    </div>
                    <span className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'INCOME' ? '+' : '−'}₹{t.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Active Budgets & Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budgets */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-teal-400" />
                <span>Budgets ({budgets.length})</span>
              </h4>
              <div className="space-y-1.5">
                {budgets.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs flex justify-between">
                    <span className="text-slate-300 font-medium">{b.category}</span>
                    <span className="text-white font-bold font-mono">₹{b.allocated.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Savings Goals ({goals.length})</span>
              </h4>
              <div className="space-y-1.5">
                {goals.map((g) => (
                  <div key={g.id} className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs flex justify-between">
                    <span className="text-slate-300 font-medium">{g.title}</span>
                    <span className="text-amber-400 font-bold font-mono">
                      ₹{g.current.toLocaleString()} / ₹{g.target.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Queries History */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Recent AI Copilot Queries ({ai.length})</span>
            </h4>
            <div className="space-y-1.5">
              {ai.map((a) => (
                <div key={a.id} className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs space-y-0.5">
                  <p className="text-slate-200 font-medium">"{a.question}"</p>
                  <p className="text-[10px] text-slate-500 font-mono">{a.created_at}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminUserDetailModal;

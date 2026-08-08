import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  RefreshCw,
  Unlink,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_BANKS = [
  {
    id: 'b1',
    name: 'HDFC Bank Ltd.',
    accountType: 'Savings Account •••• 9842',
    status: 'Synced',
    syncTime: '2 mins ago',
    logo: '🏦',
    balance: '₹1,48,250.00',
    color: '#004B87',
  },
  {
    id: 'b2',
    name: 'ICICI Bank',
    accountType: 'Salary Account •••• 4120',
    status: 'Synced',
    syncTime: '15 mins ago',
    logo: '🏛️',
    balance: '₹84,500.00',
    color: '#F37021',
  },
  {
    id: 'b3',
    name: 'Zerodha Kite',
    accountType: 'Trading & Demat Vault',
    status: 'Syncing',
    syncTime: 'In progress',
    logo: '📈',
    balance: '₹4,52,000.00',
    color: '#387ED1',
  },
  {
    id: 'b4',
    name: 'State Bank of India',
    accountType: 'Public Deposit •••• 6501',
    status: 'Synced',
    syncTime: '1 hour ago',
    logo: '💳',
    balance: '₹2,10,000.00',
    color: '#1A539B',
  },
];

export const ConnectedBanksPanel = () => {
  const [banks, setBanks] = useState(INITIAL_BANKS);
  const [syncingId, setSyncingId] = useState(null);
  const [disconnectingBank, setDisconnectingBank] = useState(null);

  const handleSyncNow = (id, name) => {
    setSyncingId(id);
    setTimeout(() => {
      setBanks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'Synced', syncTime: 'Just now' } : b))
      );
      setSyncingId(null);
      toast.success(`Account Aggregator sync completed for ${name}!`, { icon: '🔄' });
    }, 1200);
  };

  const handleDisconnect = () => {
    if (disconnectingBank) {
      setBanks((prev) => prev.filter((b) => b.id !== disconnectingBank.id));
      toast.info(`Disconnected ${disconnectingBank.name} framework.`);
      setDisconnectingBank(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Secure Bank Account Aggregator Hub
            </h3>
            <p className="text-xs text-slate-400">
              Encrypted real-time data consent pipelines for your banking and investment accounts.
            </p>
          </div>
        </div>

        <button
          onClick={() => toast.info('Launching AA consent onboarding modal...')}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Bank</span>
        </button>
      </div>

      {/* Grid of Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banks.map((bank) => {
          const isSyncing = syncingId === bank.id || bank.status === 'Syncing';
          return (
            <div
              key={bank.id}
              className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border-strong flex items-center justify-center text-xl shadow-sm">
                    {bank.logo}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                      {bank.name}
                    </h4>
                    <p className="text-xs text-slate-400">{bank.accountType}</p>
                  </div>
                </div>

                {/* Live Sync Status Indicator Light */}
                <div
                  className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isSyncing
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{isSyncing ? 'Syncing...' : 'Live Synced'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-border-subtle bg-bg-elevated/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Ledger Balance:</span>
                <span className="font-black text-slate-900 dark:text-white text-sm">{bank.balance}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
                <span className="text-slate-400 text-[11px]">Last Sync: {bank.syncTime}</span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSyncNow(bank.id, bank.name)}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-xl border border-border-strong bg-bg-elevated hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>

                  <button
                    onClick={() => setDisconnectingBank(bank)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Disconnect Bank"
                  >
                    <Unlink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disconnect Bank Confirmation Modal */}
      <AnimatePresence>
        {disconnectingBank && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisconnectingBank(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-bg-surface p-6 shadow-2xl space-y-4 z-10 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                    Disconnect {disconnectingBank.name}?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    This will revoke active bank data consent and stop automated transaction streaming.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setDisconnectingBank(null)}
                    className="flex-1 py-2.5 rounded-2xl border border-border-strong bg-bg-elevated font-bold text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 py-2.5 rounded-2xl bg-rose-500 font-bold text-xs text-white shadow-lg shadow-rose-500/25"
                  >
                    Confirm Disconnect
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConnectedBanksPanel;

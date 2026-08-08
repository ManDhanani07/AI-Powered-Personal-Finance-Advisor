import React, { useState } from 'react';
import { Bell, Smartphone, Mail, MessageSquare, Check, X, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_MATRIX = [
  {
    id: 'n1',
    event: 'Overspending Threshold Warning',
    desc: 'Triggers when envelope budget reaches 80% or 100% threshold',
    push: true,
    email: true,
    whatsapp: true,
  },
  {
    id: 'n2',
    event: 'Large Debit / Transaction >₹10,000',
    desc: 'Instant alert for high-value debit activity',
    push: true,
    email: true,
    whatsapp: false,
  },
  {
    id: 'n3',
    event: 'Tax Filing & 80C Deadlines',
    desc: 'Quarterly and year-end Indian Tax Regime submission reminders',
    push: true,
    email: true,
    whatsapp: true,
  },
  {
    id: 'n4',
    event: 'Weekly Financial Intelligence Digest',
    desc: 'Summary of savings rate, net worth growth, and top spenders',
    push: false,
    email: true,
    whatsapp: false,
  },
  {
    id: 'n5',
    event: 'Security & Login Alerts',
    desc: 'New device login, password changes, and 2FA authentication events',
    push: true,
    email: true,
    whatsapp: true,
  },
];

export const NotificationsMatrix = () => {
  const [matrix, setMatrix] = useState(INITIAL_MATRIX);

  const toggleChannel = (id, channel) => {
    setMatrix((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [channel]: !item[channel] } : item))
    );
  };

  const handleSavePreferences = () => {
    toast.success('Notification channels & matrix preferences updated!', { icon: '🔔' });
  };

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
              Granular Notification Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Configure notification preferences across Push, Email, and WhatsApp channels.
            </p>
          </div>
        </div>

        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center space-x-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Event Type & Description</th>
              <th className="py-3 px-4 text-center w-28">
                <span className="flex items-center justify-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-primary-500" /> Push
                </span>
              </th>
              <th className="py-3 px-4 text-center w-28">
                <span className="flex items-center justify-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email
                </span>
              </th>
              <th className="py-3 px-4 text-center w-28">
                <span className="flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-medium">
            {matrix.map((row) => (
              <tr key={row.id} className="hover:bg-bg-elevated/40 transition-colors">
                <td className="py-3.5 px-4">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">{row.event}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{row.desc}</p>
                </td>

                {/* Push Toggle */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleChannel(row.id, 'push')}
                    className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all ${
                      row.push ? 'bg-primary-500 text-white shadow-sm' : 'bg-bg-elevated text-slate-600 border border-border-strong'
                    }`}
                  >
                    {row.push && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>

                {/* Email Toggle */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleChannel(row.id, 'email')}
                    className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all ${
                      row.email ? 'bg-indigo-600 text-white shadow-sm' : 'bg-bg-elevated text-slate-600 border border-border-strong'
                    }`}
                  >
                    {row.email && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>

                {/* WhatsApp Toggle */}
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => toggleChannel(row.id, 'whatsapp')}
                    className={`w-6 h-6 rounded-lg mx-auto flex items-center justify-center transition-all ${
                      row.whatsapp ? 'bg-emerald-500 text-white shadow-sm' : 'bg-bg-elevated text-slate-600 border border-border-strong'
                    }`}
                  >
                    {row.whatsapp && <Check className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsMatrix;

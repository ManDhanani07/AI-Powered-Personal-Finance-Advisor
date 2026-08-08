import React, { useState } from 'react';
import { Palette, Globe, Bell, Check, Clock } from 'lucide-react';
import ThemeSelector from './ThemeSelector.jsx';
import { toast } from 'react-toastify';

export const PreferencesCard = () => {
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('DD MMM YYYY');
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    aiAdvisor: true,
    monthlyReport: true,
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences updated.', { icon: '🔔' });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-none space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Preferences</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Customize theme appearance, currency defaults, and notifications</p>
      </div>

      {/* Theme Preference */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Interface Appearance</span>
        </div>
        <ThemeSelector />
      </div>

      {/* Localization & Region */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Currency & Regional Formats</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                toast.success(`Default currency set to ${e.target.value}`);
              }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC (GMT +0:00)</option>
              <option value="America/New_York">America/New_York (EST -5:00)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs font-medium dark:bg-slate-900 dark:text-white"
            >
              <option value="DD MMM YYYY">01 Aug 2026</option>
              <option value="DD/MM/YYYY">01/08/2026</option>
              <option value="YYYY-MM-DD">2026-08-01</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Bell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>Notification Preferences</span>
        </div>

        <div className="space-y-2">
          {[
            { key: 'budgetAlerts', label: 'Budget Exceed Warning Alerts', desc: 'Get notified when spending reaches 80% or exceeds category budgets.' },
            { key: 'aiAdvisor', label: 'AI Financial Insights & Recommendations', desc: 'Receive periodic smart savings suggestions from Gemini AI.' },
            { key: 'monthlyReport', label: 'Monthly Financial Summary PDF Email', desc: 'Receive automated monthly cash flow analysis reports.' },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => handleNotificationToggle(item.key)}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/60 dark:border-slate-800/50 dark:bg-slate-800/30 cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <div
                className={`h-5 w-9 rounded-full transition-all relative ${
                  notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                    notifications[item.key] ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreferencesCard;

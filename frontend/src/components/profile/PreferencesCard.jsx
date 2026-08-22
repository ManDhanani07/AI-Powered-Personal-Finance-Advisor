import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  Sliders,
  Save,
  Loader2,
  Check,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../../services/userService.js';
import useAuth from '../../hooks/useAuth.js';
import DeleteAllTransactionsModal from '../transactions/DeleteAllTransactionsModal.jsx';

const NOTIFICATION_EVENTS = [
  { id: 'budget_80', label: 'Budget Reaches 80%', desc: 'Warn when any category budget hits 80% threshold' },
  { id: 'budget_exceeded', label: 'Budget Exceeded', desc: 'Critical alert when spending breaches monthly allocation' },
  { id: 'large_transaction', label: 'Large Transaction Alert', desc: 'Instant flag for single transactions exceeding ₹10,000' },
  { id: 'unusual_spending', label: 'Unusual Spending Detected', desc: 'AI anomaly detection for anomalous merchants or spikes' },
  { id: 'salary_received', label: 'Salary / Income Received', desc: 'Notification upon incoming credit or salary deposit' },
  { id: 'goal_milestone', label: 'Goal Milestone Achieved', desc: 'Celebratory update when savings goal reaches 25%, 50%, 100%' },
  { id: 'upcoming_emi', label: 'Upcoming EMI Due', desc: 'Reminder 3 days prior to scheduled loan or card EMI' },
  { id: 'upcoming_bill', label: 'Upcoming Utility Bill', desc: 'Electricity, broadband, rent, and subscription due notices' },
  { id: 'ai_insights', label: 'AI Financial Insights', desc: 'Weekly AI wealth synthesis and budget optimization tips' },
];

export const PreferencesCard = () => {
  const { loadCurrentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetLedgerOpen, setIsResetLedgerOpen] = useState(false);

  // Currency & Regional
  const [currency, setCurrency] = useState('INR');
  const [country, setCountry] = useState('India');
  const [language, setLanguage] = useState('English');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dateFormat, setDateFormat] = useState('21 Aug 2026');
  const [numberFormat, setNumberFormat] = useState('Indian');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');

  // Notifications Matrix
  const [notifications, setNotifications] = useState({
    budget_80: { push: true, email: true, whatsapp: false },
    budget_exceeded: { push: true, email: true, whatsapp: false },
    large_transaction: { push: true, email: true, whatsapp: false },
    unusual_spending: { push: true, email: true, whatsapp: false },
    salary_received: { push: true, email: true, whatsapp: false },
    goal_milestone: { push: true, email: true, whatsapp: false },
    upcoming_emi: { push: true, email: true, whatsapp: false },
    upcoming_bill: { push: true, email: true, whatsapp: false },
    ai_insights: { push: true, email: false, whatsapp: false },
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [notificationFrequency, setNotificationFrequency] = useState('instant');

  // Transaction Display
  const [transactionDensity, setTransactionDensity] = useState('comfortable');
  const [showMerchantLogo, setShowMerchantLogo] = useState(true);
  const [showTransactionDescription, setShowTransactionDescription] = useState(true);
  const [defaultTransactionSorting, setDefaultTransactionSorting] = useState('date_desc');
  const [defaultTransactionDateRange, setDefaultTransactionDateRange] = useState('30d');
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await userService.getPreferences();
        if (res?.data) {
          const d = res.data;
          if (d.currency) setCurrency(d.currency);
          if (d.country) setCountry(d.country);
          if (d.language) setLanguage(d.language);
          if (d.timezone) setTimezone(d.timezone);
          if (d.date_format) setDateFormat(d.date_format);
          if (d.number_format) setNumberFormat(d.number_format);
          if (d.first_day_of_week) setFirstDayOfWeek(d.first_day_of_week);

          if (d.notifications) {
            setNotifications((prev) => ({ ...prev, ...d.notifications }));
          }
          if (d.quiet_hours_enabled !== undefined) setQuietHoursEnabled(Boolean(d.quiet_hours_enabled));
          if (d.quiet_hours_start) setQuietHoursStart(d.quiet_hours_start);
          if (d.quiet_hours_end) setQuietHoursEnd(d.quiet_hours_end);
          if (d.notification_frequency) setNotificationFrequency(d.notification_frequency);

          if (d.transaction_density) setTransactionDensity(d.transaction_density);
          if (d.show_merchant_logo !== undefined) setShowMerchantLogo(Boolean(d.show_merchant_logo));
          if (d.show_transaction_description !== undefined) setShowTransactionDescription(Boolean(d.show_transaction_description));
          if (d.default_transaction_sorting) setDefaultTransactionSorting(d.default_transaction_sorting);
          if (d.default_transaction_date_range) setDefaultTransactionDateRange(d.default_transaction_date_range);
          if (d.show_completed_only !== undefined) setShowCompletedOnly(Boolean(d.show_completed_only));
        }
      } catch (err) {
        console.error('Failed to load user preferences', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggleChannel = (eventId, channel) => {
    setNotifications((prev) => {
      const currentEvent = prev[eventId] || { push: false, email: false, whatsapp: false };
      return {
        ...prev,
        [eventId]: {
          ...currentEvent,
          [channel]: !currentEvent[channel],
        },
      };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        currency,
        country,
        language,
        timezone,
        date_format: dateFormat,
        number_format: numberFormat,
        first_day_of_week: firstDayOfWeek,

        notifications,
        quiet_hours_enabled: quietHoursEnabled,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd,
        notification_frequency: notificationFrequency,

        transaction_density: transactionDensity,
        show_merchant_logo: showMerchantLogo,
        show_transaction_description: showTransactionDescription,
        default_transaction_sorting: defaultTransactionSorting,
        default_transaction_date_range: defaultTransactionDateRange,
        show_completed_only: showCompletedOnly,
      };

      await userService.updatePreferences(payload);
      toast.success('Preferences & settings saved successfully! ✨');
      loadCurrentUser();
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 rounded-3xl border border-zinc-800 bg-[#09090B]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* SECTION 1: Currency & Regional Settings */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Currency &amp; Regional Settings</h3>
            <p className="text-xs text-slate-400">Format currencies, timezone, numbers, and dates across the app</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Primary Currency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="JPY">JPY (¥) - Japanese Yen</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
              <option value="AED">AED (د.إ) - UAE Dirham</option>
            </select>
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Country / Region
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Germany">Germany</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="English">English (Global)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="America/New_York">America/New_York (EST -5:00)</option>
              <option value="Europe/London">Europe/London (GMT +0:00)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
            </select>
          </div>

          {/* Date Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="21 Aug 2026">21 Aug 2026 (DD MMM YYYY)</option>
              <option value="21/08/2026">21/08/2026 (DD/MM/YYYY)</option>
              <option value="08/21/2026">08/21/2026 (MM/DD/YYYY)</option>
              <option value="2026-08-21">2026-08-21 (ISO YYYY-MM-DD)</option>
            </select>
          </div>

          {/* Number Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Number System
            </label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="Indian">Indian (₹ 1,00,000.00)</option>
              <option value="International">International (100,000.00)</option>
            </select>
          </div>

          {/* First Day of Week */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              First Day of Week
            </label>
            <select
              value={firstDayOfWeek}
              onChange={(e) => setFirstDayOfWeek(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
            >
              <option value="Monday">Monday (Standard Business)</option>
              <option value="Sunday">Sunday (Traditional)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: Notification Preferences Matrix */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Notification Preferences</h3>
            <p className="text-xs text-slate-400">Control channels for critical budget alerts and spending events</p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-violet-400" /> Push</span>
                </th>
                <th className="pb-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-sky-400" /> Email</span>
                </th>
                <th className="pb-3 px-3 text-center">
                  <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {NOTIFICATION_EVENTS.map((evt) => {
                const row = notifications[evt.id] || { push: false, email: false, whatsapp: false };
                return (
                  <tr key={evt.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <p className="font-bold text-white">{evt.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{evt.desc}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.push}
                        onChange={() => handleToggleChannel(evt.id, 'push')}
                        className="w-4 h-4 rounded border-zinc-700 text-violet-500 focus:ring-violet-500 accent-violet-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.email}
                        onChange={() => handleToggleChannel(evt.id, 'email')}
                        className="w-4 h-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500 accent-sky-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={row.whatsapp}
                        onChange={() => handleToggleChannel(evt.id, 'whatsapp')}
                        className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quiet Hours & Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
          <div className="p-4 rounded-2xl border border-zinc-800 bg-black/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-white">Quiet Hours (Do Not Disturb)</span>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-violet-500 focus:ring-violet-500 accent-violet-500 cursor-pointer"
              />
            </div>
            {quietHoursEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">Start</label>
                  <input
                    type="time"
                    value={quietHoursStart}
                    onChange={(e) => setQuietHoursStart(e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-black py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
                <span className="text-slate-500 pt-4">to</span>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-400">End</label>
                  <input
                    type="time"
                    value={quietHoursEnd}
                    onChange={(e) => setQuietHoursEnd(e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-black py-1.5 px-2.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl border border-zinc-800 bg-black/40 space-y-2">
            <label className="block text-xs font-bold text-white">Summary Frequency</label>
            <select
              value={notificationFrequency}
              onChange={(e) => setNotificationFrequency(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black py-2.5 px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="instant">Instant (Immediate push/email upon event)</option>
              <option value="daily">Daily Summary (Consolidated 9:00 PM digest)</option>
              <option value="weekly">Weekly Digest (Sunday evening synthesis)</option>
            </select>
            <p className="text-[11px] text-slate-400">Configures non-critical insight report delivery</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Transaction Display */}
      <div className="rounded-3xl border border-zinc-800 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-outfit">Transaction Display</h3>
            <p className="text-xs text-slate-400">Set default sort order, date ranges, and list visual density</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Density */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Row Density
            </label>
            <select
              value={transactionDensity}
              onChange={(e) => setTransactionDensity(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="comfortable">Comfortable (Standard spacing with icons)</option>
              <option value="compact">Compact (Dense data view for fast review)</option>
            </select>
          </div>

          {/* Default Sorting */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Default Sorting
            </label>
            <select
              value={defaultTransactionSorting}
              onChange={(e) => setDefaultTransactionSorting(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
            </select>
          </div>

          {/* Default Date Range */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Default Date Range
            </label>
            <select
              value={defaultTransactionDateRange}
              onChange={(e) => setDefaultTransactionDateRange(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-black/60 py-2.5 px-3 text-xs font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">This Year (YTD)</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-black/40">
            <span className="text-xs font-bold text-white">Merchant Logo</span>
            <input
              type="checkbox"
              checked={showMerchantLogo}
              onChange={(e) => setShowMerchantLogo(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-black/40">
            <span className="text-xs font-bold text-white">Description Text</span>
            <input
              type="checkbox"
              checked={showTransactionDescription}
              onChange={(e) => setShowTransactionDescription(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-800 bg-black/40">
            <span className="text-xs font-bold text-white">Completed Only</span>
            <input
              type="checkbox"
              checked={showCompletedOnly}
              onChange={(e) => setShowCompletedOnly(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Data Management & Reset Ledger */}
      <div className="rounded-3xl border border-rose-900/30 bg-[#09090B] p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-outfit">Data Management & Ledger Reset</h3>
            <p className="text-xs text-rose-400">Clear or wipe transaction history</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-rose-950/40 bg-rose-950/10">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white">Reset Transaction Ledger</p>
            <p className="text-[11px] text-slate-400">
              Permanently wipe all transaction entries from your account. Budgets and categories will remain intact.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetLedgerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Ledger</span>
          </button>
        </div>
      </div>

      {/* Save Button Bar (At End of Page) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-zinc-800 bg-[#09090B] shadow-[0_10px_30px_rgba(0,0,0,0.85)]">
        <div>
          <p className="text-sm font-bold text-white font-outfit">Save Configuration</p>
          <p className="text-xs text-slate-400 mt-0.5">All changes will be updated and synced across your account</p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Delete All Modal */}
      <DeleteAllTransactionsModal
        isOpen={isResetLedgerOpen}
        onClose={() => setIsResetLedgerOpen(false)}
        onSuccess={() => {
          toast.success('Transaction ledger reset complete.');
        }}
      />
    </div>
  );
};

export default PreferencesCard;

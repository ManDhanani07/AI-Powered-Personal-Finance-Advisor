import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Plus,
  Users,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminNotifications = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('System Announcement');
  const [segment, setSegment] = useState('All Users');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getNotifications();
      setBroadcasts(res?.broadcasts || []);
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
      showToast.error('Failed to load notifications history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast.error('Please enter a title and message content.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createBroadcast({ title, type, segment, content });
      showToast.success('Platform announcement broadcast dispatched successfully.');
      setIsComposing(false);
      setTitle('');
      setContent('');
      loadBroadcasts();
    } catch (err) {
      console.error('Failed to send broadcast:', err);
      showToast.error('Failed to dispatch broadcast.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-mono">Loading notification broadcast history…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-white font-outfit">Platform Broadcast & Notification Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dispatch system-wide maintenance notices, security alerts, and feature updates across user segments.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Compose Broadcast</span>
        </button>
      </div>

      {/* ── Composer Modal / Drawer ── */}
      {isComposing && (
        <form onSubmit={handleSendBroadcast} className="p-6 rounded-3xl border border-zinc-800 bg-[#09090B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-black text-white font-outfit">Compose Platform Broadcast</h3>
            <button
              type="button"
              onClick={() => setIsComposing(false)}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance Notice"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Announcement Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="System Announcement">System Announcement</option>
                <option value="Maintenance">Maintenance Alert</option>
                <option value="Security Alert">Security Alert</option>
                <option value="Feature Announcement">Feature Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Segment</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 px-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="All Users">All Registered Users</option>
                <option value="Active Users">Active Users Only (MAU)</option>
                <option value="Suspended Users">Suspended Users Segment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 text-xs">Message Body</label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the complete announcement content for users..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching…' : 'Dispatch Broadcast'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Broadcasts History Table ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-black text-white font-outfit">Broadcast Log & Delivery Metrics</h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Push & WebSocket Delivery</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Broadcast ID</th>
                <th className="py-3.5 px-4">Title / Subject</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Target Segment</th>
                <th className="py-3.5 px-4 text-center">Sent</th>
                <th className="py-3.5 px-4 text-center">Delivered</th>
                <th className="py-3.5 px-4 text-center">Read</th>
                <th className="py-3.5 px-4">Sent Time</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{b.id}</td>
                  <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{b.title}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{b.type}</td>
                  <td className="py-3 px-4 text-indigo-400 font-semibold">{b.target_segment}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">{b.sent_count?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{b.delivered_count?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sky-400">{b.read_count?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{b.sent_at}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" /> {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;

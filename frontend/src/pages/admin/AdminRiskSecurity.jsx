import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  UserX,
  Activity,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Radio,
} from 'lucide-react';
import adminService from '../../services/adminService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const AdminRiskSecurity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRiskSecurityOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load risk and security telemetry:', err);
      showToast.error('Failed to load security overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (alertId) => {
    try {
      await adminService.resolveSecurityAlert({ alert_id: alertId });
      showToast.success(`Security alert marked as resolved.`);
      loadData();
    } catch {
      showToast.error('Failed to resolve security alert.');
    }
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-xs text-slate-400 font-mono">Scanning platform security perimeter and audit logs…</p>
      </div>
    );
  }

  const o = data?.overview || {};
  const rawEvents = data?.events || [];
  const events = filterSeverity === 'ALL'
    ? rawEvents
    : rawEvents.filter((e) => e.severity?.toUpperCase() === filterSeverity);

  const highSeverityCount = rawEvents.filter((e) => e.severity?.toUpperCase() === 'HIGH').length;

  return (
    <div className="space-y-6 max-w-[1920px] w-full mx-auto">
      {/* ── Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800 bg-[#09090B] shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            {highSeverityCount > 0 ? (
              <ShieldAlert className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-outfit">Risk & Platform Security Center</h2>
              {highSeverityCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {highSeverityCount} High Severity
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ● Perimeter Secure
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live anomaly detection, failed login tracking, and genuine security audit events.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
          <span>Scan Perimeter</span>
        </button>
      </div>

      {/* ── Security Telemetry Overview Grid (Genuine live counts from DB, zero fake fallbacks) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SecCard
          label="Failed Logins (24h)"
          value={o.failed_logins_24h ?? 0}
          icon={UserX}
          color="text-amber-400"
          alert={(o.failed_logins_24h ?? 0) > 0}
        />
        <SecCard
          label="Suspicious Sessions"
          value={o.suspicious_sessions ?? 0}
          icon={Activity}
          color="text-rose-400"
          alert={(o.suspicious_sessions ?? 0) > 0}
        />
        <SecCard
          label="Password Resets"
          value={o.password_resets_24h ?? 0}
          icon={KeyRound}
          color="text-indigo-400"
        />
        <SecCard
          label="Token Auth Failures"
          value={o.token_auth_failures ?? 0}
          icon={Lock}
          color="text-sky-400"
        />
        <SecCard
          label="Active Logins (24h)"
          value={o.new_device_logins ?? 0}
          icon={Radio}
          color="text-teal-400"
        />
        <SecCard
          label="Suspicious API Calls"
          value={o.suspicious_api_calls ?? 0}
          icon={ShieldCheck}
          color="text-emerald-400"
        />
      </div>

      {/* ── Security Events & Threat Timeline ── */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden shadow-sm space-y-4">
        <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white font-outfit">Security Incident & Threat Timeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live records of genuine security alerts and administrative audit actions.
            </p>
          </div>

          {rawEvents.length > 0 && (
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="font-semibold text-slate-500">Severity:</span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 py-1.5 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              >
                <option value="ALL">All Severities</option>
                <option value="HIGH">High Severity Only</option>
                <option value="MEDIUM">Medium Severity Only</option>
                <option value="LOW">Low Severity Only</option>
              </select>
            </div>
          )}
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center space-y-2.5 px-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white font-outfit">No Security Incidents Detected</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All user accounts, sessions, and authentication tokens are operating normally with zero active threats or suspicious activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Threat Description</th>
                  <th className="py-3.5 px-4">Target User</th>
                  <th className="py-3.5 px-4">Source IP</th>
                  <th className="py-3.5 px-4">Action Taken</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {events.map((ev) => {
                  const isHigh = ev.severity === 'High';
                  const isMed = ev.severity === 'Medium';

                  return (
                    <tr key={ev.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isHigh
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : isMed
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          {ev.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white max-w-xs">{ev.event}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{ev.user}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{ev.ip}</td>
                      <td className="py-3.5 px-4 text-slate-300">{ev.action_taken}</td>
                      <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">{ev.timestamp}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-400">{ev.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {ev.status !== 'Resolved' && (
                          <button
                            onClick={() => handleResolve(ev.id)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-300 hover:text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Resolve</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const SecCard = ({ label, value, icon: Icon, color, alert }) => (
  <div className={`p-4 rounded-2xl border bg-[#09090B] space-y-2 shadow-sm ${
    alert ? 'border-rose-500/30' : 'border-zinc-800'
  }`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-black font-outfit ${color}`}>{value}</p>
  </div>
);

export default AdminRiskSecurity;

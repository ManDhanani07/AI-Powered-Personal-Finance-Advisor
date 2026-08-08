import React from 'react';
import { ShieldCheck, Lock, Key, CheckCircle } from 'lucide-react';

export const SecuritySection = () => {
  return (
    <section id="security" className="py-20 bg-bg-base border-t border-border-subtle relative overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-border-strong bg-gradient-to-br from-bg-surface via-bg-elevated to-bg-surface p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bank-Grade Security Guarantee</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-outfit">
                Your Data Privacy is Non-Negotiable
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Built on high-level Open Banking security protocols with end-to-end 256-bit AES encryption. We never store bank passwords or sell user financial data.
              </p>
              <div className="mt-6 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>256-Bit AES TLS 1.3 Transport Encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>ISO 27001 & SOC-2 Type II Certified Infrastructure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Strict Zero-Data Selling Policy & Read-Only Access</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle text-center">
                <Lock className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Read-Only Access</p>
                <p className="text-[11px] text-slate-400 mt-1">Cannot initiate money movement or transfers</p>
              </div>
              <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle text-center">
                <Key className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Encrypted Vault</p>
                <p className="text-[11px] text-slate-400 mt-1">Hardware security module (HSM) key management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;

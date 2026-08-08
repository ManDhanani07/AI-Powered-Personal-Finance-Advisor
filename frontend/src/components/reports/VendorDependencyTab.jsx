import React, { useState, useEffect } from 'react';
import { ShoppingBag, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters.js';
import transactionService from '../../services/transactionService.js';

export const VendorDependencyTab = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        const res = await transactionService.getTransactions({ page: 1, limit: 1000 });
        const items = res?.items || res?.data?.items || [];

        // Aggregate by merchant name
        const merchantMap = new Map();

        items.forEach((tx) => {
          const merchantName = tx.merchant || tx.title || 'General Merchant';
          const amount = Math.abs(Number(tx.amount || 0));
          const catName = tx.category?.category_name || 'Expense';

          if (!merchantMap.has(merchantName)) {
            merchantMap.set(merchantName, {
              name: merchantName,
              count: 1,
              totalSpend: amount,
              category: catName,
            });
          } else {
            const existing = merchantMap.get(merchantName);
            existing.count += 1;
            existing.totalSpend += amount;
          }
        });

        // Convert map to array sorted by highest total spend
        const vendorList = Array.from(merchantMap.values())
          .sort((a, b) => b.totalSpend - a.totalSpend)
          .slice(0, 10); // Top 10 merchants

        if (isMounted) setVendors(vendorList);
      } catch (err) {
        console.error('Error loading vendor dependency data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-4 animate-pulse">
        <div className="h-5 bg-slate-800 rounded w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-glass flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="text-base font-extrabold text-white font-outfit">No Vendor Data Recorded</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Log merchant transactions to identify recurring vendor spending and concentration risks.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-glass space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
          Vendor & Merchant Concentration Matrix
        </h3>
        <p className="text-xs text-slate-400">
          Identify top recurring merchant subscriptions and spending frequency aggregated from your transactions.
        </p>
      </div>

      <div className="space-y-3">
        {vendors.map((v) => {
          const riskLevel = v.count > 10 ? 'High' : v.count > 5 ? 'Medium' : 'Low';
          const riskBg =
            riskLevel === 'High'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : riskLevel === 'Medium'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

          return (
            <div
              key={v.name}
              className="p-4 rounded-2xl border border-border-subtle bg-bg-elevated/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{v.name}</h4>
                  <p className="text-slate-400">{v.category} • {v.count} transaction{v.count > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6">
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm block">
                    {formatCurrency(v.totalSpend)}
                  </span>
                  <span className="text-[10px] text-slate-400">Total Spend</span>
                </div>

                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${riskBg}`}>
                  {riskLevel} Frequency
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VendorDependencyTab;

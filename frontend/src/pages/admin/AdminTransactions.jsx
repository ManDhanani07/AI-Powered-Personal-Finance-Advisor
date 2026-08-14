import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import adminService from '../../services/adminService.js';
import { formatCurrency } from '../../utils/formatters.js';

export const AdminTransactions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [txType, setTxType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadTx = async () => {
      setLoading(true);
      try {
        const res = await adminService.getTransactions({ search, tx_type: txType, page, page_size: 20 });
        const payload = res?.data || res || {};
        setItems(payload.items || []);
        setTotalPages(payload.total_pages || 1);
        setTotalCount(payload.total_count || 0);
      } catch (err) {
        console.error('Failed to load admin transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTx();
  }, [search, txType, page]);

  return (
    <div className="space-y-5 max-w-[1920px] w-full mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search platform transactions by title, merchant, user..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Type:</span>
          <select
            value={txType}
            onChange={(e) => { setTxType(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 px-3 text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
            <option value="TRANSFER">Transfer Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-zinc-800 bg-[#09090B] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            <p className="text-xs text-slate-500 font-mono">Loading platform ledger…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Transaction</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Account & Method</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {items.map((tx) => {
                  const isInc = tx.type === 'INCOME';
                  const isTrans = tx.type === 'TRANSFER';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{tx.user_name}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{tx.title}</p>
                        <p className="text-[10px] text-slate-500">{tx.merchant}</p>
                      </td>
                      <td className="py-3 px-4 text-indigo-400 font-medium">{tx.category}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{tx.payment_method}</td>
                      <td className="py-3 px-4 text-slate-400">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className={`font-mono font-bold ${isInc ? 'text-emerald-400' : isTrans ? 'text-indigo-300' : 'text-rose-400'}`}>
                          {isInc ? '+' : '−'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {items.length} of {totalCount} transactions</span>
            <div className="flex items-center space-x-1">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-bold text-white">{page} / {totalPages}</span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;

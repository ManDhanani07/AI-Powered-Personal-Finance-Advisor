import React, { useState } from 'react';
import { CreditCard, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

export const TransactionSummary = ({ transactions = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = transactions.filter((t) => {
    const q = searchTerm.toLowerCase();
    const title = (t.title || '').toLowerCase();
    const cat = (t.category?.category_name || '').toLowerCase();
    const merchant = (t.merchant || '').toLowerCase();
    return title.includes(q) || cat.includes(q) || merchant.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-6 rounded-3xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Transaction Summary Report ({filtered.length} Entries)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Paginated ledger records for the selected period.</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-bg-card border border-border-subtle rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-bg-card/50 text-slate-400 font-extrabold uppercase tracking-wider border-b border-border-subtle">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Title & Merchant</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Method</th>
              <th className="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {paginated.length > 0 ? (
              paginated.map((t) => {
                const isExpense = t.transaction_type === 'EXPENSE';
                return (
                  <tr key={t.id} className="hover:bg-bg-card/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(t.transaction_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white block">{t.title}</span>
                      <span className="text-[10px] text-slate-500">{t.merchant || 'N/A'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-300 border border-primary-500/20">
                        {t.category?.category_name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{t.payment_method || 'UPI'}</td>
                    <td className={`py-3 px-4 text-right font-black ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isExpense ? '-' : '+'}{formatINR(t.amount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No matching transactions found in PostgreSQL.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs text-slate-400">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl bg-bg-card border border-border-subtle hover:bg-border-subtle/50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl bg-bg-card border border-border-subtle hover:bg-border-subtle/50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionSummary;

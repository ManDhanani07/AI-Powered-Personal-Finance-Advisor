import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const day = d.getDate();
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatPaymentMethod = (raw) => {
  if (!raw) return 'Unknown';
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatAccountType = (raw) => {
  if (!raw) return 'Account';
  return raw
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const CATEGORY_COLOR_MAP = {
  'food': '#F43F5E',
  'food & dining': '#F43F5E',
  'dining': '#F43F5E',
  'shopping': '#A855F7',
  'savings': '#10B981',
  'investment': '#10B981',
  'transport': '#3B82F6',
  'transportation': '#3B82F6',
  'travel': '#3B82F6',
  'utilities': '#06B6D4',
  'bills': '#06B6D4',
  'bills & utilities': '#06B6D4',
  'entertainment': '#EC4899',
  'healthcare': '#F59E0B',
  'medical': '#F59E0B',
};

const getCategoryColor = (categoryName, dbColor) => {
  if (dbColor && dbColor !== '#94A3B8' && dbColor !== '#64748b') return dbColor;
  if (!categoryName) return '#94a3b8';
  const key = categoryName.toLowerCase().trim();
  return CATEGORY_COLOR_MAP[key] || dbColor || '#94a3b8';
};

// ── Sort Header Button ────────────────────────────────────────────────────────

const SortHeader = ({ label, field, sortField, sortOrder, onSort, align = 'left' }) => {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
        align === 'right' ? 'justify-end ml-auto text-right' : 'justify-start'
      } ${
        isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <span>{label}</span>
      <ArrowUpDown className={`h-3 w-3 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
    </button>
  );
};

// ── Row Context Menu ──────────────────────────────────────────────────────────

const RowMenu = ({ tx, onView, onEdit, onDuplicate, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 150;
      const menuWidth = 160;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.bottom + 4;
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 4;
      }

      let left = rect.right - menuWidth;
      if (left < 10) left = 10;

      setMenuPos({ top, left });
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const handleScroll = () => setOpen(false);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  return (
    <div className="relative inline-flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className={`p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer ${
          open ? 'opacity-100 text-white bg-zinc-800' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        title="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              zIndex: 99999,
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-40 rounded-xl border border-zinc-800 bg-[#09090B] shadow-2xl py-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
          >
            <MenuItem icon={Eye} label="View Details" onClick={() => { onView(tx); setOpen(false); }} />
            <MenuItem icon={Edit3} label="Edit" onClick={() => { onEdit(tx); setOpen(false); }} />
            <MenuItem icon={Copy} label="Duplicate" onClick={() => { onDuplicate(tx); setOpen(false); }} />
            <div className="my-1 border-t border-zinc-800" />
            <MenuItem
              icon={Trash2}
              label="Delete"
              danger
              onClick={() => { onDelete(tx); setOpen(false); }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors ${
      danger
        ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
        : 'text-slate-300 hover:bg-zinc-800 hover:text-white'
    }`}
  >
    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
    {label}
  </button>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

const TxAvatar = ({ tx }) => {
  const isIncome = tx.transaction_type === 'INCOME';
  const isTransfer = tx.transaction_type === 'TRANSFER';
  const letter = (tx.merchant || tx.title || '?').charAt(0).toUpperCase();

  let ring = 'border-zinc-700';
  let bg = 'bg-zinc-800';
  let text = 'text-slate-300';
  if (isIncome) { ring = 'border-emerald-500/30'; bg = 'bg-emerald-500/10'; text = 'text-emerald-400'; }
  if (isTransfer) { ring = 'border-indigo-500/30'; bg = 'bg-indigo-500/10'; text = 'text-indigo-400'; }

  return (
    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs flex-shrink-0 ${ring} ${bg} ${text}`}>
      {letter}
    </div>
  );
};

// ── Status Dot ────────────────────────────────────────────────────────────────

const StatusDot = ({ tx }) => {
  if (tx.is_deleted) {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
        Deleted
      </span>
    );
  }
  const status = tx.status || 'COMPLETED';
  const map = {
    COMPLETED: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Completed' },
    PENDING:   { dot: 'bg-amber-400',   text: 'text-amber-400',   label: 'Pending'   },
    FAILED:    { dot: 'bg-rose-500',    text: 'text-rose-400',    label: 'Failed'    },
    CANCELLED: { dot: 'bg-rose-400/60', text: 'text-rose-400/70', label: 'Cancelled' },
  };
  const s = map[status] || map.COMPLETED;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ── Empty / Loading States ────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3">
    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <ArrowLeftRight className="w-5 h-5 text-slate-600" />
    </div>
    <p className="text-sm font-medium text-slate-400">No transactions found</p>
    <p className="text-xs text-slate-600">Try adjusting your filters or add a new transaction.</p>
  </div>
);

const LoadingState = () => (
  <div className="py-20 flex flex-col items-center justify-center gap-3">
    <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
    <p className="text-xs text-slate-500">Loading transactions…</p>
  </div>
);

// ── Main Table ────────────────────────────────────────────────────────────────

export const TransactionTable = ({
  transactions = [],
  loading = false,
  sortField,
  sortOrder,
  onSortChange,
  onRowClick,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <LoadingState />
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <table className="w-full min-w-[760px] text-left border-collapse">
        {/* ── Head ── */}
        <thead>
          <tr className="border-b border-zinc-800">
            {/* Transaction */}
            <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider">
              <SortHeader label="Transaction" field="title" sortField={sortField} sortOrder={sortOrder} onSort={onSortChange} />
            </th>
            {/* Category */}
            <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider">
              <SortHeader label="Category" field="category_id" sortField={sortField} sortOrder={sortOrder} onSort={onSortChange} />
            </th>
            {/* Date */}
            <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider">
              <SortHeader label="Date" field="transaction_date" sortField={sortField} sortOrder={sortOrder} onSort={onSortChange} />
            </th>
            {/* Account */}
            <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Account
            </th>
            {/* Status */}
            <th className="py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            {/* Amount */}
            <th className="py-3 px-3 pr-4 text-[11px] font-semibold uppercase tracking-wider text-right">
              <SortHeader label="Amount" field="amount" sortField={sortField} sortOrder={sortOrder} onSort={onSortChange} align="right" />
            </th>
            {/* Actions */}
            <th className="py-3 px-3 w-10" />
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody className="divide-y divide-zinc-900">
          {transactions.map((tx) => {
            const isIncome = tx.transaction_type === 'INCOME';
            const isTransfer = tx.transaction_type === 'TRANSFER';
            const merchantName = tx.merchant || '';

            return (
              <tr
                key={tx.id}
                onClick={() => onRowClick(tx)}
                className="group cursor-pointer transition-colors duration-100 hover:bg-zinc-900/80"
              >

                {/* Transaction: avatar + title + merchant */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TxAvatar tx={tx} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate max-w-[200px] leading-tight">
                        {tx.title}
                      </p>
                      {merchantName && (
                        <p className="text-xs text-slate-500 truncate max-w-[180px] leading-tight mt-0.5">
                          {merchantName}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3.5 px-3">
                  <span
                    className="text-xs font-medium"
                    style={{ color: getCategoryColor(tx.category?.category_name, tx.category?.color) }}
                  >
                    {tx.category?.category_name || 'Uncategorized'}
                  </span>
                </td>

                {/* Date */}
                <td className="py-3.5 px-3">
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDisplayDate(tx.transaction_date)}
                  </span>
                </td>

                {/* Account + Payment Method */}
                <td className="py-3.5 px-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300 leading-tight">
                      {formatAccountType(tx.account_type)}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {formatPaymentMethod(tx.payment_method)}
                    </p>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <StatusDot tx={tx} />
                </td>

                {/* Amount */}
                <td className="py-3.5 px-3 pr-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {isIncome ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : isTransfer ? (
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-bold ${
                        isIncome
                          ? 'text-emerald-400'
                          : isTransfer
                          ? 'text-indigo-300'
                          : 'text-rose-300'
                      }`}
                    >
                      {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-3 text-right">
                  <RowMenu
                    tx={tx}
                    onView={onRowClick}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;

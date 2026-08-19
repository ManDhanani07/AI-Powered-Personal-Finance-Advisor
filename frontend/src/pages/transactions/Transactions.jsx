import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownLeft, ArrowUpRight, Minus, RefreshCw, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';

import transactionService from '../../services/transactionService.js';
import apiClient from '../../api/client.js';
import { formatCompactFinancial } from '../../utils/formatters.js';

import HeaderControlBar from '../../components/transactions/HeaderControlBar.jsx';
import TransactionTable from '../../components/transactions/TransactionTable.jsx';
import TransactionDetailDrawer from '../../components/transactions/TransactionDetailDrawer.jsx';
import PaginationToolbar from '../../components/transactions/PaginationToolbar.jsx';
import TransactionForm from '../../components/transactions/TransactionForm.jsx';
import DeleteTransactionModal from '../../components/transactions/DeleteTransactionModal.jsx';
import CsvImportModal from '../../components/transactions/CsvImportModal.jsx';

export const Transactions = () => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const cached = sessionStorage.getItem('tx_cache_items');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [summary, setSummary] = useState(() => {
    try {
      const cached = sessionStorage.getItem('tx_cache_summary');
      return cached ? JSON.parse(cached) : { total_income: 0, total_expense: 0, net_balance: 0, total_count: 0 };
    } catch {
      return { total_income: 0, total_expense: 0, net_balance: 0, total_count: 0 };
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('tx_cache_items');
    } catch {
      return true;
    }
  });

  const [categories, setCategories] = useState([]);

  // Filtering & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sortField, setSortField] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Drawer & Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

  const [isImportOpen, setIsImportOpen] = useState(false);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        if (res?.data) {
          setCategories(Array.isArray(res.data) ? res.data : res.data.items || []);
        }
      } catch (err) {
        console.warn('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Load Summary Stats
  const loadSummary = useCallback(async () => {
    try {
      const res = await transactionService.getSummary();
      if (res?.data) {
        const sumData = {
          total_income: parseFloat(res.data.total_income) || 0,
          total_expense: parseFloat(res.data.total_expense) || 0,
          net_balance: parseFloat(res.data.net_balance) || 0,
          total_count: res.data.total_count || 0,
        };
        setSummary(sumData);
        sessionStorage.setItem('tx_cache_summary', JSON.stringify(sumData));
      }
    } catch (err) {
      console.warn('Failed to load transaction summary:', err);
    }
  }, []);

  // Load Transactions List from backend database
  const loadTransactions = useCallback(async (silent = false) => {
    if (!silent && !sessionStorage.getItem('tx_cache_items')) setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        sort_by: sortField,
        sort_order: sortOrder,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category_id = selectedCategory;
      if (paymentMethod) params.payment_method = paymentMethod;

      const res = await transactionService.getTransactions(params);
      const items = res?.data?.items || res?.items || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setTransactions(items);
      if (page === 1 && !searchQuery && !selectedCategory) {
        sessionStorage.setItem('tx_cache_items', JSON.stringify(items));
      }
      const paginationMeta = res?.data?.pagination || res?.pagination || {};
      const count = paginationMeta.total_items ?? res?.data?.total_items ?? res?.total_items ?? items.length;
      const computedPages = Math.max(1, Math.ceil(count / pageSize));
      const pages = paginationMeta.total_pages ?? res?.data?.total_pages ?? computedPages;

      setTotalItems(count);
      setTotalPages(pages);
    } catch (err) {
      toast.error(err.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortField, sortOrder, searchQuery, selectedCategory, paymentMethod]);

  useEffect(() => {
    loadTransactions();
    loadSummary();
    const handleLedgerUpdate = () => {
      loadTransactions();
      loadSummary();
    };
    window.addEventListener('ledger_updated', handleLedgerUpdate);
    return () => window.removeEventListener('ledger_updated', handleLedgerUpdate);
  }, [loadTransactions, loadSummary]);


  // Row Click Handler
  const handleRowClick = (tx) => {
    setSelectedTransaction(tx);
    setIsDetailsOpen(true);
  };

  // Create & Edit Triggers
  const handleCreateNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  // Delete Triggers
  const handleDeleteClick = (tx) => {
    setDeletingTransaction(tx);
    setIsDeleteOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.info('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Title', 'Merchant', 'Category', 'Type', 'Amount', 'Payment Method', 'Account', 'Status'];
    const rows = transactions.map((tx) => [
      tx.transaction_date || '',
      tx.title || '',
      tx.merchant || '',
      tx.category?.category_name || '',
      tx.transaction_type || '',
      tx.amount || 0,
      tx.payment_method || '',
      tx.account_type || '',
      tx.is_deleted ? 'Deleted' : 'Completed',
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported!', { icon: '📥' });
  };

  // Action Handlers
  const handleSaveTransaction = (savedTx) => {
    if (savedTx && typeof savedTx === 'object' && savedTx.title) {
      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === savedTx.id ? { ...t, ...savedTx } : t))
        );
      } else {
        setTransactions((prev) => [savedTx, ...prev]);
        setTotalItems((prev) => prev + 1);
      }
    }
    setIsFormOpen(false);
    loadTransactions();
    loadSummary();
  };

  const handleDeleteSuccess = (deletedId) => {
    const targetId = deletedId || deletingTransaction?.id;
    if (targetId) {
      setTransactions((prev) => prev.filter((t) => t.id !== targetId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      try {
        sessionStorage.removeItem('tx_cache_items');
        sessionStorage.removeItem('tx_cache_summary');
      } catch (e) {}
    }
    setIsDeleteOpen(false);
    setDeletingTransaction(null);
    loadTransactions(true);
    loadSummary();
  };


  const handleDuplicateClick = async (tx) => {
    try {
      await transactionService.duplicateTransaction(tx.id);
      toast.success('Transaction duplicated successfully!', { icon: '📋' });
      loadTransactions();
      loadSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate transaction.');
    }
  };

  const hasActiveFilters = !!(searchQuery || selectedCategory || (dateRange && dateRange !== 'ALL') || paymentMethod);
  const netIsPositive = summary.net_balance >= 0;

  // Computed page range for summary
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="space-y-5 max-w-[1920px] w-full mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Transactions</h1>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">Track and manage your income, expenses, and transfers.</p>
        </div>
        <button
          onClick={() => { loadTransactions(); loadSummary(); }}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Search + Filter Toolbar ── */}
      <HeaderControlBar
        searchQuery={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(v) => { setSelectedCategory(v); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={(v) => { setPaymentMethod(v); setPage(1); }}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedCategory('');
          setDateRange('ALL');
          setPaymentMethod('');
          setPage(1);
        }}
        onExportCSV={handleExportCSV}
        onImportCSV={() => setIsImportOpen(true)}
        onAddTransaction={handleCreateNew}
      />

      {/* ── Summary Strip ── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">All Transactions</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-sm font-bold text-white">{totalItems.toLocaleString()} transactions</span>
            {totalItems > 0 && (
              <span className="text-xs text-slate-500">· Showing {startItem}–{endItem}</span>
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[11px] text-slate-500 font-medium">Income</span>
          <span className="text-sm font-bold text-emerald-400">{formatCompactFinancial(summary.total_income)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] text-slate-500 font-medium">Expenses</span>
          <span className="text-sm font-bold text-rose-400">{formatCompactFinancial(summary.total_expense)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Minus className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] text-slate-500 font-medium">Net</span>
          <span className={`text-sm font-bold ${netIsPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netIsPositive ? '+' : ''}{formatCompactFinancial(summary.net_balance)}
          </span>
        </div>
      </div>

      {/* ── Transaction Table ── */}
      <TransactionTable
        loading={loading}
        transactions={transactions}
        onRowClick={handleRowClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortField(field);
            setSortOrder('desc');
          }
        }}
      />

      {/* ── Pagination ── */}
      {totalItems > 0 && (
        <PaginationToolbar
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      )}


      {/* ── Overlays ── */}
      <TransactionDetailDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTransaction}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onDuplicate={handleDuplicateClick}
      />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSaveTransaction}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        categories={categories}
      />

      <DeleteTransactionModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingTransaction(null);
        }}
        onSuccess={handleDeleteSuccess}
        onConfirm={handleDeleteSuccess}
        transaction={deletingTransaction}
      />

      <CsvImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => {
          loadTransactions();
          loadSummary();
        }}
        categories={categories}
      />
    </div>
  );
};

export default Transactions;

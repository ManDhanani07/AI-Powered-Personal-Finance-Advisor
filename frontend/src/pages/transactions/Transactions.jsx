import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

import { PageContainer } from '../../components/layout/PageContainer.jsx';
import transactionService from '../../services/transactionService.js';
import apiClient from '../../api/client.js';

import HeaderControlBar from '../../components/transactions/HeaderControlBar.jsx';
import TransactionTable from '../../components/transactions/TransactionTable.jsx';
import TransactionDetailDrawer from '../../components/transactions/TransactionDetailDrawer.jsx';
import BulkActionDock from '../../components/transactions/BulkActionDock.jsx';
import PaginationToolbar from '../../components/transactions/PaginationToolbar.jsx';
import TransactionForm from '../../components/transactions/TransactionForm.jsx';
import DeleteTransactionModal from '../../components/transactions/DeleteTransactionModal.jsx';

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
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sortField, setSortField] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Drawer & Modal States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);

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

  // Checkbox Selection Logic
  const handleToggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === transactions.length && transactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((tx) => tx.id));
    }
  };

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

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    try {
      await transactionService.deleteTransaction(deletingTransaction.id);
      toast.success('Transaction deleted successfully.', { icon: '🗑️' });
      setIsDeleteOpen(false);
      setSelectedIds(selectedIds.filter((id) => id !== deletingTransaction.id));
      loadTransactions();
      loadSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => transactionService.deleteTransaction(id)));
      toast.success(`${selectedIds.length} transactions deleted!`, { icon: '🗑️' });
      setSelectedIds([]);
      loadTransactions();
      loadSummary();
    } catch (err) {
      toast.error(err.message || 'Failed to bulk delete.');
    }
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

  return (
    <PageContainer
      title="Transaction Ledger & Rules"
      description="Manage historical income, expenses, and automated categorization rules."
      action={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              loadTransactions();
              loadSummary();
            }}
            className="p-2.5 rounded-2xl border border-border-strong bg-bg-surface hover:bg-bg-elevated text-slate-300 hover:text-white transition-all"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 via-indigo-600 to-accent-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <HeaderControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          categories={categories}
          onAddTransaction={handleCreateNew}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('');
            setDateRange('ALL');
            setPaymentMethod('');
          }}
        />

        {/* Data Table */}
        <TransactionTable
          loading={loading}
          transactions={transactions}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectRow={handleToggleSelectRow}
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

        {/* Bottom Pagination Toolbar */}
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

        {/* Sticky Bulk Action Dock */}
        <BulkActionDock
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkDelete={handleBulkDelete}
        />
      </div>

      {/* Drawer & Modal Overlays */}
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
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        transaction={deletingTransaction}
      />
    </PageContainer>
  );
};

export default Transactions;

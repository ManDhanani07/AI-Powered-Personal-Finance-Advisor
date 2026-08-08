import React, { useState, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer.jsx';
import NotificationList from '../../components/notifications/NotificationList.jsx';
import NotificationFilters from '../../components/notifications/NotificationFilters.jsx';
import notificationService from '../../services/notificationService.js';
import { showToast } from '../../components/common/ToastProvider.jsx';

export const Notifications = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  
  const [notifications, setNotifications] = useState(() => {
    try {
      const cached = sessionStorage.getItem('notif_cache_items');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('notif_cache_items');
    } catch {
      return true;
    }
  });

  // Data state
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = async (quiet = false) => {
    if (!sessionStorage.getItem('notif_cache_items')) setLoading(true);
    try {
      const params = { page, page_size: 15 };
      if (activeFilter === 'unread') params.is_read = false;
      if (activeFilter === 'read') params.is_read = true;
      if (['critical', 'high', 'medium', 'low'].includes(activeFilter)) {
        params.priority = activeFilter.toUpperCase();
      }

      const res = await notificationService.getNotifications(params);
      const payload = res?.data ?? res;
      if (payload) {
        setNotifications(payload.items || []);
        if (page === 1 && activeFilter === 'all') {
          sessionStorage.setItem('notif_cache_items', JSON.stringify(payload.items || []));
        }
        setUnreadCount(payload.unread_count || 0);
        setTotalCount(payload.total_count || 0);
        setTotalPages(payload.total_pages || 1);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Load notifications when filter or page changes ─────────────────────────
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, page_size: 15 };
        if (activeFilter === 'unread') params.is_read = false;
        if (activeFilter === 'read') params.is_read = true;
        if (['critical', 'high', 'medium', 'low'].includes(activeFilter)) {
          params.priority = activeFilter.toUpperCase();
        }

        const res = await notificationService.getNotifications(params);
        const payload = res?.data ?? res;
        if (isMounted && payload) {
          setNotifications(payload.items || []);
          setUnreadCount(payload.unread_count || 0);
          const tCount = payload.total_count || (payload.items || []).length;
          setTotalCount(tCount);
          setTotalPages(payload.total_pages || Math.max(1, Math.ceil(tCount / 15)));
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        if (isMounted && err?.status !== 401) {
          showToast.error('Failed to load notifications.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [activeFilter, page]);

  // ── Action Handlers ────────────────────────────────────────────────────────
  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast.success('Notification marked as read.');
    } catch {
      showToast.error('Failed to update notification.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast.success('All notifications marked as read!');
    } catch {
      showToast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      showToast.success('Notification deleted.');
    } catch {
      showToast.error('Failed to delete notification.');
    }
  };

  return (
    <PageContainer
      title="Smart Financial Notification Center"
      description="PostgreSQL-driven dynamic alert engine monitoring budgets, goals, health scores, and predictive cash flow risks in real-time."
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between bg-bg-surface/80 backdrop-blur-xl border border-border-subtle p-5 sm:p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-inner flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">Active Alert Engine</h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 leading-none">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Automated PostgreSQL alert rules active</p>
            </div>
          </div>
        </div>

        {/* Filters Pill Bar */}
        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={(f) => {
            setActiveFilter(f);
            setPage(1);
          }}
          counts={{ unread: unreadCount, all: totalCount }}
        />

        {/* Main Notification List Content */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
              Fetching PostgreSQL Notifications...
            </p>
          </div>
        ) : (
          <NotificationList
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDelete}
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
            unreadCount={unreadCount}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default Notifications;

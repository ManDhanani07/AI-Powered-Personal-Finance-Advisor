import React, { useState, useEffect } from 'react';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
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

  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
      title="Notifications"
      description="Stay updated on budget alerts, savings targets, and account activity."
      action={
        unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-slate-950" />
            <span>Mark All as Read</span>
          </button>
        )
      }
    >
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Filters Bar */}
        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={(f) => {
            setActiveFilter(f);
            setPage(1);
          }}
          counts={{ unread: unreadCount, all: totalCount }}
        />

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            <p className="text-xs text-slate-500 font-medium">
              Loading notifications…
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

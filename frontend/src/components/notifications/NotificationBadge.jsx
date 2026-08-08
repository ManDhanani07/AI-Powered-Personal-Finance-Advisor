import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationBell from './NotificationBell.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import notificationService from '../../services/notificationService.js';
import { showToast } from '../common/ToastProvider.jsx';

export const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotifications, setLatestNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  // ── Fetch unread data ──────────────────────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadSummary(5);
      const payload = res?.data ?? res;
      if (payload) {
        setUnreadCount(payload.unread_count || 0);
        setLatestNotifications(payload.latest_notifications || []);
      }
    } catch {
      // Background polling fails silently
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setLatestNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast.success('All notifications marked as read.');
    } catch {
      showToast.error('Failed to mark notifications as read.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setLatestNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      showToast.error('Failed to mark notification as read.');
    }
  };

  const togglePopover = () => {
    setIsOpen((prev) => {
      if (!prev) fetchUnread();
      return !prev;
    });
  };

  return (
    <div className="relative" ref={bellRef}>
      <NotificationBell
        unreadCount={unreadCount}
        onClick={togglePopover}
        isOpen={isOpen}
      />

      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown
            unreadCount={unreadCount}
            latestNotifications={latestNotifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;

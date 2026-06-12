import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
// Socket is managed by useSocket hook — no direct io() import needed
import {
  HiBell,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiTrash,
  HiXCircle,
  HiTicket,
  HiArrowLeftOnRectangle,
  HiCog6Tooth,
} from 'react-icons/hi2';
import { Bell } from 'lucide-react';
import api from '../../services/api.js';
import { useSocket } from '../../hooks/useSocket.js';

function isNotificationUnread(n) {
  return !(n?.isRead ?? n?.read);
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const abortRef = useRef(null);
  const { socket, connected } = useSocket();

  // Determine if user is superadmin
  const role = String(user?.role || user?.panel || '').toLowerCase().replace(/_/g, '');
  const isSuperadmin = role === 'superadmin';

  // Sound settings state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('hris_notification_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('hris_notification_sound_volume');
    return saved !== null ? parseFloat(saved) : 0.6;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Persist sound settings
  useEffect(() => {
    localStorage.setItem('hris_notification_sound_enabled', soundEnabled);
    localStorage.setItem('hris_notification_sound_volume', soundVolume);
  }, [soundEnabled, soundVolume]);

  const lastSoundTime = useRef(0);

  const playNotificationSound = useCallback((priority) => {
    if (!soundEnabled) return;
    const now = Date.now();
    // Deduplication: prevent stacking within 1.5 seconds
    if (now - lastSoundTime.current < 1500) return;
    lastSoundTime.current = now;

    try {
      // In a real app we'd load different sounds based on priority, e.g., high.mp3 vs normal.mp3
      // We will use standard notification.mp3 and adjust logic if needed.
      const audio = new Audio('/assets/sounds/notification.mp3');
      audio.volume = soundVolume;
      audio.play().catch(e => console.warn('Audio play failed (browser policy)', e));
    } catch (err) {
      // Ignore audio errors
    }
  }, [soundEnabled, soundVolume]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Abort any in-flight request from a previous call before starting a new one.
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    try {

      const response = await api.get('/notifications', { signal })

      if (signal.aborted) return;

      // Extract notifications from various possible response structures
      const notificationsList = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.notifications)
          ? response.data.notifications
          : Array.isArray(response.data?.data?.notifications)
            ? response.data.data.notifications
            : Array.isArray(response.data?.data)
              ? response.data.data
              : [];

      const mappedNotifications = notificationsList.map((n) => {
        const mapped = {
          id: n.id ?? n.notificationId ?? n._id ?? null,
          title: n.title ?? n.subject ?? 'Notification',
          message: n.message ?? n.body ?? n.description ?? '',
          // CRITICAL: Handle both snake_case (backend) and camelCase - normalize to isRead
          isRead: typeof n.isRead === 'boolean'
            ? n.isRead
            : typeof n.is_read === 'boolean'
              ? n.is_read
              : typeof n.read === 'boolean'
                ? n.read
                : false,
          ticketId: n.ticketId ?? n.ticket_id ?? n.relatedId ?? n.referenceId ?? null,
          relatedId: n.relatedId ?? n.ticketId ?? n.ticket_id ?? null,
          type: n.type ?? 'info',
          forAdmin: n.forAdmin ?? n.for_admin ?? false,
          // CRITICAL: Handle both snake_case and camelCase for timestamps
          createdAt: n.createdAt ?? n.created_at ?? null,
          time:
            n.time ||
            (n.createdAt || n.created_at
              ? `${new Date(n.createdAt ?? n.created_at).toLocaleDateString()} ${new Date(n.createdAt ?? n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ''),
        };

        return mapped;
      });

      setNotifications(mappedNotifications);
      
      // Calculate unread count
      const unread = mappedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error('[NOTIFICATION DROPDOWN] Error fetching notifications:', err);
      // Keep silent on client feed sync errors
    }
  }, []);

  // Fetch unread count separately for accuracy
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      const count = response.data?.count ?? response.data?.unreadCount ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('[NOTIFICATION DROPDOWN] Error fetching unread count:', err);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [user?.id, fetchNotifications]);

  const allCount = notifications.length;
  const readCount = notifications.filter(n => n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  // Use the shared authenticated socket from useSocket().
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification) => {
      if (notification?.priority === 'HIGH' || notification?.priority === 'NORMAL') {
        playNotificationSound(notification.priority);
      }
      fetchNotifications();
      fetchUnreadCount();
    };

    // Re-sync when this user marks notifications read elsewhere (another tab/device).
    const handleReadState = () => { fetchNotifications(); fetchUnreadCount(); };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_read', handleReadState);
    socket.on('ticket:created', () => { fetchNotifications(); fetchUnreadCount(); });
    socket.on('ticket:updated', () => { fetchNotifications(); fetchUnreadCount(); });

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_read', handleReadState);
      socket.off('ticket:created');
      socket.off('ticket:updated');
    };
  }, [socket, connected, fetchNotifications, fetchUnreadCount, playNotificationSound]);

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  const markAsRead = async (id) => {
    try {
      // Optimistically update frontend
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Call API to persist
      await api.patch(`/notifications/${id}/mark-read`);
      
      // Refetch to ensure consistency
      await fetchUnreadCount();
    } catch (err) {
      console.error('[NOTIFICATION DROPDOWN] Failed to mark notification read:', err);
      // Refetch on error to revert
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistically update frontend
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Call API to persist
      await api.patch('/notifications/mark-all-read');
      
      // Refetch to ensure consistency
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('[NOTIFICATION DROPDOWN] Failed to mark all notifications read:', err);
      // Refetch on error to revert
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    try {
      await api.delete(`/notifications/${id}`);
      await fetchUnreadCount();
    } catch (err) {
      console.error('[NOTIFICATION DROPDOWN] Failed to delete notification:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="h-5 w-5 text-success-DEFAULT" />;
      case 'warning':
        return <HiExclamationCircle className="h-5 w-5 text-warning-DEFAULT" />;
      case 'danger':
      case 'error':
        return <HiXCircle className="h-5 w-5 text-danger-DEFAULT" />;
      case 'exit_management':
        return <HiArrowLeftOnRectangle className="h-5 w-5 text-danger-DEFAULT hover:scale-110 transition-transform" />;
      case 'support_ticket':
        return <HiTicket className="h-5 w-5 text-blue-500 hover:scale-110 transition-transform" />;
      default:
        return <HiInformationCircle className="h-5 w-5 text-primary" />;
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // If it has a direct redirectUrl, go there
    if (notification.redirectUrl) {
      setIsOpen(false);
      navigate(notification.redirectUrl);
      return;
    }

    // Fallback for legacy ticket handling
    const ticketId = notification.ticketId || notification.relatedId;
    if (notification.type === 'support_ticket' && ticketId) {
      const supportPath = isSuperadmin ? `/superadmin/support` : `/admin/support`;
      setIsOpen(false);
      navigate(`${supportPath}#ticket-${ticketId}`);
      return;
    }

    // Otherwise, show the modal
    setSelectedNotification(notification);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl z-[9999] max-h-[520px] overflow-y-auto overflow-x-hidden max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-14 max-sm:mt-0 max-sm:w-auto max-sm:max-w-[calc(100vw-24px)] max-sm:max-h-[80vh]">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              Notifications
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Settings"
              >
                <HiCog6Tooth className="h-4 w-4" />
              </button>
            </h3>

            {notifications.length > 0 && !showSettings && unreadCount > 0 && (
              <button
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {!showSettings && (
            <div className="flex border-b border-slate-200 px-2 py-1 bg-slate-50/80 gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-background-primary text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'}`}
              >
                All ({allCount})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'unread' ? 'bg-background-primary text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${filter === 'read' ? 'bg-background-primary text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary/50'}`}
              >
                Read ({readCount})
              </button>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-white max-h-[380px] overflow-y-auto">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Sound Preferences</h4>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-600 font-medium">Enable Sounds</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                  <span>Volume</span>
                  <span>{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
              </div>

              <button
                onClick={() => playNotificationSound('NORMAL')}
                disabled={!soundEnabled}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Test Sound
              </button>
            </div>
          )}

          {/* Notification List */}
          {!showSettings && (
            <div className="max-h-[380px] overflow-y-auto bg-white">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-background-tertiary/50 transition-all duration-150 relative group cursor-pointer ${!n.isRead ? 'bg-primary/5' : 'bg-white'} hover:bg-slate-100`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!n.isRead ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            {n.time}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-danger-DEFAULT transition-all"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                      {!n.isRead && (
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary shadow-md" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <HiBell className="h-10 w-10 text-text-tertiary mx-auto opacity-20 mb-3 animate-pulse" />
                  <p className="text-sm text-text-tertiary capitalize">No {filter !== 'all' ? filter : ''} notifications</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="p-3 border-t border-border-tertiary bg-background-secondary/30 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-text-secondary hover:text-primary transition-colors uppercase tracking-wider"
            >
              Close View
            </button>
          </div>
        </div>
      )}

      {/* PopUp / Modal Overlay */}
      {
        selectedNotification && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div
              className="relative w-full max-w-md mx-4 rounded-2xl border border-border-tertiary bg-background-primary p-6 shadow-2xl transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start gap-4 border-b border-border-tertiary pb-4 mb-4">
                <div className="p-2.5 rounded-xl bg-background-secondary/50 self-start">
                  {getIcon(selectedNotification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-text-primary leading-snug">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-xs text-text-tertiary mt-1 flex items-center gap-2">
                    <span>{selectedNotification.time}</span>
                    <span>•</span>
                    <span className="capitalize font-semibold text-primary">{selectedNotification.type || 'info'}</span>
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="py-2 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap max-h-[250px] overflow-y-auto pr-1">
                {selectedNotification.message}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 border-t border-border-tertiary pt-4">
                {selectedNotification.type === 'support_ticket' && selectedNotification.ticketId && !selectedNotification.redirectUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNotification(null);
                      const supportPath = isSuperadmin ? `/superadmin/support` : `/admin/support`;
                      navigate(`${supportPath}#ticket-${selectedNotification.ticketId}`);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-150 flex items-center gap-1.5"
                  >
                    <HiTicket className="h-4 w-4" />
                    View Ticket
                  </button>
                )}
                {selectedNotification.redirectUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedNotification(null);
                      navigate(selectedNotification.redirectUrl);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-150 flex items-center gap-1.5"
                  >
                    View Details
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold bg-danger-light text-danger-DEFAULT hover:bg-danger-DEFAULT hover:text-white transition-all duration-150 flex items-center gap-1.5"
                >
                  <HiTrash className="h-4.5 w-4.5" />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-xl px-5 py-2 text-xs font-bold border border-border-tertiary text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-all duration-150"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { HiBell, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiTrash } from 'react-icons/hi2';
import api from '../../services/api.js';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      if (data?.data && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    } catch (err) {
      // Keep silent on client feed sync errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live corporate alerts
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };
  
  const markAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.patch('/notifications/mark-all-read');
    } catch (err) {}
  };

  const deleteNotification = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <HiCheckCircle className="h-5 w-5 text-success-DEFAULT" />;
      case 'warning': return <HiExclamationCircle className="h-5 w-5 text-warning-DEFAULT" />;
      default: return <HiInformationCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative rounded-lg p-2 text-text-secondary hover:bg-background-secondary transition-colors"
        aria-label="Notifications"
      >
        <HiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger-DEFAULT text-[10px] font-bold text-white ring-2 ring-background-primary">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border-tertiary bg-background-primary shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border-tertiary">
              <h3 className="font-bold text-text-primary">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border-tertiary">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-background-tertiary/50 transition-colors relative group ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-text-tertiary mt-1 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-text-tertiary mt-2 flex items-center gap-1">
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
                      {!n.read && (
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <HiBell className="h-10 w-10 text-text-tertiary mx-auto opacity-20 mb-3" />
                  <p className="text-sm text-text-tertiary">No new notifications</p>
                </div>
              )}
            </div>
            <div className="p-3 border-t border-border-tertiary bg-background-secondary/30 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-text-secondary hover:text-primary transition-colors uppercase tracking-wider"
              >
                Close View
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

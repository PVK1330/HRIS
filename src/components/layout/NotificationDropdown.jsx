import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  HiBell, 
  HiBellAlert, 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiInformationCircle, 
  HiTrash,
  HiXCircle,
  HiArrowLeftOnRectangle
} from 'react-icons/hi2';
import api from '../../services/api.js';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectedNotification, setSelectedNotification] = useState(null);
  const dropdownRef = useRef(null);

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

  const allCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

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
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    try {
      await api.delete(`/notifications/${id}`);
    } catch (err) {}
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
      default: 
        return <HiInformationCircle className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative rounded-lg p-2 text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-all duration-200"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <HiBellAlert className="h-5 w-5 text-primary scale-105 hover:scale-110 transition-all" />
        ) : (
          <HiBell className="h-5 w-5 hover:scale-115 transition-all" />
        )}
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-background-primary animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border-tertiary bg-background-primary shadow-2xl z-50 overflow-hidden">
            
            {/* Header */}
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

            {/* Filter Tabs */}
            <div className="flex border-b border-border-tertiary px-2 py-1 bg-background-secondary/30 gap-1">
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

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-border-tertiary">
                  {filteredNotifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-background-tertiary/50 transition-all duration-150 relative group cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        markAsRead(n.id);
                        setSelectedNotification(n);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="mt-0.5">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${!n.read ? 'text-text-primary font-bold' : 'text-text-secondary'}`}>
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
                  <HiBell className="h-10 w-10 text-text-tertiary mx-auto opacity-20 mb-3 animate-pulse" />
                  <p className="text-sm text-text-tertiary capitalize">No {filter !== 'all' ? filter : ''} notifications</p>
                </div>
              )}
            </div>

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
      {selectedNotification && createPortal(
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
      )}
    </div>
  );
}

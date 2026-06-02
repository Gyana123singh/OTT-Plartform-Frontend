import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Bell, 
  X, 
  Check, 
  Clock, 
  UserPlus, 
  Tv, 
  MessageSquare, 
  Gift, 
  Video, 
  Trash2,
  BellOff
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const getIconForType = (type) => {
  switch (type) {
    case 'live':
      return Tv;
    case 'follow':
      return UserPlus;
    case 'comment':
      return MessageSquare;
    case 'gift':
      return Gift;
    case 'video':
      return Video;
    default:
      return Bell;
  }
};

const getColorForType = (type) => {
  switch (type) {
    case 'live':
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    case 'follow':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'comment':
      return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
    case 'gift':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'video':
      return 'text-violet-500 bg-violet-500/10 border-violet-500/20';
    default:
      return 'text-slate-400 bg-slate-400/10 border-white/5';
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// --- In-App Self-Dismissing Toast Component ---
const ToastItem = ({ toast, onClose, onClick }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon = getIconForType(toast.type);
  const colorClass = getColorForType(toast.type);

  // Parse sender avatar
  let avatarUrl = null;
  if (toast.sender && toast.sender.avatar) {
    avatarUrl = toast.sender.avatar.startsWith('http') || toast.sender.avatar.startsWith('data:')
      ? toast.sender.avatar
      : `${SOCKET_URL}/${toast.sender.avatar.replace(/\\/g, '/').replace(/^\//, '')}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9, y: 0 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 50, scale: 0.9, y: -10 }}
      layout
      className="w-80 bg-dark-lighter/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex gap-3 cursor-pointer select-none hover:border-primary/40 hover:shadow-primary/5 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="shrink-0 relative">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={toast.sender?.name || 'Sender'} 
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-white/10" 
          />
        ) : (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} border`}>
            <Icon size={18} />
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-dark-lighter flex items-center justify-center text-[10px] ${colorClass}`}>
          <Icon size={10} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{toast.type} alert</p>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="text-slate-500 hover:text-white p-0.5 rounded transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <p className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-primary transition-colors">{toast.title}</p>
        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">{toast.desc}</p>
      </div>
    </motion.div>
  );
};

const NotificationCenter = ({ isOpen, onClose, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unread', 'streams'
  
  const navigate = useNavigate();
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Sync unreadCount with MainLayout
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    if (onUnreadChange) {
      onUnreadChange(unread);
    }
  }, [notifications, onUnreadChange]);

  // Load notifications history & bind Socket.io Client
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const token = localStorage.getItem('token');
    if (!token || !user._id) return;

    const fetchHistory = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications history:", err);
      }
    };
    fetchHistory();

    // Bind websocket
    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('📡 Notification socket room registration successful');
      socket.emit('join_user_room', user._id);
    });

    socket.on('new_notification', (newNotif) => {
      setNotifications((prev) => {
        // Avoid duplicate rendering
        if (prev.some(n => n._id === newNotif._id)) return prev;

        // If Notification Dropdown is closed, trigger an interactive Toast banner
        if (!isOpenRef.current) {
          setToasts((prevToasts) => {
            // Keep maximum 3 toasts visible on screen
            const current = [...prevToasts, { ...newNotif, toastId: Date.now() }];
            if (current.length > 3) {
              current.shift();
            }
            return current;
          });
        }

        return [newNotif, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      onClose();
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleToastClick = async (toast) => {
    try {
      if (!toast.isRead) {
        await markNotificationAsRead(toast._id);
        setNotifications((prev) =>
          prev.map(n => (n._id === toast._id ? { ...n, isRead: true } : n))
        );
      }
      setToasts((prev) => prev.filter(t => t.toastId !== toast.toastId));
      if (toast.link) {
        navigate(toast.link);
      }
    } catch (err) {
      console.error("Failed to process toast click:", err);
    }
  };

  // Filtering Logic
  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'unread') return !notif.isRead;
    if (activeFilter === 'streams') return notif.type === 'live';
    return true;
  });

  return (
    <>
      {/* Floating Viewport Toast Containers */}
      <div className="fixed top-20 right-4 flex flex-col gap-3 z-[9999] pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.toastId}
              toast={toast}
              onClose={() => setToasts((prev) => prev.filter(t => t.toastId !== toast.toastId))}
              onClick={() => handleToastClick(toast)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Main Notification Dropdown Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay backdrop block */}
            <div className="fixed inset-0 z-40 bg-transparent" onClick={onClose} />
            
            <motion.div 
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed sm:absolute top-20 sm:top-16 right-4 sm:right-0 left-4 sm:left-auto w-auto sm:w-[360px] bg-dark-lighter/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header Title */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm tracking-wide">
                  <Bell size={16} className="text-primary animate-pulse" /> Notifications
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleMarkAllRead} 
                    title="Mark all as read"
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <Check size={15} />
                  </button>
                  <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* YouTube Filter Tags */}
              <div className="px-4 py-2 border-b border-white/5 flex gap-2 overflow-x-auto select-none no-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'streams', label: 'Streams' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      activeFilter === filter.id 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              {/* Notifications Feed */}
              <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    const Icon = getIconForType(notif.type);
                    const colorClass = getColorForType(notif.type);
                    
                    // Parse sender avatar
                    let avatarUrl = null;
                    if (notif.sender && notif.sender.avatar) {
                      avatarUrl = notif.sender.avatar.startsWith('http') || notif.sender.avatar.startsWith('data:')
                        ? notif.sender.avatar
                        : `${SOCKET_URL}/${notif.sender.avatar.replace(/\\/g, '/').replace(/^\//, '')}`;
                    }

                    return (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 flex gap-3 relative group ${
                          notif.isRead ? 'opacity-70 hover:opacity-100 bg-transparent' : 'bg-white/[0.02] hover:bg-white/5'
                        }`}
                      >
                        {/* Unread Glowing Ring Dot */}
                        {!notif.isRead && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                        )}

                        {/* Avatar or Type Icon */}
                        <div className="shrink-0 relative">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={notif.sender?.name || 'Sender'} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-white/10" 
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} border`}>
                              <Icon size={18} />
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-dark-lighter flex items-center justify-center text-[10px] ${colorClass}`}>
                            <Icon size={10} />
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs font-bold text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.desc}
                          </p>
                          <p className="text-[9px] text-slate-500 flex items-center gap-1 font-bold mt-1 uppercase tracking-wider">
                            <Clock size={9} /> {formatTimeAgo(notif.createdAt)}
                          </p>
                        </div>

                        {/* Individual Delete Action */}
                        <button 
                          onClick={(e) => handleDelete(e, notif._id)}
                          title="Delete notification"
                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-500 transition-all duration-300"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center space-y-3 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-slate-600">
                      <BellOff size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">No notifications found</p>
                      <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Notifications for subscription streams, followers, and comments will show up here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bottom Quick-actions bar */}
              <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                  {notifications.filter(n => !n.isRead).length} UNREAD
                </span>
                <button 
                  onClick={handleMarkAllRead}
                  disabled={notifications.filter(n => !n.isRead).length === 0}
                  className="py-1.5 px-3 text-[10px] font-bold text-primary hover:bg-primary/10 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-all uppercase tracking-widest"
                >
                  Mark all read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;

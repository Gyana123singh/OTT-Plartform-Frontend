import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, UserPlus, Tv, Gift } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'live',
    title: 'Live Now: Sonic Waves',
    desc: 'Started a new music session.',
    time: '2m ago',
    icon: Tv,
    color: 'text-primary'
  },
  {
    id: 2,
    type: 'follow',
    title: 'New Follower',
    desc: 'Sarah Miller followed you.',
    time: '15m ago',
    icon: UserPlus,
    color: 'text-green-500'
  },
  {
    id: 3,
    type: 'gift',
    title: 'Gift Received',
    desc: 'You received a Super Star gift!',
    time: '1h ago',
    icon: Gift,
    color: 'text-yellow-500'
  }
];

const NotificationCenter = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div className="fixed inset-0 z-40" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed sm:absolute top-20 sm:top-16 right-4 sm:right-0 left-4 sm:left-auto w-auto sm:w-80 bg-dark-lighter border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell size={16} className="text-primary" /> Notifications
              </h3>
              <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-slate-500">
                <X size={16} />
              </button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {NOTIFICATIONS.length > 0 ? (
                NOTIFICATIONS.map((notif) => (
                  <div key={notif.id} className="p-4 hover:bg-white/5 border-b border-white/5 cursor-pointer transition-all group">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${notif.color}`}>
                        <notif.icon size={20} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{notif.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-1">{notif.desc}</p>
                        <p className="text-[10px] text-slate-600 flex items-center gap-1 font-bold">
                          <Clock size={10} /> {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2">
                  <Bell size={32} className="mx-auto text-slate-700" />
                  <p className="text-sm text-slate-500">No notifications yet.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-white/5">
              <button className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all uppercase tracking-widest">
                Mark all as read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;

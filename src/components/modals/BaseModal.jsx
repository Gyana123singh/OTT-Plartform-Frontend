import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const BaseModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full ${maxWidth} bg-dark-lighter border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]`}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2">
                <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-all hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;

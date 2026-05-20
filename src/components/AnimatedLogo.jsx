import React from 'react';
import { motion } from 'framer-motion';

const AnimatedLogo = ({ className, position = "bottom-right" }) => {
  const positionClasses = {
    "bottom-right": "bottom-10 right-10",
    "bottom-left": "bottom-10 left-10",
    "top-right": "top-10 right-10",
    "top-left": "top-10 left-10",
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position] || positionClasses["bottom-right"]} ${className}`}>
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Particle Glow Background */}
        <motion.div 
          className="absolute inset-0 bg-accent/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
        
        {/* Particle Animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100"
            animate={{
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 2 + Math.random(),
              delay: i * 0.2
            }}
          />
        ))}

        {/* Main Logo */}
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[0_0_30px_rgba(244,63,94,0.4)] border border-white/20 relative z-10 overflow-hidden">
           <span className="relative z-10">G+</span>
           <motion.div 
             className="absolute inset-0 bg-white/20"
             animate={{ x: ['-100%', '100%'] }}
             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
           />
        </div>
      </motion.div>
    </div>
  );
};

export default AnimatedLogo;

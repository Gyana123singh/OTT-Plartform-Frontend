import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, Key, ArrowRight, Fingerprint, Eye, EyeOff, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      setLoading(false);
      navigate('/admin-panel');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Matrix-like Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card p-6 md:p-10 space-y-6 md:space-y-8 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center space-y-3 md:space-y-4">
            <motion.div 
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-tr from-primary to-accent rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            >
              <Shield size={32} className="md:w-10 md:h-10 text-white" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Admin Gateway</h1>
              <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
            </div>
          </div>

          <form className="space-y-5 md:space-y-6" onSubmit={handleLogin}>
            <div className="space-y-3 md:space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  <Fingerprint size={18} className="md:w-5 md:h-5" />
                </div>
                <input 
                  type="text" 
                  placeholder="Administrator ID"
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-4 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  <Key size={18} className="md:w-5 md:h-5" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Security Access Key"
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-12 pr-12 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-mono"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Encryption Active
               </div>
               <button type="button" className="hover:text-primary transition-colors">Emergency Reset</button>
            </div>

            <button 
              disabled={loading}
              className="btn-primary w-full py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 text-sm md:text-lg font-black tracking-widest relative overflow-hidden group rounded-xl md:rounded-2xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   AUTHENTICATING...
                </div>
              ) : (
                <>
                  INITIALIZE ACCESS <ArrowRight size={18} className="md:w-5 md:h-5" />
                </>
              )}
              
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          {/* Footer Info */}
          <div className="pt-6 border-t border-white/5 text-center">
             <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-mono">
                <Terminal size={14} />
                <span>Node: GPLUS-CORE-01 // v2.4.0</span>
             </div>
          </div>
        </div>

        {/* Security Warning */}
        <p className="mt-6 md:mt-8 text-center text-slate-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4 md:px-10">
          Warning: All activity is logged and monitored. Unauthorized access attempts will result in immediate IP blacklisting and legal action.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminAuth;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Mail, 
  ArrowRight, 
  Command, 
  Cpu, 
  Globe,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await adminLogin({ email, password });
      
      // Store admin data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      
      setIsLoading(false);
      navigate('/admin-panel');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Administrative verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      
      {/* Animated Hexagon Pattern (CSS only) */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`, backgroundSize: '60px 60px' }} />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-xl relative"
      >
        {/* Decorative ambient lights */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/10 blur-[120px] rounded-full animate-pulse" />

        <div className="glass-card p-6 md:p-12 border-white/5 relative overflow-hidden group">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          {/* Header */}
          <div className="text-center space-y-3 md:space-y-4 mb-8 md:mb-10">
            <div className="flex justify-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors duration-500">
                <Shield size={24} className="md:w-8 md:h-8 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">Admin Portal</h1>
              <p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Secure Environment 01-A</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
                <div className="relative group">
                  <Mail size={16} className="md:w-[18px] md:h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gplus.com"
                    className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative group">
                  <Lock size={16} className="md:w-[18px] md:h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full bg-black/40 border border-white/5 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-10 md:pr-12 text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-700 font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} className="md:w-[18px] md:h-[18px]" /> : <Eye size={16} className="md:w-[18px] md:h-[18px]" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-3 py-4 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-primary-light transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  Establish Connection <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Infrastructure Metrics */}
          <div className="mt-8 md:mt-12 grid grid-cols-3 gap-2 md:gap-4 pt-6 md:pt-8 border-t border-white/5">
             <div className="text-center space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Network</p>
                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-mono text-emerald-500">
                   <Globe size={10} /> Online
                </div>
             </div>
             <div className="text-center space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Core Status</p>
                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-mono text-blue-500">
                   <Cpu size={10} /> 34% Load
                </div>
             </div>
             <div className="text-center space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Version</p>
                <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs font-mono text-slate-400">
                   <Command size={10} /> v2.4
                </div>
             </div>
          </div>
        </div>

        <p className="text-center mt-6 md:mt-8 text-[8px] md:text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">
          All access attempts are recorded. IP Address: 192.168.1.1
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

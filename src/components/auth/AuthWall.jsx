import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, Sparkles, Loader2, ArrowRight, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../../services/api';

const AuthWall = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        // Ticket is actually the credential in standard GSI, 
        // but useGoogleLogin returns an access token by default.
        // We'll use the 'implicit' flow or 'code' flow.
        // For simplicity with @react-oauth/google, we'll fetch user info if needed or use standard GoogleLogin component.
        // However, useGoogleLogin is more flexible for custom buttons.
        
        // Let's call our backend with the credential
        const { data } = await googleLogin(tokenResponse.access_token);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
      } catch (err) {
        console.error("Login Error:", err);
        setError("Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 relative overflow-hidden text-center space-y-8"
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[120px] -z-10" />
        
        <div className="space-y-6">
          <div className="flex justify-center">
             <div className="w-20 h-20 bg-accent rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-[0_0_50px_rgba(244,63,94,0.3)] relative group">
                G+
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-[2rem] border-2 border-white/20 border-dashed"
                />
             </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome to G Plus</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Join the future of premium streaming. Sign in to access live events, cinematic content, and our global community.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => login()}
            disabled={loading}
            className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 bg-white text-dark font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Globe size={20} className="text-blue-500" />
                Sign in with Google
              </>
            )}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all scale-105 opacity-0 group-hover:opacity-100" />
          </button>

          {error && (
            <p className="text-xs text-accent font-bold animate-shake">{error}</p>
          )}

          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest justify-center py-2">
            <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500" /> Secure</span>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-yellow-500" /> Premium</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
           <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
             By signing in, you agree to our <span className="text-slate-300 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-300 underline cursor-pointer">Privacy Policy</span>.
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthWall;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Code, Globe, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 md:p-6 py-10 relative overflow-y-auto overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1000px] bg-dark-lighter/50 backdrop-blur-2xl border border-white/10 rounded-3xl md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 my-auto"
      >
        {/* Left Side - Info / Mobile Header */}
        <div className="flex md:flex-1 bg-gradient-to-br from-primary to-accent p-8 md:p-12 flex-col justify-center md:justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-xl flex items-center justify-center font-bold text-2xl md:text-3xl text-primary shadow-lg mb-4 md:mb-0">
              G+
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2 md:mt-8 leading-tight">
              Welcome to the <br className="hidden md:block" /> 
              <span className="text-dark">G Plus</span> Universe.
            </h2>
            <p className="text-white/80 mt-3 md:mt-4 text-sm md:text-lg max-w-xs mx-auto md:mx-0">
              The world's most advanced platform for live streaming and community engagement.
            </p>
          </div>
          
          <div className="hidden md:block relative z-10 space-y-6 mt-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-500" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-dark flex items-center justify-center text-[10px] font-bold">
                10M+
              </div>
            </div>
            <p className="text-white/70 text-sm">Join 10 million+ creators around the globe.</p>
          </div>
          
          {/* Decorative Particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none hidden md:block">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping" />
            <div className="absolute bottom-20 right-20 w-3 h-3 bg-white rounded-full animate-bounce" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-6 sm:p-8 md:p-12">
          <div className="max-w-md mx-auto h-full flex flex-col">
            <div className="mb-8 md:mb-10 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base">
                {isLogin 
                  ? 'Access your world and start streaming.' 
                  : 'Join the community and become a creator.'}
              </p>
            </div>

            <form className="space-y-4 flex-1" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white text-sm md:text-base"
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white text-sm md:text-base"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white text-sm md:text-base"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button className="text-sm text-primary hover:underline transition-all">Forgot password?</button>
                </div>
              )}

              <button className="btn-primary w-full py-3.5 md:py-4 flex items-center justify-center gap-2 text-base md:text-lg mt-2 transition-transform active:scale-[0.98]">
                {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                <div className="relative flex justify-center text-[10px] md:text-xs uppercase"><span className="bg-dark-lighter px-2 md:px-4 text-slate-500 tracking-wider">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button className="btn-secondary py-2.5 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base hover:bg-white/10 transition-colors">
                  <Globe size={18} /> Google
                </button>
                <button className="btn-secondary py-2.5 md:py-3 flex items-center justify-center gap-2 text-sm md:text-base hover:bg-white/10 transition-colors">
                  <Code size={18} /> Github
                </button>
              </div>

              <p className="text-center text-slate-400 text-sm md:text-base">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-bold hover:underline transition-all"
                >
                  {isLogin ? 'Create one' : 'Login here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

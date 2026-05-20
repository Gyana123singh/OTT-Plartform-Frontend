import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Tv, 
  ShieldAlert, 
  BarChart3, 
  DollarSign, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Globe,
  Lock
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin-panel' },
  { icon: Users, label: 'User Management', path: '/admin-panel/users' },
  { icon: Tv, label: 'Stream Monitor', path: '/admin-panel/streams' },
  { icon: ShieldAlert, label: 'Content Approval', path: '/admin-panel/content' },
  { icon: BarChart3, label: 'Platform Analytics', path: '/admin-panel/analytics' },
  { icon: DollarSign, label: 'Subscription Plans', path: '/admin-panel/plans' },
  { icon: DollarSign, label: 'Revenue & Subs', path: '/admin-panel/revenue' },
  { icon: Settings, label: 'System Settings', path: '/admin-panel/settings' },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin-panel/login');
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden font-inter relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Premium Admin Sidebar */}
      <aside className={cn(
        "flex flex-col bg-dark-lighter/30 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-in-out z-50",
        "fixed inset-y-0 left-0 md:relative md:translate-x-0",
        isSidebarOpen 
          ? "w-72 translate-x-0" 
          : "w-72 -translate-x-full md:w-20 md:translate-x-0"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center",
          isSidebarOpen ? "p-8 gap-4" : "p-5 justify-center"
        )}>
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0">
            G+
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-black text-lg tracking-tight leading-none">ADMIN PANEL</span>
              <span className="text-[10px] text-primary font-bold tracking-widest uppercase mt-1">Super User</span>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar",
          isSidebarOpen ? "px-4" : "px-2"
        )}>
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
              className={({ isActive }) => cn(
                "flex items-center rounded-2xl transition-all duration-300 group relative",
                isSidebarOpen ? "gap-4 p-3.5" : "p-3 justify-center",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "hover:bg-white/5 text-slate-500 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", !isSidebarOpen && "mx-auto")} />
              {isSidebarOpen && <span className="font-semibold text-sm">{item.label}</span>}
              
              {/* Active Indicator Pin */}
              {isSidebarOpen && (
                <div className="ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity">
                   <ChevronRight size={14} />
                </div>
              )}

              {!isSidebarOpen && (
                <div className="absolute left-24 bg-dark-lighter border border-white/10 px-3 py-2 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={cn(
          "border-t border-white/5 bg-white/2",
          isSidebarOpen ? "p-6" : "p-2"
        )}>
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group w-full",
              isSidebarOpen ? "gap-4 p-3.5" : "p-3 justify-center"
            )}
          >
            <LogOut size={22} className="shrink-0" />
            {isSidebarOpen && <span className="font-bold text-sm">Exit Admin</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_40%)]">
        {/* Admin Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-dark/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-white/5 rounded-xl border border-white/5 transition-all text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="hidden lg:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl">
               <Lock size={16} className="text-primary" />
               <span className="text-xs font-bold text-slate-400">Secure Session Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-dark" />
              </button>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                   <span className="text-sm font-black text-white leading-none">Admin Root</span>
                   <span className="text-[10px] text-green-500 font-bold uppercase mt-1">Online</span>
                 </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/10 shadow-lg flex items-center justify-center">
                   <Users size={20} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

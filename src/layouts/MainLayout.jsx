import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Tv,
  Video,
  MessageSquare,
  Newspaper,
  TrendingUp,
  User,
  Bell,
  Search,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
  Compass,
  Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLogo from '../components/AnimatedLogo';
import NotificationCenter from '../components/NotificationCenter';
import AuthWall from '../components/auth/AuthWall';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const NavItems = [
  { icon: HomeIcon, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discovery', path: '/discovery' },
  { icon: Tv, label: 'Live Stream', path: '/live' },
  { icon: Video, label: 'Video Chat', path: '/video-chat' },
  { icon: MessageSquare, label: 'Media Chat', path: '/media-chat' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: CreditCard, label: 'Subscription', path: '/subscription' },
  // { icon: ShieldCheck, label: 'Admin', path: '/admin-panel' },
  { icon: LayoutDashboard, label: 'Studio', path: '/creator' },
];

const MainLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch');

  React.useEffect(() => {
    // Only show auth wall for unauthenticated users after 5 seconds
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowAuthWall(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // If already authenticated, ensure wall is hidden
      setShowAuthWall(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen bg-dark text-slate-200 overflow-hidden relative">
      {!isAuthenticated && showAuthWall && <AuthWall onLogin={() => setIsAuthenticated(true)} />}

      {/* Sidebar - Desktop & Tablet */}
      <aside className={cn(
        "hidden md:flex flex-col bg-dark-lighter border-r border-white/5 transition-all duration-300 z-50",
        isWatchPage && !isSidebarOpen ? "w-0 border-none overflow-hidden" : (isSidebarOpen ? "w-64" : "w-20")
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(244,63,94,0.5)]">
              G+
            </div>
            {isSidebarOpen && <span className="font-bold text-xl tracking-tight">G Plus</span>}
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {NavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isWatchPage && setIsSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "hover:bg-white/5 text-slate-400 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", (!isSidebarOpen && !isWatchPage) && "mx-auto")} />
              {(isSidebarOpen || (isWatchPage && isSidebarOpen)) && <span className="font-medium">{item.label}</span>}
              {!isSidebarOpen && !isWatchPage && (
                <div className="absolute left-20 bg-dark-lighter border border-white/10 px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <NavLink
            to="/profile"
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all",
              (!isSidebarOpen && !isWatchPage) && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent" />
            {(isSidebarOpen || (isWatchPage && isSidebarOpen)) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-slate-500 truncate">Premium Member</p>
              </div>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-dark/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg hidden md:block"
            >
              <Menu size={20} />
            </button>
            <div className="md:hidden w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(244,63,94,0.4)]">
              G+
            </div>

            {/* Language Selector */}
            <select className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-xs focus:outline-none hidden lg:block cursor-pointer hover:bg-white/10 transition-all">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="or">Odia</option>
              <option value="te">Telugu</option>
              <option value="ta">Tamil</option>
              <option value="bn">Bengali</option>
            </select>

            <div className="relative max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search streams, videos, creators..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 hover:bg-white/5 rounded-full relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-dark" />
              </button>
              <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>
            <button className="btn-primary py-1.5 px-4 text-sm hidden sm:block">
              Go Live
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-700 md:hidden" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <Outlet />
        </div>

        {/* G Plus Animated Logo */}
        <AnimatedLogo position="bottom-right" className="hidden md:block" />

        {/* Bottom Nav - Mobile Only */}
        <nav className="md:hidden flex items-center justify-around h-16 bg-dark-lighter/80 backdrop-blur-xl border-t border-white/5 px-4 sticky bottom-0 z-30">
          {NavItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-accent" : "text-slate-500"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-accent" : "text-slate-500"
            )}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </NavLink>
        </nav>
      </main>
    </div>
  );
};

export default MainLayout;

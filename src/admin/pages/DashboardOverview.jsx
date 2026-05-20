import React from 'react';
import { 
  Users, 
  Tv, 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MoreVertical,
  Activity,
  Globe,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const STAT_CARDS = [
  { 
    label: 'Total Platform Users', 
    value: '2,482,190', 
    trend: '+12.5%', 
    isPositive: true, 
    icon: Users, 
    color: 'from-blue-600 to-indigo-700',
    chart: [30, 45, 35, 60, 55, 80, 70]
  },
  { 
    label: 'Live Stream Concurrents', 
    value: '42,902', 
    trend: '+4.2%', 
    isPositive: true, 
    icon: Tv, 
    color: 'from-emerald-500 to-teal-700',
    chart: [50, 40, 60, 45, 70, 60, 90]
  },
  { 
    label: 'Monthly Net Revenue', 
    value: '₹12.4M', 
    trend: '+18.1%', 
    isPositive: true, 
    icon: DollarSign, 
    color: 'from-amber-500 to-orange-700',
    chart: [20, 30, 50, 40, 60, 80, 95]
  },
  { 
    label: 'System Load / Health', 
    value: '99.98%', 
    trend: '-0.02%', 
    isPositive: false, 
    icon: Activity, 
    color: 'from-rose-500 to-crimson-700',
    chart: [90, 95, 99, 98, 99, 99, 99]
  },
];

const RECENT_ALERTS = [
  { id: 1, type: 'critical', title: 'DDoS Attempt Blocked', desc: 'Regional server in Odisha filtered 50k requests.', time: '2m ago' },
  { id: 2, type: 'warning', title: 'Content Flagged', desc: 'Stream #882 flagged for copyright by Sony Music.', time: '15m ago' },
  { id: 3, type: 'info', title: 'New Creator Verified', desc: '@MegaVlogger passed identity verification.', time: '1h ago' },
];

const DashboardOverview = () => {
  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">System Overview</h1>
          <p className="text-xs md:text-base text-slate-500 font-medium">Platform status and global activity for May 15, 2026.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col items-start md:items-end p-4 md:p-0 bg-white/5 md:bg-transparent rounded-xl w-full md:w-auto">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
             <span className="text-xs md:text-sm font-bold text-green-500 flex items-center gap-2 mt-1 md:mt-0">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                All Systems Operational
             </span>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {STAT_CARDS.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-2xl md:rounded-3xl`} />
            <div className="glass-card p-5 md:p-6 space-y-4 md:space-y-6 relative border-white/5 hover:border-white/10 transition-all rounded-2xl md:rounded-3xl">
               <div className="flex items-center justify-between">
                  <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-black/20`}>
                     <stat.icon size={20} className="md:w-[22px] md:h-[22px] text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] md:text-xs font-black ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                     {stat.isPositive ? <TrendingUp size={12} className="md:w-3.5 md:h-3.5" /> : <TrendingDown size={12} className="md:w-3.5 md:h-3.5" />}
                     {stat.trend}
                  </div>
               </div>
               <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-black text-white">{stat.value}</h3>
               </div>
               {/* Mini Chart Mockup */}
               <div className="flex items-end gap-1 h-12 pt-2">
                  {stat.chart.map((h, idx) => (
                    <div 
                      key={idx} 
                      className="flex-1 bg-white/5 rounded-full overflow-hidden relative group/bar"
                    >
                       <motion.div 
                         initial={{ height: 0 }}
                         animate={{ height: `${h}%` }}
                         transition={{ delay: 0.5 + (idx * 0.1) }}
                         className={`w-full bg-gradient-to-t ${stat.color} opacity-40 group-hover/bar:opacity-100 transition-opacity`}
                       />
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Real-time Stream Monitor */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
           <div className="flex items-center justify-between px-1 md:px-2">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3">
                 <Activity size={20} className="md:w-6 md:h-6 text-primary" /> Active Live Monitors
              </h3>
              <button className="text-[10px] md:text-xs font-black text-primary hover:underline uppercase tracking-widest">Global View</button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card p-3 md:p-4 flex gap-3 md:gap-4 hover:bg-white/5 transition-all cursor-pointer group">
                   <div className="w-24 md:w-32 h-16 md:h-20 bg-slate-800 rounded-lg md:rounded-xl overflow-hidden shrink-0 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
                      <div className="absolute top-1.5 md:top-2 left-1.5 md:left-2 flex gap-1">
                         <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ArrowUpRight size={16} className="md:w-5 md:h-5 text-white" />
                      </div>
                   </div>
                   <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                      <h4 className="font-bold text-xs md:text-sm text-white truncate group-hover:text-primary transition-colors">Global News: Morning Update</h4>
                      <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">Creator: @NewsDesk</p>
                      <div className="flex items-center justify-between pt-1 md:pt-2">
                         <span className="text-[8px] md:text-[10px] bg-white/5 px-1.5 md:px-2 py-0.5 rounded text-slate-300">1080p60</span>
                         <span className="text-[8px] md:text-[10px] font-black text-green-500">BITRATE OK</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* User Engagement Heatmap Mockup */}
           <div className="glass-card p-5 md:p-8 space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                 <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <Globe size={18} className="md:w-5 md:h-5 text-blue-500" /> Geographic Engagement
                 </h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-primary rounded-full" />
                       <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-slate-700 rounded-full" />
                       <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">Low</span>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-12 gap-1 md:gap-2 h-24 md:h-40">
                 {[...Array(60)].map((_, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: i * 0.01 }}
                     className={`rounded-sm transition-all hover:scale-110 cursor-crosshair
                       ${Math.random() > 0.8 ? 'bg-primary' : Math.random() > 0.5 ? 'bg-primary/40' : 'bg-white/5'}`}
                   />
                 ))}
              </div>
              <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest">Real-time heat data from 24 regions</p>
           </div>
        </div>

        {/* Security & System Alerts */}
        <div className="space-y-6">
           <div className="glass-card h-full flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-lg font-bold flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-500" /> Security Intelligence
                 </h3>
                 <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg">LIVE</span>
              </div>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                 {RECENT_ALERTS.map((alert) => (
                   <div key={alert.id} className="space-y-2 relative pl-6 group cursor-pointer">
                      <div className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full 
                        ${alert.type === 'critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                          alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                      <div className="flex justify-between items-center">
                         <h4 className={`text-xs font-black uppercase tracking-widest 
                           ${alert.type === 'critical' ? 'text-red-400' : 
                             alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                           {alert.title}
                         </h4>
                         <span className="text-[10px] text-slate-600 font-bold">{alert.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {alert.desc}
                      </p>
                      <div className="flex items-center gap-3 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-[10px] font-black text-primary uppercase hover:underline">Investigate</button>
                         <button className="text-[10px] font-black text-slate-500 uppercase hover:underline">Dismiss</button>
                      </div>
                   </div>
                 ))}
                 
                 <div className="p-6 mt-10 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Star size={18} className="text-yellow-500" />
                       <h5 className="text-sm font-black text-white">AI Moderation Status</h5>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                          <span>Efficiency</span>
                          <span>94.2%</span>
                       </div>
                       <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="w-[94%] h-full bg-primary" />
                       </div>
                    </div>
                    <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black text-white transition-all uppercase tracking-widest border border-white/10">
                       Configure AI
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

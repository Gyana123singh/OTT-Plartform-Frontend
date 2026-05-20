import React from 'react';
import { 
  Users, 
  Tv, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Clock,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Total Users', value: '1.2M', icon: Users, color: 'text-blue-500', trend: '+12%' },
  { label: 'Active Streams', value: '842', icon: Tv, color: 'text-green-500', trend: '+5%' },
  { label: 'Monthly Revenue', value: '₹4.5M', icon: DollarSign, color: 'text-yellow-500', trend: '+18%' },
  { label: 'Reports Pending', value: '24', icon: ShieldAlert, color: 'text-red-500', trend: '-2%' },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Super Admin Dashboard</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Platform-wide control and real-time analytics.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button className="flex-1 btn-secondary text-xs md:text-sm py-3 md:py-2 px-4">Download Report</button>
          <button className="flex-1 btn-primary py-3 md:py-2 px-6 text-xs md:text-sm">Update Platform</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 md:p-6 space-y-3 md:space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={18} className="md:w-6 md:h-6" />
              </div>
              <span className={`text-[10px] md:text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] md:text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-xl md:text-3xl font-black text-white truncate">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Users</h3>
            <button className="text-xs text-primary hover:underline font-bold">View All Users</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">User</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Joined</th>
                  <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700" />
                        <div>
                          <p className="text-sm font-bold text-white">Alex Johnson</p>
                          <p className="text-[10px] text-slate-500">alex@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-400">Creator</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">Active</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">2h ago</td>
                    <td className="p-4">
                      <button className="p-1 hover:bg-white/10 rounded text-slate-500"><MoreVertical size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Moderation / Reports */}
        <div className="space-y-6">
          <div className="glass-card flex flex-col h-full">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert size={20} className="text-red-500" /> Urgent Reports
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded">HARASSMENT</span>
                    <span className="text-[10px] text-slate-500">10m ago</span>
                  </div>
                  <p className="text-xs text-slate-300">User <span className="font-bold">@Troll123</span> reported in stream <span className="font-bold">#GamingNight</span></p>
                  <div className="flex items-center gap-2 pt-2">
                    <button className="flex-1 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors">Ban User</button>
                    <button className="flex-1 py-1.5 bg-white/10 text-white text-[10px] font-bold rounded-lg hover:bg-white/20 transition-colors">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <button className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">View All Reports</button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <section className="glass-card p-4 md:p-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
               <BarChart3 size={20} className="md:w-6 md:h-6 text-primary" /> Platform Growth
            </h3>
            <div className="flex items-center gap-2 bg-dark p-1 rounded-lg border border-white/10 w-fit">
               <button className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded">1W</button>
               <button className="px-3 py-1 text-slate-500 text-[10px] font-bold rounded hover:text-white">1M</button>
               <button className="px-3 py-1 text-slate-500 text-[10px] font-bold rounded hover:text-white">1Y</button>
            </div>
         </div>
         <div className="h-48 md:h-64 flex items-end gap-1.5 md:gap-2 px-1 md:px-4">
            {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85, 60, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 md:gap-2 group min-w-[12px]">
                 <div className="w-full bg-primary/20 rounded-t-sm md:rounded-t-lg relative group-hover:bg-primary/40 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dark text-[8px] md:text-[10px] font-bold px-1.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                       {h * 10}K
                    </div>
                 </div>
                 <span className="text-[8px] md:text-[10px] text-slate-600 uppercase font-black">{['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

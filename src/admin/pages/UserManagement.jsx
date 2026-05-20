import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  ShieldCheck, 
  Ban, 
  Mail, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserAuditModal from '../components/UserAuditModal';

const USERS_DATA = [
  { id: 1, name: 'Vikram Singh', email: 'vikram@gplus.com', role: 'Broadcaster', status: 'Active', joined: 'May 12, 2026', avatar: null, sessions: 24, flags: 0 },
  { id: 2, name: 'Ananya Rao', email: 'ananya.rao@gmail.com', role: 'User', status: 'Active', joined: 'May 10, 2026', avatar: null, sessions: 12, flags: 0 },
  { id: 3, name: 'Rahul Sharma', email: 'rahul@troll.com', role: 'User', status: 'Banned', joined: 'May 08, 2026', avatar: null, sessions: 2, flags: 5 },
  { id: 4, name: 'Priya Das', email: 'priya_news@gplus.com', role: 'Moderator', status: 'Active', joined: 'May 05, 2026', avatar: null, sessions: 89, flags: 0 },
  { id: 5, name: 'Amit Patel', email: 'amit@creator.net', role: 'Broadcaster', status: 'Pending', joined: 'May 14, 2026', avatar: null, sessions: 0, flags: 0 },
];

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const handleAudit = (user) => {
    setSelectedUser(user);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white">User Management</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Audit accounts, manage roles, and enforce platform policies.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
           <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
              <Mail size={18} /> Broadcast
           </button>
           <button className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 px-6 text-sm">
              <UserPlus size={18} /> Add Admin
           </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, or UID..." 
            className="w-full bg-dark border border-white/5 rounded-xl py-3 md:py-3 pl-12 pr-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
           <select className="flex-1 md:flex-none bg-dark border border-white/5 rounded-xl py-3 px-4 text-xs md:text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
              <option>All Roles</option>
              <option>Broadcasters</option>
              <option>Moderators</option>
              <option>Users</option>
           </select>
           <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white shrink-0">
              <Filter size={18} className="md:w-5 md:h-5" />
           </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                   <div className="flex items-center gap-2">User Details <ArrowUpDown size={12} /></div>
                </th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Role</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Sessions</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Flags</th>
                <th className="p-4 md:p-6 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {USERS_DATA.map((user, i) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4 min-w-[150px]">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center text-lg md:text-xl font-black text-white shrink-0 group-hover:scale-110 transition-transform">
                          {user.name[0]}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold text-white text-xs md:text-sm group-hover:text-primary transition-colors truncate">{user.name}</p>
                          <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">
                             <Mail size={10} className="shrink-0" /> <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 whitespace-nowrap">
                       <span className={`px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest border
                         ${user.role === 'Broadcaster' ? 'bg-primary/10 text-primary border-primary/20' : 
                           user.role === 'Moderator' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                           'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                          {user.role}
                       </span>
                    </td>
                    <td className="p-4 md:p-6 whitespace-nowrap">
                       <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full 
                            ${user.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                              user.status === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest
                            ${user.status === 'Active' ? 'text-green-500' : 
                              user.status === 'Pending' ? 'text-amber-500' : 'text-red-500'}`}>
                             {user.status}
                          </span>
                       </div>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                       <p className="text-xs md:text-sm font-black text-white">{user.sessions}</p>
                    </td>
                    <td className="p-4 md:p-6 text-center">
                       <span className={`text-xs md:text-sm font-black ${user.flags > 0 ? 'text-red-500' : 'text-slate-600'}`}>
                          {user.flags}
                       </span>
                    </td>
                    <td className="p-4 md:p-6">
                       <div className="flex items-center gap-1 md:gap-2">
                          <button 
                            onClick={() => handleAudit(user)}
                            className="p-1.5 md:p-2 hover:bg-primary/10 hover:text-primary rounded-lg text-slate-500 transition-all" 
                            title="Audit User"
                          >
                             <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                          <button className="p-1.5 md:p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-slate-500 transition-all" title="Ban User">
                             <Ban size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                          <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-all">
                             <MoreVertical size={16} className="md:w-[18px] md:h-[18px]" />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Export */}
      <div className="flex flex-col md:flex-row items-center justify-between px-2 gap-4">
         <div className="flex items-center gap-3 md:gap-4">
            <button className="text-[10px] md:text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Prev</button>
            <div className="flex items-center gap-1">
               {[1, 2, 3].map(p => (
                 <button key={p} className={`w-6 h-6 md:w-8 md:h-8 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold transition-all 
                   ${p === 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                   {p}
                 </button>
               ))}
            </div>
            <button className="text-[10px] md:text-xs font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Next</button>
         </div>
         <button className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-primary hover:underline uppercase tracking-widest text-center">
            Export JSON / CSV Report
         </button>

         {/* Modals */}
         <UserAuditModal 
           isOpen={isAuditModalOpen} 
           onClose={() => setIsAuditModalOpen(false)} 
           user={selectedUser} 
         />
      </div>
    </div>
  );
};

export default UserManagement;

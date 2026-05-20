import React from 'react';
import BaseModal from '../../components/modals/BaseModal';
import { Shield, Ban, CheckCircle, Mail, AlertTriangle, History } from 'lucide-react';

const UserAuditModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={`Audit User: ${user.name}`} maxWidth="max-w-2xl">
      <div className="space-y-8">
        {/* User Summary Card */}
        <div className="glass-card p-6 bg-white/5 border-white/10 flex items-center gap-6">
           <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-black text-white">
              {user.name[0]}
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black text-white">{user.name}</h4>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{user.role} // UID: GPLUS-{user.id}992</p>
              <div className="flex items-center gap-4 pt-2">
                 <div className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-tighter">
                    <CheckCircle size={12} /> ID Verified
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <History size={12} /> Member for 2 months
                 </div>
              </div>
           </div>
        </div>

        {/* Audit Sections */}
        <div className="grid grid-cols-2 gap-6">
           <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Activity Profile</h5>
              <div className="space-y-2">
                 {[
                   { label: 'Total Streams', value: '142' },
                   { label: 'Chat Reports', value: '2', alert: true },
                   { label: 'Engagement Score', value: '98%' },
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between p-3 bg-dark rounded-xl border border-white/5 text-xs">
                      <span className="text-slate-500 font-bold">{stat.label}</span>
                      <span className={`font-black ${stat.alert ? 'text-red-500' : 'text-white'}`}>{stat.value}</span>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-4">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Analysis</h5>
              <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                 <AlertTriangle size={32} className="text-red-500/50" />
                 <p className="text-[10px] text-slate-400 font-medium">System detection suggests <span className="text-red-500 font-black">LOW RISK</span> for this account.</p>
              </div>
           </div>
        </div>

        {/* Administrative Actions */}
        <div className="space-y-4 pt-4 border-t border-white/5">
           <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform Actions</h5>
           <div className="flex flex-wrap gap-4">
              <button className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                 <Ban size={16} /> Permaban Account
              </button>
              <button className="flex-1 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                 <Shield size={16} /> Suspend Temporary
              </button>
              <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/10">
                 <Mail size={16} /> Send Warning
              </button>
           </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserAuditModal;

import React from 'react';
import { 
  Settings, 
  Edit3, 
  Grid, 
  History, 
  Heart, 
  Bell, 
  LogOut,
  ChevronRight,
  Shield,
  CreditCard
} from 'lucide-react';

const Profile = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Profile Header */}
      <section className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 relative">
          <button className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-black/60 transition-all">
            <Edit3 size={18} />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-dark p-1 shadow-2xl">
            <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-tr from-primary to-accent overflow-hidden">
              <div className="w-full h-full bg-slate-700" />
            </div>
          </div>
          <div className="flex-1 pb-2 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white">Alex Johnson</h1>
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-full border border-primary/30">PREMIUM</span>
            </div>
            <p className="text-slate-400">@alex_streamer • Content Creator & Gaming Enthusiast</p>
          </div>
          <div className="flex gap-3 pb-2">
            <button className="btn-primary py-2 px-6">Edit Profile</button>
            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Followers', value: '12.4K' },
          { label: 'Following', value: '1.2K' },
          { label: 'Streams', value: '48' },
          { label: 'Watch Time', value: '1.5K hrs' }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 text-center">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Links */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-lg font-bold px-2">Account Settings</h3>
           <div className="glass-card overflow-hidden">
              {[
                { icon: Shield, label: 'Security & Privacy' },
                { icon: Bell, label: 'Notification Preferences' },
                { icon: CreditCard, label: 'Billing & Subscriptions' },
                { icon: History, label: 'Watch History' },
                { icon: Heart, label: 'Liked Content' },
              ].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group">
                   <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                   </div>
                   <ChevronRight size={16} className="text-slate-600" />
                </button>
              ))}
              <button className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 transition-all text-red-500 group">
                 <LogOut size={20} />
                 <span className="text-sm font-bold">Sign Out</span>
              </button>
           </div>
        </div>

        {/* Content Section */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold">Recent Uploads</h3>
              <div className="flex items-center gap-2">
                 <button className="p-1.5 bg-white/5 rounded-lg text-primary"><Grid size={18} /></button>
                 <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500"><History size={18} /></button>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass-card overflow-hidden group cursor-pointer border-transparent hover:border-white/10 transition-all">
                   <div className="aspect-video bg-slate-800 relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-dark/60 to-transparent" />
                      <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded">12:45</div>
                   </div>
                   <div className="p-4">
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">Amazing Stream Moment #{i}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">2.4K views • 2 days ago</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

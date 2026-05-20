import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Video, 
  Heart, 
  Share2, 
  Star, 
  Play, 
  CheckCircle, 
  MoreHorizontal,
  Mail,
  Globe,
  TrendingUp,
  Award
} from 'lucide-react';

const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Videos');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const TABS = ['Videos', 'Live Streams', 'Community', 'About'];

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Profile Header */}
      <section className="relative rounded-t-3xl md:rounded-[3rem] overflow-hidden group">
         {/* Banner */}
         <div className="h-[200px] md:h-[300px] w-full bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center" />
         <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 md:via-dark/40 to-transparent" />

         {/* Profile Info Overlay */}
         <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8">
               <div className="relative shrink-0">
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-tr from-primary to-accent p-1 shadow-2xl">
                     <div className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] bg-dark flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-slate-700" />
                     </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center border-4 border-dark shadow-xl">
                     <CheckCircle size={16} className="md:w-[18px] md:h-[18px] text-white" />
                  </div>
               </div>

               <div className="space-y-2 md:space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                     <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic flex items-center justify-center md:justify-start gap-2 md:gap-3">
                        Sarah Miller <Star size={20} className="md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
                     </h1>
                     <p className="text-primary font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm">Official Verified Partner</p>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                     <div className="flex items-center gap-1.5 md:gap-2 text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                        <Users size={14} className="md:w-4 md:h-4 text-primary" /> 1.2M Subs
                     </div>
                     <div className="flex items-center gap-1.5 md:gap-2 text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                        <Video size={14} className="md:w-4 md:h-4 text-accent" /> 842 Videos
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4 pb-2 w-full md:w-auto">
               <button 
                 onClick={() => setIsSubscribed(!isSubscribed)}
                 className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl
                   ${isSubscribed ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20' : 'btn-primary shadow-primary/30'}`}
               >
                  {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
               </button>
               <button className="p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-[2rem] text-white transition-all shrink-0">
                  <Share2 size={18} className="md:w-5 md:h-5" />
               </button>
               <button className="p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-[2rem] text-white transition-all shrink-0">
                  <MoreHorizontal size={18} className="md:w-5 md:h-5" />
               </button>
            </div>
         </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 md:px-6">
         <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {TABS.map((tab) => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`py-3 md:py-4 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all relative shrink-0
                   ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-white'}`}
               >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="creatorTab" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                    />
                  )}
               </button>
            ))}
         </div>
         <div className="hidden lg:flex items-center gap-4 py-4">
            <Mail size={18} className="text-slate-500 hover:text-primary cursor-pointer transition-colors" />
            <Globe size={18} className="text-slate-500 hover:text-primary cursor-pointer transition-colors" />
            <div className="w-px h-4 bg-white/10" />
            <Award size={18} className="text-slate-500 hover:text-yellow-500 cursor-pointer transition-colors" />
         </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode='wait'>
         <motion.div 
           key={activeTab}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.3 }}
         >
            {activeTab === 'Videos' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                   <motion.div 
                     key={i} 
                     whileHover={{ y: -8 }}
                     onClick={() => navigate(`/watch/${i}`, { state: { video: { title: `Exploring the Edge of the World #${i}`, creator: "Sarah Miller" } } })}
                     className="group cursor-pointer"
                   >
                      <div className="aspect-video bg-slate-800 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-xl group-hover:border-primary/50 transition-all duration-500">
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play size={24} className="text-white fill-white ml-1" />
                         </div>
                         <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[8px] font-black text-white">14:02</div>
                      </div>
                      <div className="mt-4 px-2">
                         <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">Exploring the Edge of the World #{i}</h4>
                         <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>124K Views</span>
                            <span>2 Days Ago</span>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
            )}

            {activeTab === 'About' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                 <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="glass-card p-6 md:p-10 space-y-4 md:space-y-6">
                       <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Biography</h3>
                       <p className="text-sm md:text-lg text-slate-400 leading-relaxed">
                          Sarah Miller is a world-renowned documentary filmmaker and cinematic storyteller. With over 10 years of experience exploring the most remote corners of our planet, her mission is to bring the beauty of the natural world into your living room.
                          <br /><br />
                          Having won multiple international awards for her work in the Amazon Basin and the Arctic Circle, Sarah continues to push the boundaries of what's possible in mobile cinematography and 8K streaming.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="glass-card p-8 space-y-4">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Reach</h4>
                          <div className="flex items-center gap-4">
                             <div className="text-3xl font-black text-white">124</div>
                             <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">Countries <br /> Explored</p>
                          </div>
                       </div>
                       <div className="glass-card p-8 space-y-4">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Community Hub</h4>
                          <div className="flex items-center gap-4">
                             <div className="text-3xl font-black text-white">4.2M</div>
                             <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">Social <br /> Followers</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Quick Stats</h3>
                       <div className="space-y-4">
                          {[
                            { label: 'Joined', value: 'May 2018' },
                            { label: 'Total Views', value: '45.2M' },
                            { label: 'Category', value: 'Documentary' },
                            { label: 'Location', value: 'London, UK' },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                               <span className="text-xs font-black text-white">{item.value}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2.5rem] space-y-4">
                       <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                          <TrendingUp size={14} /> Performance
                       </div>
                       <h4 className="text-lg font-black text-white">Top 1% Global Creator</h4>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          Recognized for high audience retention and premium production standards in the Media network.
                       </p>
                    </div>
                 </div>
              </div>
            )}

            {(activeTab === 'Live Streams' || activeTab === 'Community') && (
              <div className="h-[400px] glass-card flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/20">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                    <Play size={32} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">No {activeTab} Yet</h3>
                    <p className="text-slate-500 text-sm">Follow Sarah Miller to get notified when she goes live or posts an update.</p>
                 </div>
                 <button className="btn-primary py-2 px-8 text-xs">FOLLOW NOW</button>
              </div>
            )}
         </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreatorProfile;

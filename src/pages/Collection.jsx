import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, Clock, ChevronRight, Star, Share2, Plus } from 'lucide-react';

const Collection = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const collectionName = id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-8 md:space-y-12 pb-20 px-0">
      {/* Premium Hero Banner */}
      <section className="relative h-[350px] md:h-[450px] rounded-3xl md:rounded-[3rem] overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent z-10" />
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center" />
         
         <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12 space-y-4 md:space-y-6">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
            >
               <span className="bg-primary/20 backdrop-blur-md border border-primary/30 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase text-primary w-fit">
                  Official Collection
               </span>
               <span className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  <Users size={14} /> 2.4M Followers
               </span>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="space-y-2"
            >
               <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">{collectionName}</h1>
               <p className="text-slate-300 text-sm md:text-lg max-w-xl leading-relaxed line-clamp-2 md:line-clamp-none">
                  The ultimate destination for {collectionName} fans. Discover exclusive broadcasts, live tournaments, and behind-the-scenes content.
               </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="flex flex-row items-center gap-3 md:gap-4 pt-2 md:pt-4"
            >
               <button className="btn-primary py-3 px-6 md:py-4 md:px-10 flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm tracking-widest md:tracking-[0.2em] font-black w-full sm:w-auto">
                  FOLLOW <span className="hidden sm:inline">COLLECTION</span>
               </button>
               <button className="p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all border border-white/10 shrink-0">
                  <Share2 size={18} className="md:w-5 md:h-5" />
               </button>
            </motion.div>
         </div>
      </section>

      {/* Collection Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-2 md:px-4">
         {[
           { label: 'Weekly Streams', value: '142+', icon: TrendingUp },
           { label: 'Avg. Viewers', value: '45K', icon: Users },
           { label: 'Content Hours', value: '850h', icon: Clock },
           { label: 'Top Rated', value: '98%', icon: Star },
         ].map((stat, i) => (
           <div key={i} className="glass-card p-4 md:p-6 border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-white/5 rounded-xl md:rounded-2xl text-primary shrink-0">
                 <stat.icon size={18} className="md:w-5 md:h-5" />
              </div>
              <div>
                 <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                 <p className="text-base md:text-lg font-black text-white">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main Content Grid */}
      <section className="space-y-6 md:space-y-8">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-xl md:text-2xl font-black text-white">Top Rated for You</h2>
            <div className="flex items-center gap-2 md:gap-4">
               <span className="hidden sm:inline text-xs font-bold text-slate-500">Filter by: Newest</span>
               <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"><Plus size={16} className="md:w-[18px] md:h-[18px]" /></button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                onClick={() => navigate(`/watch/${i}`, { 
                  state: { 
                    video: { 
                      id: i, 
                      title: `${collectionName} Championship: Highlights #${i}`, 
                      creator: `${collectionName} Network`,
                      views: "840K"
                    } 
                  } 
                })}
                className="group cursor-pointer"
              >
                <div className="aspect-video bg-slate-800 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-2xl group-hover:border-primary/50 transition-all duration-500">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute top-4 right-4 z-20">
                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                         {["04:32", "08:15", "11:04", "15:40", "03:12", "06:48"][(i - 1) % 6]}
                      </span>
                   </div>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                         <Play size={24} className="text-white fill-white ml-1" />
                      </div>
                   </div>
                </div>
                <div className="mt-6 flex gap-4 px-2">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary text-sm shadow-xl">
                      {i}
                   </div>
                   <div className="space-y-1">
                      <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-primary transition-colors">{collectionName} Championship: Highlights #{i}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-widest">
                         <span>{collectionName} Network</span>
                         <span className="w-1 h-1 bg-slate-700 rounded-full" />
                         <span>840K Views</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Featured Community Section */}
      <section className="bg-white/5 border border-white/10 rounded-3xl md:rounded-[3.5rem] p-6 md:p-12 flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/10 blur-[80px] md:blur-[120px] rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 pointer-events-none" />
         <div className="flex-1 space-y-4 md:space-y-6 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">Join the {collectionName} <br className="hidden md:block" /> Community Hub</h2>
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-lg">
               Connect with thousands of fans, participate in weekly polls, and get exclusive rewards for being an active member of our ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6 pt-2">
               <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 border-dark bg-slate-700" />
                  ))}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 border-dark bg-primary flex items-center justify-center text-[8px] md:text-[10px] font-black text-white">+2K</div>
               </div>
               <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Members Online</span>
            </div>
         </div>
         <div className="w-full lg:w-[400px] space-y-4 relative z-10">
            <div className="glass-card p-5 md:p-6 border-white/5 space-y-3 md:space-y-4">
               <h4 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">Next Major Event</h4>
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5 md:space-y-1">
                     <p className="text-[10px] md:text-xs font-bold text-slate-400">Grand Finals 2026</p>
                     <p className="text-primary font-black text-xs md:text-sm uppercase">Live in 2 days</p>
                  </div>
                  <button className="p-2 md:p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white"><ChevronRight size={18} className="md:w-5 md:h-5" /></button>
               </div>
            </div>
            <button className="w-full py-4 md:py-5 btn-primary rounded-2xl md:rounded-3xl font-black text-xs md:text-sm tracking-widest md:tracking-[0.3em] uppercase">JOIN HUB NOW</button>
         </div>
      </section>
    </div>
  );
};

export default Collection;

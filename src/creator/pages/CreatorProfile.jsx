import React, { useState, useEffect } from 'react';
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
import { getCreatorProfileById, toggleSubscribe } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const formatDistanceToNow = (date) => {
   const now = new Date();
   const diffInSeconds = Math.floor((now - date) / 1000);

   if (diffInSeconds < 60) return 'just now';
   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
   return date.toLocaleDateString();
};

const CreatorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Videos');
  const [creator, setCreator] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subCount, setSubCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const TABS = ['Videos', 'Live Streams', 'Community', 'About'];

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        setLoading(true);
        const { data } = await getCreatorProfileById(id);
        setCreator(data);
        setVideos(data.videos || []);
        setSubCount(data.subscribersCount || 0);
        
        setIsSubscribed(data.isSubscribed || false);
      } catch (err) {
        console.error("Error loading creator profile:", err);
        setError("Failed to load creator profile.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCreatorProfile();
    }
  }, [id]);

  const handleSubscribeToggle = async () => {
    if (!localStorage.getItem('token')) {
      return navigate('/login');
    }
    if (currentUser._id === id) {
      alert("You cannot subscribe to yourself!");
      return;
    }
    try {
      const { data } = await toggleSubscribe(id);
      setIsSubscribed(data.isSubscribed);
      setSubCount(data.subscribers);

      setToastMessage(data.isSubscribed ? `Subscribed to ${creator.name}` : `Unsubscribed from ${creator.name}`);
      setTimeout(() => setToastMessage(null), 3000);
      
      const updatedUser = { ...currentUser };
      if (data.isSubscribed) {
        updatedUser.following = [...(updatedUser.following || []), id];
      } else {
        updatedUser.following = (updatedUser.following || []).filter(folId => folId !== id);
      }
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating subscription:", err);
    }
  };

  if (loading) {
     return (
        <div className="h-[60vh] flex items-center justify-center">
           <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Channel Details...</p>
           </div>
        </div>
     );
  }

  if (error || !creator) {
     return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
           <div className="text-red-500 font-black text-lg">⚠️ {error || "Channel not found"}</div>
           <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2 rounded-full text-xs font-bold uppercase">Go Back</button>
        </div>
     );
  }

  const fullAvatarSrc = creator.avatar ? (creator.avatar.startsWith('http') ? creator.avatar : `${SOCKET_URL}/${creator.avatar.replace(/\\/g, '/')}`) : null;

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
                        {fullAvatarSrc ? (
                           <div
                              className="w-full h-full bg-cover bg-center animate-fade-in"
                              style={{ backgroundImage: `url(${fullAvatarSrc})` }}
                           />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-black text-white uppercase">
                              {creator.name?.charAt(0) || 'G'}
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center border-4 border-dark shadow-xl">
                     <CheckCircle size={16} className="md:w-[18px] md:h-[18px] text-white" />
                  </div>
               </div>

               <div className="space-y-2 md:space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                     <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic flex items-center justify-center md:justify-start gap-2 md:gap-3">
                        {creator.name} <Star size={20} className="md:w-6 md:h-6 text-yellow-500 fill-yellow-500" />
                     </h1>
                     <p className="text-primary font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm">Official Verified Partner</p>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                     <div className="flex items-center gap-1.5 md:gap-2 text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                        <Users size={14} className="md:w-4 md:h-4 text-primary" /> {subCount.toLocaleString()} {subCount === 1 ? 'Sub' : 'Subs'}
                     </div>
                     <div className="flex items-center gap-1.5 md:gap-2 text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest shrink-0">
                        <Video size={14} className="md:w-4 md:h-4 text-accent" /> {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
                     </div>
                  </div>
               </div>
            </div>

            {currentUser._id !== creator._id && (
               <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4 pb-2 w-full md:w-auto">
                  <button 
                    onClick={handleSubscribeToggle}
                    className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-3xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-2xl
                      ${isSubscribed ? 'bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:text-red-500 hover:border-red-500/50' : 'btn-primary shadow-primary/30'}`}
                  >
                     {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                  </button>
                  <button 
                    onClick={() => {
                       navigator.clipboard.writeText(window.location.href);
                       alert("Channel link copied!");
                    }}
                    className="p-3 md:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-[2rem] text-white transition-all shrink-0"
                  >
                     <Share2 size={18} className="md:w-5 md:h-5" />
                  </button>
               </div>
            )}
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
            <Mail size={18} className="text-slate-500 hover:text-primary cursor-pointer transition-colors" onClick={() => window.location.href = `mailto:${creator.email}`} />
            {creator.website && (
               <Globe size={18} className="text-slate-500 hover:text-primary cursor-pointer transition-colors" onClick={() => window.open(creator.website, '_blank')} />
            )}
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
               videos.length === 0 ? (
                  <div className="h-[250px] glass-card flex flex-col items-center justify-center text-center p-6 border-dashed border-white/10 rounded-[2rem]">
                     <Video size={36} className="text-slate-600 mb-2" />
                     <h4 className="font-bold text-white text-sm">No Videos Published</h4>
                     <p className="text-slate-500 text-xs mt-1">This creator hasn't published any videos yet.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {videos.map(vid => (
                       <motion.div 
                         key={vid._id} 
                         whileHover={{ y: -8 }}
                         onClick={() => navigate(`/watch/${vid._id}`)}
                         className="group cursor-pointer"
                       >
                          <div 
                             className="aspect-video bg-slate-800 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-xl group-hover:border-primary/50 transition-all duration-500 bg-cover bg-center"
                             style={{ backgroundImage: `url(${vid.thumbnail?.startsWith('http') ? vid.thumbnail : `${SOCKET_URL}/${vid.thumbnail?.replace(/\\/g, '/')}`})` }}
                          >
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play size={24} className="text-white fill-white ml-1" />
                             </div>
                             <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[8px] font-black text-white">{vid.duration || "HD"}</div>
                          </div>
                          <div className="mt-4 px-2">
                             <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">{vid.title}</h4>
                             <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>{(vid.views || 0).toLocaleString()} Views</span>
                                <span>{vid.createdAt ? `${formatDistanceToNow(new Date(vid.createdAt))} ago` : 'Recently'}</span>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               )
            )}

            {activeTab === 'About' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                 <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="glass-card p-6 md:p-10 space-y-4 md:space-y-6">
                       <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">Biography</h3>
                       <p className="text-sm md:text-base text-slate-400 leading-relaxed whitespace-pre-line">
                          {creator.bio || `${creator.name} is a verified creator on G Plus OTT, sharing premium videos and events with the community.`}
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="glass-card p-8 space-y-4">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Uploads</h4>
                          <div className="flex items-center gap-4">
                             <div className="text-3xl font-black text-white">{videos.length}</div>
                             <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">Videos <br /> Published</p>
                          </div>
                       </div>
                       <div className="glass-card p-8 space-y-4">
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Audience Reach</h4>
                          <div className="flex items-center gap-4">
                             <div className="text-3xl font-black text-white">{subCount.toLocaleString()}</div>
                             <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">Active <br /> Subscribers</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 space-y-6">
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">Quick Stats</h3>
                       <div className="space-y-4">
                          {[
                            { label: 'Joined', value: creator.createdAt ? new Date(creator.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently' },
                            { label: 'Total Video Views', value: videos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString() },
                            { label: 'Role', value: creator.role ? creator.role.toUpperCase() : 'CREATOR' },
                            { label: 'Email', value: creator.email || 'Private' },
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
                          <TrendingUp size={14} /> Creator Info
                       </div>
                       <h4 className="text-lg font-black text-white">Official Partner</h4>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          This partner is recognized for publishing premium content and engaging actively with the G Plus network.
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
                     <p className="text-slate-500 text-sm">Follow {creator.name} to get notified when they post updates or go live.</p>
                  </div>
                  {currentUser._id !== creator._id && (
                     <button onClick={handleSubscribeToggle} className="btn-primary py-2 px-8 text-xs">
                        {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE NOW'}
                     </button>
                  )}
               </div>
            )}
         </motion.div>
      </AnimatePresence>

      {/* In-app Toast Banner */}
      <AnimatePresence>
         {toastMessage && (
            <motion.div
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               className="fixed bottom-6 left-6 z-[9999] bg-dark-lighter border border-white/10 px-6 py-3.5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white backdrop-blur-xl"
            >
               <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
               {toastMessage}
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default CreatorProfile;

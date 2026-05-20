import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Upload, 
  Play, 
  MessageSquare, 
  TrendingUp, 
  Video, 
  Settings,
  ChevronRight,
  Plus,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StreamConfigModal from '../components/StreamConfigModal';
import UploadMediaModal from '../components/UploadMediaModal';
import { getCreatorVideos, becomeCreator } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const CreatorDashboard = () => {
  const navigate = useNavigate();
  const [isStreamModalOpen, setIsStreamModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

  const handleBecomeCreator = async () => {
    try {
      setLoading(true);
      const { data } = await becomeCreator();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      window.location.reload(); // Refresh to update role everywhere
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Failed to upgrade role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMyVideos = async () => {
      try {
        const { data } = await getCreatorVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching creator videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyVideos();
  }, []);

  const stats = [
    { label: "Total Views", value: videos.reduce((acc, v) => acc + v.views, 0).toLocaleString(), icon: Eye, color: "text-blue-500", trend: "+12.5%" },
    { label: "Subscribers", value: "24.8K", icon: Users, color: "text-primary", trend: "+4.2%" },
    { label: "Engagement", value: "8.2%", icon: Heart, color: "text-accent", trend: "+1.1%" },
    { label: "Revenue", value: "₹42,850", icon: TrendingUp, color: "text-emerald-500", trend: "+25.8%" },
  ];

  const plan = user.subscription?.plan || "Free";
  const isFree = plan === "Free";
  const uploadCount = videos.length;
  const uploadLimit = 10;
  const uploadProgress = (uploadCount / uploadLimit) * 100;

  return (
    <div className="space-y-8 pb-20">
      {/* Free Plan Limit Notice */}
      {isFree && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 glass-card border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <TrendingUp size={120} />
          </div>
          
          <div className="flex-1 space-y-4 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Upload size={20} />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Free Upload Quota</h2>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              You are currently using the <span className="text-white font-bold">Free Plan</span>. 
              You can upload up to <span className="text-white font-bold">10 videos</span> before needing a premium subscription.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-slate-500">Usage: {uploadCount} / {uploadLimit} Videos</span>
                <span className={uploadCount >= uploadLimit ? "text-red-500" : "text-primary"}>
                  {Math.round(uploadProgress)}% Full
                </span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  className={`h-full ${uploadCount >= uploadLimit ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-primary shadow-[0_0_15px_rgba(244,63,94,0.4)]'}`}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/subscription')}
              className="w-full px-8 py-4 bg-primary text-white font-black rounded-2xl hover:shadow-lg shadow-primary/20 transition-all text-sm uppercase tracking-widest"
            >
              Upgrade to Premium
            </button>
            <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">Unlimited Uploads + 4K Streaming</p>
          </div>
        </motion.div>
      )}

      {/* Legacy "Become Creator" Banner - Only for brand new accounts with no role data */}
      {user.role === 'audience' && !isFree && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 bg-gradient-to-r from-primary to-accent rounded-3xl md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 text-white shadow-2xl shadow-primary/20"
        >
          <div className="space-y-1.5 md:space-y-2 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Unlock Creator Powers</h2>
            <p className="text-sm md:text-base text-white/80 font-medium">You are currently an audience member. Become a creator to upload videos and start streaming.</p>
          </div>
          <button 
            onClick={handleBecomeCreator}
            disabled={loading}
            className="w-full md:w-auto px-6 md:px-10 py-3 md:py-4 bg-white text-dark font-black rounded-xl md:rounded-2xl hover:scale-105 transition-all shadow-xl disabled:opacity-50 text-[10px] md:text-sm shrink-0"
          >
            BECOME A CREATOR NOW
          </button>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Creator Studio</h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Manage your content, community, and revenue.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-xs md:text-sm hover:bg-white/10 transition-all text-white"
          >
            <Upload size={16} className="md:w-[18px] md:h-[18px]" /> Upload
          </button>
          <button 
            onClick={() => setIsStreamModalOpen(true)}
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 py-2.5 md:py-3 px-4 md:px-6 text-xs md:text-sm rounded-xl"
          >
            <Play size={16} className="md:w-[18px] md:h-[18px]" fill="currentColor" /> Go Live
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 md:p-6 space-y-3 md:space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={18} className="md:w-6 md:h-6" />
              </div>
              <span className="text-[8px] md:text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg">
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-[8px] md:text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-lg md:text-2xl font-black text-white mt-0.5 md:mt-1 truncate">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Content List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Content</h2>
            <button className="text-xs font-bold text-primary hover:underline">View All Library</button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Loader2 className="animate-spin" size={40} />
                <p className="text-xs font-black uppercase tracking-widest">Synchronizing Library...</p>
              </div>
            ) : videos.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center glass-card border-dashed border-white/5 opacity-50 text-center space-y-4">
                 <Video size={40} className="text-slate-500" />
                 <p className="text-sm font-bold">No content uploaded yet.<br/>Start your journey today!</p>
               </div>
            ) : videos.map((video) => (
              <div key={video._id} className="glass-card p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:bg-white/5 transition-all group">
                <div className="w-20 md:w-24 aspect-video bg-slate-800 rounded-lg overflow-hidden shrink-0 relative">
                  {video.thumbnail && (
                    <img src={video.thumbnail.startsWith('http') ? video.thumbnail : `${SOCKET_URL}/${video.thumbnail.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={16} className="text-white" fill="currentColor" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs md:text-sm font-bold text-white truncate">{video.title}</h4>
                  <div className="flex items-center gap-2 md:gap-3 mt-1 text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    <span className="flex items-center gap-1 shrink-0"><Eye size={10} className="md:w-3 md:h-3" /> {video.views}</span>
                    <span className="flex items-center gap-1 shrink-0"><Heart size={10} className="md:w-3 md:h-3" /> {Math.floor(video.views * 0.1)}</span>
                    <span className="w-1 h-1 bg-slate-800 rounded-full shrink-0" />
                    <span className="truncate">{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-500 shrink-0"><Settings size={16} className="md:w-[18px] md:h-[18px]" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Community & Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Latest Comments</h2>
          <div className="glass-card p-6 space-y-6">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs text-white font-bold">User_{i} <span className="text-[10px] text-slate-500 font-normal">2h ago</span></p>
                    <p className="text-xs text-slate-400 line-clamp-2">This is such an amazing stream! Keep up the great work. Can't wait for the next one...</p>
                  </div>
               </div>
             ))}
             <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">
                View All Comments
             </button>
          </div>

          <div className="p-6 bg-accent/10 border border-accent/20 rounded-[2rem] space-y-3">
             <div className="flex items-center gap-2 text-accent">
                <TrendingUp size={20} />
                <h4 className="text-sm font-black uppercase tracking-widest">Creator Insight</h4>
             </div>
             <p className="text-xs text-slate-300 font-medium leading-relaxed">
               Your latest video "Deep House Mix" is performing 24% better than your average content. Share it on social media to boost reach!
             </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StreamConfigModal 
        isOpen={isStreamModalOpen} 
        onClose={() => setIsStreamModalOpen(false)} 
      />
      <UploadMediaModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
};

export default CreatorDashboard;

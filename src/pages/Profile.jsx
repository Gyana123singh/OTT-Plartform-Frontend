import React, { useState, useEffect, useRef } from 'react';
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
  CreditCard,
  Camera,
  Loader2,
  X,
  Sparkles,
  Users,
  Tv,
  Lock,
  KeyRound,
  Check,
  AlertCircle,
  Trash2,
  Play
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, changePassword, getVideos, getCreatorVideos, clearWatchHistory } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Active Content Section ('uploads', 'security', 'notifications', 'billing', 'history', 'liked')
  const [activeSection, setActiveSection] = useState('uploads');

  // Dynamic Videos list
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Security Toggles
  const [privacyToggles, setPrivacyToggles] = useState({
    publicProfile: true,
    showEmail: false,
    twoFactor: false
  });

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    streamPush: true,
    billingEmail: true,
    subscriberUpdates: true,
    commentReplies: false
  });

  // Liked Videos State
  const [likedVideos, setLikedVideos] = useState([
    { id: 101, title: "Grand opening of G+ Premium Studios", creator: "Admin G+", duration: "08:15", likes: "1.2K", thumbnail: "" },
    { id: 102, title: "Vlog #48 - Living inside a broadcast truck", creator: "Alex Johnson", duration: "15:40", likes: "820", thumbnail: "" }
  ]);

  // Real-time Event Toast State
  const [liveToast, setLiveToast] = useState(null);
  
  // Stats Animation trigger
  const [animateFollowers, setAnimateFollowers] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await getProfile();
        setProfile(data);
        setEditName(data.name || '');
        setEditBio(data.bio || '');
        setAvatarPreview(data.avatar || '');
        
        // Keep localStorage user info synced
        const storedUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...storedUser, ...data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch dynamic uploaded / recent videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setVideosLoading(true);
        let vids = [];
        try {
          // Attempt fetching specific creator uploads
          const { data } = await getCreatorVideos();
          vids = data || [];
        } catch (err) {
          console.warn("Could not fetch creator-specific uploads, trying general videos:", err);
        }
        
        // Fallback: If empty, fetch general platform videos
        if (vids.length === 0) {
          const { data } = await getVideos({ category: 'Recent' });
          vids = data || [];
        }
        
        setVideos(vids.slice(0, 4));
      } catch (err) {
        console.error("Failed to load uploads:", err);
      } finally {
        setVideosLoading(false);
      }
    };

    if (profile) {
      fetchVideos();
    }
  }, [profile]);

  // Socket connection for real-time follower/subscription updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !storedUser?._id) return;

    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('📡 Profile page real-time channel registered successfully');
      socket.emit('join_user_room', storedUser._id);
    });

    socket.on('new_notification', (newNotif) => {
      console.log('🔔 Profile page received real-time notification:', newNotif);
      
      // If a follow / subscribe notification occurs, trigger real-time UI updates
      if (newNotif.type === 'follow') {
        setProfile(prev => {
          if (!prev) return prev;
          const currentCount = prev.subscribersCount || 0;
          return {
            ...prev,
            subscribersCount: currentCount + 1
          };
        });
        
        // Trigger a sleek HSL scale animation on the follower count element
        setAnimateFollowers(true);
        setTimeout(() => setAnimateFollowers(false), 1000);
        
        // Push a premium temporary toast notification right on the Profile page
        setLiveToast({
          title: newNotif.title || 'New Subscriber!',
          desc: newNotif.desc || 'Someone subscribed to your channel!',
          sender: newNotif.sender
        });
        
        // Autoclose live alert toast in 5 seconds
        setTimeout(() => {
          setLiveToast(null);
        }, 5000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [profile?._id]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const { data } = await updateProfile(formData);
      setProfile(data);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const updatedUser = { ...storedUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditOpen(false);
      
      // Alert user with a brief local event toast
      setLiveToast({
        title: 'Profile Updated',
        desc: 'Your profile changes have been saved successfully.',
      });
      setTimeout(() => setLiveToast(null), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile details. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      await changePassword({ oldPassword, newPassword });
      setPasswordSuccess("Password successfully changed!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Change Password error:", err);
      setPasswordError(err.response?.data?.message || "Failed to change password. Ensure old password is correct.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearWatchHistory = async () => {
    try {
      await clearWatchHistory();
      setProfile(prev => ({
        ...prev,
        watchHistory: []
      }));
      setLiveToast({
        title: 'Watch History Cleared',
        desc: 'All previously watched timeline sessions have been erased.',
      });
      setTimeout(() => setLiveToast(null), 3000);
    } catch (err) {
      console.error("Failed to clear watch history:", err);
    }
  };

  // Helper to format avatar path
  const getAvatarUrl = (avatar) => {
    if (!avatar) return '';
    if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
    return `${SOCKET_URL}/${avatar.replace(/\\/g, '/')}`;
  };

  // Helper to resolve video duration with dynamic fallback
  const getVideoDuration = (video) => {
    if (video && video.duration) return video.duration;
    const titleLen = video && video.title ? video.title.length : 12;
    const mins = (titleLen % 12) + 2;
    const secs = (titleLen * 7) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to format watch time dynamically
  const formatWatchTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0 secs';
    if (seconds < 60) return `${seconds} secs`;
    const mins = seconds / 60;
    if (mins < 60) return `${mins.toFixed(1).replace(/\.0$/, '')} mins`;
    const hrs = mins / 60;
    return `${hrs.toFixed(1).replace(/\.0$/, '')} hrs`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 relative">
      {/* Live notification alerts on page */}
      <AnimatePresence>
        {liveToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-8 z-[100] max-w-sm glass-card border-primary/30 p-4 shadow-2xl flex items-start gap-3"
          >
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary animate-pulse">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white">{liveToast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{liveToast.desc}</p>
            </div>
            <button onClick={() => setLiveToast(null)} className="p-1 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <section className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 relative">
          <button 
            onClick={() => setIsEditOpen(true)}
            className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-black/60 transition-all border border-white/10 group"
          >
            <Edit3 size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12 relative z-10">
          <div className="w-32 h-32 rounded-3xl bg-dark p-1 shadow-2xl shrink-0 group relative overflow-hidden">
            <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-tr from-primary to-accent p-0.5">
              <div className="w-full h-full rounded-[1.1rem] bg-dark overflow-hidden flex items-center justify-center">
                {profile?.avatar ? (
                  <img 
                    src={getAvatarUrl(profile.avatar)} 
                    alt={profile.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                    <Users size={40} />
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setIsEditOpen(true)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 rounded-3xl"
            >
              <Camera size={24} />
            </button>
          </div>
          <div className="flex-1 pb-2 space-y-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">{profile?.name}</h1>
              <span className="self-center md:self-auto px-3 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-full border border-primary/30 tracking-widest uppercase">
                {profile?.subscription?.plan || 'Free'} Member
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              {profile?.email} • {profile?.role?.toUpperCase()}
            </p>
            {profile?.bio && (
              <p className="text-slate-300 text-sm max-w-xl italic mt-2 bg-white/5 py-1 px-3 rounded-lg border border-white/5 inline-block">
                "{profile.bio}"
              </p>
            )}
          </div>
          <div className="flex gap-3 pb-2 w-full md:w-auto justify-center">
            <button onClick={() => setIsEditOpen(true)} className="btn-primary py-2 px-6">Edit Profile</button>
            <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Followers', 
            value: profile?.subscribersCount || 0,
            animate: animateFollowers 
          },
          { label: 'Following', value: profile?.followingCount || 0 },
          { label: 'Streams Hosted', value: profile?.role === 'creator' ? '12' : '0' },
          { label: 'Watch Time', value: formatWatchTime(profile?.watchTime) }
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 text-center relative overflow-hidden group">
            {stat.animate && (
              <motion.div 
                className="absolute inset-0 bg-primary/10 -z-10"
                initial={{ opacity: 0.8, scale: 0.9 }}
                animate={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              />
            )}
            <motion.p 
              animate={stat.animate ? { scale: [1, 1.2, 1], color: ['#fff', '#ec4899', '#fff'] } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl font-black text-white"
            >
              {stat.value}
            </motion.p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Links Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-lg font-black text-white px-2">Account Settings</h3>
           <div className="glass-card overflow-hidden">
              {[
                { id: 'security', icon: Shield, label: 'Security & Privacy' },
                { id: 'notifications', icon: Bell, label: 'Notification Preferences' },
                { id: 'billing', icon: CreditCard, label: 'Billing & Subscriptions' },
                { id: 'history', icon: History, label: 'Watch History' },
                { id: 'liked', icon: Heart, label: 'Liked Content' },
              ].map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all border-b border-white/5 last:border-0 group text-left ${
                    activeSection === item.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                >
                   <div className="flex items-center gap-3">
                      <item.icon size={20} className={`transition-colors ${activeSection === item.id ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                      <span className={`text-sm font-bold transition-colors ${activeSection === item.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{item.label}</span>
                   </div>
                   <ChevronRight size={16} className={`transition-colors ${activeSection === item.id ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`} />
                </button>
              ))}
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-4 hover:bg-rose-500/10 transition-all text-rose-500 group text-left"
              >
                 <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                 <span className="text-sm font-black uppercase tracking-wider">Sign Out</span>
              </button>
           </div>
        </div>

        {/* Content Section Area */}
        <div className="lg:col-span-2 space-y-4">
           {/* Section Header */}
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-white capitalize">
                {activeSection === 'uploads' ? 'Recent Uploads' : activeSection.replace('-', ' ')}
              </h3>
              <div className="flex items-center gap-2">
                 {activeSection !== 'uploads' && (
                   <button 
                     onClick={() => setActiveSection('uploads')}
                     className="text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
                   >
                     ← Back to Uploads
                   </button>
                 )}
                 <button className="p-1.5 bg-white/5 rounded-lg text-primary"><Grid size={18} /></button>
                 <button className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500"><History size={18} /></button>
              </div>
           </div>

           {/* Tab Content Panels */}
           <div className="min-h-[300px]">
             {activeSection === 'uploads' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videosLoading ? (
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-12">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  ) : videos.length > 0 ? (
                    videos.map(video => (
                      <div 
                        key={video._id} 
                        onClick={() => navigate(`/watch/${video._id}`)}
                        className="glass-card overflow-hidden group cursor-pointer border-transparent hover:border-white/10 transition-all"
                      >
                         <div className="aspect-video bg-slate-800 relative">
                            {video.thumbnail ? (
                              <img 
                                src={video.thumbnail.startsWith('http') ? video.thumbnail : `${SOCKET_URL}/${video.thumbnail.replace(/\\/g, '/')}`} 
                                alt={video.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
                                <Tv size={36} />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-dark/60 to-transparent" />
                            <div className="absolute bottom-3 right-3 text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded">
                              {getVideoDuration(video)}
                            </div>
                         </div>
                         <div className="p-4">
                            <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">{video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 sm:col-span-2 text-center py-12 space-y-2">
                      <div className="w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-slate-600 mx-auto">
                        <Tv size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-400">No uploads found</p>
                      <p className="text-[10px] text-slate-600">This account hasn't uploaded any stream moments yet.</p>
                    </div>
                  )}
               </div>
             )}

             {activeSection === 'security' && (
               <div className="glass-card p-6 space-y-6">
                 {/* Password Reset Form */}
                 <div className="space-y-4">
                   <h4 className="text-sm font-black text-white flex items-center gap-2">
                     <KeyRound size={16} className="text-primary" /> Update Password
                   </h4>
                   
                   {passwordSuccess && (
                     <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
                       <Check size={16} /> {passwordSuccess}
                     </div>
                   )}
                   {passwordError && (
                     <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold">
                       <AlertCircle size={16} /> {passwordError}
                     </div>
                   )}

                   <form onSubmit={handlePasswordUpdate} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="space-y-2 col-span-1 sm:col-span-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
                         <input 
                           type="password" 
                           required
                           value={oldPassword}
                           onChange={(e) => setOldPassword(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                           placeholder="••••••••"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
                         <input 
                           type="password" 
                           required
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                           placeholder="••••••••"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                         <input 
                           type="password" 
                           required
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                           placeholder="••••••••"
                         />
                       </div>
                     </div>
                     <button 
                       type="submit" 
                       disabled={passwordLoading}
                       className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2"
                     >
                       {passwordLoading ? <Loader2 className="animate-spin" size={14} /> : 'Update Password'}
                     </button>
                   </form>
                 </div>

                 {/* Privacy Settings toggles */}
                 <div className="pt-6 border-t border-white/5 space-y-4">
                   <h4 className="text-sm font-black text-white flex items-center gap-2">
                     <Lock size={16} className="text-primary" /> Privacy & Integrity
                   </h4>
                   <div className="space-y-3">
                     {[
                       { key: 'publicProfile', title: "Public Profile Page", desc: "Allow non-subscribers to view my profile timeline." },
                       { key: 'showEmail', title: "Share Email Address", desc: "Display email address to authorized followers." },
                       { key: 'twoFactor', title: "Two-Factor Auth Verification", desc: "Require OTP codes when signing in from unknown devices." }
                     ].map((toggle) => (
                       <div key={toggle.key} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                         <div>
                           <p className="text-xs font-bold text-white">{toggle.title}</p>
                           <p className="text-[10px] text-slate-500 mt-0.5">{toggle.desc}</p>
                         </div>
                         <button 
                           onClick={() => setPrivacyToggles(prev => ({ ...prev, [toggle.key]: !prev[toggle.key] }))}
                           className={`w-10 h-6 rounded-full p-1 transition-colors relative flex items-center ${
                             privacyToggles[toggle.key] ? 'bg-primary' : 'bg-white/10'
                           }`}
                         >
                           <motion.div 
                             layout 
                             className="w-4 h-4 bg-white rounded-full shadow"
                             animate={{ x: privacyToggles[toggle.key] ? 16 : 0 }}
                           />
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}

             {activeSection === 'notifications' && (
               <div className="glass-card p-6 space-y-4">
                 <p className="text-xs text-slate-400">Configure how you receive push alerts, stream broadcasts, and event digests.</p>
                 <div className="space-y-3 pt-2">
                   {[
                     { key: 'streamPush', title: "Stream Live Announcements", desc: "Receive immediate notifications when creators you subscribe to go live." },
                     { key: 'billingEmail', title: "Billing & Subscription Receipts", desc: "Receive emails when premium recurring bills or plans process." },
                     { key: 'subscriberUpdates', title: "New Subscriber Triggers", desc: "Show active alert banners when viewers subscribe to your broadcast." },
                     { key: 'commentReplies', title: "Comment Reply alerts", desc: "Alert me when a user responds to my watch history conversations." }
                   ].map((item) => (
                     <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all">
                       <div>
                         <p className="text-xs font-bold text-white">{item.title}</p>
                         <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                       </div>
                       <button 
                         onClick={() => setNotifPreferences(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                         className={`w-10 h-6 rounded-full p-1 transition-colors relative flex items-center shrink-0 ${
                           notifPreferences[item.key] ? 'bg-primary' : 'bg-white/10'
                         }`}
                       >
                         <motion.div 
                           layout 
                           className="w-4 h-4 bg-white rounded-full shadow"
                           animate={{ x: notifPreferences[item.key] ? 16 : 0 }}
                         />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {activeSection === 'billing' && (
               <div className="glass-card p-6 space-y-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] -z-10" />
                 
                 {/* Card */}
                 <div className="p-6 rounded-2xl bg-gradient-to-tr from-dark-lighter to-slate-900 border border-white/10 relative overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-3">
                     <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded border border-primary/30 uppercase tracking-widest">
                       {profile?.subscription?.plan || 'Free'} Plan Active
                     </span>
                     <div>
                       <h4 className="text-2xl font-black text-white tracking-tight">
                         {profile?.subscription?.plan === 'Premium' ? 'G Plus Pro' : 'Free Watcher'}
                       </h4>
                       <p className="text-xs text-slate-400 mt-0.5">
                         {profile?.subscription?.plan === 'Premium' ? '$9.99 / Month' : 'Unlimited standard access'}
                       </p>
                     </div>
                     <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                       <span>Billing status: Active</span>
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     </div>
                   </div>
                   <div className="shrink-0 flex flex-col gap-2">
                     <button 
                       onClick={() => window.location.href = '/subscription'}
                       className="btn-primary py-2 px-5 text-xs font-black uppercase tracking-wider text-center"
                     >
                       {profile?.subscription?.plan === 'Premium' ? 'Manage Subscription' : 'Upgrade to Pro'}
                     </button>
                     <span className="text-[9px] text-slate-500 text-center">Next payment billing cycle: In 30 days</span>
                   </div>
                 </div>

                 {/* Plan benefits */}
                 <div className="space-y-3">
                   <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Plan Highlights & Details</h5>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       { detail: "Ad-free visual stream feeds", included: profile?.subscription?.plan === 'Premium' },
                       { detail: "Cinema HD 4K live broadcasts", included: profile?.subscription?.plan === 'Premium' },
                       { detail: "Access to private media chats", included: true },
                       { detail: "100GB custom creator file logs", included: profile?.subscription?.plan === 'Premium' }
                     ].map((item, idx) => (
                       <div key={idx} className="flex items-center gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                         <div className={`p-1 rounded-md ${item.included ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-slate-600'}`}>
                           <Check size={12} />
                         </div>
                         <span className={`text-xs ${item.included ? 'text-slate-300 font-bold' : 'text-slate-500 line-through'}`}>{item.detail}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             )}

             {activeSection === 'history' && (
               <div className="glass-card p-6 space-y-4">
                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
                   <p className="text-xs text-slate-400">Keep track of broadcasts or cinematic episodes you recently viewed.</p>
                   {profile?.watchHistory && profile.watchHistory.length > 0 && (
                     <button 
                       onClick={handleClearWatchHistory}
                       className="text-xs font-black text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all flex items-center gap-1 shrink-0"
                     >
                       <Trash2 size={13} /> Clear All
                     </button>
                   )}
                 </div>

                 {profile?.watchHistory && profile.watchHistory.length > 0 ? (
                   <div className="space-y-3 pt-2">
                     {profile.watchHistory.map((item) => {
                       const video = item.video;
                       if (!video) return null;
                       return (
                         <div 
                           key={item._id} 
                           onClick={() => navigate(`/watch/${video._id}`)}
                           className="flex gap-4 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-xl transition-all group cursor-pointer"
                         >
                           <div className="w-24 sm:w-32 aspect-video bg-slate-800 rounded-lg shrink-0 overflow-hidden relative flex items-center justify-center">
                             {video.thumbnail ? (
                               <img 
                                 src={video.thumbnail.startsWith('http') ? video.thumbnail : `${SOCKET_URL}/${video.thumbnail.replace(/\\/g, '/')}`} 
                                 alt={video.title} 
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                               />
                             ) : (
                               <Play size={18} className="text-slate-600 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                             )}
                             <div className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/60 px-1 py-0.2 rounded">{getVideoDuration(video)}</div>
                           </div>
                           <div className="flex-1 min-w-0 self-center">
                             <h5 className="text-xs font-black text-white group-hover:text-primary transition-colors truncate">{video.title}</h5>
                             <p className="text-[10px] text-slate-400 mt-0.5">{video.creator?.name || 'G Plus Creator'}</p>
                             <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-bold">
                               Watched {new Date(item.watchedAt).toLocaleDateString()} • {video.views || 0} views
                             </p>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="text-center py-10 space-y-2">
                     <div className="w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-slate-600 mx-auto">
                       <History size={20} />
                     </div>
                     <p className="text-xs font-bold text-slate-400">Watch history is empty</p>
                     <p className="text-[10px] text-slate-600 max-w-[200px] mx-auto">Cinematic items or creator streams you watch will list here.</p>
                   </div>
                 )}
               </div>
             )}

             {activeSection === 'liked' && (
               <div className="glass-card p-6 space-y-4">
                 <p className="text-xs text-slate-400">Your curated lists of liked streams and video uploads.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                   {likedVideos.map((item) => (
                     <div key={item.id} className="glass-card overflow-hidden group cursor-pointer border-transparent hover:border-white/10 transition-all flex flex-col justify-between">
                       <div className="aspect-video bg-slate-800 relative flex items-center justify-center">
                         <Heart size={20} className="text-slate-600 group-hover:text-primary transition-colors group-hover:scale-110 duration-300" />
                         <div className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded font-bold">{item.duration}</div>
                       </div>
                       <div className="p-3">
                         <h5 className="text-xs font-black text-white group-hover:text-primary transition-colors truncate">{item.title}</h5>
                         <div className="flex items-center justify-between mt-2">
                           <span className="text-[9px] text-slate-500 font-bold">{item.creator}</span>
                           <span className="text-[9px] text-primary font-bold flex items-center gap-1">
                             <Heart size={10} className="fill-primary" /> {item.likes}
                           </span>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md glass-card p-6 relative border-white/15"
            >
              <button 
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Edit Profile</h3>
                  <p className="text-xs text-slate-400">Update your avatar, name, and bio information.</p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar upload */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full relative overflow-hidden group border border-white/10">
                      {avatarPreview ? (
                        <img src={getAvatarUrl(avatarPreview)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                          <Users size={32} />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] cursor-pointer transition-opacity">
                        <Camera size={18} className="mb-1" />
                        Upload
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                    <span className="text-[10px] text-slate-500">Recommended: Square format image</span>
                  </div>

                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                      placeholder="Alex Johnson"
                    />
                  </div>

                  {/* Bio field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white resize-none"
                      placeholder="Tell the community about yourself..."
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setIsEditOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold hover:bg-white/5 transition-all text-slate-300"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={updating}
                      className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Globe, 
  Lock, 
  ArrowRight,
  Shield,
  MessageSquare,
  Hash
} from 'lucide-react';
import { getMyCommunities, createCommunity, joinCommunity, uploadCommunityImage } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const getAvatarUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${SOCKET_URL}/${src.replace(/\\/g, '/')}`;
};

const Communities = () => {
  const navigate = useNavigate();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingAvatar(true);
      const { data } = await uploadCommunityImage(formData);
      setAvatar(data.url);
    } catch (err) {
      alert("Avatar upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingBanner(true);
      const { data } = await uploadCommunityImage(formData);
      setBanner(data.url);
    } catch (err) {
      alert("Banner upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingBanner(false);
    }
  };

  const fetchCommunitiesData = async () => {
    try {
      setLoading(true);
      const { data } = await getMyCommunities();
      setJoinedCommunities(data.joined || []);
      setSuggestedCommunities(data.suggested || []);
    } catch (err) {
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunitiesData();
  }, []);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      setErrorMessage("");
      const { data } = await createCommunity({
        name,
        description,
        avatar: avatar || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=300',
        banner: banner || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800',
        privacy
      });

      setShowCreateModal(false);
      setName("");
      setDescription("");
      setAvatar("");
      setBanner("");
      setPrivacy("PUBLIC");
      
      // Navigate straight to community details
      navigate(`/communities/${data._id}`);
    } catch (err) {
      console.error("Error creating community:", err);
      setErrorMessage(err.response?.data?.message || "Failed to create community");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCommunity = async (id) => {
    try {
      await joinCommunity(id);
      fetchCommunitiesData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join community");
    }
  };

  const filteredJoined = joinedCommunities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggested = suggestedCommunities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 md:space-y-10 pb-20 text-left relative min-h-[calc(100vh-140px)]">
      {/* Banner / Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/30 via-accent/15 to-dark border border-white/5 p-6 md:p-10 flex flex-col md:flex-row gap-6 justify-between items-center shadow-2xl">
        <div className="space-y-3 z-10 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5">
            <Users className="text-primary w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">G Plus Social Grid</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase tracking-tight">
            WhatsApp Communities
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
            Connect parent containers, publish announcement channels to all members, custom assemble group dialogues, and build beautiful community grids.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 z-10 hover:shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Create Community
        </button>
        {/* Decorative Neon Blurs */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-36 h-36 bg-accent/10 rounded-full blur-[60px] pointer-events-none" />
      </div>

      {/* Search Filter Row */}
      <div className="max-w-md relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search communities..." 
          className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white placeholder-slate-500"
        />
      </div>

      {/* Main Section Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">
          Synchronizing communities...
        </div>
      ) : (
        <div className="space-y-10">
          {/* Joined Communities */}
          <section className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 px-1 uppercase tracking-wider">
              <Users size={18} className="text-primary" /> Joined Communities
            </h2>
            
            {filteredJoined.length === 0 ? (
              <div className="glass-card max-w-md p-8 text-center space-y-4 border border-white/5 rounded-3xl">
                <Users size={32} className="text-slate-500 mx-auto opacity-40" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm uppercase">No Communities Yet</h4>
                  <p className="text-xs text-slate-500">You haven't joined or created any communities. Discover public communities below or create your own!</p>
                </div>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 border border-white/10 hover:border-primary/40 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:text-white transition-all bg-white/5 cursor-pointer"
                >
                  Create Community
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJoined.map((community) => (
                  <div
                    key={community._id}
                    onClick={() => navigate(`/communities/${community._id}`)}
                    className="glass-card rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Banner */}
                    <div className="h-24 w-full bg-slate-800 relative overflow-hidden shrink-0">
                      <img 
                        src={getAvatarUrl(community.banner) || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase flex items-center gap-1">
                        {community.privacy === 'PUBLIC' ? (
                          <><Globe size={10} className="text-emerald-400" /> Public</>
                        ) : (
                          <><Lock size={10} className="text-amber-400" /> Private</>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative pt-10">
                      {/* Avatar Overlapping Banner */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 absolute -top-8 left-5 shadow-2xl">
                        <div className="w-full h-full rounded-2xl bg-dark flex items-center justify-center overflow-hidden">
                          {community.avatar ? (
                            <img src={getAvatarUrl(community.avatar)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-lg text-white uppercase">{community.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-left pt-2">
                        <h3 className="font-black text-base text-white group-hover:text-primary transition-colors truncate">
                          {community.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                          {community.description || 'Welcome to this beautiful WhatsApp-styled community container! Browse conversations, join custom sub-groups, and post announcements.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-slate-500">
                        <span className="flex items-center gap-1.5"><Users size={12} className="text-slate-400" /> {community.memberCount || 1} Members</span>
                        <span className="flex items-center gap-1.5"><Hash size={12} className="text-slate-400" /> {community.groups?.length || 1} Groups</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Suggested / Discover Communities */}
          {filteredSuggested.length > 0 && (
            <section className="space-y-4 md:space-y-6 pt-4">
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 px-1 uppercase tracking-wider">
                <Globe size={18} className="text-accent" /> Discover Communities
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSuggested.map((community) => (
                  <div
                    key={community._id}
                    className="glass-card rounded-3xl overflow-hidden group border border-white/5 flex flex-col h-full"
                  >
                    {/* Banner */}
                    <div className="h-24 w-full bg-slate-800 relative overflow-hidden shrink-0">
                      <img 
                        src={getAvatarUrl(community.banner) || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative pt-10 text-left">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 absolute -top-8 left-5 shadow-2xl">
                        <div className="w-full h-full rounded-2xl bg-dark flex items-center justify-center overflow-hidden">
                          {community.avatar ? (
                            <img src={getAvatarUrl(community.avatar)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black text-lg text-white uppercase">{community.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-black text-base text-white truncate">
                          {community.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                          {community.description || 'Welcome to this parent community! Check out announcement updates and join custom group chats.'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pt-1 flex items-center gap-1.5">
                          <Shield size={12} className="text-slate-500" /> Organized by {community.owner?.name || "G Plus User"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                        <button 
                          onClick={() => handleJoinCommunity(community._id)}
                          className="btn-primary w-full py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer"
                        >
                          Join Community
                        </button>
                        <button 
                          onClick={() => navigate(`/communities/${community._id}`)}
                          className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          Preview <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* CREATE MODAL FORM OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg glass-card p-6 md:p-8 rounded-[2rem] border border-white/10 animate-in zoom-in-95 duration-200 text-left space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users size={20} className="text-primary animate-pulse" /> Create Community
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
              >
                Close
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-bold leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateCommunity} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Community Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Esports Hub 🎮"
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your community network..."
                  rows={3}
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Community Avatar Picture</label>
                  <div className="relative flex items-center gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="community-avatar-input"
                    />
                    <label 
                      htmlFor="community-avatar-input"
                      className="flex-1 bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-xs text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition-all text-center border-dashed font-bold border-white/10"
                    >
                      {uploadingAvatar ? "Uploading picture..." : (avatar ? "✓ Picture Uploaded" : "Choose profile pic")}
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block">Community Banner Cover</label>
                  <div className="relative flex items-center gap-2">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      id="community-banner-input"
                    />
                    <label 
                      htmlFor="community-banner-input"
                      className="flex-1 bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-xs text-slate-400 hover:text-white cursor-pointer hover:bg-white/5 transition-all text-center border-dashed font-bold border-white/10"
                    >
                      {uploadingBanner ? "Uploading banner..." : (banner ? "✓ Banner Uploaded" : "Choose banner cover")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Privacy Level</label>
                <select 
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white cursor-pointer"
                >
                  <option value="PUBLIC">Public (Anyone can discover and join)</option>
                  <option value="PRIVATE">Private (By Invitation/Pre-authorization only)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={creating}
                className="w-full py-4 btn-primary rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/10"
              >
                {creating ? "Creating Social Network..." : "Create Social Network"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;

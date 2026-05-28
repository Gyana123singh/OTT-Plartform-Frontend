import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Send,
  MessageSquare,
  Volume2,
  Lock,
  Globe,
  Settings,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Megaphone,
  Radio,
  Clock,
  ArrowLeft,
  X,
  FileText,
  LogOut,
  Trash2
} from 'lucide-react';
import io from 'socket.io-client';
import { 
  getCommunityById, 
  joinCommunity, 
  leaveCommunity, 
  createCommunityGroup, 
  joinCommunityGroup, 
  leaveCommunityGroup, 
  getCommunityGroupMessages,
  inviteToCommunity,
  removeCommunityMember,
  promoteCommunityAdmin,
  deleteCommunity
} from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const getAvatarUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${SOCKET_URL}/${src.replace(/\\/g, '/')}`;
};

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  
  // Data State
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups"); // groups, members, about
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Chat Room State
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const socketRef = useRef();
  const chatEndRef = useRef();

  // Modal States
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [groupCreating, setGroupCreating] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const { data } = await getCommunityById(id);
      setCommunity(data);
      
      // Auto-select announcement group by default
      if (data.announcementGroup && !selectedGroup) {
        // Build selection object
        setSelectedGroup({
          ...data.announcementGroup,
          isJoined: true
        });
      }
    } catch (err) {
      console.error("Error fetching community details:", err);
      if (err.response?.status === 404) {
        navigate('/communities');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityDetails();
  }, [id]);

  // Load chat messages when selected group changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchMessages = async () => {
      setChatLoading(true);
      try {
        const { data } = await getCommunityGroupMessages(selectedGroup._id);
        setChatMessages(data.map(msg => ({
          id: msg._id,
          userId: msg.sender._id,
          user: msg.sender.name,
          avatar: msg.sender.avatar,
          message: msg.text,
          isSelf: msg.sender._id === currentUser?._id,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } catch (err) {
        console.error("Error loading chat messages:", err);
      } finally {
        setChatLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchMessages();

    // Socket Join connection
    socketRef.current = io(SOCKET_URL);
    
    // Join room
    socketRef.current.emit('group:join', { groupId: selectedGroup._id });

    // Message listener
    socketRef.current.on('receive_message', (data) => {
      // Direct room message verification
      if (data.room === `group:${selectedGroup._id}`) {
        setChatMessages(prev => [...prev, {
          id: data.id,
          userId: data.sender?._id || data.user?._id,
          user: data.sender?.name || data.user?.name || 'Guest',
          avatar: data.sender?.avatar || data.user?.avatar,
          message: data.message || data.text,
          isSelf: (data.sender?._id || data.user?._id) === currentUser?._id,
          timestamp: new Date(data.timestamp || data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setTimeout(scrollToBottom, 50);
      }
    });

    // Typing listener
    socketRef.current.on('group:user_typing', ({ user, isTyping }) => {
      if (isTyping && user._id !== currentUser?._id) {
        setTypingUser(user.name);
      } else {
        setTypingUser(null);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('group:leave', { groupId: selectedGroup._id });
        socketRef.current.disconnect();
      }
      setTypingUser(null);
    };
  }, [selectedGroup]);

  // Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || !selectedGroup) return;

    socketRef.current.emit('group:message', {
      groupId: selectedGroup._id,
      message: message.trim(),
      user: currentUser
    });

    // Emit typing off
    socketRef.current.emit('group:typing', {
      groupId: selectedGroup._id,
      user: currentUser,
      isTyping: false
    });

    setMessage("");
  };

  // Typing state emitter
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    if (!socketRef.current || !selectedGroup) return;
    
    const isTyping = e.target.value.trim().length > 0;
    socketRef.current.emit('group:typing', {
      groupId: selectedGroup._id,
      user: currentUser,
      isTyping
    });
  };

  // Create Sub-group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      setGroupCreating(true);
      const { data } = await createCommunityGroup(id, {
        name: groupName,
        description: groupDesc,
        avatar: groupAvatar || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200'
      });

      setShowGroupModal(false);
      setGroupName("");
      setGroupDesc("");
      setGroupAvatar("");
      
      // Reload details and select new group
      await fetchCommunityDetails();
      setSelectedGroup({ ...data, isJoined: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group");
    } finally {
      setGroupCreating(false);
    }
  };

  // Invite member
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      const { data } = await inviteToCommunity(id, { email: inviteEmail });
      alert(data.message);
      setShowInviteModal(false);
      setInviteEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "User invite failed");
    } finally {
      setInviting(false);
    }
  };

  // Join group
  const handleJoinGroup = async (group) => {
    try {
      await joinCommunityGroup(group._id);
      fetchCommunityDetails();
      setSelectedGroup({ ...group, isJoined: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join group");
    }
  };

  // Leave group
  const handleLeaveGroup = async (group) => {
    if (window.confirm(`Are you sure you want to leave ${group.name}?`)) {
      try {
        await leaveCommunityGroup(group._id);
        fetchCommunityDetails();
        setSelectedGroup(null);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to leave group");
      }
    }
  };

  // Community join
  const handleJoinCommunity = async () => {
    try {
      await joinCommunity(id);
      fetchCommunityDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join community");
    }
  };

  // Community leave
  const handleLeaveCommunity = async () => {
    if (window.confirm("Are you sure you want to leave this community? You will lose access to all custom chat groups.")) {
      try {
        await leaveCommunity(id);
        navigate('/communities');
      } catch (err) {
        alert(err.response?.data?.message || "Failed to leave community");
      }
    }
  };

  // Community Delete
  const handleDeleteCommunity = async () => {
    if (window.confirm("🔴 DANGER: Are you absolutely sure you want to delete this community permanently? All groups and announcements will be deleted!")) {
      try {
        await deleteCommunity(id);
        navigate('/communities');
      } catch (err) {
        alert(err.response?.data?.message || "Delete community failed");
      }
    }
  };

  // Promote Member to ADMIN
  const handlePromoteMember = async (userId) => {
    if (window.confirm("Promote this member to Community Admin?")) {
      try {
        await promoteCommunityAdmin(id, { userId });
        fetchCommunityDetails();
      } catch (err) {
        alert(err.response?.data?.message || "Promote failed");
      }
    }
  };

  // Remove / Kick member
  const handleRemoveMember = async (userId) => {
    if (window.confirm("Kick this member from the community and all of its sub-groups?")) {
      try {
        await removeCommunityMember(id, { userId });
        fetchCommunityDetails();
      } catch (err) {
        alert(err.response?.data?.message || "Remove member failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="animate-pulse text-primary font-black uppercase tracking-widest text-sm">Decoding Community Nodes...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center space-y-4">
        <Users size={48} className="opacity-25 text-slate-500" />
        <h3 className="font-bold text-white text-lg uppercase tracking-wider">Social Network Not Found</h3>
        <button onClick={() => navigate('/communities')} className="btn-primary py-2.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider">Back to Grid</button>
      </div>
    );
  }

  const isCommunityMember = community.userRole !== null;
  const isOwner = community.userRole === 'OWNER';
  const isAdmin = community.userRole === 'ADMIN' || isOwner;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 px-0 py-2 sm:px-0 sm:py-4 lg:p-0">
      
      {/* LEFT COLUMN: Sidebar - Groups List, Member List, About info */}
      <div className="w-full lg:w-[360px] h-[40%] lg:h-auto flex flex-col glass-card overflow-hidden shrink-0 border border-white/5 text-left">
        
        {/* Header Block with Back Button */}
        <div className="p-4 border-b border-white/10 shrink-0 relative overflow-hidden bg-slate-900/60">
          <button 
            onClick={() => navigate('/communities')}
            className="flex items-center gap-1 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-wider mb-2.5 cursor-pointer"
          >
            <ArrowLeft size={12} /> Back to Communities
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-0.5 shrink-0 shadow-lg">
              <div className="w-full h-full rounded-xl bg-dark flex items-center justify-center overflow-hidden">
                {community.avatar ? (
                  <img src={getAvatarUrl(community.avatar)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-white uppercase text-base">{community.name.charAt(0)}</span>
                )}
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h2 className="font-black text-sm text-white truncate uppercase tracking-tight">{community.name}</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mt-0.5">
                {community.privacy} COMMUNITY • {community.memberCount || 1} MEMBERS
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 mt-4">
            {!isCommunityMember ? (
              <button 
                onClick={handleJoinCommunity}
                className="btn-primary w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                Join Community
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="btn-primary flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer"
                >
                  Invite Users
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setShowGroupModal(true)}
                    className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    title="Create custom chat group"
                  >
                    <Plus size={12} /> Group
                  </button>
                )}
                {isOwner ? (
                  <button 
                    onClick={handleDeleteCommunity}
                    className="p-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-600/20 transition-all shrink-0 cursor-pointer"
                    title="Permanently Delete Community"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={handleLeaveCommunity}
                    className="p-2 bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-red-500 border border-white/10 rounded-xl transition-all shrink-0 cursor-pointer"
                    title="Leave Community"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/20 text-xs font-black uppercase tracking-wider text-center shrink-0">
          <button 
            onClick={() => setActiveTab("groups")}
            className={cn("flex-1 py-3 border-b-2 transition-all cursor-pointer", activeTab === "groups" ? "border-primary text-white bg-white/5" : "border-transparent text-slate-500 hover:text-white")}
          >
            Groups ({community.groups?.length || 1})
          </button>
          <button 
            onClick={() => setActiveTab("members")}
            className={cn("flex-1 py-3 border-b-2 transition-all cursor-pointer", activeTab === "members" ? "border-primary text-white bg-white/5" : "border-transparent text-slate-500 hover:text-white")}
          >
            Members ({community.members?.length || 1})
          </button>
          <button 
            onClick={() => setActiveTab("about")}
            className={cn("flex-1 py-3 border-b-2 transition-all cursor-pointer", activeTab === "about" ? "border-primary text-white bg-white/5" : "border-transparent text-slate-500 hover:text-white")}
          >
            About
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1 bg-dark/20">
          {activeTab === 'groups' && (
            <div className="space-y-1">
              {/* Official Announcement Group Megaphone element */}
              {community.announcementGroup && (
                <div 
                  onClick={() => setSelectedGroup({ ...community.announcementGroup, isJoined: true })}
                  className={cn(
                    "p-3.5 flex items-center gap-3.5 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 rounded-2xl",
                    selectedGroup?._id === community.announcementGroup._id && "bg-white/5 border-primary/20 shadow-lg"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 relative shadow-inner">
                    <Megaphone size={18} className="animate-pulse" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-dark" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-black text-xs sm:text-sm text-white truncate uppercase tracking-tight flex items-center gap-1.5">
                        {community.announcementGroup.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">OFFICIAL BROADCAST</p>
                  </div>
                </div>
              )}

              {/* Custom subgroups list */}
              {community.groups?.filter(g => !g.isAnnouncementGroup).map(group => (
                <div 
                  key={group._id} 
                  className={cn(
                    "p-3.5 flex items-center justify-between gap-3.5 hover:bg-white/5 transition-all border-b border-white/5 rounded-2xl",
                    selectedGroup?._id === group._id && "bg-white/5 border-primary/20 shadow-lg"
                  )}
                >
                  <div 
                    onClick={() => group.isJoined && setSelectedGroup(group)}
                    className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 relative flex items-center justify-center font-black text-xs shrink-0 border border-white/5 shadow">
                      {group.avatar ? (
                        <img src={getAvatarUrl(group.avatar)} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="uppercase">{group.name.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 truncate">{group.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">{group.description || 'Welcome to this community sub-group dialogue!'}</p>
                    </div>
                  </div>

                  {/* Join / Leave Buttons */}
                  {isCommunityMember && (
                    <div className="shrink-0 ml-2">
                      {group.isJoined ? (
                        <button 
                          onClick={() => handleLeaveGroup(group)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-red-600/10 hover:text-red-500 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-400 transition-all cursor-pointer"
                          title="Leave Sub-group"
                        >
                          Leave
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleJoinGroup(group)}
                          className="px-2.5 py-1.5 bg-primary/20 hover:bg-primary border border-primary/30 text-primary hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          title="Join Sub-group"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {community.groups?.filter(g => !g.isAnnouncementGroup).length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-wider">
                  No custom groups created yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-1">
              {community.members?.map(m => {
                const memberId = m.user?._id;
                const memberName = m.user?.name || "G Plus Member";
                const isTargetOwner = m.role === 'OWNER';
                const isTargetAdmin = m.role === 'ADMIN' || isTargetOwner;

                return (
                  <div key={m._id} className="p-3 flex items-center justify-between gap-3 border-b border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                        {m.user?.avatar ? (
                          <img src={getAvatarUrl(m.user.avatar)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-[10px] uppercase">{memberName.charAt(0)}</span>
                        )}
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-200 truncate flex items-center gap-1.5 leading-tight">
                          {memberName}
                          {isTargetOwner ? (
                            <span className="bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Creator</span>
                          ) : m.role === 'ADMIN' ? (
                            <span className="bg-accent/25 text-accent border border-accent/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Admin</span>
                          ) : null}
                        </h4>
                        <p className="text-[9px] text-slate-500 truncate font-medium mt-0.5">Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Moderation Controls (Only visible to OWNER or ADMIN) */}
                    {isCommunityMember && isAdmin && memberId !== currentUser?._id && !isTargetOwner && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isOwner && !isTargetAdmin && (
                          <button 
                            onClick={() => handlePromoteMember(memberId)}
                            className="p-1 bg-white/5 hover:bg-accent/20 text-slate-400 hover:text-accent border border-white/10 rounded transition-all cursor-pointer"
                            title="Promote to Community Admin"
                          >
                            <ShieldCheck size={12} />
                          </button>
                        )}
                        {(isOwner || m.role === 'MEMBER') && (
                          <button 
                            onClick={() => handleRemoveMember(memberId)}
                            className="p-1 bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-red-500 border border-white/10 rounded transition-all cursor-pointer"
                            title="Kick member from community"
                          >
                            <UserX size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-400 font-medium">
              <div className="space-y-1 text-left">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Profile</h4>
                <p className="text-slate-300 font-normal leading-relaxed">{community.description || 'Welcome to this Parent social grid container. Organize multiple subgroups and official announcements under a single community framework.'}</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">Security / Privacy</span>
                  <span className="text-slate-300 flex items-center gap-1">
                    {community.privacy === 'PUBLIC' ? <><Globe size={10} className="text-emerald-400" /> PUBLIC NETWORK</> : <><Lock size={10} className="text-amber-400" /> PRIVATE ROOM</>}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">Organized By</span>
                  <span className="text-slate-300">{community.owner?.name || 'G Plus Team'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">Created Date</span>
                  <span className="text-slate-300">{new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Area workspace */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden relative min-h-0 border border-white/5 text-left">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs shrink-0 border border-white/5 relative">
                  {selectedGroup.isAnnouncementGroup ? (
                    <Megaphone size={16} className="text-primary animate-pulse" />
                  ) : selectedGroup.avatar ? (
                    <img src={getAvatarUrl(selectedGroup.avatar)} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="uppercase">{selectedGroup.name.charAt(0)}</span>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-dark" />
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm truncate text-white">{selectedGroup.name}</h3>
                  <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest truncate mt-0.5">
                    {typingUser ? `💬 ${typingUser} is typing...` : 'REALTIME SYNCED'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar bg-dark/10">
              {chatLoading ? (
                <div className="flex items-center justify-center h-full opacity-35 text-xs font-black uppercase tracking-widest animate-pulse">
                  Retrieving secure chats...
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-4">
                  {selectedGroup.isAnnouncementGroup ? (
                    <Megaphone size={40} />
                  ) : (
                    <MessageSquare size={40} />
                  )}
                  <p className="text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
                    {selectedGroup.isAnnouncementGroup ? "Announcement Room\nOfficial channel is online" : "End-to-End Chat\nStart a dialogue"}
                  </p>
                </div>
              ) : chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.isSelf ? "ml-auto items-end" : "items-start")}>
                  <div className="flex items-center gap-2 mb-1.5 select-none">
                    {!msg.isSelf && <span className="text-[10px] font-black text-slate-500 uppercase">{msg.user}</span>}
                    <span className="text-[8px] font-bold text-slate-600">{msg.timestamp}</span>
                  </div>
                  <div 
                    className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xl",
                      msg.isSelf 
                        ? "bg-primary text-white rounded-tr-none shadow-primary/20" 
                        : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none font-medium"
                    )}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input / Announcement notice */}
            {selectedGroup.isAnnouncementGroup && !isAdmin ? (
              // RESTRICTION NOTICE FOR NON-ADMINS IN ANNOUNCEMENT GROUP
              <div className="p-4 bg-white/5 border-t border-white/10 shrink-0 text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 select-none">
                <Megaphone size={16} className="text-slate-500 shrink-0" />
                Only admins can send announcements in this community.
              </div>
            ) : (
              // REGULAR CHAT INPUT
              <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white/5 border-t border-white/10 shrink-0">
                <div className="flex items-center gap-2 bg-dark rounded-xl md:rounded-2xl p-2 border border-white/5 focus-within:border-primary/50 transition-all">
                  <input 
                    type="text" 
                    value={message}
                    onChange={handleInputChange}
                    placeholder={selectedGroup.isAnnouncementGroup ? "Broadcast official announcement..." : "Type a message..."} 
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs md:text-sm px-2 w-full min-w-0"
                  />
                  <button 
                    type="submit" 
                    disabled={!message.trim()}
                    className="p-2.5 bg-primary text-white rounded-xl hover:shadow-lg shadow-primary/20 transition-all shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-25 p-6 space-y-4 select-none">
            <Users size={64} className="text-slate-500" />
            <div className="space-y-1">
              <h3 className="text-base font-black uppercase tracking-wider">Social Chat Workspace</h3>
              <p className="text-xs max-w-xs font-medium">Select a group or announcement channel from the left sidebar to load real-time conversation stream.</p>
            </div>
          </div>
        )}
      </div>

      {/* CREATE SUBGROUP MODAL FORM */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 rounded-[2rem] border border-white/10 animate-in zoom-in-95 duration-200 text-left space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus size={18} className="text-primary" /> Create Custom Group
              </h2>
              <button 
                onClick={() => setShowGroupModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                <input 
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Chat Room 💬"
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="Briefly explain topic..."
                  rows={2}
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cover Image URL (Optional)</label>
                <input 
                  type="text"
                  value={groupAvatar}
                  onChange={(e) => setGroupAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                />
              </div>

              <button 
                type="submit"
                disabled={groupCreating}
                className="w-full py-3.5 btn-primary rounded-xl font-black text-xs uppercase tracking-widest mt-2 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {groupCreating ? "Creating Sub-group..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL FORM */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 rounded-[2rem] border border-white/10 animate-in zoom-in-95 duration-200 text-left space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={18} className="text-primary" /> Invite Community Member
              </h2>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">User Email Address</label>
                <input 
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@gplus.com"
                  className="w-full bg-dark border border-white/5 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                />
              </div>

              <button 
                type="submit"
                disabled={inviting}
                className="w-full py-3.5 btn-primary rounded-xl font-black text-xs uppercase tracking-widest mt-2 disabled:opacity-50 cursor-pointer shadow-lg animate-pulse"
              >
                {inviting ? "Pushed Invitation..." : "Send Invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;

import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
   getVideos,
   toggleLike,
   toggleDislike,
   toggleSubscribe,
   incrementViews,
   addComment,
   getComments,
   toggleCommentLike,
   getCommentReplies,
   updateVideoDuration,
   updateWatchTime
} from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Native alternative to date-fns to avoid import errors
const formatDistanceToNow = (date) => {
   const now = new Date();
   const diffInSeconds = Math.floor((now - date) / 1000);

   if (diffInSeconds < 60) return 'just now';
   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
   if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
   return date.toLocaleDateString();
};
import {
   ThumbsUp,
   ThumbsDown,
   Share2,
   Download,
   MoreHorizontal,
   MessageCircle,
   Bell,
   Star,
   Play,
   Clock,
   Check
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const AvatarImage = ({ src, name, socketUrl }) => {
   const [imgStatus, setImgStatus] = useState('loading'); // loading, success, error
   const fullSrc = src ? (src.startsWith('http') ? src : `${socketUrl}/${src.replace(/\\/g, '/')}`) : null;

   useEffect(() => {
      if (!fullSrc) {
         setImgStatus('error');
         return;
      }

      const img = new Image();
      img.src = fullSrc;
      img.referrerPolicy = "no-referrer";

      img.onload = () => setImgStatus('success');
      img.onerror = () => setImgStatus('error');
   }, [fullSrc]);

   if (imgStatus === 'success' && fullSrc) {
      return (
         <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${fullSrc})` }}
         />
      );
   }

   return (
      <div className="w-full h-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-[10px] font-black text-white uppercase">
         {name?.charAt(0) || 'G'}
      </div>
   );
};

const VideoFrame = ({ video: initialVideo }) => {
   const [video, setVideo] = useState(initialVideo);
   const [relatedVideos, setRelatedVideos] = useState([]);
   const [comments, setComments] = useState([]);
   const [commentText, setCommentText] = useState('');
   const [replyingTo, setReplyingTo] = useState(null); // commentId
   const [replyText, setReplyText] = useState('');
   const [replies, setReplies] = useState({}); // { commentId: [replies] }
   const [loading, setLoading] = useState(true);
   const [commentsLoading, setCommentsLoading] = useState(true);
   const [isSubscribed, setIsSubscribed] = useState(false);
   const [subCount, setSubCount] = useState(0);
   const [toastMessage, setToastMessage] = useState(null);
   const navigate = useNavigate();
   const user = JSON.parse(localStorage.getItem('user')) || {};

   useEffect(() => {
      setVideo(initialVideo);
      // Check if user is subscribed to creator
      const creatorId = initialVideo.creator?._id || initialVideo.creator;
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};

      if (creatorId) {
         const subs = initialVideo.creator?.subscribers || [];
         const isSub = (currentUser.following?.includes(creatorId)) || (
            Array.isArray(subs) && currentUser._id 
               ? subs.some(sub => (sub._id?.toString() || sub.toString()) === currentUser._id.toString()) 
               : false
         );
         setIsSubscribed(isSub);
         setSubCount(Array.isArray(subs) ? subs.length : (typeof subs === 'number' ? subs : 0));
      }
   }, [initialVideo]);

   useEffect(() => {
      const fetchRelated = async () => {
         try {
            const { data } = await getVideos({ limit: 6 });
            setRelatedVideos(data.filter(v => v._id !== video._id));
         } catch (err) {
            console.error("Error fetching related videos:", err);
         } finally {
            setLoading(false);
         }
      };

      const handleView = async () => {
         try {
            const { data } = await incrementViews(video._id);
            setVideo(prev => ({
               ...prev,
               views: data.views
            }));
         } catch (err) {
            console.error("Error incrementing views:", err);
         }
      };

      const fetchComments = async () => {
         try {
            const { data } = await getComments(video._id);
            setComments(data);
         } catch (err) {
            console.error("Error fetching comments:", err);
         } finally {
            setCommentsLoading(false);
         }
      };

      fetchRelated();
      handleView();
      fetchComments();
   }, [video._id]);

   const handleDurationLoaded = async (durationSeconds) => {
      if (!durationSeconds || isNaN(durationSeconds)) return;
      
      const mins = Math.floor(durationSeconds / 60);
      const secs = Math.floor(durationSeconds % 60);
      const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      
      if (video && video.duration !== formattedDuration) {
         console.log(`📡 Auto-syncing video duration. DB value: ${video.duration}, Real value: ${formattedDuration}`);
         try {
            await updateVideoDuration(video._id, formattedDuration);
            setVideo(prev => ({
               ...prev,
               duration: formattedDuration
            }));
         } catch (err) {
            console.error("Failed to sync video duration in DB:", err);
         }
      }
   };

   const handleTimePing = async (seconds) => {
      if (!localStorage.getItem('token')) return;
      try {
         const { data } = await updateWatchTime(seconds);
         console.log(`⏱️ Watch time updated: +${seconds}s. Total watch time in DB: ${data.watchTime}s.`);
      } catch (err) {
         console.error("Failed to update watch time:", err);
      }
   };

   const handleLike = async () => {
      if (!localStorage.getItem('token')) return navigate('/login');
      try {
         const { data } = await toggleLike(video._id);
         setVideo(prev => ({
            ...prev,
            likes: new Array(data.likes).fill(null), // Just to update length if needed
            dislikes: new Array(data.dislikes).fill(null)
         }));
         // We might need a better way to sync likes array, but for UI feedback:
         // If we don't have the full array, we just update the count display logic
      } catch (err) {
         console.error("Like error:", err);
      }
   };

   const handleDislike = async () => {
      if (!localStorage.getItem('token')) return navigate('/login');
      try {
         const { data } = await toggleDislike(video._id);
         setVideo(prev => ({
            ...prev,
            likes: new Array(data.likes).fill(null),
            dislikes: new Array(data.dislikes).fill(null)
         }));
      } catch (err) {
         console.error("Dislike error:", err);
      }
   };

   const handleSubscribe = async () => {
      const creatorId = video.creator?._id || video.creator;
      if (!localStorage.getItem('token')) return navigate('/login');

      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      if (creatorId === currentUser._id) {
         alert("You cannot subscribe to yourself!");
         return;
      }

      try {
         const { data } = await toggleSubscribe(creatorId);
         console.log("Toggle Subscribe Response:", data);

         setIsSubscribed(data.isSubscribed);
         setSubCount(data.subscribers);

         const creatorName = (typeof video.creator === 'object' ? video.creator.name : video.creator) || "Creator";
         setToastMessage(data.isSubscribed ? `Subscribed to ${creatorName}` : `Unsubscribed from ${creatorName}`);
         setTimeout(() => setToastMessage(null), 3000);

         // Update local storage user following list
         const updatedUser = { ...currentUser };
         if (data.isSubscribed) {
            updatedUser.following = [...(updatedUser.following || []), creatorId];
         } else {
            updatedUser.following = (updatedUser.following || []).filter(id => id !== creatorId);
         }
         localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
         console.error("Subscribe error:", err);
      }
   };

   const handleCommentSubmit = async (e) => {
      if (e.key !== 'Enter' || !commentText.trim()) return;
      if (!localStorage.getItem('token')) return navigate('/login');

      try {
         const { data } = await addComment(video._id, { text: commentText });
         // Initialize social fields for immediate feedback
         const newComment = {
            ...data,
            likesCount: 0,
            isLiked: false,
            replyCount: 0
         };
         setComments(prev => [newComment, ...prev]);
         setCommentText('');
      } catch (err) {
         console.error("Comment error:", err.response?.data || err);
      }
   };

   const handleReplySubmit = async (commentId) => {
      if (!replyText.trim()) return;
      if (!localStorage.getItem('token')) return navigate('/login');

      try {
         const { data } = await addComment(video._id, {
            text: replyText,
            parentComment: commentId
         });

         const newReply = {
            ...data,
            likesCount: 0,
            isLiked: false
         };

         setReplies(prev => ({
            ...prev,
            [commentId]: [...(prev[commentId] || []), newReply]
         }));
         setReplyText('');
         setReplyingTo(null);
      } catch (err) {
         console.error("Reply error:", err.response?.data || err);
      }
   };

   const handleCommentLike = async (commentId) => {
      if (!localStorage.getItem('token')) return navigate('/login');
      try {
         const { data } = await toggleCommentLike(commentId);

         // Update top-level comments
         setComments(prev => prev.map(c =>
            c._id === commentId ? { ...c, likesCount: data.likes, isLiked: data.isLiked } : c
         ));

         // Update replies state
         setReplies(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(parentKey => {
               updated[parentKey] = updated[parentKey].map(reply =>
                  reply._id === commentId ? { ...reply, likesCount: data.likes, isLiked: data.isLiked } : reply
               );
            });
            return updated;
         });
      } catch (err) {
         console.error("Comment like error:", err);
      }
   };

   const fetchReplies = async (commentId) => {
      try {
         const { data } = await getCommentReplies(commentId);
         setReplies(prev => ({ ...prev, [commentId]: data }));
      } catch (err) {
         console.error("Error fetching replies:", err);
      }
   };

   const handleNext = () => {
      if (relatedVideos.length > 0) {
         setVideo(relatedVideos[0]);
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }
   };

   const handlePrevious = () => {
      // For simplicity, just scroll to top or go back in history
      // Usually you'd track a "history" array, but for now we'll just handle Next
   };

   const isLiked = video.likes?.includes(user._id);
   const isDisliked = video.dislikes?.includes(user._id);
   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 pb-20">
         {/* Main Player Section */}
         <div className="lg:col-span-8 space-y-4 md:space-y-6">
            <VideoPlayer
               src={video.url || video.videoUrl || "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"}
               poster={video.thumbnail || video.thumbnailUrl}
               onNext={handleNext}
               onPrevious={handlePrevious}
               onDurationLoaded={handleDurationLoaded}
               onTimePing={handleTimePing}
            />

            <div className="space-y-4 md:space-y-6 px-4 sm:px-0">
               <h1 className="text-xl md:text-2xl font-black text-white leading-tight">{video.title}</h1>

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 pb-4 md:pb-6 border-b border-white/5">
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                     {(() => {
                        const creatorId = video.creator?._id || video.creator;
                        return (
                           <>
                              <div 
                                 onClick={() => creatorId && navigate(`/creator/${creatorId}`)}
                                 className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-white/5 shadow-inner cursor-pointer hover:opacity-80 transition-all"
                              >
                                 <AvatarImage src={video.creator?.avatar} name={video.creator?.name} socketUrl={SOCKET_URL} />
                              </div>
                              <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1 md:flex-none">
                                 <h4 
                                    onClick={() => creatorId && navigate(`/creator/${creatorId}`)}
                                    className="font-bold text-white flex items-center gap-1.5 md:gap-2 text-sm md:text-base truncate cursor-pointer hover:text-primary transition-all"
                                 >
                                    <span className="truncate">{(typeof video.creator === 'object' ? video.creator.name : video.creator) || "Unknown Creator"}</span> <CheckCircleIcon />
                                 </h4>
                                 <p className="text-[8px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest">{subCount.toLocaleString()} Subscribers</p>
                              </div>
                           </>
                        );
                     })()}
                     {(() => {
                        const creatorId = video.creator?._id || video.creator;
                        const currentUser = JSON.parse(localStorage.getItem('user')) || {};

                        if (currentUser._id === creatorId) return null;

                        return (
                           <button
                              onClick={handleSubscribe}
                              className={cn(
                                 "ml-auto md:ml-4 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[10px] md:text-xs font-black transition-all uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shrink-0",
                                 isSubscribed
                                    ? "bg-white/10 text-white border border-white/10 hover:bg-white/20 hover:text-red-500 hover:border-red-500/50"
                                    : "bg-white text-dark hover:bg-slate-200"
                              )}
                           >
                              {isSubscribed ? <><Check size={12} className="md:w-[14px] md:h-[14px]" /> Unsubscribe</> : 'Subscribe'}
                           </button>
                        );
                     })()}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 max-w-full">
                     <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5 shrink-0">
                        <button
                           onClick={handleLike}
                           className={cn(
                              "flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all text-xs md:text-sm font-bold",
                              isLiked ? "text-primary bg-primary/10" : "hover:bg-white/10"
                           )}
                        >
                           <ThumbsUp size={16} className={cn("md:w-[18px] md:h-[18px]", isLiked ? "fill-primary" : "")} /> {video.likes?.length || 0}
                        </button>
                        <div className="w-px h-4 md:h-6 bg-white/10 mx-1" />
                        <button
                           onClick={handleDislike}
                           className={cn(
                              "flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all text-xs md:text-sm font-bold",
                              isDisliked ? "text-white bg-white/10" : "hover:bg-white/10"
                           )}
                        >
                           <ThumbsDown size={16} className={cn("md:w-[18px] md:h-[18px]", isDisliked ? "fill-white" : "")} />
                        </button>
                     </div>
                     <button
                        onClick={() => {
                           navigator.clipboard.writeText(window.location.href);
                           alert("Link copied to clipboard!");
                        }}
                        className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-xs md:text-sm font-bold shrink-0"
                     >
                        <Share2 size={16} className="md:w-[18px] md:h-[18px]" /> Share
                     </button>
                     <button className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-xs md:text-sm font-bold shrink-0">
                        <Download size={16} className="md:w-[18px] md:h-[18px]" />
                     </button>
                     <button className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all shrink-0">
                        <MoreHorizontal size={16} className="md:w-[18px] md:h-[18px]" />
                     </button>
                  </div>
               </div>

               {/* Description Card */}
               <div className="glass-card p-4 md:p-6 space-y-2 md:space-y-3 hover:bg-white/5 transition-all group cursor-pointer">
                  <div className="flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs font-black text-white uppercase tracking-widest">
                     <span>{(video.views || 0).toLocaleString()} Views</span>
                     <span>{video.createdAt ? `${formatDistanceToNow(new Date(video.createdAt))} ago` : 'Recently'}</span>
                     {video.category && <span className="text-primary">#{video.category}</span>}
                     {video.tags && video.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-primary">#{tag.trim()}</span>
                     ))}
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all whitespace-pre-line">
                     {video.description || "No description provided."}
                  </p>
               </div>

               {/* Comments Section */}
               <div className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <h3 className="text-lg md:text-xl font-black flex items-center gap-3 md:gap-4">
                        <MessageCircle size={20} className="md:w-6 md:h-6 text-primary shrink-0" /> {comments.length.toLocaleString()} Comments
                     </h3>
                     <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest shrink-0 self-start sm:self-auto">
                        <span>Sort By</span>
                        <button className="text-white">Newest</button>
                     </div>
                  </div>

                  <div className="flex gap-3 md:gap-5 items-start">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 shrink-0 overflow-hidden border border-white/5">
                        <AvatarImage src={user.avatar} name={user.name} socketUrl={SOCKET_URL} />
                     </div>
                     <div className="flex-1 space-y-4">
                        <input
                           type="text"
                           value={commentText}
                           onChange={(e) => setCommentText(e.target.value)}
                           onKeyDown={handleCommentSubmit}
                           placeholder="Share your thoughts..."
                           className="w-full bg-white/5 border border-white/5 rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-xs md:text-sm font-medium placeholder:text-slate-600"
                        />
                        <div className="flex justify-end gap-2 md:gap-3">
                           <button onClick={() => setCommentText('')} className="px-3 py-1.5 md:px-5 md:py-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                           <button
                              onClick={() => handleCommentSubmit({ key: 'Enter' })}
                              className="px-4 py-2 md:px-6 md:py-2.5 bg-primary rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                           >
                              Comment
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 pt-4">
                     {commentsLoading ? (
                        <div className="py-10 text-center opacity-20 animate-pulse font-black uppercase tracking-widest text-xs">Loading Conversations...</div>
                     ) : comments.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border border-dashed border-white/5 rounded-3xl">Be the first to start a conversation</div>
                     ) : comments
                        .filter(c => !c.parentComment)
                        .map((comment) => (
                           <div key={comment._id} className="flex gap-5 group relative">
                              {/* Vertical Tree Line */}
                              {comment.replyCount > 0 && replies[comment._id] && (
                                 <div className="absolute left-[19px] top-12 bottom-4 w-0.5 bg-gradient-to-b from-primary/30 to-transparent z-0" />
                              )}

                              <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0 overflow-hidden border border-white/5 shadow-inner z-10">
                                 <AvatarImage src={comment.sender?.avatar} name={comment.sender?.name} socketUrl={SOCKET_URL} />
                              </div>
                              <div className="flex-1 space-y-2">
                                 <div className="flex items-center gap-3">
                                    <h4 className="text-xs font-black text-white">{comment.sender?.name || "G Plus User"}</h4>
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">
                                       {formatDistanceToNow(new Date(comment.createdAt))} ago
                                    </span>
                                 </div>
                                 <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    {comment.text}
                                 </p>
                                 <div className="flex items-center gap-6 pt-1">
                                    <button
                                       onClick={() => handleCommentLike(comment._id)}
                                       className={cn(
                                          "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                                          comment.isLiked ? "text-primary" : "text-slate-600 hover:text-primary"
                                       )}
                                    >
                                       <ThumbsUp size={14} className={comment.isLiked ? "fill-primary" : ""} /> {comment.likesCount || comment.likes?.length || 0}
                                    </button>
                                    <button
                                       onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                       className={cn(
                                          "flex items-center gap-2 text-[10px] font-black transition-colors uppercase tracking-widest",
                                          replyingTo === comment._id ? "text-white" : "text-slate-600 hover:text-white"
                                       )}
                                    >
                                       Reply
                                    </button>
                                 </div>

                                 {/* Inline Reply Box */}
                                 {replyingTo === comment._id && (
                                    <div className="flex gap-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                       <div className="w-8 h-8 rounded-lg bg-primary/20 shrink-0 overflow-hidden border border-white/5">
                                          <AvatarImage src={user.avatar} name={user.name} socketUrl={SOCKET_URL} />
                                       </div>
                                       <div className="flex-1 space-y-3">
                                          <input
                                             type="text"
                                             autoFocus
                                             value={replyText}
                                             onChange={(e) => setReplyText(e.target.value)}
                                             onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)}
                                             placeholder={`Reply to ${comment.sender?.name}...`}
                                             className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-xs font-medium"
                                          />
                                          <div className="flex justify-end gap-2">
                                             <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                                             <button
                                                onClick={() => handleReplySubmit(comment._id)}
                                                className="px-4 py-1.5 bg-primary rounded-full text-[8px] font-black uppercase tracking-widest text-white hover:scale-105 transition-all"
                                             >
                                                Reply
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                 )}

                                 {/* Replies Display */}
                                 {replies[comment._id] ? (
                                    <div className="space-y-6 pt-4 ml-4 pl-6 relative">
                                       {replies[comment._id].map((reply, index) => (
                                          <div key={reply._id} className="flex gap-4 group relative">
                                             {/* Elbow connector line */}
                                             <div className="absolute -left-6 top-4 w-6 h-px bg-primary/20" />
                                             {index === replies[comment._id].length - 1 && (
                                                <div className="absolute -left-6 -top-10 bottom-4 w-px bg-primary/20" />
                                             )}

                                             <div className="w-8 h-8 rounded-lg bg-slate-800 shrink-0 overflow-hidden border border-white/5 shadow-inner z-10">
                                                <AvatarImage src={reply.sender?.avatar} name={reply.sender?.name} socketUrl={SOCKET_URL} />
                                             </div>
                                             <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                   <h5 className="text-[10px] font-black text-white">{reply.sender?.name || "G Plus User"}</h5>
                                                   <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
                                                      {formatDistanceToNow(new Date(reply.createdAt))} ago
                                                   </span>
                                                </div>
                                                <p className="text-xs text-slate-400 font-medium">{reply.text}</p>
                                                <div className="flex items-center gap-4 pt-1">
                                                   <button
                                                      onClick={() => handleCommentLike(reply._id)}
                                                      className={cn(
                                                         "flex items-center gap-2 text-[8px] font-black uppercase tracking-widest transition-colors",
                                                         reply.isLiked ? "text-primary" : "text-slate-600 hover:text-primary"
                                                      )}
                                                   >
                                                      <ThumbsUp size={12} className={reply.isLiked ? "fill-primary" : ""} /> {reply.likesCount || 0}
                                                   </button>
                                                </div>
                                             </div>
                                          </div>
                                       ))}
                                       <button
                                          onClick={() => setReplies(prev => {
                                             const next = { ...prev };
                                             delete next[comment._id];
                                             return next;
                                          })}
                                          className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 hover:text-white transition-colors"
                                       >
                                          Hide Replies
                                       </button>
                                    </div>
                                 ) : comment.replyCount > 0 && (
                                    <button
                                       onClick={() => fetchReplies(comment._id)}
                                       className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                       <div className="w-4 h-px bg-primary/30" /> View {comment.replyCount} {comment.replyCount === 1 ? 'Reply' : 'Replies'}
                                    </button>
                                 )}
                              </div>
                           </div>
                        ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Recommended Sidebar */}
         <div className="lg:col-span-4 space-y-6 px-4 sm:px-0">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] px-2">Up Next</h3>
            <div className="space-y-4">
               {loading ? (
                  <div className="py-10 text-center opacity-20">
                     <span className="animate-pulse">Loading Next...</span>
                  </div>
               ) : relatedVideos.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs font-bold uppercase">No related content</div>
               ) : relatedVideos.map((v) => (
                  <div
                     key={v._id}
                     className="flex gap-3 group cursor-pointer"
                     onClick={() => window.location.href = `/watch/${v._id}`}
                  >
                     <div
                        className="w-32 md:w-40 aspect-video rounded-lg md:rounded-xl overflow-hidden relative border border-white/5 bg-slate-800 shrink-0"
                        style={{
                           backgroundImage: `url(${v.thumbnail?.startsWith('http') ? v.thumbnail : `${SOCKET_URL}/${v.thumbnail?.replace(/\\/g, '/')}`})`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center'
                        }}
                     >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <span className="absolute bottom-1 right-1 text-[8px] font-black bg-black/80 px-1.5 py-0.5 rounded text-white uppercase shrink-0">HD</span>
                     </div>
                     <div className="flex-1 space-y-1 py-1 min-w-0">
                        <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-primary transition-colors leading-tight">{v.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">
                           {(typeof v.creator === 'object' ? v.creator.name : v.creator) || "G Plus Creator"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">{v.views || 0} Views</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

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

const CheckCircleIcon = () => (
   <span className="bg-primary/20 p-0.5 rounded-full">
      <Star size={10} className="text-primary fill-primary" />
   </span>
);

export default VideoFrame;

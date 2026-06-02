import React, { useState, useMemo, useEffect } from 'react';
import { Play, TrendingUp, Star, Clock, Eye, User, ChevronRight, ChevronLeft, Calendar, Users, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getLiveStreams, getVideos } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

const CATEGORIES = ["All", "Gaming", "Music", "Tech", "News", "Movies", "Sports", "Live"];

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [streams, setStreams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 8;

  // Fetch Content from Backend
  const fetchContent = async () => {
    try {
      setLoading(true);
      const [streamsRes, videosRes] = await Promise.all([
        getLiveStreams(),
        getVideos() // Fetch all videos for client-side pagination
      ]);
      setStreams(streamsRes.data);
      setVideos(videosRes.data);
      console.log("DEBUG - Home Streams:", streamsRes.data);
      console.log("DEBUG - Home Videos:", videosRes.data);

    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset page to 1 when video data updates
  useEffect(() => {
    setCurrentPage(1);
  }, [videos]);

  const totalPages = Math.ceil(videos.length / videosPerPage);

  const currentVideos = useMemo(() => {
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    return videos.slice(indexOfFirstVideo, indexOfLastVideo);
  }, [videos, currentPage]);

  useEffect(() => {
    fetchContent();

    // Real-time integration
    const socket = io(SOCKET_URL);

    socket.on('stream_started', () => fetchContent());
    socket.on('stream_ended', () => fetchContent());

    return () => socket.disconnect();
  }, []);

  const filteredStreams = useMemo(() => {
    if (activeCategory === "All") return streams;
    return streams.filter(stream => stream.category === activeCategory);
  }, [activeCategory, streams]);

  const handleHeroClick = () => {
    const featuredStream = streams[0];
    if (featuredStream) {
      navigate(`/live/${featuredStream._id || featuredStream.id}`, { state: { video: featuredStream } });
    } else {
      navigate('/live');
    }
  };

  return (
    <div className="space-y-8 md:space-y-10 pb-20 px-0">
      {/* Hero Section */}
      <section className="relative h-[350px] md:h-[400px] rounded-3xl md:rounded-[2rem] overflow-hidden group cursor-pointer" onClick={handleHeroClick}>
        <div className="absolute inset-0 bg-gradient-to-r from-dark/80 md:from-dark via-dark/60 md:via-dark/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-20 max-w-2xl space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="bg-primary px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase text-white shadow-lg shadow-primary/30">FEATURED</span>
            <span className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-slate-300 uppercase tracking-widest"><Eye size={12} /> 1.2M Viewers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight"
          >
            Experience the Future <br className="hidden sm:block" /> of Live Entertainment.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-sm md:text-lg max-w-lg"
          >
            Join millions of fans watching high-quality live streams, movies, and community news in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 pt-2 md:pt-4 w-full sm:w-auto"
          >
            <button className="btn-primary py-3 px-6 md:px-8 flex items-center justify-center gap-3 text-xs md:text-sm tracking-widest font-black w-full sm:w-auto">
              <Play size={20} fill="white" /> WATCH NOW
            </button>
            <button className="py-3 px-6 md:px-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs md:text-sm font-black transition-all border border-white/10 w-full sm:w-auto">
              LEARN MORE
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap
              ${activeCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Now */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
            <TrendingUp className="text-primary w-5 h-5 md:w-6 md:h-6" /> {activeCategory === "All" ? "Trending Streams" : `${activeCategory} Streams`}
          </h2>
          <button className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
            VIEW ALL <ChevronRight size={16} />
          </button>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">
                Synchronizing with G Plus Core...
              </div>
            ) : filteredStreams.map((stream) => (
              <motion.div
                key={stream._id || stream.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/live/${stream._id || stream.id}`, { state: { video: stream } })}
                className="group cursor-pointer"
              >
                <div
                  className={cn(
                    "aspect-video rounded-3xl relative overflow-hidden shadow-xl group-hover:shadow-primary/20 transition-all border border-white/5 bg-slate-800",
                    !stream.thumbnail?.includes('/') && stream.thumbnail
                  )}
                  style={stream.thumbnail ? {
                    backgroundImage: `url(${stream.thumbnail.startsWith('http') ? stream.thumbnail : `${SOCKET_URL}/${stream.thumbnail.replace(/\\/g, '/')}`})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-red-600 px-2 py-0.5 rounded-lg text-[8px] font-black text-white flex items-center gap-1 shadow-lg shadow-red-600/30">
                      <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> LIVE
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-[8px] font-black text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                    <Eye size={10} /> {stream.viewerCount || 0}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Play size={20} className="text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 px-1">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl shrink-0 shadow-lg bg-slate-700 overflow-hidden",
                      (!stream.creator?.avatar || !stream.creator.avatar.includes('/')) && (stream.avatar || 'bg-primary/20')
                    )}
                  >
                    {stream.creator?.avatar && (
                      <img
                        src={stream.creator.avatar.startsWith('http') ? stream.creator.avatar : `${SOCKET_URL}/${stream.creator.avatar.replace(/\\/g, '/').replace(/^\//, '')}`}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">{stream.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span>{stream.creator?.name || stream.creator}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span>{stream.category}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Recent Uploads */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
            <Clock className="text-accent w-5 h-5 md:w-6 md:h-6" /> Recent Uploads
          </h2>
          <button onClick={() => navigate('/discovery')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
            EXPLORE ALL <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full py-10 text-center opacity-20">
              <span className="animate-pulse">Loading Library...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 text-sm font-bold uppercase tracking-widest bg-white/5 rounded-3xl border border-dashed border-white/10">
              No videos uploaded yet
            </div>
          ) : currentVideos.map((video) => (
            <motion.div
              key={video._id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/watch/${video._id}`, { state: { video } })}
              className="group cursor-pointer"
            >
              <div
                className="aspect-video rounded-3xl overflow-hidden relative border border-white/5 bg-slate-800"
                style={{
                  backgroundImage: `url(${video.thumbnail?.startsWith('http') ? video.thumbnail : `${SOCKET_URL}/${video.thumbnail?.replace(/\\/g, '/')}`})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <Play size={16} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-3">
                 <div 
                   onClick={(e) => {
                     e.stopPropagation();
                     const creatorId = video.creator?._id || video.creator;
                     if (creatorId) navigate(`/creator/${creatorId}`);
                   }}
                   className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-white/5 shadow-inner cursor-pointer hover:opacity-80 transition-opacity"
                 >
                    <AvatarImage src={video.creator?.avatar} name={video.creator?.name} socketUrl={SOCKET_URL} />
                 </div>
                 <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors leading-tight">{video.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                       <span 
                         onClick={(e) => {
                           e.stopPropagation();
                           const creatorId = video.creator?._id || video.creator;
                           if (creatorId) navigate(`/creator/${creatorId}`);
                         }}
                         className="truncate cursor-pointer hover:text-primary transition-colors"
                       >
                         {(typeof video.creator === 'object' ? video.creator.name : video.creator) || "G Plus Creator"}
                       </span>
                       <span className="w-1 h-1 bg-slate-700 rounded-full shrink-0" />
                       <span className="shrink-0">{video.views || 0} Views</span>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Premium Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5 px-2">
            <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">
              Showing Page <span className="text-white font-black">{currentPage}</span> of <span className="text-white font-black">{totalPages}</span> ({videos.length} videos)
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:border-white/5 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </motion.button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = currentPage === pageNumber;
                  return (
                    <motion.button
                      key={pageNumber}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={cn(
                        "w-10 h-10 flex items-center justify-center rounded-2xl text-xs font-bold transition-all border",
                        isActive
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10"
                      )}
                    >
                      {pageNumber}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-white/5 disabled:hover:border-white/5 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        )}
      </section>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-accent hidden sm:block" /> Trending Collections
          </h3>
          <button onClick={() => navigate('/discovery')} className="text-[10px] md:text-xs font-bold text-primary hover:underline">Explore All <span className="hidden sm:inline">Collections</span></button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: "E-Sports", id: "e-sports", color: "from-blue-600/20" },
            { label: "Classical Music", id: "music", color: "from-purple-600/20" },
            { label: "Tech Reviews", id: "tech", color: "from-cyan-600/20" },
            { label: "Local News", id: "news", color: "from-emerald-600/20" }
          ].map((col, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`glass-card p-4 md:p-10 text-center hover:bg-white/5 transition-all cursor-pointer group relative overflow-hidden bg-gradient-to-br ${col.color} to-transparent border-white/5`}
              onClick={() => navigate(`/collection/${col.id}`)}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl md:rounded-[2rem] mx-auto mb-3 md:mb-4 flex items-center justify-center group-hover:scale-110 group-hover:text-primary transition-all duration-500 shadow-xl">
                <Clock size={24} className="md:w-8 md:h-8" />
              </div>
              <h4 className="font-black text-white text-xs md:text-sm uppercase tracking-widest truncate">{col.label}</h4>
              <p className="text-[8px] md:text-[10px] text-slate-500 mt-1 md:mt-2 uppercase font-black tracking-tighter">200+ Videos</p>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Community Section CTA */}
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-6 md:p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden text-center md:text-left">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />

        <div className="space-y-3 md:space-y-4 relative z-10 w-full">
          <h2 className="text-2xl md:text-3xl font-black">Become a Creator</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto md:mx-0">
            Start your own broadcast, grow your community, and earn rewards for your content. The stage is yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
            <button className="btn-primary w-full sm:w-auto px-8 py-3">Start Streaming</button>
            <button className="text-slate-300 font-medium hover:text-white transition-colors w-full sm:w-auto">Learn More</button>
          </div>
        </div>
        <div className="relative z-10 hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="w-32 h-32 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md flex items-center justify-center">
              <Calendar size={32} className="text-primary" />
            </div>
            <div className="w-32 h-32 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md flex items-center justify-center">
              <Users size={32} className="text-accent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

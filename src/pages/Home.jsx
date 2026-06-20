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
      <section className="relative min-h-[400px] md:min-h-[480px] lg:min-h-[520px] flex flex-col items-center justify-center overflow-hidden mx-0 sm:mx-0 pt-16 pb-28 md:pt-20 md:pb-36 px-4" onClick={handleHeroClick}>
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />

        <div className="relative z-30 max-w-3xl mx-auto flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
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
            className="text-slate-300 text-sm md:text-lg max-w-lg mx-auto"
          >
            Join millions of fans watching high-quality live streams, movies, and community news in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4 w-full sm:w-auto"
          >
            <button className="btn-primary py-3 px-6 md:px-8 flex items-center justify-center gap-3 text-xs md:text-sm tracking-widest font-black w-full sm:w-auto">
              <Play size={20} fill="white" /> WATCH NOW
            </button>
            <button className="py-3 px-6 md:px-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs md:text-sm font-black transition-all border border-white/10 w-full sm:w-auto">
              LEARN MORE
            </button>
          </motion.div>
        </div>

        {/* Curved Divider Arch */}
        <div className="absolute -bottom-1 left-[50%] -translate-x-[50%] w-[140%] sm:w-[180%] h-[100px] rounded-t-[100%] bg-dark border-t-[3px] border-[#e50914] z-20 shadow-[0_-8px_25px_rgba(229,9,20,0.5)]" />
      </section>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 px-1 sm:px-0 no-scrollbar">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border whitespace-nowrap
              ${activeCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Now */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
            <TrendingUp className="text-primary w-5 h-5 md:w-6 md:h-6" /> {activeCategory === "All" ? "Trending Streams" : `${activeCategory} Streams`}
          </h2>
          <button className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
            VIEW ALL <ChevronRight size={16} />
          </button>
        </div>

        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-6 px-1 sm:px-0"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">
                Synchronizing with G Plus Core...
              </div>
            ) : filteredStreams.slice(0, 9).map((stream) => {
              const thumbnailSrc = stream.thumbnail ? (stream.thumbnail.startsWith('http') ? stream.thumbnail : `${SOCKET_URL}/${stream.thumbnail.replace(/\\/g, '/')}`) : null;

              return (
                <motion.div
                  key={stream._id || stream.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/live/${stream._id || stream.id}`, { state: { video: stream } })}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div className="relative aspect-[2/3] sm:aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/5 shadow-xl group-hover:shadow-primary/20 transition-all">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
                        <Play size={24} />
                      </div>
                    )}
                    {/* Live Badge (top left) */}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-1 shadow-lg shadow-red-600/30">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" /> LIVE
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-primary transition-colors leading-tight px-1 text-left">
                    {stream.title}
                  </h3>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredStreams.length > 9 && (
          <div className="flex justify-center pt-2 px-1">
            <button
              onClick={() => navigate('/live')}
              className="w-full sm:w-auto py-2.5 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 tracking-widest uppercase text-center"
            >
              View All Streams
            </button>
          </div>
        )}
      </section>

      {/* Recent Uploads */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3">
            <Clock className="text-accent w-5 h-5 md:w-6 md:h-6" /> Recent Uploads
          </h2>
          <button onClick={() => navigate('/discovery')} className="text-[10px] md:text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
            EXPLORE ALL <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 md:gap-6 px-1 sm:px-0">
          {loading ? (
            <div className="col-span-full py-10 text-center opacity-20">
              <span className="animate-pulse">Loading Library...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 text-sm font-bold uppercase tracking-widest bg-white/5 rounded-3xl border border-dashed border-white/10">
              No videos uploaded yet
            </div>
          ) : videos.slice(0, 9).map((video) => {
            const thumbnailSrc = video.thumbnail ? (video.thumbnail.startsWith('http') ? video.thumbnail : `${SOCKET_URL}/${video.thumbnail.replace(/\\/g, '/')}`) : null;

            return (
              <motion.div
                key={video._id}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/watch/${video._id}`, { state: { video } })}
                className="group cursor-pointer flex flex-col gap-2"
              >
                <div className="relative aspect-[2/3] sm:aspect-video rounded-2xl overflow-hidden bg-slate-800 border border-white/5 shadow-xl group-hover:shadow-primary/20 transition-all">
                  {thumbnailSrc ? (
                    <img
                      src={thumbnailSrc}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
                      <Play size={24} />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h4 className="font-bold text-white text-xs sm:text-sm truncate group-hover:text-primary transition-colors leading-tight px-1 text-left">
                  {video.title}
                </h4>
              </motion.div>
            );
          })}
        </div>

        {!loading && videos.length > 9 && (
          <div className="flex justify-center pt-2 px-1">
            <button
              onClick={() => navigate('/discovery')}
              className="w-full sm:w-auto py-2.5 px-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 tracking-widest uppercase text-center"
            >
              View All Videos
            </button>
          </div>
        )}
      </section>
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-accent hidden sm:block" /> Trending Collections
          </h3>
          <button onClick={() => navigate('/discovery')} className="text-[10px] md:text-xs font-bold text-primary hover:underline">Explore All <span className="hidden sm:inline">Collections</span></button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-10 md:gap-6 px-1 sm:px-0">
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
      <section className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl p-6 md:p-10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden text-center md:text-left mx-1 sm:mx-0">
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

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Grid, List, TrendingUp, Star, Clock, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getVideos, getLiveStreams } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const AvatarImage = ({ src, name, socketUrl }) => {
  const [imgStatus, setImgStatus] = useState('loading'); // loading, success, error
  const [fullSrc, setFullSrc] = useState(null);

  useEffect(() => {
    const calculatedSrc = src ? (src.startsWith('http') ? src : `${socketUrl}/${src.replace(/\\/g, '/')}`) : null;
    setFullSrc(calculatedSrc);

    if (!calculatedSrc) {
      setImgStatus('error');
      return;
    }

    const img = new Image();
    img.src = calculatedSrc;
    img.referrerPolicy = "no-referrer";

    img.onload = () => setImgStatus('success');
    img.onerror = () => setImgStatus('error');
  }, [src, socketUrl]);

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

const CATEGORIES = ["All Content", "Live Now", "Most Viewed", "Recent", "Trending", "Upcoming"];

const Discovery = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All Content");
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (activeFilter === "Live Now") {
        const { data } = await getLiveStreams();
        setContent(data.map(item => ({ ...item, isLive: true })));
      } else {
        const params = {
          category: activeFilter === "All Content" ? null : activeFilter,
          sort: activeFilter
        };
        const { data } = await getVideos(params);
        setContent(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching discovery content:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [activeFilter]);

  const filteredContent = content; // Logic handled in fetchContent

  return (
    <div className="space-y-6 md:space-y-10 pb-20 px-4 md:px-0">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-black text-white">Discover Content</h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">Explore live streams, videos, and news from across the G Plus network.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by title, creator, category, or region..."
              className="w-full bg-dark-lighter border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-xl"
            />
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all">
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Discovery Navigation */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveFilter(cat)}
            className={`px-6 py-3 text-sm font-bold whitespace-nowrap transition-all relative
              ${activeFilter === cat ? 'text-white' : 'text-slate-500 hover:text-white'}`}
          >
            {cat}
            {activeFilter === cat && <motion.div layoutId="activeTabDisc" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {/* Grid Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span>Showing <span className="text-white">{filteredContent.length}</span> results</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Sorted by: <span className="text-primary cursor-pointer hover:underline">Most Relevant</span></span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button className="p-2 bg-white/10 text-white rounded-lg"><Grid size={18} /></button>
          <button className="p-2 hover:bg-white/5 text-slate-500 rounded-lg"><List size={18} /></button>
        </div>
      </div>

      {/* Content Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {loading ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-[0.2em] animate-pulse">
              Synchronizing with G Plus Core...
            </div>
          ) : content.map((item) => (
            <motion.div
              key={item._id || item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              onClick={() => {
                if (item.isLive) {
                  navigate(`/live/${item._id || item.id}`, { state: { video: item } });
                } else {
                  navigate(`/watch/${item._id || item.id}`, { state: { video: item } });
                }
              }}
              className="group cursor-pointer"
            >
              <div
                className={cn(
                  "aspect-video rounded-2xl overflow-hidden relative border border-white/5 shadow-lg group-hover:border-primary/50 transition-all bg-slate-800",
                  !item.thumbnail?.includes('/') && (item.thumbnail || 'bg-gradient-to-tr from-slate-700 to-slate-900')
                )}
                style={item.thumbnail ? {
                  backgroundImage: `url(${item.thumbnail.startsWith('http') ? item.thumbnail : `${SOCKET_URL}/${item.thumbnail.replace(/\\/g, '/')}`})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded uppercase">Premium</span>
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md text-white text-[8px] font-black rounded uppercase">4K</span>
                  </div>
                </div>
                {item.isLive && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-lg shadow-red-600/30 animate-pulse">
                    <span className="w-1 h-1 bg-white rounded-full" /> LIVE
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-300">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <Play size={20} className="text-white fill-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-white/5 shadow-lg">
                  <AvatarImage src={item.creator?.avatar} name={item.creator?.name} socketUrl={SOCKET_URL} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {(typeof item.creator === 'object' ? item.creator.name : item.creator) || "Unknown Creator"} • {item.views || 0} Views
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Featured Creator Section */}
      <section className="glass-card p-6 md:p-8 border-dashed border-white/20 mt-6 md:mt-0">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-primary to-accent p-1 shrink-0">
            <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-slate-700" />
            </div>
          </div>
          <div className="flex-1 space-y-3 md:space-y-4 text-center md:text-left w-full">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
                Sarah Miller <Star size={20} className="text-yellow-500 fill-yellow-500" />
              </h2>
              <p className="text-primary text-xs md:text-sm font-bold uppercase tracking-widest">Top Rated Creator of the Month</p>
            </div>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto md:mx-0">
              Specializing in high-quality travel documentaries and cinematic storytelling. Join her community of 1M+ followers and explore the world from home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 pt-2">
              <button className="btn-primary px-8 w-full sm:w-auto py-3">Follow Now</button>
              <button
                onClick={() => navigate('/creator/sarah-miller')}
                className="btn-secondary px-8 w-full sm:w-auto py-3"
              >
                View Channel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Collections */}
      <div className="space-y-4 md:space-y-6">
        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <TrendingUp size={24} className="text-accent" /> Trending Collections
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "E-Sports", id: "e-sports" },
            { label: "Classical Music", id: "music" },
            { label: "Tech Reviews", id: "tech" },
            { label: "Local News", id: "news" }
          ].map((col, i) => (
            <div
              key={i}
              className="glass-card p-4 md:p-8 text-center hover:bg-white/5 transition-all cursor-pointer group"
              onClick={() => navigate(`/collection/${col.id}`)}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl md:rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center group-hover:scale-110 group-hover:text-primary transition-all">
                <Clock size={20} className="md:w-6 md:h-6" />
              </div>
              <h4 className="font-bold text-white text-xs md:text-sm truncate">{col.label}</h4>
              <p className="text-[8px] md:text-[10px] text-slate-500 mt-1 md:mt-2 uppercase font-black">200+ Videos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Discovery;

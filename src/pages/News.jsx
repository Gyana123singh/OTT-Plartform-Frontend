import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Play, 
  Clock, 
  Globe, 
  RefreshCw, 
  BookOpen, 
  User, 
  ExternalLink,
  Bookmark,
  Sparkles,
  X,
  Flame,
  Tv,
  Share2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getTopHeadlines, searchNews, getTrendingNews } from '../services/newsApi';
import BreakingTicker from '../components/BreakingTicker';
import SearchBar from '../components/SearchBar';
import { clsx } from 'clsx';

// Production GNews Country Mapping
const COUNTRY_MAP = [
  { name: "All", code: "world", flag: "🌐" },
  { name: "India", code: "in", flag: "🇮🇳" },
  { name: "USA", code: "us", flag: "🇺🇸" },
  { name: "UK", code: "gb", flag: "🇬🇧" },
  { name: "Canada", code: "ca", flag: "🇨🇦" },
  { name: "Australia", code: "au", flag: "🇦🇺" },
  { name: "Japan", code: "jp", flag: "🇯🇵" },
  { name: "Germany", code: "de", flag: "🇩🇪" },
  { name: "France", code: "fr", flag: "🇫🇷" },
  { name: "Brazil", code: "br", flag: "🇧🇷" },
  { name: "Russia", code: "ru", flag: "🇷🇺" },
  { name: "Singapore", code: "sg", flag: "🇸🇬" }
];

// Production GNews Categories
const CATEGORIES = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health"
];

const TRENDING_TOPICS = [
  { label: "Artificial Intelligence", query: "AI OR OpenAI OR Nvidia" },
  { label: "Space Exploration", query: "NASA OR SpaceX OR Mars" },
  { label: "Crypto Telemetry", query: "Bitcoin OR Ethereum OR Blockchain" },
  { label: "Climate Innovation", query: "Fusion OR Solar OR Renewable" }
];

const VIDEO_BRIEFINGS = [
  {
    id: "vid_1",
    title: "Global Financial Markets Shift as Cyber Security Protocols Upgrade Worldwide",
    summary: "Breaking telemetry from global trading hubs shows immediate reactions following the unified GNews API security agreements.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "142K views",
    duration: "2:15",
    channel: "G Plus Markets Live",
    publishedAt: "2h ago"
  },
  {
    id: "vid_2",
    title: "Exclusive: Inside the Prometheus Mars Rover Command Center",
    summary: "Live satellite telemetry and interviews with space agency command in Pasadena regarding equatorial ice glaciers.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    views: "98K views",
    duration: "4:32",
    channel: "Astro Science Corp",
    publishedAt: "6h ago"
  },
  {
    id: "vid_3",
    title: "Next-Gen Quantum Processors: The 512-Qubit Decoherence Breakdown",
    summary: "Tech engineers explain the physics behind isolating topological qubits and what this means for classical encryption systems.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    views: "230K views",
    duration: "6:10",
    channel: "Tech Future Intel",
    publishedAt: "1d ago"
  }
];

// Glassmorphism Skeleton Loader Card Grid
const SkeletonCard = () => (
  <div className="glass-card animate-pulse overflow-hidden flex flex-col h-full border border-white/5 rounded-2xl bg-white/[0.02]">
    <div className="aspect-video bg-white/5 relative" />
    <div className="p-4 md:p-6 space-y-4 flex-grow flex flex-col justify-between">
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-5 bg-white/10 rounded w-full" />
        <div className="h-5 bg-white/10 rounded w-5/6" />
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-4/5" />
        </div>
      </div>
      <div className="h-4 bg-white/5 rounded w-2/5 pt-2" />
    </div>
  </div>
);

const News = () => {
  const [news, setNews] = useState([]);
  const [tickerNews, setTickerNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCountry, setActiveCountry] = useState("in"); // Default to India
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  // Premium Layout States
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' or 'videos'
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTrendingTopic, setActiveTrendingTopic] = useState("");
  
  // AI summary states
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTypingText, setAiTypingText] = useState("");

  // Debounce search input changes by 500ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      if (searchQuery.trim()) {
        setActiveTrendingTopic("");
        setShowBookmarksOnly(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load saved bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gplus_news_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse bookmarks:", e);
      }
    }
  }, []);

  // Fetch breaking headlines once for marquee ticker
  useEffect(() => {
    const loadTicker = async () => {
      try {
        const headlines = await getTopHeadlines('world', 'general', 1);
        setTickerNews(headlines.slice(0, 10));
      } catch (err) {
        console.warn("Could not load breaking news ticker:", err);
      }
    };
    loadTicker();
  }, []);

  // Fetch Initial News Grid Block on Filter/Search update
  const fetchInitialNews = async () => {
    if (showBookmarksOnly) {
      setNews(bookmarks);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setFetchError(false);
    setPage(1);
    setHasMore(true);

    try {
      let articles = [];
      if (debouncedQuery.trim()) {
        articles = await searchNews(debouncedQuery, 1);
      } else if (activeTrendingTopic) {
        articles = await searchNews(activeTrendingTopic, 1);
      } else if (activeCountry === "world") {
        articles = await getTrendingNews(1);
      } else {
        articles = await getTopHeadlines(activeCountry, activeCategory, 1);
      }
      setNews(articles);
      if (articles.length < 10) setHasMore(false);
    } catch (error) {
      console.error("Error loading GNews feed:", error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Next Page (called automatically by react-infinite-scroll-component)
  const fetchNextNewsPage = async () => {
    if (loadingMore || !hasMore || showBookmarksOnly) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      let nextArticles = [];

      if (debouncedQuery.trim()) {
        nextArticles = await searchNews(debouncedQuery, nextPage);
      } else if (activeTrendingTopic) {
        nextArticles = await searchNews(activeTrendingTopic, nextPage);
      } else if (activeCountry === "world") {
        nextArticles = await getTrendingNews(nextPage);
      } else {
        nextArticles = await getTopHeadlines(activeCountry, activeCategory, nextPage);
      }

      if (nextArticles.length === 0) {
        setHasMore(false);
      } else {
        setNews(prev => {
          const combined = [...prev, ...nextArticles];
          // Filter duplicates based on unique id
          const unique = combined.filter((art, idx, self) => 
            self.findIndex(a => a.id === art.id) === idx
          );
          return unique;
        });
        setPage(nextPage);
        if (nextArticles.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.warn("Could not fetch next news page:", error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialNews();
  }, [activeCountry, activeCategory, debouncedQuery, activeTrendingTopic, showBookmarksOnly]);

  // Bookmark Syncing
  const saveBookmarks = (newBookmarks) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('gplus_news_bookmarks', JSON.stringify(newBookmarks));
    if (showBookmarksOnly) {
      setNews(newBookmarks);
    }
  };

  const toggleBookmark = (e, article) => {
    e.stopPropagation();
    const isBookmarked = bookmarks.some(b => b.title === article.title);
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter(b => b.title !== article.title);
    } else {
      updated = [...bookmarks, article];
    }
    saveBookmarks(updated);
  };

  // Simulated cyber AI summarizer typing stream
  const handleAISummary = (article) => {
    setAiLoading(true);
    setAiSummary(null);
    setAiTypingText("");
    
    const threatSeed = Math.abs(article.title.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 60 + 35;
    const finalThreat = threatSeed + "%";
    
    let threatCategory = "Medium Risk Alert";
    let threatColor = "text-yellow-400";
    if (threatSeed > 70) {
      threatCategory = "High Priority Threat Vector";
      threatColor = "text-red-500";
    } else if (threatSeed < 50) {
      threatCategory = "Standard Info Matrix";
      threatColor = "text-green-400";
    }

    const payload = {
      threat: finalThreat,
      threatClass: threatCategory,
      threatColor,
      verdict: "Decoded Strategic Signal",
      bulletPoints: [
        `Summary Analysis: "${article.title.slice(0, 48)}..." signals key operational changes within the region.`,
        `Direct Consequence: Structural markets and local telemetry are projected to readjust accordingly.`,
        `Secured Guideline: Continuous satellite telemetry monitoring is highly recommended.`
      ]
    };

    setTimeout(() => {
      setAiLoading(false);
      setAiSummary(payload);
      
      let currentIdx = 0;
      const fullText = `[AI INTEL DECODER ENGINE v4.5]\n\nVERDICT: ${payload.verdict}\nTHREAT RATIO: ${payload.threat} (${payload.threatClass})\n\nKEY INTELLIGENCE:\n1. ${payload.bulletPoints[0]}\n2. ${payload.bulletPoints[1]}\n3. ${payload.bulletPoints[2]}\n\n[END DATA DECRYPT]`;
      
      const interval = setInterval(() => {
        setAiTypingText(fullText.slice(0, currentIdx));
        currentIdx += 2;
        if (currentIdx > fullText.length) {
          clearInterval(interval);
        }
      }, 10);
    }, 1200);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (isNaN(seconds) || seconds < 0) return "2h ago";
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return Math.floor(seconds/60) + "m ago";
    if (seconds < 86400) return Math.floor(seconds/3600) + "h ago";
    return Math.floor(seconds/86400) + "d ago";
  };

  const copyShareLink = (e, url) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    alert("Copied briefing telemetry link!");
  };

  const getCountryName = (code) => {
    const match = COUNTRY_MAP.find(c => c.code === code);
    return match ? `${match.flag} ${match.name.toUpperCase()}` : "🌐 WORLD";
  };

  return (
    <div className="space-y-6 pb-20 select-none">
      {/* Auto-scrolling auto-marquee top ticker component */}
      {tickerNews.length > 0 && (
        <BreakingTicker headlines={tickerNews} onArticleClick={(art) => setSelectedArticle(art)} />
      )}

      {/* Main Title Banner & tab control panels */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 px-4 sm:px-0">
        <div className="text-center lg:text-left flex flex-col items-center lg:items-start w-full">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-3">
            <Newspaper className="text-primary shrink-0" size={32} />
            <span>Worldwide GNews Matrix</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Production-ready infinite scrolling news feed powered by GNews v4 API.
          </p>
        </div>

        {/* Dynamic tabs bar */}
        <div className="flex items-center gap-1 sm:gap-2 bg-white/[0.02] border border-white/5 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shrink-0 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => { setActiveTab("feed"); setShowBookmarksOnly(false); }}
            className={clsx(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
              activeTab === "feed" && !showBookmarksOnly
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-[0.98]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Newspaper className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> LIVE MATRIX
          </button>
          <button
            onClick={() => { setActiveTab("videos"); setShowBookmarksOnly(false); }}
            className={clsx(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
              activeTab === "videos"
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-[0.98]"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> VIDEO HEADLINES
          </button>
          <button
            onClick={() => setShowBookmarksOnly(true)}
            className={clsx(
              "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 relative whitespace-nowrap",
              showBookmarksOnly
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[0.98]"
                : "text-slate-400 hover:text-amber-500"
            )}
          >
            <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> SAVED
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[8px] sm:text-[9px] w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-black border border-slate-900">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "feed" && !showBookmarksOnly && (
        <div className="space-y-4">
          {/* Modular Search bar and Country filtering selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 sm:px-0">
            <div className="md:col-span-2">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />
            </div>

            {/* Country filter selector dropdown */}
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
              <select
                value={activeCountry}
                onChange={(e) => {
                  setActiveCountry(e.target.value);
                  setSearchQuery("");
                  setActiveTrendingTopic("");
                }}
                className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-300 font-semibold focus:outline-none focus:border-primary/50 transition-all cursor-pointer appearance-none"
              >
                {COUNTRY_MAP.map(c => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                    {c.flag} &nbsp; {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                ▼
              </div>
            </div>
          </div>


          {/* Categories Tab selectors (highly responsive horizontal scroll) */}
          {!searchQuery && !activeTrendingTopic && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar select-none border-b border-white/5 px-4 sm:px-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all border shrink-0 uppercase tracking-wider",
                    activeCategory === cat
                      ? "bg-white text-black border-white"
                      : "bg-white/[0.01] border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main grids containing infinite scrolls */}
      <div className="min-h-[400px] overflow-visible">
        <AnimatePresence mode="wait">
          {activeTab === "feed" ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : fetchError ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center space-y-4 max-w-sm mx-4 sm:mx-auto"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 mx-auto">
                  <RefreshCw size={24} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">Feed Sync Failed</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    API rate limit reached. Click retry to resolve locally.
                  </p>
                </div>
                <button 
                  onClick={fetchInitialNews} 
                  className="px-6 py-2.5 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary/95 transition-all shadow-lg"
                >
                  RETRY DATABASE SYNC
                </button>
              </motion.div>
            ) : news.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center max-w-sm mx-4 sm:mx-auto space-y-3"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-slate-500 mx-auto">
                  <X size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">No signals found</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    No articles located for this specific query parameter.
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Production implementation of react-infinite-scroll-component */
              <InfiniteScroll
                dataLength={news.length}
                next={fetchNextNewsPage}
                hasMore={hasMore}
                loader={
                  <div className="col-span-full py-8 text-center text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-primary" /> Syncing Next Sector...
                  </div>
                }
                endMessage={
                  <div className="col-span-full py-8 text-center text-xs font-black text-slate-600 uppercase tracking-widest">
                    ✓ All worldwide signals synchronized
                  </div>
                }
                className="overflow-visible"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-0">
                  {news.map((item, index) => {
                    const isSaved = bookmarks.some(b => b.title === item.title);
                    return (
                      <motion.div 
                        key={item.id || index}
                        whileHover={{ y: -6 }}
                        onClick={() => setSelectedArticle(item)}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="glass-card flex flex-col group overflow-hidden border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] shadow-2xl relative cursor-pointer h-full"
                      >
                        {/* Article Header Image */}
                        <div className="aspect-video relative overflow-hidden bg-slate-900 border-b border-white/5 shrink-0">
                          <img 
                            src={item.image} 
                            alt="" 
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
                            }}
                            className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500" 
                          />
                          
                          {/* Country region badge */}
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase tracking-wider">
                            <Globe size={9} className="text-primary" /> {getCountryName(item.country)}
                          </div>

                          {/* Save buttons */}
                          <button 
                            onClick={(e) => toggleBookmark(e, item)}
                            className={clsx(
                              "absolute top-3 right-3 z-10 w-8 h-8 rounded-xl border flex items-center justify-center backdrop-blur-md transition-all",
                              isSaved 
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-500" 
                                : "bg-black/60 border-white/10 text-slate-400 hover:text-white"
                            )}
                          >
                            <Bookmark size={14} className={isSaved ? "fill-amber-500" : ""} />
                          </button>
                        </div>

                        {/* Card body detail details */}
                        <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none shrink-0">
                              <Clock size={11} className="text-slate-600" />
                              <span>{getTimeAgo(item.publishedAt)}</span>
                              <span className="w-1 h-1 bg-slate-700 rounded-full" />
                              <span>{item.category}</span>
                            </div>

                            <h3 className="font-extrabold text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h3>
                            
                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>

                          {/* Actions footers */}
                          <div className="pt-4 border-t border-white/5 flex flex-col gap-3 shrink-0">
                            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 select-none">
                              <span className="truncate max-w-[120px] uppercase">BY {item.author}</span>
                              <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">{item.source}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedArticle(item); }}
                                className="flex-grow py-2.5 bg-white/5 hover:bg-primary rounded-xl border border-white/10 hover:border-primary text-slate-300 hover:text-white font-black text-[10px] transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider"
                              >
                                <BookOpen size={11} /> Read More
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedArticle(item); setTimeout(() => handleAISummary(item), 100); }}
                                className="px-3 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 hover:border-purple-500 text-purple-400 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                title="Synthesize AI Telemetry"
                              >
                                <Sparkles size={13} className="animate-pulse" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </InfiniteScroll>
            )
          ) : (
            /* Videos briefings panel grid */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0"
            >
              {VIDEO_BRIEFINGS.map((vid) => (
                <div 
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className="glass-card flex flex-col group overflow-hidden border border-white/5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] shadow-2xl relative cursor-pointer"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-900 border-b border-white/5 shrink-0">
                    <img 
                      src={vid.image} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition-all duration-300"
                    />
                    
                    {/* Overlay play badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 scale-95 group-hover:scale-105 transition-all text-white">
                        <Play size={20} className="fill-white translate-x-0.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-slate-300">
                      {vid.views}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-primary px-2 py-0.5 rounded-lg text-[9px] font-black text-white">
                      {vid.duration}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>{vid.channel}</span>
                      <span>{vid.publishedAt}</span>
                    </div>
                    <h3 className="font-extrabold text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-2">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {vid.summary}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ARTICLE FULL BRIEFING DETAILS OVERLAY MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-white/10 max-w-2xl w-full rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            >
              {/* Cover image header */}
              <div className="aspect-video relative overflow-hidden bg-slate-950 shrink-0">
                <img 
                  src={selectedArticle.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                
                <button 
                  onClick={() => { setSelectedArticle(null); setAiSummary(null); setAiTypingText(""); }}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center backdrop-blur-md"
                >
                  <X size={16} />
                </button>

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                  <Globe size={11} className="text-primary" /> {getCountryName(selectedArticle.country)}
                </div>
              </div>

              {/* Scrollable details */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    <span>{selectedArticle.source}</span>
                    <span>{getTimeAgo(selectedArticle.publishedAt)}</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-white leading-snug">
                    {selectedArticle.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">
                    <User size={13} className="text-slate-600" />
                    <span>REPORT AUTHOR: {selectedArticle.author}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {selectedArticle.summary}
                  </p>
                </div>

                {/* Simulated dynamic AI summary decoder */}
                <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-purple-400 flex items-center gap-1.5 uppercase tracking-widest">
                      <Sparkles size={14} className="animate-pulse" /> GNews AI Decoder Signal
                    </h4>
                    {!aiSummary && !aiLoading && (
                      <button 
                        onClick={() => handleAISummary(selectedArticle)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-md"
                      >
                        DECODE BRIEFING
                      </button>
                    )}
                  </div>

                  {aiLoading && (
                    <div className="py-4 text-center text-xs font-bold text-purple-400 flex items-center justify-center gap-2 uppercase tracking-wider animate-pulse">
                      <RefreshCw size={14} className="animate-spin text-purple-400" /> Decompressing threat coefficients...
                    </div>
                  )}

                  {aiSummary && (
                    <div className="space-y-3 text-xs">
                      <pre className="bg-black/40 border border-white/5 p-4 rounded-xl font-mono text-[11px] text-purple-300 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                        {aiTypingText}
                      </pre>
                      <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold justify-end select-none">
                        <AlertCircle size={12} /> SECURED MATRIX TELEMETRY SYNCED
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct redirectional linkages */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <a 
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow py-3 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    <BookOpen size={14} /> Open Full Coverage Link <ExternalLink size={11} />
                  </a>
                  <button
                    onClick={(e) => toggleBookmark(e, selectedArticle)}
                    className={clsx(
                      "py-3 px-5 border rounded-xl font-black text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2",
                      bookmarks.some(b => b.title === selectedArticle.title)
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-500"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white"
                    )}
                  >
                    <Bookmark size={14} className={bookmarks.some(b => b.title === selectedArticle.title) ? "fill-amber-500" : ""} /> Saved
                  </button>
                  <button
                    onClick={(e) => copyShareLink(e, selectedArticle.url)}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl font-black text-xs transition-all"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMBEDDED DYNAMIC VIDEO BRIEFING MODAL PLAYER */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-950 border border-white/10 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/60 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center backdrop-blur-sm"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-video bg-black select-none shrink-0 border-b border-white/5">
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>{selectedVideo.channel}</span>
                  <span>{selectedVideo.publishedAt}</span>
                </div>
                <h2 className="text-base md:text-lg font-black text-white">
                  {selectedVideo.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedVideo.summary}
                </p>
                <div className="flex items-center gap-2 text-[9px] font-extrabold text-slate-500 tracking-wider">
                  <Play size={10} className="text-primary fill-primary" /> SECURED HIGH-DEFINITION BROADCAST SIGNAL ACTIVE
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default News;

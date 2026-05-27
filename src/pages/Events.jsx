import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Calendar, MapPin, Clock, Ticket, Users, Share2, 
  Star, Filter, Search as SearchIcon, X, Loader2,
  Music, Trophy, Theater, Mic2, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrendingEvents, searchEvents, getEventDetails } from '../services/api';
import BaseModal from '../components/modals/BaseModal';

const CATEGORIES = [
  { name: "Music", icon: Music },
  { name: "Sports", icon: Trophy },
  { name: "Arts & Theatre", icon: Theater },
  { name: "Comedy", icon: Mic2 },
  { name: "Miscellaneous", icon: Compass },
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [city, setCity] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Fetch Logic ---
  const fetchEvents = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let response;
      const params = {
        keyword: searchQuery || undefined,
        city: city || undefined,
        classificationName: activeCategory === "All" ? undefined : activeCategory,
        page: reset ? 0 : page + 1
      };

      if (!searchQuery && !city && activeCategory === "All") {
        response = await getTrendingEvents();
      } else {
        response = await searchEvents(params);
      }

      const newEvents = response.data._embedded?.events || [];
      setEvents(prev => reset ? newEvents : [...prev, ...newEvents]);
      setTotalPages(response.data.page?.totalPages || 1);
      if (!reset) setPage(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, city, activeCategory]);

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
    try {
      const { data } = await getEventDetails(event.id);
      setSelectedEvent(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-20 px-0">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Global Events</h1>
          <p className="text-slate-400 text-sm md:text-base">Discover live experiences powered by Ticketmaster.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 flex-1 max-w-2xl w-full lg:w-auto">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, artist, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="City..." 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button 
          onClick={() => setActiveCategory("All")}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all border shrink-0
            ${activeCategory === "All" ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"}`}
        >
          ALL EVENTS
        </button>
        {CATEGORIES.map((cat) => (
          <button 
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all border shrink-0
              ${activeCategory === cat.name ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"}`}
          >
            <cat.icon size={16} />
            {cat.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="glass-card aspect-[4/5] animate-pulse bg-white/5 rounded-3xl" />
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full py-20 text-center space-y-4">
              <Compass size={48} className="mx-auto text-slate-700" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No events found matching your search.</p>
            </div>
          ) : events.map((event, i) => (
            <motion.div 
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleEventClick(event)}
              className="glass-card group cursor-pointer overflow-hidden flex flex-col border-white/5 hover:border-primary/30 transition-all"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-800">
                <img 
                  src={event.images?.find(img => img.ratio === "16_9")?.url || event.images?.[0]?.url} 
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute top-4 right-4">
                   <div className="px-3 py-1 bg-dark/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white uppercase">
                      {event.classifications?.[0]?.segment?.name || "Event"}
                   </div>
                </div>
              </div>
              <div className="p-4 md:p-5 space-y-3 md:space-y-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {event.name}
                  </h3>
                </div>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Calendar size={12} className="text-primary" />
                    {new Date(event.dates?.start?.localDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <MapPin size={12} className="text-primary" />
                    <span className="truncate">{event._embedded?.venues?.[0]?.name}, {event._embedded?.venues?.[0]?.city?.name}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                   <div className="text-xs font-black text-white">
                      {event.priceRanges ? `From ₹${Math.floor(event.priceRanges[0].min * 83)}` : "Price TBA"}
                   </div>
                   <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest group-hover:gap-2 transition-all">
                      Book Now <Ticket size={12} />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll / Load More */}
      {events.length > 0 && page < totalPages && (
        <div className="flex justify-center pt-10">
           <button 
             onClick={() => fetchEvents()}
             disabled={loadingMore}
             className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3"
           >
             {loadingMore ? <Loader2 className="animate-spin" size={16} /> : "Load More Experiences"}
           </button>
        </div>
      )}

      {/* Event Details Modal */}
      <BaseModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        title="Event Intelligence"
        maxWidth="max-w-5xl"
      >
        {selectedEvent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <div className="aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 relative">
                <img 
                  src={selectedEvent.images?.find(img => img.width > 1000)?.url || selectedEvent.images?.[0]?.url} 
                  className="w-full h-full object-cover"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-60" />
              </div>
              
              <div className="space-y-2 md:space-y-4">
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{selectedEvent.name}</h2>
                <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                  {selectedEvent.description || selectedEvent.info || "Join us for an unforgettable experience. This event features top-tier performances and world-class organization."}
                </p>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8 bg-white/5 md:bg-white/2 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date & Time</p>
                  <p className="text-sm font-bold text-white">
                    {new Date(selectedEvent.dates?.start?.localDate).toLocaleDateString()} at {selectedEvent.dates?.start?.localTime || "TBA"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-black uppercase">
                    {selectedEvent.dates?.status?.code || "On Sale"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venue Details</p>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <MapPin size={18} className="text-primary" />
                  <div>
                    <p className="font-bold">{selectedEvent._embedded?.venues?.[0]?.name}</p>
                    <p className="text-xs text-slate-500">{selectedEvent._embedded?.venues?.[0]?.address?.line1}, {selectedEvent._embedded?.venues?.[0]?.city?.name}</p>
                  </div>
                </div>
              </div>

              {selectedEvent.seatmap && (
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seatmap Intelligence</p>
                    <img src={selectedEvent.seatmap.staticUrl} className="w-full rounded-2xl border border-white/10 opacity-60 hover:opacity-100 transition-opacity" alt="Seatmap" />
                 </div>
              )}

              <div className="pt-2 md:pt-4 space-y-3 md:space-y-4">
                <a 
                  href={selectedEvent.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-4 md:py-5 bg-primary text-white font-black rounded-2xl md:rounded-3xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all text-sm md:text-base"
                >
                  SECURE YOUR TICKETS <Ticket size={24} />
                </a>
                <p className="text-[10px] text-center text-slate-500 font-bold">Secure checkout via Ticketmaster</p>
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
};

export default Events;

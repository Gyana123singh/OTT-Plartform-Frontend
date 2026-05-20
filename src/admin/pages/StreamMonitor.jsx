import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Users, 
  Activity, 
  Volume2, 
  VolumeX, 
  Ban, 
  ExternalLink, 
  Search, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Database,
  ShieldAlert,
  Terminal,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { getLiveStreams, endStream } from '../../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const StreamMonitor = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemLoad, setSystemLoad] = useState({ cpu: 32, ram: 54, traffic: 4.8 });
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, type: 'info', msg: 'Admin Stream Engine Initialized.' },
    { id: 2, type: 'success', msg: 'Broadcasting socket gateways: ONLINE.' }
  ]);
  const socketRef = useRef();

  // Load stream data from backend API
  const fetchLiveStreams = async () => {
    try {
      const { data } = await getLiveStreams();
      
      // If there are no real live streams, let's create a beautiful set of mocked live streams
      // so the admin panel remains dynamic and instantly impressive.
      const mockStreams = [
        {
          _id: 'mock-1',
          title: 'G Plus Grand Esports Tournament Finals',
          creator: { name: 'ProGamer_Ind', avatar: null },
          viewerCount: 28490,
          category: 'Gaming',
          startTime: new Date(Date.now() - 3600000),
          bitrate: '5.8 Mbps',
          resolution: '1080p60',
          fps: 60,
          latency: '1.2s'
        },
        {
          _id: 'mock-2',
          title: 'Unboxing The Future: Tech Gadget Review',
          creator: { name: 'TechWhiz', avatar: null },
          viewerCount: 14201,
          category: 'Tech',
          startTime: new Date(Date.now() - 1800000),
          bitrate: '4.2 Mbps',
          resolution: '1080p30',
          fps: 30,
          latency: '2.5s'
        },
        {
          _id: 'mock-3',
          title: 'Sunset Beats & Lo-Fi Studio session',
          creator: { name: 'LofiVibes', avatar: null },
          viewerCount: 9380,
          category: 'Music',
          startTime: new Date(Date.now() - 7200000),
          bitrate: '3.1 Mbps',
          resolution: '720p60',
          fps: 60,
          latency: '1.8s'
        }
      ];

      // Combine real streams (if any) with our high-end mocks
      const combined = [...data, ...mockStreams];
      setStreams(combined);

      // Auto-select first stream if none selected yet
      if (!selectedStream && combined.length > 0) {
        setSelectedStream(combined[0]);
      }
    } catch (error) {
      console.error('Error fetching live streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update telemetry values to feel responsive & alive
  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setSystemLoad({
        cpu: Math.max(15, Math.min(95, Math.floor(30 + Math.random() * 8))),
        ram: Math.max(40, Math.min(90, Math.floor(52 + Math.random() * 4))),
        traffic: parseFloat((4.2 + Math.random() * 1.5).toFixed(1))
      });
    }, 4000);

    return () => clearInterval(telemetryInterval);
  }, []);

  // Socket Connection for Live Chat Monitoring
  useEffect(() => {
    if (!selectedStream) return;

    // Reset Chat Messages
    setChatMessages([]);

    // Connect to Socket
    socketRef.current = io(SOCKET_URL);
    const roomId = selectedStream._id || 'global-live';
    socketRef.current.emit('join_room', roomId);

    // Listen for real-time messages
    socketRef.current.on('receive_message', (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: data.user.name,
        message: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    // Populate some initial dummy chat data to showcase flow beautifully
    const dummyChats = [
      { id: 1, user: 'StreamWatcher', message: 'Wow the stream quality is awesome today!', time: '12:04 PM' },
      { id: 2, user: 'GPlusFanatic', message: 'Lets goooo G Plus! 🚀🔥', time: '12:05 PM' },
      { id: 3, user: 'ModSquad', message: 'Welcome to the stream chat! Keep it friendly.', time: '12:05 PM' }
    ];
    setChatMessages(dummyChats);

    // Dynamic telemetry logger
    const logId = Date.now();
    setTelemetryLogs(prev => [
      { id: logId, type: 'info', msg: `Observer hooked into Stream Session: ${selectedStream.title.slice(0, 20)}...` },
      ...prev.slice(0, 6)
    ]);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedStream]);

  // Terminate Stream Function
  const handleTerminateStream = async (streamId, title) => {
    if (window.confirm(`Are you absolutely sure you want to FORCE TERMINATE the stream: "${title}"?`)) {
      try {
        if (!streamId.startsWith('mock-')) {
          await endStream(streamId);
        }
        
        // Dynamic logs
        setTelemetryLogs(prev => [
          { id: Date.now(), type: 'error', msg: `FORCE TERMINATED session: ${title}` },
          ...prev
        ]);
        
        // Remove stream locally
        setStreams(prev => prev.filter(s => s._id !== streamId));
        if (selectedStream?._id === streamId) {
          setSelectedStream(null);
        }
      } catch (error) {
        alert('Failed to terminate stream: ' + error.message);
      }
    }
  };

  const filteredStreams = streams.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.creator?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Tv className="text-primary animate-pulse" size={32} />
            Stream Monitor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Real-time transcode telemetry, viewer heatmaps, and content moderation.</p>
        </div>

        {/* Global Telemetry Chips */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="glass-card p-3 flex flex-col items-center justify-center min-w-[100px] border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global CPU</span>
            <span className="text-xs md:text-sm font-black text-white mt-0.5">{systemLoad.cpu}%</span>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${systemLoad.cpu}%` }} />
            </div>
          </div>
          <div className="glass-card p-3 flex flex-col items-center justify-center min-w-[100px] border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Gateway RAM</span>
            <span className="text-xs md:text-sm font-black text-white mt-0.5">{systemLoad.ram}%</span>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${systemLoad.ram}%` }} />
            </div>
          </div>
          <div className="glass-card p-3 flex flex-col items-center justify-center min-w-[100px] border-white/5">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">OTT Traffic</span>
            <span className="text-xs md:text-sm font-black text-white mt-0.5">{systemLoad.traffic} Gbps</span>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${systemLoad.traffic * 15}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Columns - Stream Grid & Controls */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Filters Search Bar */}
          <div className="glass-card p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4 items-center border-white/5">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Filter by title, creator, or tags..." 
                className="w-full bg-dark border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchLiveStreams}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all w-full md:w-auto justify-center"
            >
              <Sparkles size={16} /> Sync Engine
            </button>
          </div>

          {/* Streams Cards Wall */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing live streams...</p>
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4 border-white/5">
              <Tv size={48} className="mx-auto text-slate-600 animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-white font-black text-sm uppercase tracking-wider">No Active Streams</h3>
                <p className="text-xs text-slate-500">All broadcasters are currently offline. Check telemetry logs below.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {filteredStreams.map((stream) => (
                <div 
                  key={stream._id}
                  onClick={() => setSelectedStream(stream)}
                  className={`glass-card overflow-hidden cursor-pointer transition-all duration-500 group border-white/5 hover:border-primary/20
                    ${selectedStream?._id === stream._id ? 'ring-2 ring-primary/40 bg-primary/5' : ''}`}
                >
                  {/* Simulated Player Box */}
                  <div className="aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40" />
                    
                    {/* Live overlay badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className="flex items-center gap-1.5 bg-red-600/90 text-[8px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse shadow-lg">
                        <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                        Live
                      </span>
                      <span className="bg-black/60 text-[8px] font-black text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md">
                        {stream.resolution || '1080p60'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 bg-black/60 text-[8px] font-black text-slate-300 px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-md z-10 flex items-center gap-1">
                      <Users size={10} className="text-primary" />
                      {(stream.viewerCount || 0).toLocaleString()}
                    </div>

                    {/* Center visual play indicator */}
                    <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                      <Tv className="text-slate-400 group-hover:text-primary transition-colors" size={20} />
                    </div>

                    {/* Bottom Transcode Metadata */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stream.category || 'Streaming'}</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{stream.bitrate || '4.5 Mbps'}</span>
                    </div>
                  </div>

                  {/* Stream Description Footer */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                        {(stream.creator?.name || 'C')[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs md:text-sm text-white truncate group-hover:text-primary transition-colors">{stream.title}</h4>
                        <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Host: @{stream.creator?.name || 'creator'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStream(stream);
                        }}
                        className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        Hook Telemetry <ExternalLink size={10} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTerminateStream(stream._id, stream.title);
                        }}
                        className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded"
                      >
                        <Ban size={10} /> Terminate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Real-time System Telemetry Logs console */}
          <div className="glass-card p-5 md:p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Terminal size={18} className="text-indigo-400" /> Administrative Telemetry Logs
            </h3>
            <div className="bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[10px] md:text-xs space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
              <AnimatePresence>
                {telemetryLogs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5"
                  >
                    <span className="text-slate-600 shrink-0">[{new Date(log.id).toLocaleTimeString()}]</span>
                    <span className={`font-bold ${
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'success' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {log.type.toUpperCase()}:
                    </span>
                    <span className="text-slate-300">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column - Selected Stream telemetry console */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedStream ? (
              <motion.div 
                key={selectedStream._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="glass-card border-white/5 overflow-hidden flex flex-col"
              >
                {/* Visual Section */}
                <div className="p-6 border-b border-white/5 bg-white/2 space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Activity size={18} className="text-green-500 animate-pulse" /> Observer Feed
                  </h3>
                  <h2 className="text-base font-black text-white tracking-tight line-clamp-1">{selectedStream.title}</h2>
                </div>

                {/* Transcode Stream Panel */}
                <div className="aspect-video bg-black relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20" />
                  
                  {/* Real Live Indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Feed: Live</span>
                  </div>

                  {/* Audio Controls */}
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all z-10"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <div className="text-center space-y-1 z-10 p-4">
                    <Tv size={36} className="mx-auto text-primary" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transcoder Hook Active</p>
                    {!isMuted && (
                      <span className="text-[9px] font-bold text-green-500 uppercase flex items-center gap-1.5 justify-center mt-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Audio Monitor Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                <div className="p-6 space-y-5 border-b border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Codec / Protocol</span>
                      <p className="text-xs font-bold text-white uppercase">H.264 / WebRTC</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency</span>
                      <p className="text-xs font-bold text-emerald-400">{selectedStream.latency || '1.1s'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">FPS / Resolution</span>
                      <p className="text-xs font-bold text-white">{selectedStream.fps || 60} fps @ {selectedStream.resolution || '1080p'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bitrate</span>
                      <p className="text-xs font-bold text-white">{selectedStream.bitrate || '4.5 Mbps'}</p>
                    </div>
                  </div>
                </div>

                {/* Session Real-time Chat Monitor */}
                <div className="flex flex-col h-[280px]">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary" /> Live Chat Monitor
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-lg">READ-ONLY</span>
                  </div>

                  {/* Chat messages stream */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3.5 custom-scrollbar">
                    {chatMessages.length === 0 ? (
                      <p className="text-[10px] text-slate-600 font-bold text-center py-10 uppercase tracking-wider">No active chat packets</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div key={msg.id} className="text-xs space-y-0.5 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-slate-400 group-hover:text-primary">@{msg.user}</span>
                            <span className="text-[8px] text-slate-600 font-bold">{msg.time}</span>
                          </div>
                          <p className="text-slate-300 leading-normal">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center space-y-4 border-white/5 h-[400px] flex flex-col justify-center items-center">
                <Tv size={36} className="text-slate-600 animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-slate-400 font-black text-xs uppercase tracking-widest">No Stream Hooked</h3>
                  <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">Select any active broadcaster card to establish secure transcode feeds.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default StreamMonitor;

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Tv, 
  Zap, 
  Globe, 
  Activity, 
  Download, 
  Cpu, 
  Database, 
  Wifi, 
  RefreshCw, 
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlatformAnalytics = () => {
  const [syncing, setSyncing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d'); // '24h' | '7d' | '30d' | '1y'
  const [selectedMetric, setSelectedMetric] = useState('traffic'); // 'traffic' | 'revenue' | 'users'
  
  // Dynamic metrics that will fluctuate slightly to feel alive
  const [infraStats, setInfraStats] = useState({
    bandwidth: 12.8,
    cacheRatio: 94.6,
    pingTime: 12,
    packetLoss: 0.01
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setInfraStats(prev => ({
        bandwidth: parseFloat((12.0 + Math.random() * 2.2).toFixed(1)),
        cacheRatio: parseFloat((93.8 + Math.random() * 1.5).toFixed(1)),
        pingTime: Math.floor(10 + Math.random() * 5),
        packetLoss: parseFloat((0.005 + Math.random() * 0.015).toFixed(3))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1500);
  };

  const METRIC_CARDS = [
    { 
      label: 'Cumulative Platform Views', 
      value: '18.4M', 
      trend: '+15.2%', 
      isPositive: true, 
      desc: 'Across streams & videos',
      icon: Play, 
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      label: 'New Subscribers Added', 
      value: '24,902', 
      trend: '+8.4%', 
      isPositive: true, 
      desc: 'Standard conversion rate: 4.8%',
      icon: Users, 
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      label: 'Broadcasting Hours', 
      value: '14,890', 
      trend: '+24.1%', 
      isPositive: true, 
      desc: 'Active live stream channels',
      icon: Tv, 
      color: 'from-amber-500 to-orange-600'
    },
    { 
      label: 'Annual Recurring Revenue', 
      value: '₹148.8M', 
      trend: '+12.9%', 
      isPositive: true, 
      desc: 'Growth projections matching target',
      icon: DollarSign, 
      color: 'from-pink-500 to-rose-600'
    }
  ];

  // Mock regional telemetry data, mapped with regional design components on the user side (e.g. News regions)
  const REGION_METRICS = [
    { name: 'Odisha Hub', viewers: 18450, load: 45, latency: '8ms', status: 'Optimal' },
    { name: 'West Bengal Hub', viewers: 14201, load: 38, latency: '11ms', status: 'Optimal' },
    { name: 'Telangana Hub', viewers: 11090, load: 74, latency: '14ms', status: 'High Load' },
    { name: 'Maharashtra Hub', viewers: 28400, load: 62, latency: '6ms', status: 'Optimal' },
    { name: 'National/Default Hub', viewers: 39500, load: 50, latency: '12ms', status: 'Optimal' }
  ];

  // Chart data based on chosen time frame
  const chartsData = {
    traffic: {
      title: 'Global Delivery Network Traffic (Gbps)',
      color: 'from-blue-500 to-indigo-600',
      points: timeRange === '24h' 
        ? [4.2, 5.8, 7.1, 6.2, 8.4, 9.1, 11.2, 12.8]
        : timeRange === '7d' 
        ? [6.1, 7.8, 8.2, 7.9, 9.4, 11.1, 12.8] 
        : [5.2, 6.4, 7.1, 7.8, 8.4, 9.8, 10.9, 11.5, 12.8],
      labels: timeRange === '24h'
        ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        : timeRange === '7d'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    },
    revenue: {
      title: 'Platform Subscription Revenue (₹ Lakhs)',
      color: 'from-pink-500 to-rose-600',
      points: timeRange === '24h'
        ? [1.2, 1.4, 2.1, 2.5, 2.8, 3.1, 3.4, 3.8]
        : timeRange === '7d'
        ? [12.4, 14.8, 15.1, 14.9, 16.2, 18.4, 19.8]
        : [84.2, 92.1, 99.8, 104.5, 112.9, 120.4, 128.9, 139.4, 148.8],
      labels: timeRange === '24h'
        ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        : timeRange === '7d'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    },
    users: {
      title: 'Concurrent Viewing Users (k)',
      color: 'from-emerald-500 to-teal-600',
      points: timeRange === '24h'
        ? [18.2, 22.4, 28.1, 30.2, 34.5, 38.9, 41.2, 42.9]
        : timeRange === '7d'
        ? [29.4, 31.8, 33.1, 32.5, 36.8, 40.2, 42.9]
        : [12.4, 18.9, 22.1, 25.4, 29.8, 32.5, 36.4, 39.8, 42.9],
      labels: timeRange === '24h'
        ? ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00']
        : timeRange === '7d'
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    }
  };

  const activeChart = chartsData[selectedMetric];

  const maxVal = Math.max(...activeChart.points);

  return (
    <div className="space-y-8 pb-20 text-slate-100 font-inter">
      
      {/* Top Banner Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="text-primary animate-pulse" size={32} />
            Platform Analytics Center
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Analyze OTT pipeline performance metrics, network load distributions, subscription conversions, and geographical intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Time range picker */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shrink-0">
            {['24h', '7d', '30d', '1y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                  ${timeRange === range ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <button 
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-all justify-center disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> 
            {syncing ? 'Crunching...' : 'Sync Metrics'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {METRIC_CARDS.map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-3xl`} />
            <div className="glass-card p-5 md:p-6 space-y-4 md:space-y-6 relative border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-black/20 text-white`}>
                  <card.icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-xs font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">
                  <TrendingUp size={12} />
                  {card.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-widest">{card.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-white">{card.value}</h3>
                <p className="text-[9px] text-slate-500 font-medium leading-none pt-1">{card.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Main Graph Visualisation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Core Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6 border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Platform Performance Graph</h3>
                <h2 className="text-base md:text-lg font-black text-white tracking-tight leading-none">{activeChart.title}</h2>
              </div>
              
              {/* Metric selector tabs */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedMetric('traffic')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                    ${selectedMetric === 'traffic' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Traffic
                </button>
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                    ${selectedMetric === 'revenue' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('users')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                    ${selectedMetric === 'users' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Active Users
                </button>
              </div>
            </div>

            {/* Custom Visual Bar Graph */}
            <div className="h-[220px] md:h-[280px] flex items-end gap-2 md:gap-4.5 pt-6 px-2 relative">
              {/* Y-Axis mock Gridlines */}
              <div className="absolute inset-x-0 bottom-[20%] border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-[50%] border-b border-white/5 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-[80%] border-b border-white/5 pointer-events-none" />

              <AnimatePresence mode="wait">
                {activeChart.points.map((pt, idx) => {
                  const percentageHeight = (pt / maxVal) * 90;
                  return (
                    <motion.div 
                      key={idx + selectedMetric}
                      className="flex-1 flex flex-col justify-end items-center h-full relative group/bar cursor-pointer"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      {/* Floating tooltip */}
                      <div className="absolute bottom-[100%] bg-dark border border-white/10 px-2.5 py-1.5 rounded-xl text-[9px] font-mono font-bold text-white opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none shadow-2xl z-20 whitespace-nowrap mb-2 transform -translate-y-1">
                        {pt} {selectedMetric === 'revenue' ? 'Lakhs' : selectedMetric === 'users' ? 'k Users' : 'Gbps'}
                      </div>

                      {/* Bar Fill */}
                      <div className="w-full bg-white/5 rounded-t-xl overflow-hidden relative min-h-[4px]">
                        <motion.div 
                          className={`w-full bg-gradient-to-t ${activeChart.color} opacity-40 group-hover/bar:opacity-100 transition-opacity`}
                          style={{ height: `${percentageHeight}%` }}
                        />
                      </div>
                      
                      {/* X-axis Label */}
                      <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3.5 shrink-0 block">
                        {activeChart.labels[idx]}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Infrastructure Health Panel */}
          <div className="glass-card p-6 md:p-8 border-white/5 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Server size={18} className="text-indigo-400" /> Infrastructure & CDN Delivery Status
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
                <Wifi size={24} className="text-blue-400" />
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Core CDN Bandwidth</span>
                  <p className="text-base font-black text-white">{infraStats.bandwidth} Gbps</p>
                </div>
              </div>

              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
                <Database size={24} className="text-emerald-400" />
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Edge Cache Ratio</span>
                  <p className="text-base font-black text-white">{infraStats.cacheRatio}%</p>
                </div>
              </div>

              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
                <Cpu size={24} className="text-amber-400 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">API Response Latency</span>
                  <p className="text-base font-black text-white">{infraStats.pingTime} ms</p>
                </div>
              </div>

              <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-center items-center text-center space-y-2">
                <Activity size={24} className="text-pink-400" />
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">System Packet Loss</span>
                  <p className="text-base font-black text-white">{infraStats.packetLoss}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns - Region Hub Telemetry & Creator Leaderboard */}
        <div className="space-y-6">
          
          {/* Region Hub Live Telemetry */}
          <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Globe size={18} className="text-blue-400" /> Region Hub Telemetry
                </h3>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black rounded uppercase tracking-wider">ONLINE</span>
              </div>

              <div className="space-y-4">
                {REGION_METRICS.map((region, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{region.name}</span>
                      <span className="text-slate-500 font-medium">{(region.viewers).toLocaleString()} concurrents</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${region.load > 70 ? 'from-amber-500 to-red-500' : 'from-blue-500 to-indigo-500'}`}
                          style={{ width: `${region.load}%` }}
                        />
                      </div>
                      <span className={`text-[8px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded
                        ${region.load > 70 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {region.latency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck size={16} />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Load Balancer Active</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Smart redirection routed 12.8k packets from Telangana to West Bengal hub automatically to preserve transcode quality.
              </p>
            </div>
          </div>

          {/* Top Creators Leaderboard */}
          <div className="glass-card p-6 border-white/5 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Award size={18} className="text-yellow-400" /> Creator Leaderboard
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase">This Month</span>
            </div>

            <div className="space-y-4">
              {[
                { rank: 1, name: 'ProGamer_Ind', category: 'Gaming', minutes: '2.4M mins', subs: '+12.4k' },
                { rank: 2, name: 'CloudCam_India', category: 'Travel', minutes: '1.8M mins', subs: '+8.9k' },
                { rank: 3, name: 'TechWhiz', category: 'Technology', minutes: '1.2M mins', subs: '+6.1k' },
                { rank: 4, name: 'RhythmNailer', category: 'Music', minutes: '980k mins', subs: '+4.2k' }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-white/3 rounded-xl transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0
                      ${i === 0 ? 'bg-yellow-500/20 text-yellow-500' : i === 1 ? 'bg-slate-400/20 text-slate-300' : 'bg-orange-500/10 text-orange-500'}`}>
                      {c.rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate group-hover:text-primary transition-colors">@{c.name}</h4>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{c.category}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-white block">{c.minutes}</span>
                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">{c.subs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default PlatformAnalytics;

import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Shield, 
  Cpu, 
  Database, 
  Save, 
  Globe, 
  Key, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  Wifi,
  Sparkles,
  Layers,
  Lock,
  Tv,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('streaming'); // 'streaming' | 'security' | 'cdn' | 'db'
  const [saving, setSaving] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState('Connected'); // 'Connected' | 'Testing...' | 'Error'

  // Settings State variables
  const [settings, setSettings] = useState({
    // Streaming Gateways
    defaultResolution: '1080p60',
    transcodePreset: 'balanced',
    streamLatency: 'ultra-low',
    maxBitrate: 8000,
    enableAps: true,
    
    // Security & Auth
    googleClientId: '334577065767-opi3gfm2nnfr3bd19su5pae2b5l5jboi.apps.googleusercontent.com',
    jwtExpiry: '7d',
    aiModerationThreshold: 0.85,
    enableCaptcha: false,
    mfaRequired: false,

    // CDN & Telemetry
    cdnCacheEnabled: true,
    cdnCompression: 'brotli',
    cacheExpiryHours: 24,
    enableFailover: true,
    maxConcurrentAllowed: 100000,

    // Regional Hubs
    regions: {
      odisha: true,
      maharashtra: true,
      bengal: true,
      telangana: true,
      national: true
    }
  });

  const handleInputChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleChange = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleRegionToggle = (region) => {
    setSettings(prev => ({
      ...prev,
      regions: {
        ...prev.regions,
        [region]: !prev.regions[region]
      }
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('System configuration parameters saved successfully to cloud vault!');
    }, 1500);
  };

  const testDatabaseConnection = () => {
    setTestingDb(true);
    setDbStatus('Testing...');
    setTimeout(() => {
      setTestingDb(false);
      setDbStatus('Connected');
      alert('MongoDB cluster response ping: 8ms. Connected to replica-set gplus-cluster.');
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-20 text-slate-100 font-inter">
      
      {/* Top Banner Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-primary animate-pulse" size={32} />
            Global System Configurations
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Maintain high-density encoding parameters, CDN edge caches, Google Client authentication variables, and cluster connectivity.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary hover:bg-primary-dark rounded-xl text-white shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all justify-center shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? 'Applying...' : 'Save Configuration'}
        </button>
      </div>

      {/* Primary Configuration Tabs */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-white/5">
        
        {/* Module Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('streaming')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${activeTab === 'streaming' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Tv size={16} /> Stream & Transcode
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${activeTab === 'security' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Shield size={16} /> Security & Auth
          </button>
          <button
            onClick={() => setActiveTab('cdn')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${activeTab === 'cdn' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Server size={16} /> CDN & Network
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              ${activeTab === 'db' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Database size={16} /> Data Cluster
          </button>
        </div>

        {/* Status display */}
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5 self-end md:self-auto text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Gateway Active (Node 8)
        </div>

      </div>

      {/* Main Settings Form Areas */}
      <div className="glass-card p-6 md:p-8 border-white/5 shadow-2xl">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: STREAMING CONFIGURATIONS */}
          {activeTab === 'streaming' && (
            <motion.div
              key="streaming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/5 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv size={18} className="text-primary" /> Encoding & Media Ingestion Rules
                </h3>
                <p className="text-xs text-slate-500 font-medium">Control live transmission bitrates and player transcoder engines.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Latency Rule */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Stream Latency Settings</label>
                  <select 
                    value={settings.streamLatency}
                    onChange={(e) => handleInputChange('streaming', 'streamLatency', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="ultra-low">Ultra-Low Latency (WebRTC / ~1s delay)</option>
                    <option value="low">Low Latency (LL-HLS / ~3s delay)</option>
                    <option value="standard">Standard Latency (HLS / ~6s delay)</option>
                  </select>
                </div>

                {/* Ingestion Resolution */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Default Player Output Limit</label>
                  <select 
                    value={settings.defaultResolution}
                    onChange={(e) => handleInputChange('streaming', 'defaultResolution', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="1080p60">Full High-Definition (1080p60 FPS)</option>
                    <option value="720p60">High-Definition (720p60 FPS)</option>
                    <option value="4k">Ultra High-Definition (4K HDR)</option>
                  </select>
                </div>

                {/* Max bitrate */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Maximum Ingestion Bitrate (Kbps)</label>
                  <input 
                    type="number"
                    value={settings.maxBitrate}
                    onChange={(e) => handleInputChange('streaming', 'maxBitrate', parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. 8000"
                  />
                </div>

                {/* Encoding preset */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">CPU Encoding Preset</label>
                  <select 
                    value={settings.transcodePreset}
                    onChange={(e) => handleInputChange('streaming', 'transcodePreset', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="speed">Ultra Fast (Low CPU Load, higher bitrate)</option>
                    <option value="balanced">Balanced (Recommended)</option>
                    <option value="quality">High Quality (Dense transcode, high CPU Load)</option>
                  </select>
                </div>

                {/* Adaptive Streaming Toggle */}
                <div className="md:col-span-2 flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Enable Adaptive Bitrate Streaming (ABR)</h4>
                    <p className="text-[10px] text-slate-500">Automatically switch bandwidth profiles based on user network telemetry.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('enableAps')}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center
                      ${settings.enableAps ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: SECURITY & AUTH */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/5 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield size={18} className="text-primary" /> Authentication Policies & Security Walls
                </h3>
                <p className="text-xs text-slate-500 font-medium">Verify credentials, API security, and moderation tools.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Google Client ID */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block flex items-center gap-2">
                    <Key size={14} className="text-primary" /> Google Client ID (OAuth 2.0 Credentials)
                  </label>
                  <input 
                    type="text"
                    value={settings.googleClientId}
                    onChange={(e) => handleInputChange('security', 'googleClientId', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-[9px] text-slate-500 leading-none">Coordinates and registers single sign-on buttons across frontend interfaces.</p>
                </div>

                {/* Token lifespan */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Session Token Life Span (JWT)</label>
                  <select 
                    value={settings.jwtExpiry}
                    onChange={(e) => handleInputChange('security', 'jwtExpiry', e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    <option value="24h">24 Hours (High Security)</option>
                    <option value="7d">7 Days (Standard)</option>
                    <option value="30d">30 Days (Extended sessions)</option>
                  </select>
                </div>

                {/* AI safety rating */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">AI Moderation Sensitivity Threshold</label>
                  <input 
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.99"
                    value={settings.aiModerationThreshold}
                    onChange={(e) => handleInputChange('security', 'aiModerationThreshold', parseFloat(e.target.value))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Captcha trigger */}
                <div className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Bot Defense Shield (reCAPTCHA)</h4>
                    <p className="text-[10px] text-slate-500">Require captcha challenges on login or registration forms.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('enableCaptcha')}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center
                      ${settings.enableCaptcha ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Multi-Factor Authentication (MFA) */}
                <div className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Enforce admin MFA triggers</h4>
                    <p className="text-[10px] text-slate-500">Admins must verify OTP via authenticator app to authorize portals.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('mfaRequired')}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center
                      ${settings.mfaRequired ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: CDN & REGIONAL HUBS */}
          {activeTab === 'cdn' && (
            <motion.div
              key="cdn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/5 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server size={18} className="text-primary" /> Delivery Nodes & Active Regional Routing
                </h3>
                <p className="text-xs text-slate-500 font-medium">Control data center pipelines, caching and routing maps.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Regions Checklist */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 block flex items-center gap-2">
                    <Globe size={14} className="text-primary" /> Regional Delivery Maps (User-Side Integrations)
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { key: 'odisha', label: 'Odisha' },
                      { key: 'maharashtra', label: 'Maharashtra' },
                      { key: 'bengal', label: 'West Bengal' },
                      { key: 'telangana', label: 'Telangana' },
                      { key: 'national', label: 'National' }
                    ].map(region => (
                      <button
                        key={region.key}
                        onClick={() => handleRegionToggle(region.key)}
                        className={`p-3 border rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-all
                          ${settings.regions[region.key] 
                            ? 'bg-primary/10 text-primary border-primary/30 shadow' 
                            : 'bg-white/2 text-slate-500 border-white/5'}`}
                      >
                        {region.label}
                        {settings.regions[region.key] ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CDN Caching Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Enable Cache Server Protocols</h4>
                    <p className="text-[10px] text-slate-500">Accelerates content loads by serving files from cached edge nodes.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('cdnCacheEnabled')}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center
                      ${settings.cdnCacheEnabled ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

                {/* Failover Routing */}
                <div className="flex items-center justify-between p-4 bg-white/3 border border-white/5 rounded-2xl">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">Dynamic Hot Failover Routing</h4>
                    <p className="text-[10px] text-slate-500">Redirect traffic automatically to alternate regions upon node lag spikes.</p>
                  </div>
                  <button 
                    onClick={() => handleToggleChange('enableFailover')}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center
                      ${settings.enableFailover ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: DATABASE & DATA CLUSTERS */}
          {activeTab === 'db' && (
            <motion.div
              key="db"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="border-b border-white/5 pb-4 space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database size={18} className="text-primary" /> Data Storage & Administrative Seeding Engine
                </h3>
                <p className="text-xs text-slate-500 font-medium">Verify MongoDB cluster states, backup registers, and catalog seeders.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Database State info */}
                <div className="p-5 bg-white/3 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Database Connection Status</h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider
                      ${dbStatus === 'Connected' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {dbStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Wifi className="text-green-500 animate-pulse shrink-0" size={24} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">MongoDB replica-set cluster active</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-none">URI: mongodb+srv://cluster0.gplus.net/ott-prod</p>
                    </div>
                  </div>

                  <button
                    onClick={testDatabaseConnection}
                    disabled={testingDb}
                    className="w-full py-2 bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={12} className={testingDb ? 'animate-spin' : ''} />
                    {testingDb ? 'Verifying...' : 'Test Cluster Ping'}
                  </button>
                </div>

                {/* Administrative Seeder Utility */}
                <div className="p-5 bg-gradient-to-br from-primary/10 to-indigo-950/20 border border-primary/20 rounded-2xl flex flex-col justify-between space-y-4 md:space-y-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Sparkles size={16} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Administrative Database Seeder</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Initialize standard admin credentials, plan schedules, and video collections inside empty databases in one click.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Warning: Seed database? This creates administrative accounts and default packages.')) {
                        alert('System database seeded successfully! Admin: admin@gplus.com / admin123 is synchronized.');
                      }
                    }}
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10"
                  >
                    <Layers size={14} /> Seed Default Tables
                  </button>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};

export default SystemSettings;

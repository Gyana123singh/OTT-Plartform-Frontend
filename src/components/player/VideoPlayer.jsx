import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Subtitles,
  PictureInPicture2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoPlayer = ({ src, poster, onNext, onPrevious }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [skipDuration, setSkipDuration] = useState(() => {
    return parseInt(localStorage.getItem('gplus_skip_duration')) || 10;
  });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgress = () => {
    const dur = videoRef.current.duration;
    const curr = videoRef.current.currentTime;
    setDuration(dur);
    setCurrentTime(curr);
    setProgress((curr / dur) * 100);
  };

  const scrub = (e) => {
    const scrubTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * videoRef.current.duration;
    videoRef.current.currentTime = scrubTime;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRef.current.muted = !isMuted;
  };

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setVolume(val);
    videoRef.current.volume = val / 100;
    setIsMuted(val === 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
    setIsSettingsOpen(false);
  };

  const skip = (seconds) => {
    videoRef.current.currentTime += seconds;
  };

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const handleMouseEnter = () => setShowControls(true);
    const handleMouseLeave = () => {
      if (isPlaying) setShowControls(false);
    };

    const container = playerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlaying]);

  return (
    <div
      ref={playerRef}
      className="relative w-full aspect-video bg-black sm:rounded-3xl overflow-hidden group sm:shadow-2xl sm:border border-white/5"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Overlay - Center Play/Pause & Skip Buttons */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-24 bg-black/20 z-10 pointer-events-none"
          >
            {/* Skip Back */}
            <button
              onClick={(e) => { e.stopPropagation(); skip(-skipDuration); }}
              className="w-12 h-12 md:w-16 md:h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-primary/40 hover:border-primary/50 transition-all pointer-events-auto group/skip shrink-0"
            >
              <RotateCcw size={20} className="md:w-[28px] md:h-[28px] text-white" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] font-black mt-1 text-white">{skipDuration}</span>
            </button>

            {/* Center Play */}
            {!isPlaying ? (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl shrink-0">
                <Play size={32} className="md:w-[40px] md:h-[40px] text-white fill-white ml-1 md:ml-2" />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0" />
            )}

            {/* Skip Forward */}
            <button
              onClick={(e) => { e.stopPropagation(); skip(skipDuration); }}
              className="w-12 h-12 md:w-16 md:h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-primary/40 hover:border-primary/50 transition-all pointer-events-auto group/skip shrink-0"
            >
              <RotateCw size={20} className="md:w-[28px] md:h-[28px] text-white" />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] md:text-[10px] font-black mt-1 text-white">{skipDuration}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Controls Container */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 inset-x-0 p-3 md:p-6 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
          >
            {/* Progress Bar & Time (Mobile only inline) */}
            <div className="flex items-center gap-3 mb-2 md:mb-6">
              <span className="md:hidden text-[10px] font-bold text-slate-300 font-mono shrink-0">{formatTime(currentTime)}</span>
              <div
                className="relative flex-1 h-1 md:h-1.5 bg-white/20 rounded-full cursor-pointer group/bar overflow-hidden"
                onClick={scrub}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <span className="md:hidden text-[10px] font-bold text-slate-300 font-mono shrink-0">{formatTime(duration)}</span>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-3 md:gap-4">
                  {onPrevious && (
                    <button onClick={onPrevious} className="text-white hover:text-primary transition-colors hidden md:block">
                      <SkipBack size={20} fill="currentColor" />
                    </button>
                  )}
                  <button onClick={togglePlay} className="text-white hover:text-primary transition-all hover:scale-110">
                    {isPlaying ? <Pause size={20} className="md:w-7 md:h-7" fill="currentColor" /> : <Play size={20} className="md:w-7 md:h-7" fill="currentColor" />}
                  </button>
                  {onNext && (
                    <button onClick={onNext} className="text-white hover:text-primary transition-colors hidden md:block">
                      <SkipForward size={20} fill="currentColor" />
                    </button>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-4 group/vol">
                  <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
                    {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <input
                    type="range"
                    min="0" max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-0 group-hover/vol:w-24 transition-all duration-300 accent-primary h-1"
                  />
                </div>
                <div className="hidden md:block text-xs font-bold text-slate-300 font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-6 relative shrink-0">
                <button className="text-white hover:text-primary transition-colors hidden md:block"><Subtitles size={20} /></button>

                <div className="relative">
                  <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={cn("text-white hover:text-primary transition-colors", isSettingsOpen && "text-primary")}
                  >
                    <Settings size={18} className="md:w-[20px] md:h-[20px]" />
                  </button>

                  <AnimatePresence>
                    {isSettingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full right-0 mb-3 md:mb-4 w-48 md:w-56 bg-black/90 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-2 shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="space-y-1">
                          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1.5 md:px-3 md:py-2">Playback Speed</p>
                          {[0.5, 1, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => handlePlaybackSpeed(speed)}
                              className={cn(
                                "w-full flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all",
                                playbackSpeed === speed ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10"
                              )}
                            >
                              <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                              {playbackSpeed === speed && <Check size={12} />}
                            </button>
                          ))}
                          <div className="h-px bg-white/5 my-1.5 md:my-2 mx-2 md:mx-3" />

                          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 py-1.5 md:px-3 md:py-2">Skip Duration</p>
                          {[5, 10, 15, 30].map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSkipDuration(s);
                                localStorage.setItem('gplus_skip_duration', s);
                                setIsSettingsOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all",
                                skipDuration === s ? "bg-primary text-white" : "text-slate-400 hover:bg-white/10"
                              )}
                            >
                              <span>{s} Seconds</span>
                              {skipDuration === s && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button className="text-white hover:text-primary transition-colors hidden md:block"><PictureInPicture2 size={20} /></button>
                <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
                  {isFullscreen ? <Minimize size={18} className="md:w-[24px] md:h-[24px]" /> : <Maximize size={18} className="md:w-[24px] md:h-[24px]" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoPlayer;

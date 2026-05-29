import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  Users, 
  Settings,
  Maximize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const VideoChat = () => {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const localVideoRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    // Get Local Media
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getMedia();

    // Socket Connection
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_room', 'video-collab-room');

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      socketRef.current.disconnect();
    };
  }, []);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMicOn;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };
  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-120px)] gap-4 md:gap-6 px-0 py-4 lg:p-0 relative">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-white truncate">Video Collaboration</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 truncate">Room: GPLUS-COLLAB-2024</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 self-start sm:self-auto shrink-0">
          <div className="flex -space-x-2 shrink-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-dark bg-slate-600" />
            ))}
          </div>
          <span className="text-xs md:text-sm font-medium text-slate-400 shrink-0">+12 others</span>
        </div>
      </div>

      {/* Video Grid Container */}
      <div className="flex-1 flex flex-col justify-center lg:overflow-y-auto custom-scrollbar lg:min-h-0 pb-40 lg:pb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-7xl mx-auto items-center">
          {/* Main User (Self) */}
          <div className="relative glass-card overflow-hidden group aspect-video bg-black/40 w-full">
            {isVideoOn ? (
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <VideoOff size={24} className="md:w-8 md:h-8 text-slate-500" />
                 </div>
              </div>
            )}
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/60 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
              <span className="truncate">You (Organizer)</span>
            </div>
            <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 md:p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-black/60"><Maximize2 size={14} className="md:w-4 md:h-4" /></button>
            </div>
          </div>

          {/* Remote Participant 1 (Mock for UI Consistency) */}
          <div className="relative glass-card overflow-hidden group aspect-video w-full">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')] bg-cover bg-center" />
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/60 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2">
              <MicOff size={12} className="md:w-3.5 md:h-3.5 text-red-500 shrink-0" />
              <span className="truncate">John Doe</span>
            </div>
          </div>

          {/* Remote Participant 2 (Mock for UI Consistency) */}
          <div className="relative glass-card overflow-hidden group aspect-video w-full">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80')] bg-cover bg-center" />
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 bg-black/60 backdrop-blur-md px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
               <span className="truncate">Sarah Miller</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-center py-4 md:py-6 shrink-0 fixed bottom-20 sm:bottom-28 left-4 right-4 lg:static lg:bottom-auto lg:left-auto lg:right-auto z-50 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-4 bg-dark-lighter/80 backdrop-blur-2xl p-2 md:p-4 rounded-full md:rounded-[2rem] border border-white/10 shadow-2xl overflow-x-auto no-scrollbar pointer-events-auto max-w-full">
          <button 
            onClick={toggleMic}
            className={`p-3 md:p-4 rounded-full md:rounded-2xl transition-all shrink-0 ${isMicOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-red-500/20 text-red-500'}`}
          >
            {isMicOn ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
          </button>
          <button 
            onClick={toggleVideo}
            className={`p-3 md:p-4 rounded-full md:rounded-2xl transition-all shrink-0 ${isVideoOn ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-red-500/20 text-red-500'}`}
          >
            {isVideoOn ? <Video size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
          </button>
          <button className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full md:rounded-2xl text-white transition-all shrink-0"><Monitor size={20} className="md:w-6 md:h-6" /></button>
          <button className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full md:rounded-2xl text-white transition-all shrink-0"><Users size={20} className="md:w-6 md:h-6" /></button>
          <button className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-full md:rounded-2xl text-white transition-all shrink-0"><Settings size={20} className="md:w-6 md:h-6" /></button>
          <div className="w-px h-8 md:h-10 bg-white/10 mx-1 md:mx-2 shrink-0" />
          <button 
            onClick={() => navigate('/')}
            className="p-3 md:p-4 bg-red-500 hover:bg-red-600 rounded-full md:rounded-2xl text-white shadow-lg shadow-red-500/20 transition-all shrink-0"
          >
            <PhoneOff size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;

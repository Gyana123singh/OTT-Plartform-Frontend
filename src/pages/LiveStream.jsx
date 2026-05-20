import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Heart,
  Share2,
  MessageCircle,
  Gift,
  Smile,
  Send,
  MoreVertical,
  AlertCircle,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { clsx } from 'clsx';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getStreamById, endStream, startStream } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const createMockStream = () => {
  console.log("🎨 Creating high-fidelity virtual dummy video & audio stream fallback...");

  // 1. Create a beautiful simulated Canvas video track
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  let angle = 0;
  const intervalId = setInterval(() => {
    if (!ctx) return;

    // Draw vibrant moving gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    const col1 = `hsl(${angle % 360}, 70%, 25%)`;
    const col2 = `hsl(${(angle + 120) % 360}, 75%, 15%)`;
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw high-end abstract floating particle circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 5; i++) {
      const x = canvas.width / 2 + Math.sin(angle * 0.02 + i) * 150;
      const y = canvas.height / 2 + Math.cos(angle * 0.03 + i) * 100;
      const radius = 30 + Math.sin(angle * 0.05 + i) * 15;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw standard neon camera grid/telemetry overlays
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // "REC" flashing indicator
    if (Math.floor(angle / 15) % 2 === 0) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(45, 45, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 14px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('REC', 65, 50);

    // Platform label
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '900 24px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('G PLUS VIRTUAL STREAM', canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '700 12px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('HIGH-FIDELITY SIMULATION FEED', canvas.width / 2, canvas.height / 2 + 20);

    angle += 2;
  }, 1000 / 30); // 30 fps

  const canvasStream = canvas.captureStream(30);
  const videoTrack = canvasStream.getVideoTracks()[0];

  // 2. Create simulated silent Audio track using Web Audio API
  let audioTrack;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440; // A4 tone
    gainNode.gain.value = 0.0001; // Silent tone to comply with autoplay/noise

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    const mediaStreamDestination = audioCtx.createMediaStreamDestination();
    gainNode.connect(mediaStreamDestination);
    audioTrack = mediaStreamDestination.stream.getAudioTracks()[0];
  } catch (audioErr) {
    console.warn("Could not construct virtual audio track:", audioErr);
  }

  // Combine virtual tracks into a media stream
  const tracks = [];
  if (videoTrack) tracks.push(videoTrack);
  if (audioTrack) tracks.push(audioTrack);

  const mockStream = new MediaStream(tracks);

  // Custom cleanup method to clear draw interval when tracks stop
  const originalStop = videoTrack.stop;
  videoTrack.stop = function () {
    clearInterval(intervalId);
    if (originalStop) originalStop.apply(this, arguments);
  };

  return mockStream;
};

const LiveStream = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [streamData, setStreamData] = useState(state?.video || null);
  const [isHost, setIsHost] = useState(state?.isHost || false);
  const [loadingStream, setLoadingStream] = useState(!streamData);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamOffline, setStreamOffline] = useState(false);
  const [viewerMuted, setViewerMuted] = useState(true);

  const socketRef = useRef();
  const videoRef = useRef();
  const localStreamRef = useRef();
  const pcsRef = useRef({}); // host: viewerSocketId -> RTCPeerConnection
  const pcRef = useRef(); // viewer: single connection to host
  const hostCandidatesRef = useRef({}); // host: viewerSocketId -> early candidates queue
  const viewerCandidatesRef = useRef([]); // viewer: early candidates queue
  const chatEndRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  // YouTube-style Stream Setup Control Room States
  const [setupTitle, setSetupTitle] = useState("");
  const [setupDesc, setSetupDesc] = useState("");
  const [setupCategory, setSetupCategory] = useState("Gaming");
  const [setupPublic, setSetupPublic] = useState(true);
  const [setupThumbnail, setSetupThumbnail] = useState("");
  const [setupStream, setSetupStream] = useState(null);
  const [isStartingStream, setIsStartingStream] = useState(false);
  const setupVideoRef = useRef(null);

  // Handle local camera preview inside Stream setup control room
  useEffect(() => {
    if (!id) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((stream) => {
          setSetupStream(stream);
          if (setupVideoRef.current) {
            setupVideoRef.current.srcObject = stream;
            setupVideoRef.current.muted = true;
            setupVideoRef.current.play().catch(e => console.warn("Preview autoplay blocked:", e));
          }
        })
        .catch((err) => {
          console.warn("⚠️ Preview camera access denied:", err);
        });
    }
    return () => {
      if (setupStream) {
        setupStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id]);

  const handleGoLive = async (e) => {
    e.preventDefault();
    if (!setupTitle.trim()) {
      alert("Please enter a title for your stream!");
      return;
    }
    try {
      setIsStartingStream(true);
      
      const defaultThumbnails = {
        Gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640',
        Entertainment: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=640',
        Music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=640',
        News: 'https://images.unsplash.com/photo-1495020689067-958852a6565d?q=80&w=640',
        Education: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640'
      };
      
      const thumb = setupThumbnail.trim() || defaultThumbnails[setupCategory] || defaultThumbnails.Gaming;

      const { data } = await startStream({
        title: setupTitle,
        description: setupDesc,
        category: setupCategory,
        thumbnail: thumb,
        isPublic: setupPublic
      });

      console.log("Stream successfully created on backend:", data);

      if (setupStream) {
        setupStream.getTracks().forEach(track => track.stop());
        setSetupStream(null);
      }

      setIsHost(true);
      setStreamData(data);
      setLoadingStream(false);
      setStreamOffline(false);
      
      navigate(`/live/${data._id}`, { replace: true, state: { video: data, isHost: true } });
    } catch (err) {
      console.error("Error creating stream:", err);
      alert(err.response?.data?.message || "Failed to start live stream. Please try again.");
    } finally {
      setIsStartingStream(false);
    }
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch Stream Data if not provided in location state
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoadingStream(true);
        const { data } = await getStreamById(id);
        setStreamData(data);

        // Dynamically detect host
        const creatorId = data.creator?._id || data.creator;
        if (creatorId && currentUser?._id && creatorId.toString() === currentUser._id.toString()) {
          setIsHost(true);
        }

        if (!data.isLive) {
          setStreamOffline(true);
        }
      } catch (err) {
        console.error("Error fetching stream:", err);
      } finally {
        setLoadingStream(false);
      }
    };

    if (id) {
      fetchStream();
    }
  }, [id]);

  // WebRTC & Socket Connection Setup
  useEffect(() => {
    if (loadingStream || !streamData) return;

    // Connect to Socket
    socketRef.current = io(SOCKET_URL);
    const roomId = id || 'global-live';

    socketRef.current.emit('join_room', roomId);
    socketRef.current.emit('join_stream', roomId);

    // Listen for chat messages
    socketRef.current.on('receive_message', (data) => {
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: data.user?.name || data.user || 'Guest',
        message: data.message,
        color: data.user?._id === currentUser?._id ? "text-primary" : "text-blue-400"
      }]);
    });

    const peerConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    };

    if (isHost) {
      console.log("🎥 Broadcaster active. Capturing camera & mic...");

      const createPeerConnection = async (socketId) => {
        if (pcsRef.current[socketId]) return;

        console.log(`📡 Initializing RTCPeerConnection for viewer: ${socketId}`);
        const pc = new RTCPeerConnection(peerConfiguration);
        pcsRef.current[socketId] = pc;

        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current);
          });
        }

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('ice_candidate', {
              candidate: event.candidate,
              target: socketId
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
            pc.close();
            delete pcsRef.current[socketId];
            setViewerCount(Object.keys(pcsRef.current).length);
          }
        };

        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.emit('stream_offer', {
            offer,
            target: socketId
          });
        } catch (err) {
          console.error("Error creating WebRTC offer:", err);
        }

        setViewerCount(Object.keys(pcsRef.current).length);
      };

      // Capture broadcaster camera
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // Mute locally to avoid eco
          }

          // Emit stream started and host ready signals
          socketRef.current.emit('start_stream', roomId);
          socketRef.current.emit('host_ready', { roomId });

          // Viewer joined listener (initiates peer connection)
          socketRef.current.on('user_joined_stream', async ({ socketId }) => {
            console.log(`📡 Viewer joined: ${socketId}, establishing connection...`);
            createPeerConnection(socketId);
          });

          // Listener for explicit viewer ready signals (for viewers already in room)
          socketRef.current.on('viewer_ready', async ({ socketId }) => {
            console.log(`📡 Viewer ready signal received from ${socketId}, establishing connection...`);
            createPeerConnection(socketId);
          });

          // Answer listener
          socketRef.current.on('stream_answer', async ({ answer, sender }) => {
            console.log(`📬 Received answer from viewer ${sender}`);
            const pc = pcsRef.current[sender];
            if (pc) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log(`✅ Remote description set for viewer ${sender}. Draining candidate buffer...`);
                const pending = hostCandidatesRef.current[sender] || [];
                for (const cand of pending) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (e) {
                    console.error("Error draining pending host ICE candidate:", e);
                  }
                }
                delete hostCandidatesRef.current[sender];
              } catch (e) {
                console.error("Error setting host remote description:", e);
              }
            }
          });

          // ICE Candidate listener
          socketRef.current.on('ice_candidate', async ({ candidate, sender }) => {
            const pc = pcsRef.current[sender];
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error("Error setting host ICE candidate:", e);
              }
            } else {
              console.log(`⏳ Buffering early ICE candidate from viewer: ${sender}`);
              if (!hostCandidatesRef.current[sender]) {
                hostCandidatesRef.current[sender] = [];
              }
              hostCandidatesRef.current[sender].push(candidate);
            }
          });

          // User disconnects listener
          socketRef.current.on('user_left_stream', ({ socketId }) => {
            console.log(`🔌 Viewer left stream: ${socketId}`);
            const pc = pcsRef.current[socketId];
            if (pc) {
              pc.close();
              delete pcsRef.current[socketId];
            }
            setViewerCount(Object.keys(pcsRef.current).length);
          });
        })
        .catch((err) => {
          console.warn("⚠️ Camera/Mic access denied or unavailable. Activating virtual simulation stream...", err);

          // Generate moving neon HSL canvas stream & silent audio context fallback
          const stream = createMockStream();
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
          }

          // Emit stream started and host ready signals
          socketRef.current.emit('start_stream', roomId);
          socketRef.current.emit('host_ready', { roomId });

          // Viewer joined listener (initiates peer connection)
          socketRef.current.on('user_joined_stream', async ({ socketId }) => {
            console.log(`📡 Viewer joined: ${socketId}, establishing connection...`);
            createPeerConnection(socketId);
          });

          // Listener for explicit viewer ready signals (for viewers already in room)
          socketRef.current.on('viewer_ready', async ({ socketId }) => {
            console.log(`📡 Viewer ready signal received from ${socketId}, establishing connection...`);
            createPeerConnection(socketId);
          });

          // Answer listener
          socketRef.current.on('stream_answer', async ({ answer, sender }) => {
            console.log(`📬 Received answer from viewer ${sender}`);
            const pc = pcsRef.current[sender];
            if (pc) {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log(`✅ Remote description set for viewer ${sender}. Draining candidate buffer...`);
                const pending = hostCandidatesRef.current[sender] || [];
                for (const cand of pending) {
                  try {
                    await pc.addIceCandidate(new RTCIceCandidate(cand));
                  } catch (e) {
                    console.error("Error draining pending host ICE candidate:", e);
                  }
                }
                delete hostCandidatesRef.current[sender];
              } catch (e) {
                console.error("Error setting host remote description:", e);
              }
            }
          });

          // ICE Candidate listener
          socketRef.current.on('ice_candidate', async ({ candidate, sender }) => {
            const pc = pcsRef.current[sender];
            if (pc && pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error("Error setting host ICE candidate:", e);
              }
            } else {
              console.log(`⏳ Buffering early ICE candidate from viewer: ${sender}`);
              if (!hostCandidatesRef.current[sender]) {
                hostCandidatesRef.current[sender] = [];
              }
              hostCandidatesRef.current[sender].push(candidate);
            }
          });

          // User disconnects listener
          socketRef.current.on('user_left_stream', ({ socketId }) => {
            console.log(`🔌 Viewer left stream: ${socketId}`);
            const pc = pcsRef.current[socketId];
            if (pc) {
              pc.close();
              delete pcsRef.current[socketId];
            }
            setViewerCount(Object.keys(pcsRef.current).length);
          });
        });
    } else {
      console.log("📺 Viewer active. Waiting for WebRTC offer...");
      setStreamOffline(true);

      // Emit viewer ready signal immediately on join
      socketRef.current.emit('viewer_ready', { roomId });

      // Listen for Host Ready signal
      socketRef.current.on('host_ready', () => {
        console.log("👑 Host has initialized. Emitting viewer_ready handshake...");
        socketRef.current.emit('viewer_ready', { roomId });
      });

      // Offer listener (viewer sets up remote receiver)
      socketRef.current.on('stream_offer', async ({ offer, sender }) => {
        console.log(`📬 Received stream offer from Host ${sender}`);

        if (pcRef.current) {
          pcRef.current.close();
        }

        const pc = new RTCPeerConnection(peerConfiguration);
        pcRef.current = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('ice_candidate', {
              candidate: event.candidate,
              target: sender
            });
          }
        };

        pc.ontrack = (event) => {
          console.log("🎮 Remote stream track received. Displaying feed...");
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.muted = true; // Force muted on video element to allow seamless autoplay
            videoRef.current.play().catch(e => console.warn("Autoplay was blocked or interrupted:", e));
          }
          setStreamOffline(false);
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            setStreamOffline(true);
          }
        };

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('stream_answer', {
            answer,
            target: sender
          });

          console.log("✅ Remote description set for viewer. Draining candidate buffer...");
          const pending = viewerCandidatesRef.current || [];
          for (const cand of pending) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.error("Error draining pending viewer ICE candidate:", e);
            }
          }
          viewerCandidatesRef.current = [];
        } catch (err) {
          console.error("Error answering WebRTC offer:", err);
        }
      });

      // ICE candidate listener
      socketRef.current.on('ice_candidate', async ({ candidate }) => {
        if (pcRef.current && pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error setting viewer ICE candidate:", err);
          }
        } else {
          console.log("⏳ Buffering early ICE candidate from host...");
          viewerCandidatesRef.current.push(candidate);
        }
      });

      // Stream status signals
      socketRef.current.on('stream_started', () => {
        console.log("Host came online!");
        setStreamOffline(false);
      });

      socketRef.current.on('stream_ended', () => {
        console.log("Host ended stream.");
        setStreamOffline(true);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      });
    }

    return () => {
      console.log("Cleaning up live stream WebRTC connection...");
      if (socketRef.current) {
        socketRef.current.emit('leave_stream', roomId);
        socketRef.current.disconnect();
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      Object.keys(pcsRef.current).forEach(id => {
        pcsRef.current[id].close();
      });
      pcsRef.current = {};
      hostCandidatesRef.current = {};
      viewerCandidatesRef.current = [];

      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [loadingStream, isHost, id]);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleViewerMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setViewerMuted(videoRef.current.muted);
    }
  };


  const handleEndStream = async () => {
    if (window.confirm("Are you sure you want to stop this live stream? This will disconnect all viewers.")) {
      try {
        await endStream(streamData._id);
        if (socketRef.current) {
          socketRef.current.emit('end_stream', id);
        }
        navigate('/creator');
      } catch (err) {
        console.error("Error ending stream:", err);
        navigate('/creator');
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest_' + Math.floor(Math.random() * 1000) };
    const roomId = id || 'global-live';

    socketRef.current.emit('send_message', {
      roomId,
      message,
      user
    });

    setMessage("");
  };

  if (!id) {
    return (
      <div className="max-w-6xl mx-auto py-6 md:py-10 px-4 space-y-6 md:space-y-8">
         {/* YouTube-like Header */}
         <div className="flex items-center gap-4 border-b border-white/5 pb-6">
           <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 shrink-0">
             <Video size={24} className="animate-pulse" />
           </div>
           <div>
             <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">Stream Control Room</h1>
             <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure your broadcast telemetry, adjust camera preview, and go live instantly.</p>
           </div>
         </div>
         
         <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
           {/* Left Column: Camera Preview */}
           <div className="flex-1 space-y-4">
             <div className="aspect-video bg-black rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl flex items-center justify-center group">
               {setupStream ? (
                 <video 
                   ref={setupVideoRef}
                   autoPlay 
                   playsInline
                   muted
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="text-center p-6 space-y-3">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mx-auto text-slate-500 group-hover:text-primary transition-colors">
                     <Video size={28} />
                   </div>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Awaiting Camera/Mic Access...</p>
                 </div>
               )}
               
               <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white tracking-widest uppercase border border-white/5 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Local Preview
               </div>
             </div>
             
             {/* Stream guidelines/tips inside a glass card */}
             <div className="glass-card p-5 space-y-3">
               <h3 className="text-xs font-black text-white uppercase tracking-wider">Broadcaster Pre-Flight Checklist</h3>
               <ul className="text-xs text-slate-400 space-y-2.5">
                 <li className="flex items-center gap-2 text-slate-300">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                   <span>Ensure a high-speed stable internet connection.</span>
                 </li>
                 <li className="flex items-center gap-2 text-slate-300">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                   <span>Place your camera at eye-level with clear foreground lighting.</span>
                 </li>
                 <li className="flex items-center gap-2 text-slate-300">
                   <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                   <span>Check that your micro-auditory device captures crisp vocals.</span>
                 </li>
               </ul>
             </div>
           </div>
           
           {/* Right Column: Config Form */}
           <div className="w-full lg:w-[480px] glass-card p-6 md:p-8 space-y-6 shrink-0">
             <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider border-b border-white/5 pb-4">Stream Metadata</h2>
             <form onSubmit={handleGoLive} className="space-y-5">
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stream Title</label>
                 <input 
                   type="text"
                   required
                   value={setupTitle}
                   onChange={(e) => setSetupTitle(e.target.value)}
                   placeholder="e.g. Chill Gaming Session! 🚀"
                   className="w-full bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                 />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                 <textarea 
                   value={setupDesc}
                   onChange={(e) => setSetupDesc(e.target.value)}
                   placeholder="Describe what your broadcast is about..."
                   rows={3}
                   className="w-full bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white resize-none"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                   <select 
                     value={setupCategory}
                     onChange={(e) => setSetupCategory(e.target.value)}
                     className="w-full bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white cursor-pointer"
                   >
                     <option value="Gaming">Gaming</option>
                     <option value="Entertainment">Entertainment</option>
                     <option value="Music">Music</option>
                     <option value="News">News</option>
                     <option value="Education">Education</option>
                   </select>
                 </div>
                 
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visibility</label>
                   <select 
                     value={setupPublic ? "Public" : "Private"}
                     onChange={(e) => setSetupPublic(e.target.value === "Public")}
                     className="w-full bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white cursor-pointer"
                   >
                     <option value="Public">Public (Global feed)</option>
                     <option value="Private">Private</option>
                   </select>
                 </div>
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Custom Cover Image URL (Optional)</label>
                 <input 
                   type="text"
                   value={setupThumbnail}
                   onChange={(e) => setSetupThumbnail(e.target.value)}
                   placeholder="https://images.unsplash.com/photo-..."
                   className="w-full bg-dark border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                 />
               </div>
               
               <button 
                 type="submit"
                 disabled={isStartingStream}
                 className="w-full py-4 btn-primary rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
               >
                 {isStartingStream ? (
                   <Loader2 className="animate-spin" size={16} />
                 ) : (
                   <Video size={16} className="fill-white" />
                 )}
                 GO LIVE NOW
               </button>
             </form>
           </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 p-2 sm:p-4 lg:p-0">
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto custom-scrollbar lg:pr-2">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/5 shadow-2xl shrink-0">

          {/* Main Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Simulated Video Content fallback if not fully loaded */}
          {loadingStream && (
            <div className="absolute inset-0 bg-dark flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tuning in to the satellite feed...</p>
            </div>
          )}

          {/* Stream Offline Glass Cover */}
          {streamOffline && !loadingStream && (
            <div className="absolute inset-0 bg-dark/95 flex flex-col items-center justify-center text-center p-6 space-y-4 z-20">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 animate-pulse">
                <VideoOff size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Live Broadcast Offline</h3>
                <p className="text-xs text-slate-500 max-w-xs font-semibold">The broadcaster has ended the stream or is currently offline. Please wait or check other channels.</p>
              </div>
            </div>
          )}

          {/* Player Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-between z-30">

            {/* Dynamic Live Status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 px-3 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                </span>
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-1.5">
                  <Users size={12} className="text-primary" /> {isHost ? viewerCount : (viewerCount || 1)} watching
                </span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <button className="p-2 hover:bg-white/10 rounded-lg"><AlertCircle size={20} /></button>
                <button className="p-2 hover:bg-white/10 rounded-lg"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Host Audio/Video Control Panel */}
            {isHost && (
              <div className="flex items-center gap-3 self-center bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={clsx(
                    "p-2 rounded-xl border transition-all text-white",
                    cameraEnabled ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-red-600/20 border-red-600 text-red-500"
                  )}
                  title={cameraEnabled ? "Disable Camera" : "Enable Camera"}
                >
                  {cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button
                  type="button"
                  onClick={toggleMic}
                  className={clsx(
                    "p-2 rounded-xl border transition-all text-white",
                    micEnabled ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-red-600/20 border-red-600 text-red-500"
                  )}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button
                  type="button"
                  onClick={handleEndStream}
                  className="p-2 bg-red-600 text-white rounded-xl border border-red-600 hover:bg-red-700 transition-all font-bold flex items-center gap-1.5 text-xs px-4"
                >
                  <PhoneOff size={14} /> END BROADCAST
                </button>
              </div>
            )}

            {/* Viewer Audio Control Panel */}
            {!isHost && (
              <div className="flex items-center gap-3 self-center bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                <button
                  type="button"
                  onClick={toggleViewerMute}
                  className={clsx(
                    "p-2 rounded-xl border transition-all text-white flex items-center gap-2 px-4",
                    viewerMuted ? "bg-red-600/20 border-red-600 text-red-500 hover:bg-red-600/30" : "bg-white/10 border-white/10 hover:bg-white/20"
                  )}
                  title={viewerMuted ? "Unmute Stream Audio" : "Mute Stream Audio"}
                >
                  {viewerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{viewerMuted ? "Unmute" : "Mute Audio"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stream Info */}
        <div className="mt-4 md:mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-black text-white truncate">{streamData?.title || "Live Broadcast"}</h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 md:mt-2">
                <span className="px-2 py-0.5 md:py-1 bg-white/5 rounded text-[8px] md:text-[10px] font-bold text-slate-400 whitespace-nowrap">#{streamData?.category?.toUpperCase() || "LIVE"}</span>
                <span className="px-2 py-0.5 md:py-1 bg-white/5 rounded text-[8px] md:text-[10px] font-bold text-slate-400 whitespace-nowrap">#GPLUS</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={clsx(
                  "flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border transition-all",
                  isLiked ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                )}
              >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} className="md:w-[18px] md:h-[18px]" />
                <span className="font-bold text-xs md:text-sm">{(streamData?.views || 0) + (isLiked ? 1 : 0)}</span>
              </button>
              <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg md:rounded-xl transition-all">
                <Share2 size={16} className="md:w-[18px] md:h-[18px]" />
                <span className="font-bold text-xs md:text-sm">Share</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 md:p-4 glass-card gap-2">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
                  {streamData?.creator?.avatar ? (
                    <img src={`${SOCKET_URL}/${streamData.creator.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                      {streamData?.creator?.name?.charAt(0) || streamData?.creator?.charAt(0) || "G"}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                  <span className="truncate">{streamData?.creator?.name || streamData?.creator || "G Plus Streamer"}</span>
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-400 rounded-full border-2 border-dark shrink-0" />
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest truncate">Broadcaster</p>
              </div>
            </div>
            {!isHost && (
              <button className="btn-primary py-1.5 px-4 md:py-2 md:px-6 rounded-lg md:rounded-xl text-xs md:text-sm shrink-0">FOLLOW</button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-[380px] flex flex-col glass-card overflow-hidden h-[400px] lg:h-full shrink-0 mt-4 lg:mt-0">
        <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">Live Chat</h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-black/20 px-2 py-1 rounded">
            <Users size={12} className="text-accent" />
            REALTIME FEED
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-2 text-white">
              <MessageCircle size={40} />
              <p className="text-xs font-bold uppercase tracking-widest">No messages yet.<br />Start the conversation!</p>
            </div>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className={clsx("font-bold mr-2", msg.color)}>{msg.user}:</span>
              <span className="text-slate-300">{msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white/5 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Smile size={20} /></button>
            <button type="button" className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><Gift size={20} /></button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a message..."
                className="w-full bg-dark border border-white/10 rounded-xl py-2 px-3 md:px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
              />
            </div>
            <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:shadow-lg shadow-primary/20 transition-all">
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveStream;

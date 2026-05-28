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
  VolumeX,
  Play,
  Sparkles,
  Plus,
  Compass,
  Radio,
  Tv,
  DollarSign,
  Star,
  Settings,
  Trash2,
  Pin,
  X,
  BarChart2,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getStreamById, endStream, startStream, getLiveStreams, becomeCreator, getChatMessages } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const createMockStream = (realAudioTrack = null) => {
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

    // Fallback status
    ctx.fillStyle = realAudioTrack ? 'rgba(34, 197, 94, 0.9)' : 'rgba(139, 92, 246, 0.9)';
    ctx.font = '900 11px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(realAudioTrack ? '🎤 REAL VOICE STREAMING ACTIVE' : '📡 TELEMETRY HUM STREAMING ACTIVE', canvas.width / 2, canvas.height / 2 + 20);

    angle += 2;
  }, 1000 / 30); // 30 fps

  const canvasStream = canvas.captureStream(30);
  const videoTrack = canvasStream.getVideoTracks()[0];

  // 2. Resolve audio track (real microphone or Web Audio placeholder)
  let audioTrack = realAudioTrack;
  let pulseInterval = null;
  let droneOsc = null;
  let beepOsc = null;

  if (!audioTrack) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();

      // Ambient Satellite Space hum drone (A2 low hum)
      droneOsc = audioCtx.createOscillator();
      const droneGain = audioCtx.createGain();
      droneOsc.type = 'sine';
      droneOsc.frequency.value = 110;
      droneGain.gain.value = 0.015;

      droneOsc.connect(droneGain);

      // Periodic space telemetry beep
      beepOsc = audioCtx.createOscillator();
      const beepGain = audioCtx.createGain();
      beepOsc.type = 'sine';
      beepOsc.frequency.value = 880;
      beepGain.gain.value = 0;

      beepOsc.connect(beepGain);

      droneOsc.start();
      beepOsc.start();

      pulseInterval = setInterval(() => {
        try {
          beepGain.gain.setValueAtTime(0.008, audioCtx.currentTime);
          beepGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
        } catch (e) {}
      }, 4000);

      const mediaStreamDestination = audioCtx.createMediaStreamDestination();
      droneGain.connect(mediaStreamDestination);
      beepGain.connect(mediaStreamDestination);
      audioTrack = mediaStreamDestination.stream.getAudioTracks()[0];
    } catch (audioErr) {
      console.warn("Could not construct virtual audio track:", audioErr);
    }
  }

  // Combine virtual tracks into a media stream
  const tracks = [];
  if (videoTrack) tracks.push(videoTrack);
  if (audioTrack) tracks.push(audioTrack);

  const mockStream = new MediaStream(tracks);

  // Custom cleanup method to clear draw interval and oscillators when tracks stop
  const originalStop = videoTrack.stop;
  videoTrack.stop = function () {
    clearInterval(intervalId);
    if (pulseInterval) clearInterval(pulseInterval);
    try {
      if (droneOsc) droneOsc.stop();
      if (beepOsc) beepOsc.stop();
    } catch (e) {}
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
  const [loadingStream, setLoadingStream] = useState(!streamData && !!id);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamOffline, setStreamOffline] = useState(false);
  const [viewerMuted, setViewerMuted] = useState(true);

  // Catalog & Studio setup states
  const [activeStreams, setActiveStreams] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(!id);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSetupRoom, setShowSetupRoom] = useState(false);

  const socketRef = useRef();
  const videoRef = useRef();
  const localStreamRef = useRef();
  const pcsRef = useRef({}); // host: viewerSocketId -> RTCPeerConnection
  const pcRef = useRef(); // viewer: single connection to host
  const hostCandidatesRef = useRef({}); // host: viewerSocketId -> early candidates queue
  const viewerCandidatesRef = useRef([]); // viewer: early candidates queue
  const pendingViewersRef = useRef([]); // host: viewers who joined before localStream is captured
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

  // Super Chat & Quick Actions states
  const [showSuperChatModal, setShowSuperChatModal] = useState(false);
  const [superAmount, setSuperAmount] = useState("5.00");
  const [superTier, setSuperTier] = useState("green");
  const [superMessage, setSuperMessage] = useState("");
  const [selectedPinnedSuperChat, setSelectedPinnedSuperChat] = useState(null);

  // Upgraded live chat premium states (YouTube Live styling)
  const [slowModeDelay, setSlowModeDelay] = useState(0);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [activePoll, setActivePoll] = useState(null);
  const [userVotedIndex, setUserVotedIndex] = useState(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [reactionsList, setReactionsList] = useState([]);
  const [showHostSettings, setShowHostSettings] = useState(false);
  const [starParticles, setStarParticles] = useState([]);

  // Fetch Live Catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        if (!id) setLoadingCatalog(true);
        const { data } = await getLiveStreams();
        setActiveStreams(data || []);
      } catch (err) {
        console.error("Error fetching live streams catalog:", err);
      } finally {
        if (!id) setLoadingCatalog(false);
      }
    };
    fetchCatalog();
    
    // Keep feed dynamic and updated
    const interval = setInterval(fetchCatalog, 8000);
    return () => clearInterval(interval);
  }, [id]);

  // Handle local camera preview inside Stream setup control room
  useEffect(() => {
    if (!id && showSetupRoom) {
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
  }, [id, showSetupRoom]);

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

  // Play Super Chat Sound Chime synthesized via Web Audio API
  const playSuperChatChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Synthesis of double retro bell-chime tones
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5

      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime); // D6
      osc2.frequency.setValueAtTime(1760.00, ctx.currentTime + 0.08); // A6

      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio chime failed to synthesize:", e);
    }
  };

  // Spark star confetti particle splash inside chat area
  const triggerSuperChatParticles = () => {
    const newStars = [];
    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6"];
    for (let i = 0; i < 30; i++) {
      newStars.push({
        id: `${Date.now()}-${Math.random()}-${i}`,
        left: Math.random() * 100,
        top: Math.random() * 40 + 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.2,
        angle: Math.random() * 360,
        distance: Math.random() * 120 + 80
      });
    }
    setStarParticles(newStars);
    setTimeout(() => {
      setStarParticles([]);
    }, 2000);
  };

  // Cooldown countdown tick effect for Slow Mode
  useEffect(() => {
    let timer;
    if (cooldownActive && cooldownSeconds > 0) {
      timer = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            setCooldownActive(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownActive, cooldownSeconds]);

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

  // Fetch Chat Messages History
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const { data } = await getChatMessages(id);
        const formattedHistory = data.map(msg => {
          let text = msg.text || "";
          let isSuperChat = false;
          let sAmount = "";
          let sTier = "";
          
          if (text.startsWith("__SUPERCHAT__:")) {
            const parts = text.split("__:");
            if (parts.length >= 2) {
              const meta = parts[0].split(":");
              if (meta.length >= 3) {
                isSuperChat = true;
                sAmount = meta[1];
                sTier = meta[2];
                text = parts.slice(1).join("__:");
              }
            }
          }

          return {
            id: msg._id,
            user: msg.sender?.name || 'Guest',
            avatar: msg.sender?.avatar || '',
            userId: msg.sender?._id || '',
            message: text,
            isSuperChat,
            superAmount: sAmount,
            superTier: sTier,
            color: msg.sender?._id === currentUser?._id ? "text-primary" : "text-blue-400"
          };
        });
        setChatMessages(formattedHistory);
      } catch (err) {
        console.error("Error fetching chat history:", err);
      }
    };

    if (id) {
      fetchChatHistory();
    }
  }, [id]);

  // WebRTC & Socket Connection Setup
  useEffect(() => {
    if (loadingStream || !streamData || !id) return;

    // Connect to Socket
    socketRef.current = io(SOCKET_URL);
    const roomId = id;

    socketRef.current.emit('join_room', roomId);
    socketRef.current.emit('join_stream', roomId);

    // Listen for chat messages
    socketRef.current.on('receive_message', (data) => {
      let text = data.message || "";
      let isSuperChat = false;
      let sAmount = "";
      let sTier = "";

      if (text.startsWith("__SUPERCHAT__:")) {
        const parts = text.split("__:");
        if (parts.length >= 2) {
          const meta = parts[0].split(":");
          if (meta.length >= 3) {
            isSuperChat = true;
            sAmount = meta[1];
            sTier = meta[2];
            text = parts.slice(1).join("__:");
          }
        }
      }

      if (isSuperChat) {
        playSuperChatChime();
        triggerSuperChatParticles();
      }

      setChatMessages(prev => [...prev, {
        id: data.id || `${Date.now()}-${Math.random()}`,
        user: data.user?.name || data.user || 'Guest',
        avatar: data.user?.avatar || '',
        userId: data.user?._id || '',
        message: text,
        isSuperChat,
        superAmount: sAmount,
        superTier: sTier,
        color: data.user?._id === currentUser?._id ? "text-primary" : "text-blue-400"
      }]);
    });

    // Slow Mode Updates
    socketRef.current.on('slow_mode_changed', ({ delay }) => {
      setSlowModeDelay(delay);
    });

    // Pinned Messages Listeners
    socketRef.current.on('message_pinned', ({ message }) => {
      setPinnedMessage(message);
    });

    socketRef.current.on('message_unpinned', () => {
      setPinnedMessage(null);
    });

    // Message Deletion Listener
    socketRef.current.on('message_deleted', ({ messageId }) => {
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    // Reaction Listener
    socketRef.current.on('receive_reaction', ({ reaction, id }) => {
      const randomX = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal range
      const reactionId = id || `${Date.now()}-${Math.random()}`;
      setReactionsList(prev => [...prev, {
        id: reactionId,
        emoji: reaction,
        x: randomX,
        y: 100
      }]);
      setTimeout(() => {
        setReactionsList(prev => prev.filter(r => r.id !== reactionId));
      }, 3000);
    });

    // Poll Listeners
    socketRef.current.on('poll_created', (pollData) => {
      setActivePoll(pollData);
      setUserVotedIndex(null);
    });

    socketRef.current.on('poll_updated', ({ votes, totalVotes }) => {
      setActivePoll(prev => prev ? { ...prev, votes, totalVotes } : null);
    });

    socketRef.current.on('poll_ended', () => {
      setActivePoll(null);
      setUserVotedIndex(null);
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

      // Decouple listeners from async camera stream promise to eliminate race conditions!
      socketRef.current.on('user_joined_stream', async ({ socketId }) => {
        console.log(`📡 Viewer joined: ${socketId}. Checking stream readiness...`);
        if (localStreamRef.current) {
          createPeerConnection(socketId);
        } else {
          console.log(`⏳ Stream not ready yet. Buffering viewer join: ${socketId}`);
          if (!pendingViewersRef.current.includes(socketId)) {
            pendingViewersRef.current.push(socketId);
          }
        }
      });

      socketRef.current.on('viewer_ready', async ({ socketId }) => {
        console.log(`📡 Viewer ready signal received from ${socketId}. Checking stream readiness...`);
        if (localStreamRef.current) {
          createPeerConnection(socketId);
        } else {
          console.log(`⏳ Stream not ready yet. Buffering viewer ready: ${socketId}`);
          if (!pendingViewersRef.current.includes(socketId)) {
            pendingViewersRef.current.push(socketId);
          }
        }
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
                await pc.addIceCandidate(cand);
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
            await pc.addIceCandidate(candidate);
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

      // Capture broadcaster camera
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true; // Mute locally to avoid feedback loop
          }

          // Emit stream started and host ready signals
          socketRef.current.emit('start_stream', roomId);
          socketRef.current.emit('host_ready', { roomId });

          // Drain early viewers who joined while the camera was spinning up
          console.log(`📡 Stream is ready. Draining ${pendingViewersRef.current.length} buffered viewers...`);
          const pending = [...pendingViewersRef.current];
          pendingViewersRef.current = [];
          pending.forEach(socketId => {
            createPeerConnection(socketId);
          });
        })
        .catch(async (err) => {
          console.warn("⚠️ Camera/Mic access denied or unavailable. Activating virtual simulation stream...", err);

          let realAudioTrack = null;
          try {
            console.log("🎤 Attempting to capture only microphone for voice streaming...");
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            realAudioTrack = audioStream.getAudioTracks()[0];
            console.log("✅ Microphone capture successful! Voice stream is live.");
          } catch (audioErr) {
            console.warn("⚠️ Microphone access also denied. Virtual stream will be silent.", audioErr);
          }

          // Generate moving neon HSL canvas stream & embed real voice if available
          const stream = createMockStream(realAudioTrack);
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = true;
          }

          // Emit stream started and host ready signals
          socketRef.current.emit('start_stream', roomId);
          socketRef.current.emit('host_ready', { roomId });

          // Drain early viewers who joined
          console.log(`📡 Virtual Stream is ready. Draining ${pendingViewersRef.current.length} buffered viewers...`);
          const pending = [...pendingViewersRef.current];
          pendingViewersRef.current = [];
          pending.forEach(socketId => {
            createPeerConnection(socketId);
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
              await pc.addIceCandidate(cand);
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
            await pcRef.current.addIceCandidate(candidate);
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
      pendingViewersRef.current = [];

      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [loadingStream, isHost, id, streamData]);

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
    if (!message.trim() || !socketRef.current) return;

    // Slow mode cooldown interlock check
    if (slowModeDelay > 0 && cooldownActive && !isHost) {
      return;
    }

    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Guest_' + Math.floor(Math.random() * 1000) };
    const roomId = id || 'global-live';

    socketRef.current.emit('send_message', {
      roomId,
      message,
      user
    });

    setMessage("");

    // Start slow mode cooldown timer
    if (slowModeDelay > 0 && !isHost) {
      setCooldownActive(true);
      setCooldownSeconds(slowModeDelay);
    }
  };

  const handleSetSlowMode = (seconds) => {
    if (!socketRef.current || !isHost) return;
    socketRef.current.emit('set_slow_mode', { roomId: id, delay: seconds });
    setShowHostSettings(false);
  };

  const handlePinMessage = (msg) => {
    if (!socketRef.current || !isHost) return;
    socketRef.current.emit('pin_message', { roomId: id, message: msg });
  };

  const handleUnpinMessage = () => {
    if (!socketRef.current || !isHost) return;
    socketRef.current.emit('unpin_message', { roomId: id });
  };

  const handleDeleteMessage = (messageId) => {
    if (!socketRef.current || !isHost) return;
    if (window.confirm("Are you sure you want to delete this message? It will be removed instantly for all viewers.")) {
      socketRef.current.emit('delete_message', { roomId: id, messageId });
    }
  };

  const handleSendReaction = (emoji) => {
    if (!socketRef.current) return;
    socketRef.current.emit('send_reaction', { roomId: id, reaction: emoji });
  };

  const handleCreatePoll = () => {
    if (!socketRef.current || !isHost) return;
    const filteredOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      alert("Please provide at least 2 options for your poll!");
      return;
    }
    
    socketRef.current.emit('create_poll', {
      roomId: id,
      question: pollQuestion,
      options: filteredOptions
    });

    // Reset fields
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowCreatePollModal(false);
  };

  const handleVotePoll = (optionIndex) => {
    if (!socketRef.current || !currentUser?._id || userVotedIndex !== null) return;
    setUserVotedIndex(optionIndex);
    socketRef.current.emit('submit_vote', {
      roomId: id,
      optionIndex,
      userId: currentUser._id
    });
  };

  const handleEndPoll = () => {
    if (!socketRef.current || !isHost) return;
    socketRef.current.emit('end_poll', { roomId: id });
  };

  const handleSendSuperChat = (e) => {
    e.preventDefault();
    if (!currentUser?._id) {
      alert("Please log in to send a Super Chat!");
      navigate('/auth');
      return;
    }
    if (!superMessage.trim() || !socketRef.current) return;

    const roomId = id || 'global-live';
    const formattedMessage = `__SUPERCHAT__:${superAmount}:${superTier}__:${superMessage.trim()}`;

    socketRef.current.emit('send_message', {
      roomId,
      message: formattedMessage,
      user: currentUser
    });

    setSuperMessage("");
    setShowSuperChatModal(false);
  };

  const handleCreateBroadcastClick = async () => {
    if (!currentUser?._id) {
      navigate('/auth');
      return;
    }

    if (currentUser.role === 'creator') {
      setShowSetupRoom(true);
    } else {
      if (window.confirm("Would you like to unlock G Plus Creator Studio and start your own live streams?")) {
        try {
          await becomeCreator();
          const updatedUser = { ...currentUser, role: 'creator' };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.location.reload();
        } catch (err) {
          console.error("Error unlocking creator role:", err);
          alert("Failed to activate Creator Account. Please try again.");
        }
      }
    }
  };

  // Render 1: Beautiful YouTube Live Catalog Page
  if (!id && !showSetupRoom) {
    const categories = ["All", "Gaming", "Entertainment", "Music", "News", "Education"];
    const filteredStreams = activeStreams.filter(s => {
      if (selectedCategory === "All") return true;
      return s.category?.toLowerCase() === selectedCategory.toLowerCase();
    });

    // Pick first stream as spotlight or render premium static placeholder spotlight
    const spotlightStream = activeStreams[0];

    return (
      <div className="max-w-7xl mx-auto py-6 md:py-10 px-0 space-y-8 md:space-y-12">
        {/* Page Hero Spotlight Header */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-900/40 via-purple-950/20 to-dark border border-white/5 shadow-2xl p-6 md:p-12 flex flex-col md:flex-row gap-8 items-center">
          {/* Neon Orb background */}
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-red-600/5 rounded-full blur-[80px] pointer-events-none" />

          {spotlightStream ? (
            <>
              {/* Spotlight Live Card */}
              <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden relative shadow-2xl border border-white/10 shrink-0 group cursor-pointer"
                   onClick={() => navigate(`/live/${spotlightStream._id}`, { state: { video: spotlightStream } })}>
                <img 
                  src={spotlightStream.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640"} 
                  alt={spotlightStream.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-red-600 px-3 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE SPOTLIGHT
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black text-white flex items-center gap-1.5">
                    <Users size={12} className="text-primary" /> {spotlightStream.viewerCount || 1} watching
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center text-white">
                    <Play size={26} fill="white" className="ml-1 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Spotlight Metadata */}
              <div className="flex-1 space-y-4 md:space-y-5 text-left">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">FEATURED CHANNEL</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight line-clamp-2">
                  {spotlightStream.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {spotlightStream.description || "Tune in immediately to participate in G Plus's most popular broadcast channel! Live chat, audio feedback, and high-fidelity video feed are online."}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5">
                    <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
                      {spotlightStream.creator?.avatar ? (
                        <img src={`${SOCKET_URL}/${spotlightStream.creator.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs">
                          {spotlightStream.creator?.name?.charAt(0) || spotlightStream.creator?.charAt(0) || "G"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      {spotlightStream.creator?.name || spotlightStream.creator || "G Plus Streamer"}
                      <span className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider">{spotlightStream.category || "Gaming"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/live/${spotlightStream._id}`, { state: { video: spotlightStream } })}
                  className="btn-primary py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Play size={14} fill="currentColor" /> TUNE IN NOW
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Premium Static Spotlight Banner */}
              <div className="w-full md:w-1/2 aspect-video rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 shrink-0 bg-black/40 flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-indigo-600/15 mix-blend-overlay" />
                <div className="text-center p-6 space-y-4 z-10">
                  <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 mx-auto animate-pulse">
                    <Radio size={32} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">G Plus Live Network</h3>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">24/7 Global Satellite Broadcast</p>
                  </div>
                </div>
              </div>

              {/* Spotlight Metadata */}
              <div className="flex-1 space-y-4 md:space-y-5 text-left">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Broadcaster Space</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                  Share Your World in Realtime
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Join G Plus Live! Experience ultra-low latency WebRTC streaming, high-fidelity browser canvas rendering, instant live chat, and a seamless global community.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleCreateBroadcastClick}
                    className="btn-primary py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> START BROADCASTING
                  </button>
                  <button 
                    onClick={() => {
                      const gamingCategory = document.getElementById("Gaming-feed");
                      if (gamingCategory) gamingCategory.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="py-3.5 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all flex items-center justify-center gap-1"
                  >
                    DISCOVER FEEDS
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Catalog Feed Section */}
        <div className="space-y-6 md:space-y-8" id="Gaming-feed">
          {/* Header & Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500">
                <Tv size={16} />
              </div>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Explore Live Channels</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border",
                    selectedCategory === cat 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Loading State */}
          {loadingCatalog && activeStreams.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Loader2 className="animate-spin text-primary mx-auto" size={40} />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Scanning channels...</p>
            </div>
          ) : filteredStreams.length > 0 ? (
            /* Stream Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredStreams.map((stream) => {
                const streamId = stream._id;
                const creatorName = stream.creator?.name || stream.creator || "G Plus Streamer";
                const creatorAvatar = stream.creator?.avatar;
                const thumbnail = stream.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640";

                return (
                  <motion.div
                    key={streamId}
                    whileHover={{ y: -6 }}
                    className="glass-card overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col h-full rounded-2xl md:rounded-3xl"
                    onClick={() => navigate(`/live/${streamId}`, { state: { video: stream } })}
                  >
                    {/* Thumbnail Container */}
                    <div className="aspect-video relative overflow-hidden bg-black/50 shrink-0">
                      <img 
                        src={thumbnail} 
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Live & Viewers Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                        <span className="bg-red-600 px-2.5 py-0.5 rounded-lg text-[9px] font-black text-white flex items-center gap-1 shadow-lg shadow-red-600/30">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                        </span>
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-black text-white flex items-center gap-1">
                          <Users size={10} className="text-primary" /> {stream.viewerCount || 1}
                        </span>
                      </div>

                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play size={20} fill="white" className="ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">{stream.category || "Gaming"}</span>
                        <h3 className="font-black text-sm md:text-base text-white group-hover:text-primary transition-colors line-clamp-1">
                          {stream.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {stream.description || "Tune in to this real-time stream channel for live entertainment and interactive chat session."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-white/5 mt-4">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shrink-0">
                          <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
                            {creatorAvatar ? (
                              <img src={`${SOCKET_URL}/${creatorAvatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                                {creatorName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Broadcaster Info */}
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-white truncate flex items-center gap-1">
                            {creatorName}
                            <span className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Broadcaster</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Beautiful Empty State */
            <div className="glass-card max-w-xl mx-auto py-12 px-6 rounded-3xl text-center space-y-5 border border-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mx-auto text-slate-500">
                <VideoOff size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-black text-white uppercase tracking-wider text-base">No Channels Broadcasted</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">There are currently no active live streams in the {selectedCategory} frequency. Be the first to start a live broadcast!</p>
              </div>
              <button 
                onClick={handleCreateBroadcastClick}
                className="btn-primary py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest inline-flex items-center gap-2"
              >
                <Plus size={14} /> CREATE FIRST STREAM
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render 2: YouTube-like Stream Setup Control Room
  if (!id && showSetupRoom) {
    return (
      <div className="max-w-6xl mx-auto py-6 md:py-10 px-0 space-y-6 md:space-y-8">
         {/* YouTube-like Header */}
         <div className="flex items-center justify-between border-b border-white/5 pb-6 gap-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 shrink-0">
               <Video size={24} className="animate-pulse" />
             </div>
             <div>
               <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider">Stream Control Room</h1>
               <p className="text-xs sm:text-sm text-slate-400 mt-1">Configure your broadcast telemetry, adjust camera preview, and go live instantly.</p>
             </div>
           </div>
           
           <button 
             onClick={() => setShowSetupRoom(false)}
             className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-wider transition-all shrink-0"
           >
             Cancel Broadcast
           </button>
         </div>
         
         <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Left Column: Camera Preview */}
            <div className="flex-1 space-y-4 text-left">
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
            <div className="w-full lg:w-[480px] glass-card p-6 md:p-8 space-y-6 shrink-0 text-left">
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

  const otherStreams = activeStreams.filter(s => s._id !== id && s.id !== id);

  // Render 3: Standard Stream Player and Live Chat Room Layout (when ID exists)
  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 px-0 py-2 sm:px-0 sm:py-4 lg:p-0">
      {/* Synthesized Inline Stylesheet for animations */}
      <style>{`
        @keyframes floatBubble {
          0% {
            transform: translateY(0) scale(0.4) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1) rotate(5deg);
          }
          50% {
            transform: translateY(-120px) scale(1.0) rotate(-10deg);
          }
          100% {
            transform: translateY(-240px) scale(0.6) rotate(15deg);
            opacity: 0;
          }
        }
        @keyframes scatterStar {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Video Player Section */}
      <div className="flex-1 flex flex-col min-w-0 lg:overflow-y-auto custom-scrollbar lg:pr-2 text-left">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group border border-white/5 shadow-2xl shrink-0">

          {/* Main Video Element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Floating Emoji Reactions Stream */}
          <div className="absolute right-6 bottom-16 w-28 h-64 pointer-events-none overflow-hidden z-40 select-none">
            {reactionsList.map((react) => (
              <span
                key={react.id}
                className="absolute bottom-0 text-3xl font-black select-none pointer-events-none"
                style={{
                  left: `${react.x}%`,
                  animation: 'floatBubble 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                }}
              >
                {react.emoji}
              </span>
            ))}
          </div>

          {/* Quick Floating Reactions Tray */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 z-40 select-none opacity-80 hover:opacity-100 transition-opacity">
            {["❤️", "🔥", "😂", "👏", "⭐"].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendReaction(emoji)}
                className="w-8 h-8 flex items-center justify-center text-base rounded-full hover:bg-white/15 active:scale-75 transition-all cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-between z-30">

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

        {/* Live Video Slider */}
        <div className="mt-6 md:mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <Radio size={16} className="text-primary animate-pulse" />
              More Live Channels
            </h3>
            <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {otherStreams.length} Online
            </span>
          </div>

          {otherStreams.length === 0 ? (
            <div className="glass-card p-6 text-center border border-white/5 rounded-2xl md:rounded-3xl">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                No other live streams online right now
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
              {otherStreams.map((stream) => {
                const streamId = stream._id || stream.id;
                const creatorName = stream.creator?.name || stream.creator || "G Plus Streamer";
                const creatorAvatar = stream.creator?.avatar;
                const thumbnail = stream.thumbnail || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640";

                return (
                  <div
                    key={streamId}
                    onClick={() => navigate(`/live/${streamId}`, { state: { video: stream } })}
                    className="w-[200px] sm:w-[240px] shrink-0 glass-card rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-black/40 shrink-0">
                      <img 
                        src={thumbnail.startsWith('http') ? thumbnail : `${SOCKET_URL}/${thumbnail.replace(/\\/g, '/')}`} 
                        alt={stream.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640";
                        }}
                      />
                      
                      {/* Live Badge & Viewers */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-1 shadow-lg shadow-red-600/30">
                          <span className="w-1 h-1 bg-white rounded-full animate-ping" /> LIVE
                        </span>
                        <span className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-white flex items-center gap-1">
                          <Users size={8} className="text-primary" /> {stream.viewerCount || 1}
                        </span>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play size={14} fill="white" className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {stream.category || "Gaming"}
                        </span>
                        <h4 className="font-bold text-xs text-white group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                          {stream.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
                        {/* Avatar */}
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-accent p-0.5 shrink-0">
                          <div className="w-full h-full rounded-full bg-dark flex items-center justify-center overflow-hidden">
                            {creatorAvatar ? (
                              <img src={`${SOCKET_URL}/${creatorAvatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[8px]">
                                {creatorName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-bold text-[10px] text-slate-300 truncate">
                            {creatorName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full lg:w-[380px] flex flex-col glass-card overflow-hidden h-[400px] lg:h-full shrink-0 mt-4 lg:mt-0 text-left relative">
        {/* Star Confetti Particles Overlay */}
        {starParticles.map((star) => (
          <span
            key={star.id}
            className="absolute pointer-events-none select-none text-xl z-50 animate-in fade-in"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              color: star.color,
              fontSize: `${star.size}px`,
              '--tx': `${Math.cos(star.angle * Math.PI / 180) * star.distance}px`,
              '--ty': `${Math.sin(star.angle * Math.PI / 180) * star.distance - 150}px`,
              animation: 'scatterStar 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
              animationDelay: `${star.delay}s`
            }}
          >
            ★
          </span>
        ))}

        {/* Chat Header */}
        <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 relative">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-primary animate-pulse" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">Live Chat</h3>
          </div>
          <div className="flex items-center gap-2">
            {isHost && (
              <button
                type="button"
                onClick={() => setShowHostSettings(!showHostSettings)}
                className={clsx(
                  "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer mr-1",
                  showHostSettings && "text-white bg-white/10"
                )}
                title="Broadcaster Controls"
              >
                <Settings size={16} />
              </button>
            )}
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-black/20 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping shrink-0" />
              REALTIME FEED
            </div>
          </div>
        </div>

        {/* Broadcaster Host Settings Panel Overlay */}
        {showHostSettings && isHost && (
          <div className="absolute top-[53px] left-0 right-0 z-30 p-4 bg-dark/95 backdrop-blur-md border-b border-white/10 animate-in slide-in-from-top duration-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Settings size={14} className="text-primary" /> Broadcaster Control Panel
              </h4>
              <button
                type="button"
                onClick={() => setShowHostSettings(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Slow Mode Configurations */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={12} /> Slow Mode Cooldown Delay
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { delay: 0, label: "Off" },
                  { delay: 3, label: "3s" },
                  { delay: 5, label: "5s" },
                  { delay: 10, label: "10s" }
                ].map(opt => (
                  <button
                    key={opt.delay}
                    type="button"
                    onClick={() => handleSetSlowMode(opt.delay)}
                    className={clsx(
                      "py-1 rounded-lg text-xs font-black transition-all border cursor-pointer",
                      slowModeDelay === opt.delay
                        ? "bg-primary border-primary text-white shadow-lg"
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Poll Creation Button */}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              {activePoll ? (
                <button
                  type="button"
                  onClick={() => { handleEndPoll(); setShowHostSettings(false); }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={12} /> End Active Poll
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setShowCreatePollModal(true); setShowHostSettings(false); }}
                  className="flex-1 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BarChart2 size={12} /> Create Community Poll
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div className="bg-blue-600/20 border-b border-blue-500/30 text-blue-100 p-2.5 flex items-center gap-2.5 z-20 shadow-md relative animate-in slide-in-from-top duration-300">
            <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20 text-blue-400 shrink-0">
              <Pin size={14} className="rotate-45" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-[11px] text-blue-300 tracking-wide uppercase">Pinned Announcement</span>
                <span className="text-[10px] text-slate-400 font-bold">•</span>
                <span className="font-bold text-slate-300 truncate max-w-[100px]">{pinnedMessage.user}</span>
              </div>
              <p className="text-white font-medium text-xs mt-0.5 line-clamp-1 break-all leading-tight select-text">
                {pinnedMessage.message}
              </p>
            </div>
            {isHost && (
              <button
                type="button"
                onClick={handleUnpinMessage}
                className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded shrink-0 transition-colors cursor-pointer"
                title="Unpin Message"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Interactive Live Polling Widget Card */}
        {activePoll && (
          <div className="bg-dark/60 backdrop-blur-md border-b border-white/10 p-3.5 space-y-3 z-20 animate-in slide-in-from-top duration-300 relative text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping shrink-0" />
                Live Community Poll
              </span>
              {isHost && (
                <button
                  onClick={handleEndPoll}
                  className="px-2 py-0.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  End Poll
                </button>
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white leading-relaxed select-text">{activePoll.question}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{activePoll.totalVotes || 0} votes cast</p>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {activePoll.options.map((opt, idx) => {
                const total = activePoll.totalVotes || 0;
                const optVotes = (activePoll.votes && activePoll.votes[idx]) || 0;
                const percent = total > 0 ? Math.round((optVotes / total) * 100) : 0;
                const hasVoted = userVotedIndex !== null;

                return (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-white/5 bg-white/5 group transition-all">
                    {/* Animated Progress Bar */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/15 to-accent/15 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                    
                    {hasVoted || isHost ? (
                      // Show Poll Results Mode
                      <div className="relative px-3 py-2 flex items-center justify-between text-xs font-medium z-10">
                        <span className="text-slate-300 truncate max-w-[80%] flex items-center gap-1.5">
                          {hasVoted && userVotedIndex === idx && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                          {opt}
                        </span>
                        <span className="font-bold text-white">{percent}%</span>
                      </div>
                    ) : (
                      // Show Interactive Voting Options Mode
                      <button
                        type="button"
                        onClick={() => handleVotePoll(idx)}
                        className="w-full relative px-3 py-2 text-left text-xs font-bold text-slate-300 hover:text-white z-10 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate max-w-[85%]">{opt}</span>
                        <span className="w-4 h-4 rounded-full border border-white/30 flex items-center justify-center group-hover:border-primary transition-colors shrink-0">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pinned Super Chat Ticker */}
        {chatMessages.filter(m => m.isSuperChat).length > 0 && (
          <div className="bg-dark/40 border-b border-white/5 p-2 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar select-none">
            {chatMessages
              .filter(m => m.isSuperChat)
              .map((m, idx) => {
                // Tier colors
                let dotBorder = "border-sky-500";
                let pinBg = "bg-sky-600/30 text-sky-300";
                if (m.superTier === "green") {
                  dotBorder = "border-emerald-500";
                  pinBg = "bg-emerald-600/30 text-emerald-300";
                } else if (m.superTier === "yellow") {
                  dotBorder = "border-amber-500";
                  pinBg = "bg-amber-600/30 text-amber-300";
                } else if (m.superTier === "red") {
                  dotBorder = "border-rose-500";
                  pinBg = "bg-rose-600/30 text-rose-300";
                }

                return (
                  <button
                    key={m.id || idx}
                    onClick={() => setSelectedPinnedSuperChat(selectedPinnedSuperChat?.id === m.id ? null : m)}
                    className={clsx(
                      "flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-[11px] font-black tracking-wide shrink-0 transition-all active:scale-95 shadow-lg cursor-pointer",
                      dotBorder,
                      pinBg
                    )}
                  >
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-white/10 shrink-0">
                      {m.avatar ? (
                        <img src={`${SOCKET_URL}/${m.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-600 flex items-center justify-center text-[8px] font-black text-white uppercase">
                          {m.user.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span>{m.superAmount}</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* Selected Super Chat Detail Drawer */}
        {selectedPinnedSuperChat && (
          <div className="absolute top-[52px] left-0 right-0 z-10 p-3 bg-dark/95 border-b border-white/10 animate-in slide-in-from-top duration-300">
            <div className={clsx(
              "rounded-xl overflow-hidden border shadow-2xl text-xs",
              selectedPinnedSuperChat.superTier === "green" ? "border-emerald-500/40 text-emerald-100" :
              selectedPinnedSuperChat.superTier === "yellow" ? "border-amber-500/40 text-amber-100" :
              selectedPinnedSuperChat.superTier === "red" ? "border-rose-500/40 text-rose-100" :
              "border-sky-500/40 text-sky-100"
            )}>
              <div className={clsx(
                "p-2 flex items-center justify-between font-bold text-white",
                selectedPinnedSuperChat.superTier === "green" ? "bg-emerald-600" :
                selectedPinnedSuperChat.superTier === "yellow" ? "bg-amber-600" :
                selectedPinnedSuperChat.superTier === "red" ? "bg-rose-600" :
                "bg-sky-600"
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-white/20 shrink-0">
                    {selectedPinnedSuperChat.avatar ? (
                      <img src={`${SOCKET_URL}/${selectedPinnedSuperChat.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-600 flex items-center justify-center text-[9px] font-bold text-white">
                        {selectedPinnedSuperChat.user.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span>{selectedPinnedSuperChat.user}</span>
                </div>
                <div className="px-2 py-0.5 bg-black/20 rounded text-[11px] font-black">
                  {selectedPinnedSuperChat.superAmount}
                </div>
              </div>
              <div className={clsx(
                "p-2.5 text-left text-sm",
                selectedPinnedSuperChat.superTier === "green" ? "bg-emerald-950/60" :
                selectedPinnedSuperChat.superTier === "yellow" ? "bg-amber-950/60" :
                selectedPinnedSuperChat.superTier === "red" ? "bg-rose-950/60" :
                "bg-sky-950/60"
              )}>
                {selectedPinnedSuperChat.message}
              </div>
            </div>
            <button
              onClick={() => setSelectedPinnedSuperChat(null)}
              className="mt-2 text-[10px] uppercase font-bold text-slate-500 hover:text-white block mx-auto py-0.5 px-3 hover:bg-white/5 rounded-full"
            >
              Close Detail
            </button>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3.5 custom-scrollbar bg-dark/20">
          {chatMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-35 text-center space-y-2.5 text-white select-none">
              <MessageCircle size={38} className="text-slate-500" />
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                Welcome to Live Chat!<br />
                <span className="text-[10px] text-slate-500 font-normal normal-case">Be polite and stay positive in the feed.</span>
              </p>
            </div>
          )}
          
          {chatMessages.map((msg) => {
            const isBroadcaster = msg.userId && streamData?.creator && msg.userId.toString() === (streamData.creator._id || streamData.creator).toString();

            if (msg.isSuperChat) {
              // Super Chat Tier styles
              let headerBg = "bg-sky-600";
              let cardBg = "bg-sky-950/50 border-sky-500/30 text-sky-100";
              let pillBg = "bg-sky-800 text-sky-200 border border-sky-600/40";
              
              if (msg.superTier === "green") {
                headerBg = "bg-emerald-600";
                cardBg = "bg-emerald-950/50 border-emerald-500/30 text-emerald-100";
                pillBg = "bg-emerald-800 text-emerald-200 border border-emerald-600/40";
              } else if (msg.superTier === "yellow") {
                headerBg = "bg-amber-600";
                cardBg = "bg-amber-950/50 border-amber-500/30 text-amber-100";
                pillBg = "bg-amber-800 text-amber-200 border border-amber-600/40";
              } else if (msg.superTier === "red") {
                headerBg = "bg-rose-600";
                cardBg = "bg-rose-950/50 border-rose-500/30 text-rose-100";
                pillBg = "bg-rose-800 text-rose-200 border border-rose-600/40";
              }

              return (
                <div
                  key={msg.id}
                  className={clsx(
                    "rounded-xl overflow-hidden border shadow-lg text-xs hover:shadow-xl transition-all scale-98 active:scale-100 animate-in fade-in duration-300",
                    cardBg
                  )}
                >
                  {/* Header Row */}
                  <div className={clsx("p-2 flex items-center justify-between font-bold text-white", headerBg)}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 p-0.5 shrink-0 border border-white/20">
                        {msg.avatar ? (
                          <img src={`${SOCKET_URL}/${msg.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full bg-slate-600 flex items-center justify-center text-[10px] font-black text-white uppercase rounded-full">
                            {msg.user.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="truncate max-w-[150px]">{msg.user}</span>
                    </div>
                    <div className={clsx("px-2 py-0.5 rounded text-[10px] font-black tracking-wide", pillBg)}>
                      {msg.superAmount}
                    </div>
                  </div>
                  {/* Message Row */}
                  <div className="p-3 text-left text-sm leading-relaxed whitespace-pre-line font-medium text-white/95">
                    {msg.message}
                  </div>
                </div>
              );
            }

            // Regular Message Layout
            return (
              <div key={msg.id} className="flex gap-2.5 items-start text-xs text-left group hover:bg-white/5 p-1 rounded-lg transition-all duration-200 animate-in fade-in duration-300">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-white/5 shrink-0 border border-white/10 p-0.5 mt-0.5">
                  {msg.avatar ? (
                    <img src={`${SOCKET_URL}/${msg.avatar.replace(/\\/g, '/')}`} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase rounded-full">
                      {msg.user.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isBroadcaster ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase tracking-widest shadow-md">
                        <Star size={10} fill="currentColor" />
                        Broadcaster
                      </span>
                    ) : (
                      <span className={clsx("font-bold", msg.color || "text-slate-400")}>{msg.user}</span>
                    )}
                    <span className="text-[9px] text-slate-600 font-bold tracking-wider select-none">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap leading-relaxed break-all select-text font-normal">{msg.message}</p>
                </div>
                {/* Moderation Controls (Broadcaster Only) */}
                {isHost && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-start shrink-0 ml-1.5">
                    <button
                      type="button"
                      onClick={() => handlePinMessage(msg)}
                      className="p-1 bg-white/5 hover:bg-blue-600/30 text-slate-400 hover:text-blue-400 rounded transition-all cursor-pointer"
                      title="Pin Announcement"
                    >
                      <Pin size={12} className="rotate-45" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1 bg-white/5 hover:bg-red-600/30 text-slate-400 hover:text-red-400 rounded transition-all cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Emoji shortcuts */}
        <div className="px-3 py-1 border-t border-white/5 bg-white/5 flex items-center justify-around gap-1 shrink-0 select-none">
          {["🔥", "😂", "❤️", "😮", "🎉", "👏", "👑", "👍"].map(em => (
            <button
              key={em}
              type="button"
              onClick={() => setMessage(prev => prev + em)}
              className="text-lg hover:scale-130 active:scale-90 transition-transform p-1 rounded hover:bg-white/10"
            >
              {em}
            </button>
          ))}
        </div>

        {/* Super Chat Modal Form Overlay */}
        {showSuperChatModal && (
          <form
            onSubmit={handleSendSuperChat}
            className="absolute bottom-0 left-0 right-0 z-20 bg-dark/95 border-t border-white/10 p-4 space-y-4 animate-in slide-in-from-bottom duration-300 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <DollarSign size={16} className="text-emerald-400" />
                Unlock YouTube Live Super Chat
              </span>
              <button
                type="button"
                onClick={() => setShowSuperChatModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
            </div>
            
            {/* Amount / Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Super Chat Tier</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { amt: "2.00", tier: "blue", label: "$2", bg: "bg-sky-600 text-white" },
                  { amt: "5.00", tier: "green", label: "$5", bg: "bg-emerald-600 text-white" },
                  { amt: "10.00", tier: "yellow", label: "$10", bg: "bg-amber-600 text-white" },
                  { amt: "50.00", tier: "red", label: "$50", bg: "bg-rose-600 text-white" }
                ].map(opt => (
                  <button
                    key={opt.amt}
                    type="button"
                    onClick={() => { setSuperAmount(opt.amt); setSuperTier(opt.tier); }}
                    className={clsx(
                      "py-1.5 px-1 rounded-xl text-xs font-black border text-center transition-all",
                      superAmount === opt.amt ? `${opt.bg} border-white shadow-lg scale-105` : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom text */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Super Chat Message</label>
              <textarea
                value={superMessage}
                onChange={(e) => setSuperMessage(e.target.value)}
                placeholder="Enter highly visible pinned message..."
                maxLength={200}
                rows={2}
                className="w-full bg-dark border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!superMessage.trim()}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 active:scale-99 transition-all"
            >
              Send Super Chat ({superAmount === "2.00" ? "$2" : superAmount === "5.00" ? "$5" : superAmount === "10.00" ? "$10" : "$50"})
            </button>
          </form>
        )}

        {/* Live Poll Creation Modal overlay */}
        {showCreatePollModal && (
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreatePoll(); }}
            className="absolute bottom-0 left-0 right-0 z-20 bg-dark/95 border-t border-white/10 p-4 space-y-4 animate-in slide-in-from-bottom duration-300 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart2 size={16} className="text-primary animate-pulse" />
                Create Community Poll
              </span>
              <button
                type="button"
                onClick={() => setShowCreatePollModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Question</label>
              <input
                type="text"
                required
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Ask something to your viewers..."
                className="w-full bg-dark border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Options (2 to 4)</label>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-dark border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions(prev => [...prev, ""])}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-bold mt-1.5 cursor-pointer"
                >
                  <Plus size={12} /> Add option choice
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg active:scale-99 transition-all cursor-pointer"
            >
              Launch Live Poll
            </button>
          </form>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white/5 space-y-1.5 shrink-0">
          {slowModeDelay > 0 && (
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1">
              <Clock size={10} className="text-primary animate-pulse" />
              Slow Mode Active ({slowModeDelay}s delay)
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={cooldownActive}
              onClick={() => setShowSuperChatModal(!showSuperChatModal)}
              className={clsx(
                "p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 active:scale-90 transition-all disabled:opacity-30 cursor-pointer",
                showSuperChatModal ? "bg-emerald-500/25 text-white border-emerald-500" : "bg-white/5"
              )}
              title="Send Super Chat"
            >
              <DollarSign size={18} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                disabled={cooldownActive}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={cooldownActive ? `Slow mode active. Wait ${cooldownSeconds}s...` : "Send a message..."}
                className={clsx(
                  "w-full bg-dark border border-white/10 rounded-xl py-2 px-3 md:px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white transition-all",
                  cooldownActive && "opacity-55 border-red-500/20 focus:ring-red-500/20"
                )}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || cooldownActive}
              className="p-2 bg-primary disabled:opacity-50 text-white rounded-lg hover:shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LiveStream;

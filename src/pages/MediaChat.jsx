import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  MoreVertical, 
  Send, 
  Search,
  Plus,
  Smile,
  Paperclip
} from 'lucide-react';
import { io } from 'socket.io-client';
import { getChatMessages } from '../services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const MediaChat = () => {
  const [selectedChat, setSelectedChat] = useState({ id: 'global', name: 'Global Group', avatar: 'bg-primary/20' });
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef();
  const chatEndRef = useRef();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await getChatMessages(selectedChat.id);
        setChatMessages(data.map(msg => ({
          id: msg._id,
          user: msg.sender.name,
          message: msg.text,
          isSelf: msg.sender._id === JSON.parse(localStorage.getItem('user'))?._id,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_room', selectedChat.id);

    socketRef.current.on('receive_message', (data) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        user: data.user.name,
        message: data.message,
        isSelf: data.user._id === currentUser?._id,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [selectedChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const user = JSON.parse(localStorage.getItem('user')) || { _id: 'guest', name: 'Guest' };
    
    socketRef.current.emit('send_message', {
      roomId: selectedChat.id,
      message,
      user
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 px-0 py-4 lg:p-0">
      {/* Chats List Sidebar */}
      <div className="w-full lg:w-80 h-[35%] lg:h-auto flex flex-col glass-card overflow-hidden shrink-0">
        <div className="p-3 md:p-4 border-b border-white/10 space-y-3 md:space-y-4 shrink-0">
          <h2 className="text-xl font-bold">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-dark border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {[1, 2, 3, 4, 5].map(i => (
            <div 
              key={i} 
              onClick={() => setSelectedChat({ id: `group-${i}`, name: `Community Group ${i}`, avatar: 'bg-slate-700' })}
              className={cn(
                "p-3 md:p-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5",
                selectedChat.id === `group-${i}` && "bg-white/5"
              )}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-700 relative flex items-center justify-center font-bold text-xs shrink-0">
                C{i}
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-dark" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <h4 className="font-bold text-xs md:text-sm text-white truncate">{selectedChat.name || `Community Group ${i}`}</h4>
                  <span className="text-[8px] md:text-[10px] text-slate-500 shrink-0">12:45 PM</span>
                </div>
                <p className="text-[10px] md:text-xs text-slate-400 truncate mt-0.5">Hey, did you see the new stream?</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 md:p-4 border-t border-white/5 shrink-0">
          <button className="btn-primary w-full py-2 flex items-center justify-center gap-2 text-xs md:text-sm rounded-lg md:rounded-xl">
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> New Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card overflow-hidden relative min-h-0">
        {/* Chat Header */}
        <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black text-[10px] md:text-xs shrink-0", selectedChat.avatar)}>
              {selectedChat.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs md:text-sm truncate">{selectedChat.name}</h3>
              <p className="text-[8px] md:text-[10px] text-green-500 font-bold uppercase tracking-widest truncate">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <button type="button" className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-400"><Video size={18} className="md:w-5 md:h-5" /></button>
            <button type="button" className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-400"><Mic size={18} className="md:w-5 md:h-5" /></button>
            <button type="button" className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg text-slate-400"><MoreVertical size={18} className="md:w-5 md:h-5" /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full opacity-30 text-xs font-black uppercase tracking-widest animate-pulse">
               Retrieving secure messages...
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-4">
               <MessageSquare size={48} />
               <p className="text-sm font-bold uppercase tracking-[0.2em]">End-to-End Encrypted<br/>Start a conversation</p>
            </div>
          ) : chatMessages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.isSelf ? "ml-auto items-end" : "items-start")}>
              <div className="flex items-center gap-2 mb-1">
                {!msg.isSelf && <span className="text-[10px] font-black text-slate-500 uppercase">{msg.user}</span>}
                <span className="text-[8px] font-bold text-slate-600">{msg.timestamp}</span>
              </div>
              <div 
                className={cn(
                  "px-4 py-2 rounded-2xl text-sm shadow-xl",
                  msg.isSelf 
                    ? "bg-primary text-white rounded-tr-none shadow-primary/20" 
                    : "bg-white/5 text-slate-200 border border-white/5 rounded-tl-none"
                )}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white/5 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-1.5 md:gap-2 bg-dark rounded-xl md:rounded-2xl p-1.5 md:p-2 border border-white/5 focus-within:border-primary/50 transition-all">
            <button type="button" className="p-1.5 md:p-2 hover:bg-white/5 rounded-lg md:rounded-xl text-slate-500"><Smile size={18} className="md:w-5 md:h-5" /></button>
            <button type="button" className="hidden sm:block p-1.5 md:p-2 hover:bg-white/5 rounded-lg md:rounded-xl text-slate-500"><Paperclip size={18} className="md:w-5 md:h-5" /></button>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-xs md:text-sm px-2 w-full min-w-0"
            />
            <button type="submit" className="p-1.5 md:p-2 bg-primary text-white rounded-lg md:rounded-xl hover:shadow-lg shadow-primary/20 transition-all shrink-0">
              <Send size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaChat;

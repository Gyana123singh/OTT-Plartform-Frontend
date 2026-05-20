import React, { useState } from 'react';
import BaseModal from '../../components/modals/BaseModal';
import { Video, Globe, Lock, Play, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { startStream } from '../../services/api';

const StreamConfigModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [isPublic, setIsPublic] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a stream title!");
      return;
    }

    try {
      setLoading(true);
      // Use a premium looking default thumbnail if none is provided
      const defaultThumbnails = {
        Gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640',
        Entertainment: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=640',
        Music: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=640',
        News: 'https://images.unsplash.com/photo-1495020689067-958852a6565d?q=80&w=640',
        Education: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=640'
      };
      
      const thumb = thumbnailUrl.trim() || defaultThumbnails[category] || defaultThumbnails.Gaming;

      const { data } = await startStream({
        title,
        category,
        thumbnail: thumb
      });

      console.log("Stream successfully started on backend:", data);
      onClose();
      // Redirect to the live stream page as host
      navigate(`/live/${data._id}`, { state: { video: data, isHost: true } });
    } catch (error) {
      console.error("Error starting stream:", error);
      alert(error.response?.data?.message || "Failed to start live stream. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Setup Your Live Stream" maxWidth="max-w-xl">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Stream Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your stream an engaging title..." 
              className="w-full bg-dark border border-white/5 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark border border-white/5 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer text-white"
              >
                <option value="Gaming">Gaming</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="News">News</option>
                <option value="Education">Education</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Privacy</label>
              <div className="flex items-center gap-2 bg-dark border border-white/5 rounded-xl md:rounded-2xl p-1.5 md:p-2">
                 <button 
                   type="button"
                   onClick={() => setIsPublic(true)}
                   className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${isPublic ? 'bg-primary text-white' : 'text-slate-500 hover:bg-white/5'}`}
                 >
                    <Globe size={14} /> Public
                 </button>
                 <button 
                   type="button"
                   onClick={() => setIsPublic(false)}
                   className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 transition-all ${!isPublic ? 'bg-primary text-white' : 'text-slate-500 hover:bg-white/5'}`}
                 >
                    <Lock size={14} /> Private
                 </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Thumbnail Image URL (Optional)</label>
            <input 
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="Paste thumbnail image URL or leave blank for dynamic premium cover..." 
              className="w-full bg-dark border border-white/5 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-3 md:py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-[2] py-3 md:py-4 btn-primary rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 md:px-10 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin md:w-[18px] md:h-[18px]" size={16} />
            ) : (
              <Play size={16} className="md:w-[18px] md:h-[18px]" fill="white" />
            )}
            GO LIVE NOW
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default StreamConfigModal;

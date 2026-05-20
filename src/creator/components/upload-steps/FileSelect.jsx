import React, { useRef } from 'react';
import { Upload, FileVideo, Music, Image as ImageIcon } from 'lucide-react';

const FileSelect = ({ onNext, updateData, data }) => {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateData({ video: file, title: file.name.split('.').slice(0, -1).join('.') });
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="video/*" 
        onChange={handleFileChange}
      />
      <div 
        onClick={() => fileInputRef.current.click()}
        className="w-full min-h-[250px] md:aspect-video bg-dark border-2 border-dashed border-white/5 rounded-3xl md:rounded-[3rem] flex flex-col items-center justify-center gap-4 md:gap-6 group hover:border-primary/50 cursor-pointer transition-all relative overflow-hidden p-6 md:p-0"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all relative z-10 shrink-0">
          <Upload size={24} className="md:w-10 md:h-10 text-slate-500 group-hover:text-primary transition-all" />
        </div>
        <div className="text-center space-y-1.5 md:space-y-2 relative z-10 w-full">
          <h4 className="text-base md:text-xl font-black text-white px-2 truncate">
            {data.video ? data.video.name : "Select video to upload"}
          </h4>
          <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest">Or drag and drop files here</p>
        </div>
        <p className="text-[8px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest relative z-10 bg-white/5 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-center">
          Your videos will be private until you publish them
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Standard Video', icon: FileVideo, desc: 'OTT & Feed' },
          { label: 'Audio Podcast', icon: Music, desc: 'Music & Talk' },
          { label: 'Quick Reel', icon: ImageIcon, desc: 'Short Content' },
        ].map((item, i) => (
          <div key={i} className="glass-card p-6 flex flex-col items-center gap-3 hover:bg-white/5 transition-all border-white/5 text-center group cursor-pointer" onClick={() => fileInputRef.current.click()}>
            <div className="p-4 bg-white/5 rounded-3xl group-hover:text-primary transition-all group-hover:bg-primary/10">
              <item.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">{item.label}</p>
              <p className="text-[10px] text-slate-500 font-bold">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileSelect;

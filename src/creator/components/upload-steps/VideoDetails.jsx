import React, { useRef } from 'react';
import { Image as ImageIcon, Info, Wand2, ShieldCheck, HelpCircle } from 'lucide-react';

const VideoDetails = ({ onNext, updateData, data }) => {
  const thumbInputRef = useRef();

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateData({ thumbnail: file });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column: Form Fields */}
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Title (Required)</label>
              <textarea 
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="Add a title that describes your video..." 
                className="w-full bg-dark border border-white/5 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[60px] md:min-h-[80px] resize-none"
              />
           </div>

           <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder="Tell viewers about your video..." 
                className="w-full bg-dark border border-white/5 rounded-xl md:rounded-2xl py-3 px-4 md:py-4 md:px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px] md:min-h-[160px] resize-none"
              />
           </div>

           <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Thumbnail</label>
              <input 
                type="file" 
                ref={thumbInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleThumbChange}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                 <div 
                   onClick={() => thumbInputRef.current.click()}
                   className="aspect-video bg-dark border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-all group overflow-hidden"
                 >
                    {data.thumbnail ? (
                      <img src={URL.createObjectURL(data.thumbnail)} alt="Thumb" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon size={20} className="text-slate-600 group-hover:text-primary" />
                        <span className="text-[8px] font-black uppercase text-slate-500">Upload</span>
                      </>
                    )}
                 </div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Select or upload a picture that shows what's in your video.</p>
           </div>
        </div>
      </div>

      {/* Right Column: Preview & Status */}
      <div className="lg:col-span-5 space-y-6">
         <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
            <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
               <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-black/40">
                  <div className="w-10 h-10 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Processing HD...</p>
               </div>
            </div>
            <div className="p-3 md:p-4 bg-white/2 flex justify-between items-center">
               <div className="space-y-1 min-w-0 flex-1 mr-4">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">File Name</p>
                  <p className="text-xs font-bold text-white truncate w-full">{data.video?.name || "No file selected"}</p>
               </div>
               <div className="text-right space-y-1 shrink-0">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Type</p>
                  <p className="text-xs font-bold text-primary truncate">{(data.video?.type || "Video").split('/')[1]?.toUpperCase()}</p>
               </div>
            </div>
         </div>

         <div className="p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-2xl md:rounded-3xl space-y-4">
            <h5 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Wand2 size={16} className="text-primary" /> Optimization Tips
            </h5>
            <ul className="space-y-3">
               {[
                 "Add 3-5 tags for better discoverability.",
                 "Mention @creators to increase reach.",
                 "Upload a custom thumbnail for 40% more clicks."
               ].map((tip, i) => (
                 <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-1.5 shrink-0" />
                    {tip}
                 </li>
               ))}
            </ul>
         </div>

         <button 
           onClick={onNext}
           disabled={!data.title || !data.thumbnail}
           className="w-full py-4 btn-primary rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            Next: Visibility →
         </button>
      </div>
    </div>
  );
};

export default VideoDetails;

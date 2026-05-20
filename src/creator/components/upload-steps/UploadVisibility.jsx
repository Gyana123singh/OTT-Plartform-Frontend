import React from 'react';
import { Globe, Lock, Users, ShieldCheck, CheckCircle2, Info, Loader2 } from 'lucide-react';

const UploadVisibility = ({ onPublish, loading, progress }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-6">
           <div className="space-y-4">
              <h4 className="text-xl font-black text-white">Save or publish</h4>
              <p className="text-sm text-slate-500">Make your video public, unlisted, or private.</p>
              
              <div className="space-y-3">
                 {[
                   { id: 'public', title: 'Public', desc: 'Everyone can watch your video', icon: Globe },
                   { id: 'private', title: 'Private', desc: 'Only you and people you choose can watch', icon: Lock },
                   { id: 'members', title: 'Members Only', desc: 'Only subscribers can watch', icon: Users },
                 ].map((opt, i) => (
                   <label key={opt.id} className={`flex items-start md:items-center gap-4 md:gap-6 p-4 md:p-6 rounded-3xl md:rounded-[2rem] border transition-all cursor-pointer
                     ${i === 0 ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20' : 'bg-dark border-white/5 hover:border-white/10'}`}>
                      <input type="radio" name="visibility" className="w-5 h-5 accent-primary mt-1 md:mt-0 shrink-0" defaultChecked={i === 0} />
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                         <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl shrink-0 ${i === 0 ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}>
                            <opt.icon size={20} className="md:w-[22px] md:h-[22px]" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-xs md:text-sm font-black text-white tracking-wide truncate">{opt.title}</p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{opt.desc}</p>
                         </div>
                      </div>
                   </label>
                 ))}
              </div>
           </div>

           <div className="p-4 md:p-6 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl space-y-4">
              <h5 className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck size={16} className="text-green-500" /> Checks Passed
              </h5>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 md:gap-3">
                    <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px] text-green-500 shrink-0" />
                    <span className="text-[10px] md:text-xs text-slate-300 font-bold truncate">Copyright</span>
                 </div>
                 <span className="text-[8px] md:text-[10px] font-black text-green-500 uppercase shrink-0">No issues found</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-xs text-slate-300 font-bold">Ad suitability</span>
                 </div>
                 <span className="text-[10px] font-black text-green-500 uppercase">Suitable for all ads</span>
              </div>
           </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
         <div className="p-5 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border border-white/5 rounded-3xl md:rounded-[2.5rem] space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 md:gap-4">
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                  <Info size={20} className="md:w-6 md:h-6" />
               </div>
               <h4 className="text-base md:text-lg font-black text-white">One last thing...</h4>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed font-medium">
               By clicking publish, you acknowledge that your content complies with the G Plus Community Guidelines and does not contain copyrighted material you don't have permission to use.
            </p>
            <button 
              onClick={onPublish}
              disabled={loading}
              className="w-full py-4 md:py-5 btn-primary rounded-2xl md:rounded-3xl font-black text-sm md:text-lg tracking-widest shadow-2xl shadow-primary/30 flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? (
                 <>
                   <div className="flex items-center gap-3">
                     {progress < 100 ? 'UPLOADING...' : 'PROCESSING...'} 
                     <Loader2 size={24} className="animate-spin" />
                   </div>
                   <div className="w-full px-10 mt-2">
                      <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-white transition-all duration-300" 
                           style={{ width: `${progress}%` }} 
                         />
                      </div>
                      <p className="text-[10px] mt-1 opacity-70">{progress}% Complete</p>
                   </div>
                 </>
               ) : (
                 <div className="flex items-center gap-3">
                    PUBLISH VIDEO <CheckCircle2 size={24} />
                 </div>
               )}
            </button>
         </div>

         <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            <button className="text-[8px] md:text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Schedule for Later</button>
            <span className="w-1 h-1 bg-slate-700 rounded-full hidden sm:block" />
            <button className="text-[8px] md:text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Add to Playlist</button>
         </div>
      </div>
    </div>
  );
};

export default UploadVisibility;

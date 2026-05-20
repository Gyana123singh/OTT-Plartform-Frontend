import React from 'react';

const BreakingTicker = ({ headlines, onArticleClick }) => {
  if (!headlines || headlines.length === 0) return null;

  return (
    <div className="relative overflow-hidden w-full bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl py-3 px-4 flex items-center gap-4 text-xs font-bold text-white shrink-0 shadow-lg shadow-black/20">
      {/* Self-contained marquee style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
        .mask-marquee {
          -webkit-mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
          mask-image: linear-gradient(to right, transparent, white 10%, white 90%, transparent);
        }
      `}</style>

      <span className="bg-red-600 px-3 py-1 rounded-xl text-[10px] font-black tracking-wider flex items-center gap-1.5 shrink-0 shadow-lg shadow-red-500/30 z-10">
        <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> BREAKING
      </span>
      
      <div className="overflow-hidden relative flex-grow w-full mask-marquee">
        <div className="animate-ticker whitespace-nowrap flex gap-12">
          {/* Double array map for infinite loop illusion */}
          {[...headlines, ...headlines].map((art, idx) => (
            <div 
              key={idx} 
              onClick={() => onArticleClick && onArticleClick(art)}
              className="hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className="text-red-500">•</span> {art.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BreakingTicker;

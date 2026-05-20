import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear }) => {
  return (
    <div className="relative group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
      <input 
        type="text"
        placeholder="Query global signals..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-semibold"
      />
      {value && (
        <button 
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

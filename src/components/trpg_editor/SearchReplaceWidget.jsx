import React, { useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X, Replace, ReplaceAll, CornerDownRight } from 'lucide-react';

export function SearchReplaceWidget({
  mode,
  searchQuery,
  setSearchQuery,
  replaceQuery,
  setReplaceQuery,
  matchesCount,
  currentMatchIndex,
  onNext,
  onPrev,
  onReplace,
  onReplaceAll,
  onClose,
  isDarkMode,
  onSearchModeToggle
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mode]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  const handleReplaceKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      onReplace();
    }
  };

  if (!mode) return null;

  return (
    <div className={`absolute top-4 right-8 z-[60] w-80 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] border transition-all ${isDarkMode ? 'bg-gray-800/80 border-white/20 backdrop-blur-xl' : 'bg-white/80 border-white/80 backdrop-blur-xl'}`}>
      <div className="flex flex-col p-2 space-y-2">
        {/* Search Row */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onSearchModeToggle}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'} ${mode === 'replace' ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-gray-900') : ''}`}
            title="置換の切り替え"
          >
            <ChevronRightIcon expanded={mode === 'replace'} />
          </button>
          
          <div className={`flex-1 flex items-center px-2 py-1 rounded-lg border focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-900/60 border-white/10' : 'bg-white border-gray-200'}`}>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="検索..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full bg-transparent border-none outline-none text-sm ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
            <span className={`text-xs ml-2 whitespace-nowrap min-w-[40px] text-right ${matchesCount > 0 ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : 'text-red-500'}`}>
              {matchesCount > 0 ? `${currentMatchIndex + 1} / ${matchesCount}` : '0 / 0'}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button onClick={onPrev} disabled={matchesCount === 0} className={`p-1.5 rounded-lg transition-colors ${matchesCount > 0 ? (isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5') : 'text-gray-400/50 cursor-not-allowed'}`} title="前へ (Shift+Enter)">
              <ChevronUp size={16} />
            </button>
            <button onClick={onNext} disabled={matchesCount === 0} className={`p-1.5 rounded-lg transition-colors ${matchesCount > 0 ? (isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5') : 'text-gray-400/50 cursor-not-allowed'}`} title="次へ (Enter)">
              <ChevronDown size={16} />
            </button>
            <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-600 hover:bg-red-50 hover:text-red-600'}`} title="閉じる (Esc)">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Replace Row */}
        {mode === 'replace' && (
          <div className="flex items-center gap-1 pl-7">
            <div className={`flex-1 flex items-center px-2 py-1 rounded-lg border focus-within:ring-2 focus-within:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-900/60 border-white/10' : 'bg-white border-gray-200'}`}>
              <input 
                type="text" 
                placeholder="置換..." 
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                onKeyDown={handleReplaceKeyDown}
                className={`w-full bg-transparent border-none outline-none text-sm ${isDarkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
              />
            </div>
            
            <div className="flex items-center gap-0.5">
              <button 
                onClick={onReplace} 
                disabled={matchesCount === 0}
                className={`p-1.5 rounded-lg transition-colors ${matchesCount > 0 ? (isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5') : 'text-gray-400/50 cursor-not-allowed'}`} 
                title="置換 (Enter)"
              >
                <Replace size={14} />
              </button>
              <button 
                onClick={onReplaceAll} 
                disabled={matchesCount === 0}
                className={`p-1.5 rounded-lg transition-colors ${matchesCount > 0 ? (isDarkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-black/5') : 'text-gray-400/50 cursor-not-allowed'}`} 
                title="すべて置換"
              >
                <ReplaceAll size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronRightIcon({ expanded }) {
  return (
    <svg 
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"
      className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}

import React, { useState, useEffect, useRef } from 'react';

export function CharacterPicker({ isOpen, onClose, characters, onSelect, isDarkMode }) {
  const [filter, setFilter] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const filteredChars = characters.filter(c => c.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setFilter('');
      setIndex(0);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex(prev => (prev + 1) % filteredChars.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex(prev => (prev - 1 + filteredChars.length) % filteredChars.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filteredChars.length > 0) {
        onSelect(filteredChars[index]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className={`absolute top-2 left-4 z-20 w-64 rounded-2xl shadow-2xl border p-2 backdrop-blur-xl ${isDarkMode ? 'bg-gray-900/60 border-white/10' : 'bg-white/60 border-white/50'}`}>
      <input 
        ref={inputRef}
        type="text" 
        className={`w-full px-2 py-1.5 mb-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-white/10 text-white' : 'bg-white/40 border-white/40 text-gray-900'}`}
        placeholder="キャラクターを検索..."
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setIndex(0); }}
        onKeyDown={handleKeyDown}
      />
      <div className="max-h-48 overflow-y-auto">
        {filteredChars.length > 0 ? filteredChars.map((char, idx) => (
          <div 
            key={char} 
            className={`px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors backdrop-blur-sm ${idx === index ? isDarkMode ? 'bg-indigo-500/80 text-white shadow-md border border-white/10' : 'bg-indigo-500 text-white shadow-md border border-white/30' : isDarkMode ? 'text-gray-200 hover:bg-gray-800/50' : 'text-gray-700 hover:bg-white/50'}`}
            onClick={() => { onSelect(char); onClose(); }}
          >
            {char}
          </div>
        )) : <div className="text-xs text-gray-400 p-2 text-center">該当なし</div>}
      </div>
    </div>
  );
}

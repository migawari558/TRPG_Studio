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
    <div className="absolute top-2 left-4 z-20 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2">
      <input 
        ref={inputRef}
        type="text" 
        className="w-full px-2 py-1 mb-2 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
        placeholder="キャラクターを検索..."
        value={filter}
        onChange={(e) => { setFilter(e.target.value); setIndex(0); }}
        onKeyDown={handleKeyDown}
      />
      <div className="max-h-48 overflow-y-auto">
        {filteredChars.length > 0 ? filteredChars.map((char, idx) => (
          <div 
            key={char} 
            className={`px-2 py-1.5 text-xs rounded cursor-pointer ${idx === index ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => { onSelect(char); onClose(); }}
          >
            {char}
          </div>
        )) : <div className="text-xs text-gray-400 p-2 text-center">該当なし</div>}
      </div>
    </div>
  );
}

import React, { useState, memo } from 'react';
import { Users, X, Plus, Trash2, User } from 'lucide-react';

export const NpcSidebar = memo(function NpcSidebar({ isOpen, onClose, characters, onAddCharacter, onInsertCharacter, onDeleteCharacter }) {
  const [newCharName, setNewCharName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCharName.trim()) {
      onAddCharacter(newCharName.trim());
      setNewCharName('');
    }
  };

  return (
    <div className={`absolute right-0 top-0 h-full z-20 shadow-lg flex flex-col transition-all duration-250 overflow-hidden bg-white dark:bg-gray-900 border-l border-gray-200/80 dark:border-gray-800 ${isOpen ? 'w-56' : 'w-0'}`}>
      <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <h2 className="font-bold flex items-center gap-2 text-xs text-gray-700 dark:text-gray-200"><Users size={16} /> キャラクター</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:scale-95"><X size={16} /></button>
      </div>

      <div className="p-3">
        <form onSubmit={handleAdd} className="relative">
          <input
            type="text"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            placeholder="名前を追加..."
            className="w-full pl-3 pr-10 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95" disabled={!newCharName.trim()}>
            <Plus size={14} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 py-1 uppercase tracking-wide">リスト</div>
        {characters.map((char, index) => (
          <div key={`${char}-${index}`} className="group flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-98 cursor-pointer" onClick={() => onInsertCharacter(char)}>
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <User size={14} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{char}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char); }}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 active:scale-95"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

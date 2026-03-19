import React, { useState, memo } from 'react';
import { Users, X, Plus, Trash2, User } from 'lucide-react';

export const NpcSidebar = memo(function NpcSidebar({ isOpen, onClose, characters, onAddCharacter, onRenameCharacter, onDeleteCharacter, isDarkMode }) {
  const [newCharName, setNewCharName] = useState('');
  const [editingChar, setEditingChar] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCharName.trim()) {
      onAddCharacter(newCharName.trim());
      setNewCharName('');
    }
  };

  return (
    <div className={`absolute right-0 top-0 h-full z-20 shadow-xl flex flex-col transition-all duration-250 overflow-hidden border-l ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} ${isOpen ? 'w-56' : 'w-0'}`}>
      <div className={`flex items-center justify-between p-3 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
        <h3 className="font-bold flex items-center gap-2 text-sm">
          <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} /> 登場人物
        </h3>
        <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors active:scale-95 backdrop-blur-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-gray-400 hover:text-gray-200' : 'hover:bg-white/50 text-gray-500 hover:text-gray-700'}`}><X size={16} /></button>
      </div>

      <div className="p-3">
        <form onSubmit={handleAdd} className="relative">
          <input
            type="text"
            value={newCharName}
            onChange={(e) => setNewCharName(e.target.value)}
            placeholder="名前を追加..."
            className={`w-full pl-3 pr-10 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner backdrop-blur-sm border ${isDarkMode ? 'bg-gray-900/40 border-white/10 focus:bg-gray-900/60 text-white' : 'bg-white/30 border-white/40 focus:bg-white/50 text-gray-900'}`}
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95" disabled={!newCharName.trim()}>
            <Plus size={14} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 py-1 uppercase tracking-wide">リスト</div>
        {characters.map((char, index) => (
          <div 
            key={`${char}-${index}`} 
            className={`group flex items-center justify-between px-2 py-2 rounded-xl transition-all cursor-pointer border ${editingChar === char ? (isDarkMode ? 'bg-indigo-900/30 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200') : (isDarkMode ? 'hover:bg-gray-800/50 border-transparent hover:border-white/5' : 'hover:bg-white/60 border-transparent hover:border-white/40')}`}
            onClick={() => {
              if (editingChar !== char) {
                setEditingChar(char);
                setEditName(char);
              }
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isDarkMode ? 'bg-indigo-900/40 text-indigo-300 border-indigo-400/20' : 'bg-indigo-50/60 text-indigo-600 border-white/60'}`}>
                <User size={14} />
              </div>
              
              {editingChar === char ? (
                <input
                  type="text"
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => {
                    if (editName.trim() && editName !== char) {
                      onRenameCharacter(char, editName.trim());
                    }
                    setEditingChar(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    } else if (e.key === 'Escape') {
                      setEditingChar(null);
                    }
                  }}
                  className={`flex-1 min-w-0 bg-transparent text-sm font-bold focus:outline-none ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                />
              ) : (
                <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{char}</span>
              )}
            </div>
            
            {editingChar !== char && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char); }}
                className={`p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95 ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-400 hover:text-red-500 hover:bg-white/50'}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

import React, { useState, memo } from 'react';
import { Users, X, Plus, ChevronRight, Trash2 } from 'lucide-react';

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
    <div className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 ${isOpen ? 'w-56' : 'w-0'}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between">
        <h2 className="font-bold flex items-center gap-2 text-xs"><Users size={16} /> NPCリスト</h2>
        <button onClick={onClose}><X size={16} /></button>
      </div>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            type="text" 
            value={newCharName} 
            onChange={(e) => setNewCharName(e.target.value)} 
            placeholder="名前" 
            className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600" 
          />
          <button type="submit" className="bg-indigo-600 text-white p-1 rounded"><Plus size={14} /></button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {characters.map((char, index) => (
          <div key={`${char}-${index}`} className="group flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <button onClick={() => onInsertCharacter(char)} className="flex items-center gap-2 text-xs font-medium flex-1 text-left truncate">
              <ChevronRight size={12} />{char}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteCharacter(char); }} className="text-gray-400 hover:text-red-500 p-0.5 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});
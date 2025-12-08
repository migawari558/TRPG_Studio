import React, { useState } from 'react';
import { Settings, X, RotateCcw } from 'lucide-react';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';

export function SettingsModal({ isOpen, onClose, shortcuts, setShortcuts, isDarkMode }) {
  const [editingShortcutId, setEditingShortcutId] = useState(null);

  if (!isOpen) return null;

  const handleShortcutRecord = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const newShortcut = { 
        ...shortcuts[id], 
        key: e.key.length === 1 ? e.key.toLowerCase() : e.key, 
        ctrl: e.ctrlKey || e.metaKey, 
        shift: e.shiftKey, 
        alt: e.altKey 
    };
    setShortcuts({ ...shortcuts, [id]: newShortcut });
    setEditingShortcutId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} scale-100 transform transition-all`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold flex items-center gap-3 text-lg">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300">
              <Settings size={20}/>
            </div>
            設定
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"><X size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">ショートカット</h4>
          <div className="space-y-3">
            {Object.values(shortcuts).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                <span className="font-medium text-sm">{s.label}</span>
                <button 
                  onClick={() => setEditingShortcutId(s.id)} 
                  className={`px-4 py-2 rounded-xl text-xs font-mono min-w-[120px] text-center transition-all border shadow-sm active:scale-98 ${
                    editingShortcutId === s.id 
                    ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`} 
                  onKeyDown={(e) => handleShortcutRecord(e, s.id)}
                >
                  {editingShortcutId === s.id ? 'キーを押す...' : [s.ctrl && 'Ctrl', s.shift && 'Shift', s.alt && 'Alt', s.key.toUpperCase()].filter(Boolean).join(' + ')}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button onClick={() => setShortcuts(DEFAULT_SHORTCUTS)} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors px-3 py-2 rounded-xl hover:bg-gray-200/50 active:scale-98">
            <RotateCcw size={16} /> 初期設定に戻す
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-98 transition-all">
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
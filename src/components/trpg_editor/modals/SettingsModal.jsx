import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="flex justify-between p-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit">
          <h3 className="font-bold flex gap-2 text-sm"><Settings size={18}/>設定</h3>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <div className="p-5">
          <h4 className="font-bold mb-3 text-indigo-500 text-xs">ショートカットキー設定</h4>
          <div className="space-y-2">
            {Object.values(shortcuts).map((s) => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <span className="font-medium text-xs">{s.label}</span>
                <button 
                  onClick={() => setEditingShortcutId(s.id)} 
                  className={`px-3 py-1 rounded text-xs min-w-[120px] text-center transition-all ${editingShortcutId === s.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-600 border'}`} 
                  onKeyDown={(e) => handleShortcutRecord(e, s.id)}
                >
                  {editingShortcutId === s.id ? 'キーを入力...' : [s.ctrl && 'Ctrl', s.shift && 'Shift', s.alt && 'Alt', s.key.toUpperCase()].filter(Boolean).join(' + ')}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
            <button onClick={() => setShortcuts(DEFAULT_SHORTCUTS)} className="text-xs text-gray-500 underline">初期設定に戻す</button>
            <button onClick={onClose} className="px-4 py-1.5 bg-indigo-600 text-white rounded text-xs">閉じる</button>
          </div>
        </div>
      </div>
    </div>
  );
}

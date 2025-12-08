import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export function SceneModal({ isOpen, onClose, onInsert, characters, onAddCharacter, isDarkMode }) {
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState(1);
  const [player, setPlayer] = useState('');
  const [selectedNpcs, setSelectedNpcs] = useState([]);
  const [newNpcName, setNewNpcName] = useState('');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: '', type: 'info', action: () => {} });

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNumber(1);
      setPlayer('');
      setSelectedNpcs([]);
      setNewNpcName('');
      setTimeout(() => {
        if (titleInputRef.current) titleInputRef.current.focus();
      }, 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleNpc = (npc) => {
    if (selectedNpcs.includes(npc)) {
      setSelectedNpcs(selectedNpcs.filter(n => n !== npc));
    } else {
      setSelectedNpcs([...selectedNpcs, npc]);
    }
  };

  const handleAddNpc = (e) => {
    e.preventDefault();
    const nameTrimmed = newNpcName.trim();
    if (!nameTrimmed) return;
    onAddCharacter(nameTrimmed);
    if (!selectedNpcs.includes(nameTrimmed)) setSelectedNpcs([...selectedNpcs, nameTrimmed]);
    setNewNpcName('');
  };

  const executeInsert = () => {
    const npcString = selectedNpcs.length > 0 ? selectedNpcs.join('、') : 'なし';
    const pcString = player ? `（PC ${player}）` : '';
    const sceneText = `
## ● シーン${number}：${title}${pcString}
### ◆ 解説

### ▼ 描写&セリフ
**[登場NPC：${npcString}]**

### ▼ 結末
`;
    onInsert(sceneText);
    onClose();
  };

  const checkInsert = () => {
    // Required Fields
    if (!title.trim() || !number) {
        setConfirmConfig({
            message: 'シーン名とシーン番号は必須です。',
            type: 'alert',
            action: () => setShowConfirm(false)
        });
        setShowConfirm(true);
        return;
    }

    // Warning Fields
    if (!player.trim() || selectedNpcs.length === 0) {
        const missing = [];
        if (!player.trim()) missing.push('シーンプレイヤー');
        if (selectedNpcs.length === 0) missing.push('登場NPC');
        
        setConfirmConfig({
            message: `${missing.join('・')}が空白です。本当によろしいですか？`,
            type: 'confirm', // mapping 'confirm' to 'info' or similar in ConfirmationModal, but we used specific types
            action: executeInsert
        });
        setShowConfirm(true);
        return;
    }

    executeInsert();
  };

  const handleKeyDown = (e) => {
      if (e.target.placeholder === "新規NPCを追加") return;
      if (e.key === 'Enter') {
          e.preventDefault();
          checkInsert();
      }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-sm rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="flex justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-sm">シーン追加</h3>
            <button onClick={onClose}><X size={18} /></button>
          </div>
          <div className="p-4 space-y-3" onKeyDown={handleKeyDown}>
            <div>
              <label className="text-xs block mb-1">シーンタイトル <span className="text-red-500">*</span></label>
              <input ref={titleInputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="text-xs block mb-1">シーン番号 <span className="text-red-500">*</span></label>
              <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div>
              <label className="text-xs block mb-1">シーンプレイヤー (任意)</label>
              <input type="text" value={player} onChange={(e) => setPlayer(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="1, 2, 全員" />
            </div>
            <div>
              <label className="text-xs block mb-1">登場NPC</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newNpcName} onChange={(e) => setNewNpcName(e.target.value)} placeholder="新規NPCを追加" className="flex-1 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600" />
                <button onClick={handleAddNpc} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"><Plus size={14}/></button>
              </div>
              <div className="max-h-32 overflow-y-auto border rounded p-2 dark:border-gray-600">
                {characters.map(char => (
                  <label key={char} className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <input type="checkbox" checked={selectedNpcs.includes(char)} onChange={() => toggleNpc(char)} className="w-3 h-3" />
                    <span className="text-xs">{char}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700">キャンセル</button>
            <button onClick={checkInsert} className="px-3 py-1.5 rounded text-xs bg-indigo-600 text-white">追加</button>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmConfig.action}
        title={confirmConfig.type === 'alert' ? '入力エラー' : '確認'}
        message={confirmConfig.message}
        type={confirmConfig.type} // 'alert' or 'confirm' (mapped to 'info' in default logic but let's pass it)
        isDarkMode={isDarkMode}
      />
    </>
  );
}

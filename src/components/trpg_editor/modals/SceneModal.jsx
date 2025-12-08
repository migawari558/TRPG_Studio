import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Clapperboard } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal'; // Assuming ConfirmationModal is already modernized

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
    if (!title.trim() || !number) {
        setConfirmConfig({
            message: 'シーン名とシーン番号は必須です。',
            type: 'alert',
            action: () => setShowConfirm(false)
        });
        setShowConfirm(true);
        return;
    }

    if (!player.trim() || selectedNpcs.length === 0) {
        const missing = [];
        if (!player.trim()) missing.push('シーンプレイヤー');
        if (selectedNpcs.length === 0) missing.push('登場NPC');
        
        setConfirmConfig({
            message: `${missing.join('・')}が空白です。本当によろしいですか？`,
            type: 'confirm',
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
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className={`w-full max-w-sm rounded-2xl shadow-2xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} scale-100 transform transition-all`}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Clapperboard size={20} />
              </div>
              シーン追加
            </h3>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"><X size={20} /></button>
          </div>
          
          <div className="p-6 space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">シーンタイトル <span className="text-red-500">*</span></label>
              <input ref={titleInputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">シーン番号 <span className="text-red-500">*</span></label>
                <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">プレイヤー</label>
                <input type="text" value={player} onChange={(e) => setPlayer(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="例: 全員" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">登場NPC</label>
              <div className="flex gap-3 mb-3">
                <input type="text" value={newNpcName} onChange={(e) => setNewNpcName(e.target.value)} placeholder="新規NPCを追加" className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" />
                <button onClick={handleAddNpc} className="px-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95 shadow-sm"><Plus size={18}/></button>
              </div>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                {characters.map(char => (
                  <label key={char} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors active:scale-98">
                    <input type="checkbox" checked={selectedNpcs.includes(char)} onChange={() => toggleNpc(char)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm">{char}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 active:scale-95">キャンセル</button>
            <button onClick={checkInsert} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 active:scale-98 transition-all">追加する</button>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmConfig.action}
        title={confirmConfig.type === 'alert' ? '入力エラー' : '確認'}
        message={confirmConfig.message}
        type={confirmConfig.type}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Clapperboard } from 'lucide-react';
import { ConfirmationModal } from '../../modals/ConfirmationModal'; // Assuming ConfirmationModal is already modernized

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
        <div className={`w-full max-w-sm rounded-3xl shadow-2xl border backdrop-blur-2xl ${isDarkMode ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/60 border-white/60 text-gray-900'} scale-100 transform transition-all`}>
          <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-white/40'}`}>
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-inner border backdrop-blur-md ${isDarkMode ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50/60 border-white/60 text-indigo-600'}`}>
                <Clapperboard size={20} />
              </div>
              シーン追加
            </h3>
            <button onClick={onClose} className={`p-2 rounded-xl transition-colors active:scale-95 backdrop-blur-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-gray-400 hover:text-white' : 'hover:bg-white/50 text-gray-500 hover:text-gray-900'}`}><X size={20} /></button>
          </div>
          
          <div className="p-6 space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">シーンタイトル <span className="text-red-500">*</span></label>
              <input ref={titleInputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'bg-white/30 border-white/40 focus:bg-white/50'}`} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">シーン番号 <span className="text-red-500">*</span></label>
                <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'bg-white/30 border-white/40 focus:bg-white/50'}`} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">プレイヤー</label>
                <input type="text" value={player} onChange={(e) => setPlayer(e.target.value)} className={`w-full px-4 py-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'bg-white/30 border-white/40 focus:bg-white/50'}`} placeholder="例: 全員" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">登場NPC</label>
              <div className="flex gap-3 mb-3">
                <input type="text" value={newNpcName} onChange={(e) => setNewNpcName(e.target.value)} placeholder="新規NPCを追加" className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'bg-white/30 border-white/40 focus:bg-white/50'}`} />
                <button onClick={handleAddNpc} className={`px-4 rounded-xl transition-all active:scale-95 shadow-sm border backdrop-blur-md ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/60 border-white/10' : 'bg-white/50 hover:bg-white/80 border-white/40'}`}><Plus size={18}/></button>
              </div>
              <div className={`max-h-32 overflow-y-auto border rounded-xl p-3 shadow-inner backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/20 border-white/5' : 'bg-white/20 border-white/30'}`}>
                {characters.map(char => (
                  <label key={char} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors active:scale-98 backdrop-blur-sm ${isDarkMode ? 'hover:bg-gray-800/60' : 'hover:bg-white/60'}`}>
                    <input type="checkbox" checked={selectedNpcs.includes(char)} onChange={() => toggleNpc(char)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600" />
                    <span className="text-sm">{char}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-5 border-t flex justify-end gap-3 rounded-b-3xl backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-gray-900/40' : 'border-white/40 bg-white/40'}`}>
            <button onClick={onClose} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm shadow-sm active:scale-95 ${isDarkMode ? 'hover:bg-gray-800/60 bg-gray-900/40 text-gray-300 border-white/10' : 'hover:bg-white/80 bg-white/40 text-gray-700 border-white/40'}`}>キャンセル</button>
            <button onClick={checkInsert} className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-98 transition-all border ${isDarkMode ? 'bg-indigo-600/80 hover:bg-indigo-500/90 border-white/10' : 'bg-indigo-600/90 hover:bg-indigo-500 border-white/30'}`}>追加する</button>
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
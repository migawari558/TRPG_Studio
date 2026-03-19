import React, { useState } from 'react';
import { Settings, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

export function SettingsModal({ 
  isOpen, onClose, shortcuts, setShortcuts, isDarkMode, 
  dataPath, setDataPath, editorFontFamily, setEditorFontFamily, 
  editorFontSize, setEditorFontSize 
}) {
  const [editingShortcutId, setEditingShortcutId] = useState(null);
  const [tempDataPath, setTempDataPath] = useState(dataPath || '');
  const [errorPopupMessage, setErrorPopupMessage] = useState('');

  const [tempFontFamily, setTempFontFamily] = useState(editorFontFamily || 'monospace');
  const [tempFontSize, setTempFontSize] = useState(editorFontSize || 14);

  React.useEffect(() => {
    if (isOpen) {
      setTempDataPath(dataPath || '');
      setTempFontFamily(editorFontFamily || 'monospace');
      setTempFontSize(editorFontSize || 14);
      setErrorPopupMessage('');
    }
  }, [isOpen, dataPath, editorFontFamily, editorFontSize]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    if (tempDataPath && tempDataPath !== dataPath) {
      if (!fs || !path) {
        setErrorPopupMessage('デスクトップアプリ版でのみフォルダの指定が可能です。ブラウザ環境では利用できません。');
        return;
      }
      try {
        if (!path.isAbsolute(tempDataPath)) {
          setErrorPopupMessage('「絶対パス」（フルパス）で指定してください。');
          return;
        }
        if (!fs.existsSync(tempDataPath)) {
          setErrorPopupMessage('指定されたフォルダは存在しません。事前に作成してください。');
          return;
        }
        if (!fs.statSync(tempDataPath).isDirectory()) {
          setErrorPopupMessage('指定されたパスはフォルダではありません。');
          return;
        }
      } catch (e) {
        setErrorPopupMessage('フォルダの確認に失敗しました。パスが正しいか確認してください。');
        return;
      }
      
      if (setDataPath) setDataPath(tempDataPath);
    } else if (tempDataPath === '' && dataPath !== '') {
      if (setDataPath) setDataPath('');
    }
    
    if (setEditorFontFamily) setEditorFontFamily(tempFontFamily);
    if (setEditorFontSize) setEditorFontSize(Number(tempFontSize));

    onClose();
  };

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
      <div className={`w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[85vh] border backdrop-blur-2xl ${isDarkMode ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/60 border-white/60 text-gray-900'} scale-100 transform transition-all`}>
        <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-white/40'}`}>
          <h3 className="font-bold flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-xl shadow-inner border backdrop-blur-md ${isDarkMode ? 'bg-gray-800/40 border-white/10 text-gray-300' : 'bg-white/40 border-white/40 text-gray-600'}`}>
              <Settings size={20}/>
            </div>
            設定
          </h3>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors active:scale-95 backdrop-blur-sm ${isDarkMode ? 'hover:bg-gray-800/50' : 'hover:bg-white/50'}`}><X size={20}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">エディタ設定</h4>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    フォントファミリー
                  </label>
                  <select 
                    value={tempFontFamily}
                    onChange={(e) => setTempFontFamily(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60 text-white' : 'bg-white/30 border-white/40 focus:bg-white/50 text-gray-900'}`}
                  >
                    <option value="monospace" className="dark:bg-gray-800">等幅フォント (Monospace)</option>
                    <option value="'Noto Sans JP', sans-serif" className="dark:bg-gray-800">ゴシック体 (Noto Sans JP)</option>
                    <option value="'Noto Serif JP', serif" className="dark:bg-gray-800">明朝体 (Noto Serif JP)</option>
                    <option value="sans-serif" className="dark:bg-gray-800">システム標準 (Sans-serif)</option>
                    <option value="serif" className="dark:bg-gray-800">システム標準 (Serif)</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    サイズ (px)
                  </label>
                  <input 
                    type="number" 
                    min="10" max="40"
                    value={tempFontSize} 
                    onChange={(e) => setTempFontSize(e.target.value)} 
                    className={`w-full p-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 text-center ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60 text-white' : 'bg-white/30 border-white/40 focus:bg-white/50 text-gray-900'}`}
                  />
                </div>
              </div>
            </div>

            <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">データ保存先フォルダ</h4>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                シナリオファイルの保存先 (絶対パス)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tempDataPath} 
                  onChange={(e) => setTempDataPath(e.target.value)} 
                  placeholder="例: C:\TRPG_Data または /home/user/TRPG_Data"
                  className={`flex-1 p-3 rounded-xl border text-sm outline-none shadow-inner backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/50 ${isDarkMode ? 'bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'bg-white/30 border-white/40 focus:bg-white/50'}`}
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                指定したフォルダ内に、シナリオ毎のJSONファイルが保存されます。「完了」を押すと現在のデータが自動で移行されます。未指定時はローカルストレージに保存されます。
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">ショートカット</h4>
            <div className="space-y-3">
            {Object.values(shortcuts).map((s) => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors backdrop-blur-sm shadow-sm ${isDarkMode ? 'bg-gray-800/30 border-white/5 hover:border-white/20' : 'bg-white/40 border-white/40 hover:border-white/80'}`}>
                <span className="font-bold text-sm">{s.label}</span>
                <button 
                  onClick={() => setEditingShortcutId(s.id)} 
                  className={`px-4 py-2 rounded-xl text-xs font-mono min-w-[120px] text-center transition-all border shadow-md active:scale-98 backdrop-blur-md ${
                    editingShortcutId === s.id 
                    ? isDarkMode ? 'bg-indigo-500/80 text-white border-white/10 ring-2 ring-indigo-500/50' : 'bg-indigo-600/90 text-white border-white/40 ring-2 ring-indigo-500/50'
                    : isDarkMode ? 'bg-gray-800/50 border-white/10 hover:bg-gray-700/50' : 'bg-white/60 border-white/60 hover:bg-white/80'
                  }`} 
                  onKeyDown={(e) => handleShortcutRecord(e, s.id)}
                >
                  {editingShortcutId === s.id ? 'キーを押す...' : [s.ctrl && 'Ctrl', s.shift && 'Shift', s.alt && 'Alt', s.key.toUpperCase()].filter(Boolean).join(' + ')}
                </button>
              </div>
            ))}
          </div>
          </div>
        </div>

        <div className={`p-5 border-t flex justify-between rounded-b-3xl backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-gray-900/40' : 'border-white/40 bg-white/40'}`}>
          <button onClick={() => setShortcuts(DEFAULT_SHORTCUTS)} className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-2 rounded-xl active:scale-98 backdrop-blur-sm border border-transparent shadow-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 hover:border-white/10' : 'text-gray-600 hover:text-gray-800 hover:bg-white/60 hover:border-white/40'}`}>
            <RotateCcw size={16} /> 初期設定に戻す
          </button>
          <button onClick={handleSaveSettings} className={`px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-98 transition-all border ${isDarkMode ? 'bg-indigo-600/80 hover:bg-indigo-500/90 border-white/10' : 'bg-indigo-600/90 hover:bg-indigo-500 border-white/30'}`}>
            完了
          </button>
        </div>
      </div>

      {/* Error Popup Modal */}
      {errorPopupMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-xs rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-5 text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold mb-2">エラー</h3>
              <p className={`text-xs mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} break-words whitespace-pre-wrap`}>
                {errorPopupMessage}
              </p>
              <div className="flex justify-center">
                <button 
                  onClick={() => setErrorPopupMessage('')}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
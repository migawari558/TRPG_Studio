import React from 'react';
import { FileText, Plus } from 'lucide-react';

export function EditorEmptyState({ isDarkMode, onAddPage }) {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border shadow-lg ${isDarkMode ? 'bg-gray-800/40 border-white/10' : 'bg-white/40 border-white/40'}`}>
        <FileText size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
      </div>
      <h3 className="text-lg font-bold mb-2">ページがありません</h3>
      <p className="text-sm max-w-sm leading-relaxed mb-6 opacity-70">
        シナリオには現在ページが存在しません。<br />
        左のサイドバー、または下のボタンから最初のページを追加して執筆を始めてください。
      </p>
      <button
        onClick={onAddPage}
        className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl backdrop-blur-md transition-all shadow-lg active:scale-95 font-bold ${isDarkMode ? 'bg-indigo-600/80 hover:bg-indigo-500/90 border border-white/10' : 'bg-indigo-600/90 hover:bg-indigo-500 border border-white/20'}`}
      >
        <Plus size={16} />
        <span>最初のページを作成</span>
      </button>
    </div>
  );
}

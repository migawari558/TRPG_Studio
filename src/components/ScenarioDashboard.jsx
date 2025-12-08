import React, { useState, useRef } from 'react';
import { 
  FileText, Moon, Sun, LayoutGrid, List, Upload, Plus, Copy, Trash2, ChevronRight, AlertTriangle 
} from 'lucide-react';

export function ScenarioDashboard({ scenarios, onCreate, onImport, onSelect, onDelete, onDuplicate, isDarkMode, toggleTheme }) {
  const [viewType, setViewType] = useState('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const confirmDelete = (id) => {
    setScenarioToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (scenarioToDelete) {
      onDelete(scenarioToDelete);
      setShowDeleteModal(false);
      setScenarioToDelete(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImport(file);
      e.target.value = null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-[#f0f4f9] text-gray-800'} transition-colors duration-300 text-sm`}>
      <header className="h-12 flex items-center justify-between px-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-md">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">TRPG Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-0.5">
            <button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`} title="グリッド表示">
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`} title="リスト表示">
              <List size={14} />
            </button>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".md,.txt" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            title="インポート"
          >
            <Upload size={16} />
          </button>

          <button onClick={toggleTheme} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" title={isDarkMode ? "ライトモードへ" : "ダークモードへ"}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">シナリオ一覧</h2>
            <button 
              onClick={onCreate}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow hover:bg-indigo-700 transition-all hover:shadow-md text-xs font-bold"
            >
              <Plus size={16} />
              <span>新規作成</span>
            </button>
          </div>

          {scenarios.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">まだシナリオがありません</p>
              <div className="flex justify-center gap-4 mt-3">
                <button onClick={onCreate} className="text-indigo-600 hover:underline text-xs">新しいシナリオを作成する</button>
                <span className="text-gray-300 text-xs">|</span>
                <button onClick={() => fileInputRef.current.click()} className="text-indigo-600 hover:underline text-xs">ファイルをインポート</button>
              </div>
            </div>
          ) : (
            <div className={viewType === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
              {scenarios.map(scenario => (
                <div 
                  key={scenario.id}
                  className={`
                    group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer
                    ${viewType === 'grid' ? 'p-4 flex flex-col h-40' : 'p-3 flex items-center justify-between'} 
                  `}
                  onClick={() => onSelect(scenario.id)}
                >
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-bold text-base mb-0.5 truncate text-gray-900 dark:text-gray-100">{scenario.title}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                      最終更新: {new Date(scenario.lastModified).toLocaleString()}
                    </p>
                    {viewType === 'grid' && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 opacity-80 leading-snug">
                        {scenario.pages[0]?.content.substring(0, 80) || '（本文なし）'}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 ${viewType === 'grid' ? 'mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 shrink-0' : ''}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDuplicate(scenario.id); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                      title="複製"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); confirmDelete(scenario.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                    {viewType === 'list' && <ChevronRight size={16} className="text-gray-300 ml-1" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-xs rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-5 text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-medium mb-1">シナリオを削除しますか？</h3>
              <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                この操作は取り消せません。
              </p>
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className={`px-3 py-1.5 rounded text-xs font-medium ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  キャンセル
                </button>
                <button 
                  onClick={executeDelete}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { Suspense, lazy, useState, useRef } from 'react';
import { 
  FileText, Moon, Sun, LayoutGrid, List, Upload, Plus, Copy, Trash2, ChevronRight, AlertTriangle, Settings 
} from 'lucide-react';
import { useShortcuts } from './trpg_editor/hooks/useShortcuts';
import { PromptModal } from './modals/PromptModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

const SettingsModal = lazy(() => import('./trpg_editor/modals/SettingsModal').then((module) => ({ default: module.SettingsModal })));

const getReorderTargetIndex = (draggedIndex, index, dropPosition) => {
  if (dropPosition === 'before') {
    return draggedIndex < index ? index - 1 : index;
  }

  return draggedIndex < index ? index : index + 1;
};

export function ScenarioDashboard({
  scenarios,
  onCreate,
  onImport,
  onSelect,
  onDelete,
  onDuplicate,
  onReorder,
  isDarkMode,
  toggleTheme,
  appTheme,
  setAppTheme,
  colorMode,
  setColorMode,
  dataPath,
  setDataPath,
}) {
  const isSimpleTheme = appTheme === 'simple';
  const [viewType, setViewType] = useState('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scenarioToDelete, setScenarioToDelete] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [scenarioToDuplicate, setScenarioToDuplicate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const fileInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState('before');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { shortcuts, setShortcuts } = useShortcuts({ dataPath });

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition('before');
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const finalIndex = getReorderTargetIndex(draggedIndex, index, dropPosition);
    
    if (finalIndex !== draggedIndex) {
      onReorder(draggedIndex, finalIndex);
    }
    handleDragEnd();
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (viewType === 'grid') {
      const isRightHalf = e.clientX > rect.left + rect.width / 2;
      setDropPosition(isRightHalf ? 'after' : 'before');
    } else {
      const isBottomHalf = e.clientY > rect.top + rect.height / 2;
      setDropPosition(isBottomHalf ? 'after' : 'before');
    }
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setScenarioToDelete(null);
  };

  const confirmDelete = (id) => {
    setScenarioToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (scenarioToDelete) onDelete(scenarioToDelete);
    closeDeleteModal();
  };

  const closeDuplicateModal = () => {
    setShowDuplicateModal(false);
    setScenarioToDuplicate(null);
  };

  const confirmDuplicate = (id) => {
    setScenarioToDuplicate(id);
    setShowDuplicateModal(true);
  };

  const executeDuplicate = () => {
    if (scenarioToDuplicate) onDuplicate(scenarioToDuplicate);
    closeDuplicateModal();
  };

  const confirmCreate = () => {
    setNewScenarioName('');
    setShowCreateModal(true);
  };

  const executeCreate = () => {
    if (newScenarioName.trim()) {
      onCreate(newScenarioName.trim());
      setShowCreateModal(false);
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
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark text-gray-100' : 'text-gray-800'} transition-colors duration-300 text-sm`}>
      <header className={`theme-simple-divider h-12 flex items-center justify-between px-4 z-10 border-b ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-300') : (isDarkMode ? 'bg-gray-900/40 border-white/5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]' : 'bg-white/40 border-white/40 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)]')}`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-md">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">TRPG Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex p-0.5 border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700' : 'bg-stone-100 border-stone-300') : (isDarkMode ? 'rounded-md backdrop-blur-md shadow-inner bg-gray-800/40 border-white/10' : 'rounded-md backdrop-blur-md shadow-inner bg-white/30 border-white/40')}`}>
            <button onClick={() => setViewType('grid')} className={`p-1.5 rounded transition-all duration-300 ${viewType === 'grid' ? isDarkMode ? 'bg-gray-700/60 text-white shadow-sm border border-white/10' : 'bg-white/60 text-gray-900 shadow-sm border border-white/40' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} title="グリッド表示">
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setViewType('list')} className={`p-1.5 rounded transition-all duration-300 ${viewType === 'list' ? isDarkMode ? 'bg-gray-700/60 text-white shadow-sm border border-white/10' : 'bg-white/60 text-gray-900 shadow-sm border border-white/40' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`} title="リスト表示">
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
            className={`p-1.5 transition-all duration-300 border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-black') : (isDarkMode ? 'rounded-full backdrop-blur-md shadow-sm bg-gray-800/40 border-white/10 text-gray-300 hover:bg-gray-700/60 hover:text-white' : 'rounded-full backdrop-blur-md shadow-sm bg-white/40 border-white/40 text-gray-600 hover:bg-white/80 hover:text-gray-900')}`}
            title="インポート"
          >
            <Upload size={16} />
          </button>

          <button onClick={() => setShowSettingsModal(true)} className={`p-1.5 transition-all duration-300 border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-black') : (isDarkMode ? 'rounded-full backdrop-blur-md shadow-sm bg-gray-800/40 border-white/10 text-gray-300 hover:bg-gray-700/60 hover:text-white' : 'rounded-full backdrop-blur-md shadow-sm bg-white/40 border-white/40 text-gray-600 hover:bg-white/80 hover:text-gray-900')}`} title="設定">
            <Settings size={16} />
          </button>

          <button onClick={toggleTheme} className={`p-1.5 transition-all duration-300 border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-black') : (isDarkMode ? 'rounded-full backdrop-blur-md shadow-sm bg-gray-800/40 border-white/10 text-gray-300 hover:bg-gray-700/60 hover:text-white' : 'rounded-full backdrop-blur-md shadow-sm bg-white/40 border-white/40 text-gray-600 hover:bg-white/80 hover:text-gray-900')}`} title={isDarkMode ? "ライトモードへ" : "ダークモードへ"}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto ${isSimpleTheme ? (isDarkMode ? 'bg-neutral-950' : 'bg-neutral-200') : ''}`}>
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">シナリオ一覧</h2>
            <button 
              onClick={confirmCreate}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${isSimpleTheme ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-stone-800') : 'bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 hover:shadow-md'}`}
            >
              <Plus size={16} />
              <span>新規作成</span>
            </button>
          </div>

          {scenarios.length === 0 ? (
            <div className={`text-center py-16 ${isSimpleTheme ? (isDarkMode ? 'bg-neutral-900 text-zinc-400' : 'bg-white text-stone-600') : (isDarkMode ? 'rounded-2xl backdrop-blur-md shadow-xl bg-gray-800/30 border-white/10 text-gray-400 border' : 'rounded-2xl backdrop-blur-md shadow-xl bg-white/30 border-white/40 text-gray-500 border')}`}>
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">まだシナリオがありません</p>
              <div className="flex justify-center gap-4 mt-3">
                <button onClick={confirmCreate} className="text-indigo-600 hover:underline text-xs">新しいシナリオを作成する</button>
                <span className="text-gray-300 text-xs">|</span>
                <button onClick={() => fileInputRef.current.click()} className="text-indigo-600 hover:underline text-xs">ファイルをインポート</button>
              </div>
            </div>
          ) : (
            <div className={viewType === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6" : "space-y-2"}>
              {scenarios.map((scenario, index) => (
                <div 
                  key={scenario.id}
                  className="relative"
                  onDragEnter={() => handleDragEnter(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {/* Drop Indicator */}
                  {dragOverIndex === index && draggedIndex !== index && (
                    <div className={`absolute z-20 pointer-events-none bg-indigo-500 rounded-full ${
                      viewType === 'grid' 
                        ? `w-1.5 h-full top-0 ${dropPosition === 'before' ? '-left-[11px]' : '-right-[11px]'}` 
                        : `h-1.5 w-full left-0 ${dropPosition === 'before' ? '-top-[7px]' : '-bottom-[7px]'}`
                    }`} />
                  )}
                  <div 
                    draggable="true"
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      group overflow-hidden transition-all duration-300 cursor-pointer
                      ${isSimpleTheme ? (isDarkMode ? 'bg-neutral-900 text-white border-b border-neutral-600 hover:bg-neutral-800' : 'bg-white text-black border-b border-neutral-400 hover:bg-neutral-50') : (isDarkMode ? 'rounded-xl shadow-lg hover:shadow-2xl backdrop-blur-xl bg-gray-900/40 border border-white/10 hover:border-indigo-400/50 hover:bg-gray-800/60' : 'rounded-xl shadow-lg hover:shadow-2xl backdrop-blur-xl bg-white/40 border border-white/40 hover:border-indigo-300/80 hover:bg-white/70')}
                      ${draggedIndex === index ? 'opacity-50' : ''}
                      ${viewType === 'grid' ? 'p-4 flex flex-col h-40' : 'p-3 flex items-center justify-between'} 
                    `}
                    onClick={() => onSelect(scenario.id)}
                  >
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className={`font-bold text-base mb-0.5 truncate ${isSimpleTheme ? (isDarkMode ? 'text-white' : 'text-black') : 'text-gray-900 dark:text-gray-100'}`}>{scenario.title}</h3>
                    <p className={`text-[10px] mb-2 ${isSimpleTheme ? (isDarkMode ? 'text-zinc-300' : 'text-stone-600') : 'text-gray-500 dark:text-gray-400'}`}>
                      最終更新: {new Date(scenario.lastModified).toLocaleString()}
                    </p>
                    {viewType === 'grid' && (
                      <div className={`text-xs line-clamp-3 opacity-90 leading-snug ${isSimpleTheme ? (isDarkMode ? 'text-zinc-200' : 'text-stone-700') : 'text-gray-600 dark:text-gray-400'}`}>
                        {scenario.pages[0]?.content.substring(0, 80) || '（本文なし）'}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 ${viewType === 'grid' ? `mt-auto pt-2 shrink-0 transition-colors duration-300 ${isSimpleTheme ? (isDarkMode ? 'border-t border-white' : 'border-t border-black') : (isDarkMode ? 'border-t border-white/5 group-hover:border-white/10' : 'border-t border-black/5 group-hover:border-black/10')}` : ''}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); confirmDuplicate(scenario.id); }}
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
              </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={executeDelete}
        title="シナリオを削除しますか？"
        message="この操作は取り消せません。"
        type="delete"
        confirmText="削除する"
        isDarkMode={isDarkMode}
      />

      <ConfirmationModal
        isOpen={showDuplicateModal}
        onClose={closeDuplicateModal}
        onConfirm={executeDuplicate}
        title="シナリオを複製しますか？"
        message="選択したシナリオのコピーを新しく作成します。"
        type="duplicate"
        confirmText="複製する"
        isDarkMode={isDarkMode}
      />

      <PromptModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={executeCreate}
        title="新規シナリオの作成"
        placeholder="シナリオの名前を入力..."
        value={newScenarioName}
        onChange={setNewScenarioName}
        confirmText="作成する"
        isDarkMode={isDarkMode}
      />

      {/* Settings Modal */}
      <Suspense fallback={null}>
        {showSettingsModal && (
          <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
            shortcuts={shortcuts} 
            setShortcuts={setShortcuts} 
            isDarkMode={isDarkMode} 
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            colorMode={colorMode}
            setColorMode={setColorMode}
            dataPath={dataPath}
            setDataPath={setDataPath}
          />
        )}
      </Suspense>
    </div>
  );
}

import React, { memo, useState } from 'react';
import { Menu, Home, Settings, Columns, Type, Maximize2, Sun, Moon, Trash2, Edit2 } from 'lucide-react';
import { ExportMenu } from './ExportMenu';
import { PromptModal } from '../modals/PromptModal';

export const EditorHeader = memo(function EditorHeader({
  scenarioTitle,
  onTitleChange,
  onBack,
  saveStatus,
  appTheme,
  isDarkMode,
  toggleTheme,
  viewMode,
  setViewMode,
  showLeftSidebar,
  setShowLeftSidebar,
  onOpenSettings,
  onDownloadMd,
  onDownloadPageHtml,
  onDownloadScenarioHtml,
  onDownloadPagePdf,
  onDownloadScenarioPdf,
  onClearPage,
  getShortcutLabel
}) {
  const isSimpleTheme = appTheme === 'simple';
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleOpenRename = () => {
    setTempTitle(scenarioTitle);
    setShowRenameModal(true);
  };

  const handleSaveRename = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setShowRenameModal(false);
  };

  return (
    <header className={`theme-simple-divider h-12 flex items-center justify-between px-6 border-b sticky top-0 z-20 transition-colors duration-300 ${isSimpleTheme ? (isDarkMode ? 'bg-black border-transparent text-white' : 'bg-black border-transparent text-white') : `shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className={`p-2.5 transition-all active:scale-95 border ${isSimpleTheme ? 'bg-transparent hover:bg-white/12 border-transparent text-white' : (isDarkMode ? 'rounded-xl backdrop-blur-lg shadow-sm bg-gray-800/40 hover:bg-gray-700/60 border-white/10 hover:border-white/20 border-b-black/30 hover:shadow-md text-gray-300' : 'rounded-xl backdrop-blur-lg shadow-sm bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]')}`}
          title={getShortcutLabel('pageList')}
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2.5 transition-all active:scale-95 border ${isSimpleTheme ? 'bg-transparent hover:bg-white/12 border-transparent text-white' : (isDarkMode ? 'rounded-full backdrop-blur-lg shadow-sm bg-gray-800/40 hover:bg-gray-700/60 border-white/10 hover:border-white/20 border-b-black/30 hover:shadow-md text-gray-300' : 'rounded-full backdrop-blur-lg shadow-sm bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]')}`} title="一覧へ戻る">
            <Home size={16} />
          </button>
                    <div 
                      className={`flex items-center gap-2 group cursor-pointer px-2 py-1 -ml-2 transition-colors ${isSimpleTheme ? 'hover:bg-white/10 text-white' : (isDarkMode ? 'rounded-lg backdrop-blur-sm hover:bg-gray-800/40 text-white' : 'rounded-lg backdrop-blur-sm hover:bg-white/40 text-gray-900')}`}
                      onClick={handleOpenRename}
                      title="シナリオ名を変更"
                    >
                      <div className="font-bold text-lg truncate max-w-[200px] leading-tight">
                        {scenarioTitle || 'シナリオタイトル'}
                      </div>
                      <button className="text-gray-400 hover:text-indigo-500 transition-colors shrink-0">
                        <Edit2 size={14} />
                      </button>
                      <span className={`text-[11px] font-medium tracking-wide ml-1 ${isSimpleTheme ? 'text-white/55' : 'text-gray-400'}`}>{saveStatus}</span>
                    </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center p-1 mr-2 border ${isSimpleTheme ? 'bg-transparent border-transparent' : (isDarkMode ? 'rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-xl bg-gray-800/50 border-t-white/20 border-l-white/20 border-b-black/40 border-r-black/40' : 'rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] backdrop-blur-xl bg-white/50 border-t-white/80 border-l-white/80 border-b-white/20 border-r-white/20')}`}>
          <button onClick={() => setViewMode('split')} className={`p-2 transition-all border ${viewMode === 'split' ? (isSimpleTheme ? 'bg-white text-black border-transparent' : isDarkMode ? 'rounded-xl bg-gray-700/80 shadow-md text-indigo-300 border-white/20 border-b-black/40' : 'rounded-xl bg-white/80 shadow-md text-indigo-600 border-white') : (isSimpleTheme ? 'text-white/65 bg-transparent border-transparent hover:bg-white/12 hover:text-white' : 'text-gray-500 hover:text-gray-900 border border-transparent dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/5')}`}><Columns size={14} /></button>
          <button onClick={() => setViewMode('edit')} className={`p-2 transition-all border ${viewMode === 'edit' ? (isSimpleTheme ? 'bg-white text-black border-transparent' : isDarkMode ? 'rounded-xl bg-gray-700/80 shadow-md text-indigo-300 border-white/20 border-b-black/40' : 'rounded-xl bg-white/80 shadow-md text-indigo-600 border-white') : (isSimpleTheme ? 'text-white/65 bg-transparent border-transparent hover:bg-white/12 hover:text-white' : 'text-gray-500 hover:text-gray-900 border border-transparent dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/5')}`}><Type size={14} /></button>
          <button onClick={() => setViewMode('preview')} className={`p-2 transition-all border ${viewMode === 'preview' ? (isSimpleTheme ? 'bg-white text-black border-transparent' : isDarkMode ? 'rounded-xl bg-gray-700/80 shadow-md text-indigo-300 border-white/20 border-b-black/40' : 'rounded-xl bg-white/80 shadow-md text-indigo-600 border-white') : (isSimpleTheme ? 'text-white/65 bg-transparent border-transparent hover:bg-white/12 hover:text-white' : 'text-gray-500 hover:text-gray-900 border border-transparent dark:text-gray-400 dark:hover:text-gray-100 hover:bg-white/20 dark:hover:bg-white/5')}`}><Maximize2 size={14} /></button>
        </div>

        <button onClick={onOpenSettings} className={`p-2.5 transition-all active:scale-95 border ${isSimpleTheme ? 'bg-transparent hover:bg-white/12 border-transparent text-white' : (isDarkMode ? 'rounded-xl backdrop-blur-lg shadow-sm bg-gray-800/40 hover:bg-gray-700/60 border-white/10 hover:border-white/20 border-b-black/30 hover:shadow-md text-gray-300' : 'rounded-xl backdrop-blur-lg shadow-sm bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]')}`} title="設定">
          <Settings size={16} />
        </button>

        <button onClick={toggleTheme} className={`p-2.5 transition-all active:scale-95 border ${isSimpleTheme ? 'bg-transparent hover:bg-white/12 border-transparent text-white' : (isDarkMode ? 'rounded-xl backdrop-blur-lg shadow-sm bg-gray-800/40 hover:bg-gray-700/60 border-white/10 hover:border-white/20 border-b-black/30 hover:shadow-md text-gray-300' : 'rounded-xl backdrop-blur-lg shadow-sm bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-gray-700 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]')}`}>
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <ExportMenu
          onDownloadMd={onDownloadMd}
          onDownloadPageHtml={onDownloadPageHtml}
          onDownloadScenarioHtml={onDownloadScenarioHtml}
          onDownloadPagePdf={onDownloadPagePdf}
          onDownloadScenarioPdf={onDownloadScenarioPdf}
          isDarkMode={isDarkMode}
        />

        <div className={`w-px h-6 mx-1 shrink-0 ${isSimpleTheme ? 'bg-white/15' : (isDarkMode ? 'bg-white/10' : 'bg-black/10')}`}></div>

        <button onClick={onClearPage} className={`p-2.5 text-red-500 transition-all active:scale-95 flex-shrink-0 border ${isSimpleTheme ? 'bg-transparent hover:bg-red-500/20 border-transparent hover:text-red-300' : (isDarkMode ? 'rounded-xl backdrop-blur-lg shadow-sm bg-gray-800/20 hover:bg-red-900/40 border-white/10 hover:border-red-400/30 border-b-black/30 hover:shadow-md' : 'rounded-xl backdrop-blur-lg shadow-sm bg-white/40 hover:bg-white/80 border-white/60 hover:border-white hover:text-red-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]')}`} title={getShortcutLabel('clear')}>
          <Trash2 size={16} />
        </button>

      </div>

      <PromptModal 
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleSaveRename}
        title="シナリオ名の変更"
        placeholder="シナリオタイトル"
        value={tempTitle}
        onChange={setTempTitle}
        Icon={Edit2}
        isDarkMode={isDarkMode}
      />
    </header>
  );
});

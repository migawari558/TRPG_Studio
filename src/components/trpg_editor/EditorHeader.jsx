import React, { memo } from 'react';
import { Menu, Home, Settings, Columns, Type, Maximize2, Sun, Moon, Users } from 'lucide-react';
import { ExportMenu } from './ExportMenu';

export const EditorHeader = memo(function EditorHeader({
  scenarioTitle,
  onTitleChange,
  onBack,
  saveStatus,
  isDarkMode,
  toggleTheme,
  viewMode,
  setViewMode,
  showLeftSidebar,
  setShowLeftSidebar,
  showRightSidebar,
  setShowRightSidebar,
  onOpenSettings,
  onDownloadMd,
  onDownloadPageHtml,
  onDownloadScenarioHtml,
  getShortcutLabel
}) {
  return (
    <header className="h-12 flex items-center justify-between px-6 border-b border-gray-160/80 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowLeftSidebar(!showLeftSidebar)}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95"
          title={getShortcutLabel('pageList')}
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95" title="一覧へ戻る">
            <Home size={16} />
          </button>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={scenarioTitle}
                        onChange={(e) => onTitleChange(e.target.value)}
                        className="bg-transparent border-none p-0 focus:ring-0 font-bold text-lg text-gray-900 dark:text-white placeholder-gray-400 w-64 truncate leading-tight"
                        placeholder="シナリオタイトル"
                      />
                      <span className="text-[11px] text-gray-400 font-medium tracking-wide">{saveStatus}</span>
                    </div>        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mr-2">
          <button onClick={() => setViewMode('split')} className={`p-2 rounded-lg transition-all ${viewMode === 'split' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Columns size={14} /></button>
          <button onClick={() => setViewMode('edit')} className={`p-2 rounded-lg transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Type size={14} /></button>
          <button onClick={() => setViewMode('preview')} className={`p-2 rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}><Maximize2 size={14} /></button>
        </div>

        <button onClick={onOpenSettings} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95" title="設定">
          <Settings size={16} />
        </button>

        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all active:scale-95">
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <ExportMenu
          onDownloadMd={onDownloadMd}
          onDownloadPageHtml={onDownloadPageHtml}
          onDownloadScenarioHtml={onDownloadScenarioHtml}
          isDarkMode={isDarkMode}
        />

        <div className="w-px h-8 bg-gray-160 dark:bg-gray-800 mx-1"></div>

        <button onClick={() => setShowRightSidebar(!showRightSidebar)} className={`p-2.5 rounded-xl transition-all active:scale-95 ${showRightSidebar ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`} title={getShortcutLabel('npcList')}>
          <Users size={16} />
        </button>
      </div>
    </header>
  );
});

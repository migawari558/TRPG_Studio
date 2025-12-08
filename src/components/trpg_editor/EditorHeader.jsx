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
    <header className="h-12 flex items-center justify-between px-4 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowLeftSidebar(!showLeftSidebar)} 
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" 
          title={getShortcutLabel('pageList')}
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="一覧へ戻る">
            <Home size={18} />
          </button>
          <input 
            type="text"
            value={scenarioTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none font-bold text-base w-56 px-1 truncate transition-colors"
            placeholder="シナリオタイトル"
          />
        </div>
        <span className="text-[10px] text-gray-400 ml-1">{saveStatus}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onOpenSettings} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 mr-1" title="設定">
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
          <button onClick={() => setViewMode('split')} className={`p-1 rounded ${viewMode === 'split' ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}><Columns size={14} /></button>
          <button onClick={() => setViewMode('edit')} className={`p-1 rounded ${viewMode === 'edit' ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}><Type size={14} /></button>
          <button onClick={() => setViewMode('preview')} className={`p-1 rounded ${viewMode === 'preview' ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}><Maximize2 size={14} /></button>
        </div>
        <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">{isDarkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
        
        <ExportMenu 
          onDownloadMd={onDownloadMd} 
          onDownloadPageHtml={onDownloadPageHtml} 
          onDownloadScenarioHtml={onDownloadScenarioHtml} 
          isDarkMode={isDarkMode} 
        />
        
        <button onClick={() => setShowRightSidebar(!showRightSidebar)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title={getShortcutLabel('npcList')}><Users size={16} /></button>
      </div>
    </header>
  );
});
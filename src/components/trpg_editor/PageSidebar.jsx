import React, { memo } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

// Custom comparison function (unchanged)
function arePropsEqual(prevProps, nextProps) {
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    if (prevProps.activePageId !== nextProps.activePageId) return false;
    if (prevProps.onPageSelect !== nextProps.onPageSelect) return false;
    if (prevProps.onAddPage !== nextProps.onAddPage) return false;
    if (prevProps.onDeletePage !== nextProps.onDeletePage) return false;
    if (prevProps.getShortcutLabel !== nextProps.getShortcutLabel) return false;

    // pages配列の長さ比較
    if (prevProps.pages.length !== nextProps.pages.length) return false;

    // pages配列の中身比較（IDとTitleのみ）
    for (let i = 0; i < prevProps.pages.length; i++) {
        if (prevProps.pages[i].id !== nextProps.pages[i].id) return false;
        if (prevProps.pages[i].title !== nextProps.pages[i].title) return false;
    }

    return true;
}

export const PageSidebar = memo(function PageSidebar({ 
  isOpen, 
  pages, 
  activePageId, 
  onPageSelect, 
  onAddPage, 
  onDeletePage, 
  getShortcutLabel 
}) {
  return (
    <div className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
        <button 
          onClick={onAddPage} 
          className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow transition-all text-sm font-medium active:scale-98" 
          title={getShortcutLabel('pageAdd')}
        >
          <Plus size={16} className="text-indigo-500" />
          <span>新規ページ</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 px-2 py-1 uppercase tracking-wide">ページ</div>
        {pages.map((page, index) => (
          <div 
            key={page.id} 
            onClick={() => onPageSelect(page.id)} 
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all active:scale-98 ${activePageId === page.id ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText size={16} className={`shrink-0 ${activePageId === page.id ? 'text-white/80' : 'text-gray-400'}`} />
              <span className="text-sm font-medium truncate">{page.title}</span>
            </div>
            {pages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }} 
                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 ${activePageId === page.id ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}, arePropsEqual);

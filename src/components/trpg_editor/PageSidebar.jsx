import React, { memo } from 'react';
import { Plus, Trash2 } from 'lucide-react';

// カスタム比較関数: pagesのidとtitleのみを比較
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
    <div className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${isOpen ? 'w-56' : 'w-0'}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onAddPage} 
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-1.5 rounded shadow hover:bg-indigo-700 text-xs font-medium" 
          title={getShortcutLabel('pageAdd')}
        >
          <Plus size={14} /><span>ページを追加</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {pages.map((page, index) => (
          <div 
            key={page.id} 
            onClick={() => onPageSelect(page.id)} 
            className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-all ${activePageId === page.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 border' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent'}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={`text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ${activePageId === page.id ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-500'}`}>{index + 1}</span>
              <span className="text-xs font-medium truncate">{page.title}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }} 
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-0.5"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}, arePropsEqual);
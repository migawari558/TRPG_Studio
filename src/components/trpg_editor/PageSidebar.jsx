import React, { memo, useState } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const extractHeadings = (content) => {
  if (!content) return [];
  const lines = content.split('\n');
  const headings = [];
  lines.forEach((line) => {
    // # or ## 
    const match = line.match(/^(#{1,2})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }
  });
  return headings;
};

// Custom comparison function
function arePropsEqual(prevProps, nextProps) {
    if (prevProps.isOpen !== nextProps.isOpen) return false;
    if (prevProps.activePageId !== nextProps.activePageId) return false;
    if (prevProps.onPageSelect !== nextProps.onPageSelect) return false;
    if (prevProps.onAddPage !== nextProps.onAddPage) return false;
    if (prevProps.onDeletePage !== nextProps.onDeletePage) return false;
    if (prevProps.onReorderPages !== nextProps.onReorderPages) return false;
    if (prevProps.onHeadingClick !== nextProps.onHeadingClick) return false;
    if (prevProps.getShortcutLabel !== nextProps.getShortcutLabel) return false;
    if (prevProps.isDarkMode !== nextProps.isDarkMode) return false;

    // pages配列の長さ比較
    if (prevProps.pages.length !== nextProps.pages.length) return false;

    // pages配列の中身比較（IDとTitleのみ）
    for (let i = 0; i < prevProps.pages.length; i++) {
        if (prevProps.pages[i].id !== nextProps.pages[i].id) return false;
        if (prevProps.pages[i].title !== nextProps.pages[i].title) return false;
    }

    const prevActivePage = prevProps.pages.find(p => p.id === prevProps.activePageId);
    const nextActivePage = nextProps.pages.find(p => p.id === nextProps.activePageId);
    if (prevActivePage?.content !== nextActivePage?.content) return false;

    return true;
}

export const PageSidebar = memo(function PageSidebar({ 
  isOpen, 
  pages, 
  activePageId, 
  onPageSelect, 
  onAddPage, 
  onDeletePage, 
  onReorderPages,
  onHeadingClick,
  getShortcutLabel,
  isDarkMode 
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState('before');
  const [expandedPages, setExpandedPages] = useState({});

  const toggleExpand = (e, pageId) => {
    e.stopPropagation();
    setExpandedPages(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragEnter = (index) => setDragOverIndex(index);
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition('before');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const isBottomHalf = e.clientY > rect.top + rect.height / 2;
    setDropPosition(isBottomHalf ? 'after' : 'before');
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    let finalIndex = index;
    if (dropPosition === 'before') {
      finalIndex = draggedIndex < index ? index - 1 : index;
    } else {
      finalIndex = draggedIndex < index ? index : index + 1;
    }
    
    if (finalIndex !== draggedIndex) {
      onReorderPages(draggedIndex, finalIndex);
    }
    handleDragEnd();
  };

  return (
    <div className={`flex flex-col shrink-0 transition-all duration-300 overflow-hidden border-r shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 relative">
        <div className={`text-sm font-bold px-2 py-2 mb-2 sticky top-0 z-10 border-b ${isDarkMode ? 'text-gray-300 bg-gray-900 border-gray-800' : 'text-gray-700 bg-white border-gray-200'}`}>ページ</div>
        {pages.map((page, index) => {
          const isActive = activePageId === page.id;
          const hasHeadings = page.content ? /^(#{1,2})\s+/m.test(page.content) : false;
          const isExpanded = !!expandedPages[page.id];
          const headings = isExpanded && hasHeadings ? extractHeadings(page.content) : [];
          return (
          <div 
            key={page.id} 
            className="relative"
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            {dragOverIndex === index && draggedIndex !== index && (
              <div className={`absolute z-20 pointer-events-none bg-indigo-500 rounded-full h-1 w-full left-0 ${dropPosition === 'before' ? '-top-[2px]' : '-bottom-[2px]'}`} />
            )}
            <div 
              draggable="true"
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                onPageSelect(page.id);
                if (hasHeadings && !expandedPages[page.id]) {
                  setExpandedPages(prev => ({ ...prev, [page.id]: true }));
                }
              }} 
              className={`group flex items-center justify-between px-2 py-2 rounded-xl cursor-pointer transition-all active:scale-98 backdrop-blur-sm ${draggedIndex === index ? 'opacity-50' : ''} ${activePageId === page.id ? isDarkMode ? 'bg-indigo-500/80 text-white shadow-lg border border-white/10' : 'bg-indigo-500/90 text-white shadow-lg border border-white/30' : isDarkMode ? 'text-gray-200 hover:bg-gray-800/50 border border-transparent hover:border-white/5' : 'text-gray-700 hover:bg-white/60 border border-transparent hover:border-white/40'}`}
            >
              <div className="flex items-center gap-1 overflow-hidden">
                <div 
                  onClick={(e) => hasHeadings && toggleExpand(e, page.id)}
                  className={`p-1 rounded-md transition-colors shrink-0 ${hasHeadings ? `cursor-pointer ${isActive ? 'hover:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}` : 'opacity-30 cursor-default'} ${isActive ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {isExpanded && hasHeadings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <span className="text-sm font-bold truncate">{page.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }} 
                className={`p-1.5 rounded-lg transition-colors active:scale-95 ${activePageId === page.id ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-gray-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {isExpanded && headings.length > 0 && (
              <div className={`mt-1.5 mb-3 ml-7 pl-3 border-l-2 transition-colors ${isDarkMode ? 'border-white/10' : 'border-indigo-100'} space-y-0.5`}>
                {headings.map((heading, hIdx) => (
                  <div 
                    key={hIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onHeadingClick(page.id, heading.text);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs cursor-pointer transition-all active:scale-95 ${
                      heading.level === 1 
                        ? (isDarkMode ? 'text-gray-300 hover:text-white hover:bg-white/10 font-bold' : 'text-gray-700 hover:text-indigo-700 hover:bg-black/5 font-bold') 
                        : (isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-white/10 ml-2' : 'text-gray-500 hover:text-gray-800 hover:bg-black/5 ml-2')
                    }`}
                  >
                    <span className="truncate block">{heading.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )})}
        
        <div className="pt-2 pb-4">
          <button 
            onClick={onAddPage} 
            className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed transition-all text-xs font-bold active:scale-98 backdrop-blur-sm ${isDarkMode ? 'text-gray-400 border-white/20 hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-900/20' : 'text-gray-500 border-indigo-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white/50 shadow-sm'}`}
            title={getShortcutLabel('pageAdd')}
          >
            <Plus size={14} />
            <span>新規ページを追加</span>
          </button>
        </div>
      </div>
    </div>
  );
}, arePropsEqual);

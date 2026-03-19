import React, { useEffect, useState, memo } from 'react';
import { parseMarkdown } from '../../utils/markdownParser';
import { SearchReplaceWidget } from './SearchReplaceWidget';

export const EditorArea = memo(function EditorArea({ 
  viewMode, 
  title,
  content, 
  onChange, 
  images, 
  textareaRef, 
  previewRef, 
  onSyncPreview, 
  onKeyDown,
  editorFontFamily,
  editorFontSize,
  isDarkMode,
  showSearchWidget,
  setShowSearchWidget
}) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  useEffect(() => {
    if (!searchQuery || !showSearchWidget) {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    try {
      const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const newMatches = [];
      let match;
      while ((match = searchRegex.exec(content)) !== null) {
        newMatches.push({ index: match.index, length: match[0].length });
      }
      setMatches(newMatches);

      if (newMatches.length > 0) {
        if (currentMatchIndex < 0 || currentMatchIndex >= newMatches.length) {
          setCurrentMatchIndex(0);
        }
      } else {
        setCurrentMatchIndex(-1);
      }
    } catch {
      setMatches([]);
    }
  }, [searchQuery, content, showSearchWidget]);

  const handleNext = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex(prev => (prev + 1) % matches.length);
      setScrollTrigger(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (matches.length > 0) {
      setCurrentMatchIndex(prev => (prev - 1 + matches.length) % matches.length);
      setScrollTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (scrollTrigger > 0 && matches.length > 0 && currentMatchIndex >= 0) {
      const match = matches[currentMatchIndex];
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(match.index, match.index + match.length);
        
        const textBeforeMatch = content.substring(0, match.index);
        const lineCount = textBeforeMatch.split('\n').length;
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 24;
        textarea.scrollTop = Math.max(0, (lineCount - 1) * lineHeight - textarea.clientHeight / 4);
        
        onSyncPreview();
      }
    }
  }, [scrollTrigger]);

  const handleReplace = () => {
    if (matches.length > 0 && currentMatchIndex >= 0) {
      const match = matches[currentMatchIndex];
      const before = content.substring(0, match.index);
      const after = content.substring(match.index + match.length);
      const newContent = before + replaceQuery + after;
      onChange(newContent);
      setScrollTrigger(prev => prev + 1);
    }
  };

  const handleReplaceAll = () => {
    if (matches.length > 0 && searchQuery) {
      const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const newContent = content.replace(searchRegex, replaceQuery);
      onChange(newContent);
      // Wait for content update, effect will clear matches if we clear prompt? Let's leave query.
    }
  };

  useEffect(() => {
    const handlePreviewClick = (e) => {
      if (e.target.classList.contains('copy-btn')) {
        const container = e.target.closest('.group');
        const contentDiv = container.querySelector('.info-content');
        if (contentDiv) {
          const textToCopy = contentDiv.innerText;
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            const originalText = e.target.innerText;
            e.target.innerText = '完了';
            e.target.classList.add('text-green-600');
            setTimeout(() => {
              e.target.innerText = originalText;
              e.target.classList.remove('text-green-600');
            }, 1500);
          } catch (err) {
            console.error('Copy failed', err);
          }
          document.body.removeChild(textArea);
        }
      }
    };
    document.addEventListener('click', handlePreviewClick);
    return () => document.removeEventListener('click', handlePreviewClick);
  }, []);

  return (
    <div className="flex-grow flex h-full overflow-hidden relative">
      <div className={`flex-1 h-full transition-all ${viewMode === 'preview' ? 'hidden' : ''} relative py-4 pl-4 ${viewMode === 'split' ? 'pr-2' : 'pr-4'}`}>
        <SearchReplaceWidget 
          mode={showSearchWidget}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          replaceQuery={replaceQuery}
          setReplaceQuery={setReplaceQuery}
          matchesCount={matches.length}
          currentMatchIndex={currentMatchIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onReplace={handleReplace}
          onReplaceAll={handleReplaceAll}
          onClose={() => setShowSearchWidget(null)}
          isDarkMode={isDarkMode}
          onSearchModeToggle={() => setShowSearchWidget(prev => prev === 'search' ? 'replace' : 'search')}
        />
        <div className="h-full rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 bg-white dark:bg-gray-900 relative before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 dark:before:border-white/20 before:mix-blend-overlay">
          <textarea 
            ref={textareaRef} 
            value={content} 
            onChange={(e) => onChange(e.target.value)} 
            onKeyUp={onSyncPreview} 
            onClick={onSyncPreview} 
            onScroll={onSyncPreview} 
            onKeyDown={onKeyDown}
            placeholder="ここにシナリオを入力..." 
            className="w-full h-full resize-none p-5 md:p-8 focus:outline-none leading-relaxed bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 selection:bg-indigo-200 dark:selection:bg-indigo-900/50" 
            spellCheck={false} 
            style={{ fontFamily: editorFontFamily, fontSize: `${editorFontSize}px` }}
          />
        </div>
      </div>
      
      {viewMode === 'split' && <div className="w-px shrink-0 bg-transparent"></div>}
      
      <div 
        ref={previewRef}
        className={`flex-1 h-full overflow-y-auto ${viewMode === 'edit' ? 'hidden' : ''} py-4 pr-4 ${viewMode === 'split' ? 'pl-2' : 'pl-4'}`}
      >
        <div className="max-w-3xl mx-auto min-h-full rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 bg-white dark:bg-gray-900 relative before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 dark:before:border-white/20 before:mix-blend-overlay my-0 overflow-hidden">
          <div className="p-6 md:p-10 relative z-10">
            <h1 className="text-3xl font-bold mb-6 pb-4 border-b border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white tracking-tight">{title}</h1>
            <div className="prose dark:prose-invert max-w-none break-words leading-relaxed" style={{ fontFamily: editorFontFamily, fontSize: `${editorFontSize}px` }} dangerouslySetInnerHTML={{ __html: parseMarkdown(content, images) }} />
          </div>
        </div>
      </div>
    </div>
  );
});
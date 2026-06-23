import React, { useDeferredValue, useEffect, useMemo, useState, memo } from 'react';
import { parseMarkdown } from '../../utils/markdownParser';
import { SearchReplaceWidget } from './SearchReplaceWidget';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findMatches = (content, query) => {
  if (!query) return [];

  const searchRegex = new RegExp(escapeRegExp(query), 'gi');
  const nextMatches = [];
  let match;

  while ((match = searchRegex.exec(content)) !== null) {
    nextMatches.push({ index: match.index, length: match[0].length });
  }

  return nextMatches;
};

const focusMatchInTextarea = (textarea, content, match) => {
  textarea.focus();
  textarea.setSelectionRange(match.index, match.index + match.length);

  const textBeforeMatch = content.substring(0, match.index);
  const lineCount = textBeforeMatch.split('\n').length;
  const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 24;
  textarea.scrollTop = Math.max(0, (lineCount - 1) * lineHeight - textarea.clientHeight / 4);
};

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
  appTheme,
  isDarkMode,
  showSearchWidget,
  setShowSearchWidget
}) {
  const isSimpleTheme = appTheme === 'simple';
  const deferredContent = useDeferredValue(content);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [scrollTrigger, setScrollTrigger] = useState(0);

  const matches = useMemo(() => {
    if (!searchQuery || !showSearchWidget) return [];
    try {
      return findMatches(content, searchQuery);
    } catch {
      return [];
    }
  }, [searchQuery, content, showSearchWidget]);

  const previewHtml = useMemo(
    () => parseMarkdown(deferredContent, images),
    [deferredContent, images],
  );
  const editorFontStyle = useMemo(() => ({
    '--editor-font-family': editorFontFamily,
    fontFamily: editorFontFamily,
    fontSize: `${editorFontSize}px`,
  }), [editorFontFamily, editorFontSize]);

  useEffect(() => {
    if (!searchQuery || !showSearchWidget) {
      setCurrentMatchIndex(-1);
      return;
    }

    if (matches.length === 0) {
      setCurrentMatchIndex(-1);
      return;
    }

    if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) {
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, showSearchWidget, matches, currentMatchIndex]);

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
        focusMatchInTextarea(textarea, content, match);
        onSyncPreview();
      }
    }
  }, [scrollTrigger, matches, currentMatchIndex, textareaRef, content, onSyncPreview]);

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
      const searchRegex = new RegExp(escapeRegExp(searchQuery), 'gi');
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
        <div className={`${isSimpleTheme ? 'theme-simple-editor-surface h-full overflow-hidden relative' : 'theme-simple-frame h-full overflow-hidden border relative rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/40 dark:border-white/10 bg-white dark:bg-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 dark:before:border-white/20 before:mix-blend-overlay'}`}>
          <textarea 
            ref={textareaRef} 
            value={content} 
            onChange={(e) => onChange(e.target.value)} 
            onKeyUp={onSyncPreview} 
            onClick={onSyncPreview} 
            onScroll={onSyncPreview} 
            onKeyDown={onKeyDown}
            placeholder="ここにシナリオを入力..." 
            className={`theme-editor-font-target w-full h-full resize-none p-5 md:p-8 focus:outline-none leading-relaxed bg-transparent ${isSimpleTheme ? (isDarkMode ? 'border-0 text-zinc-100 placeholder-zinc-500 selection:bg-white selection:text-black' : 'border-0 text-stone-900 placeholder-stone-400 selection:bg-black selection:text-white') : 'text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 selection:bg-indigo-200 dark:selection:bg-indigo-900/50'}`} 
            spellCheck={false} 
            style={editorFontStyle}
          />
        </div>
      </div>
      
      {viewMode === 'split' && (
        <div className={`w-px shrink-0 ${isSimpleTheme ? 'theme-simple-hr bg-neutral-300 dark:bg-neutral-600' : 'bg-transparent'}`}></div>
      )}
      
      <div 
        ref={previewRef}
        className={`flex-1 h-full overflow-y-auto ${viewMode === 'edit' ? 'hidden' : ''} py-4 pr-4 ${viewMode === 'split' ? 'pl-2' : 'pl-4'}`}
      >
        <div className={`${isSimpleTheme ? 'theme-simple-editor-surface max-w-3xl mx-auto min-h-full my-0 overflow-hidden relative' : 'theme-simple-frame max-w-3xl mx-auto min-h-full border my-0 overflow-hidden relative rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border-white/40 dark:border-white/10 bg-white dark:bg-gray-900 before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/60 dark:before:border-white/20 before:mix-blend-overlay'}`}>
          <div className="p-6 md:p-10 relative z-10">
            <h1 className={`text-3xl font-bold mb-6 pb-4 border-b tracking-tight ${isSimpleTheme ? (isDarkMode ? 'border-zinc-800 text-white' : 'border-stone-300 text-black') : 'border-gray-200 dark:border-gray-700/50 text-gray-900 dark:text-white'}`}>{title}</h1>
            <div className="theme-editor-font-target theme-preview-consistent prose dark:prose-invert max-w-none break-words leading-relaxed" style={editorFontStyle} dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
});

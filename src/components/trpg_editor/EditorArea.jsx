import React, { useEffect, memo } from 'react';
import { parseMarkdown } from '../../utils/markdownParser';

export const EditorArea = memo(function EditorArea({ 
  viewMode, 
  title,
  content, 
  onChange, 
  images, 
  textareaRef, 
  previewRef, 
  onSyncPreview, 
  onKeyDown 
}) {
  
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
    <div className="flex-grow flex h-full overflow-hidden relative bg-gray-100 dark:bg-gray-950">
      <div className={`flex-1 h-full transition-all ${viewMode === 'preview' ? 'hidden' : ''} relative p-4`}>
        <div className="h-full bg-white dark:bg-gray-900 shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <textarea 
            ref={textareaRef} 
            value={content} 
            onChange={(e) => onChange(e.target.value)} 
            onKeyUp={onSyncPreview} 
            onClick={onSyncPreview} 
            onScroll={onSyncPreview} 
            onKeyDown={onKeyDown}
            placeholder="ここにシナリオを入力..." 
            className="w-full h-full resize-none p-8 md:p-12 focus:outline-none text-sm font-mono leading-relaxed bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 selection:bg-indigo-100 dark:selection:bg-indigo-900/50" 
            spellCheck={false} 
          />
        </div>
      </div>
      
      {viewMode === 'split' && <div className="w-px shrink-0 bg-transparent"></div>}
      
      <div 
        ref={previewRef}
        className={`flex-1 h-full overflow-y-auto ${viewMode === 'edit' ? 'hidden' : ''} p-4`}
      >
        <div className="max-w-3xl mx-auto min-h-full bg-white dark:bg-gray-900 shadow-sm rounded-2xl my-0 overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="p-10 md:p-14">
            <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white tracking-tight">{title}</h1>
            <div className="prose prose-sm dark:prose-invert max-w-none font-sans break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdown(content, images) }} />
          </div>
        </div>
      </div>
    </div>
  );
});
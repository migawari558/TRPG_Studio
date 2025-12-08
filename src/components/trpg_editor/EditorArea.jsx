import React, { useEffect } from 'react';
import { parseMarkdown } from '../../utils/markdownParser';

export function EditorArea({ 
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
    <div className="flex-grow flex h-full overflow-hidden relative">
      <div className={`flex-1 h-full transition-all ${viewMode === 'preview' ? 'hidden' : ''}`}>
        <textarea 
          ref={textareaRef} 
          value={content} 
          onChange={(e) => onChange(e.target.value)} 
          onKeyUp={onSyncPreview} 
          onClick={onSyncPreview} 
          onScroll={onSyncPreview} 
          onKeyDown={onKeyDown}
          placeholder="ここにシナリオを入力..." 
          className="w-full h-full resize-none p-6 focus:outline-none text-sm font-mono leading-relaxed bg-white dark:bg-gray-900" 
          spellCheck={false} 
        />
      </div>
      {viewMode === 'split' && <div className="w-px shrink-0 bg-gray-200 dark:bg-gray-700"></div>}
      <div 
        ref={previewRef}
        className={`flex-1 h-full overflow-y-auto ${viewMode === 'edit' ? 'hidden' : ''} bg-gray-50 dark:bg-gray-800`}
      >
        <div className="max-w-3xl mx-auto p-6 min-h-full bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700 shadow-sm my-4">
          <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">{title}</h1>
          <div className="prose prose-sm dark:prose-invert max-w-none font-sans break-words" dangerouslySetInnerHTML={{ __html: parseMarkdown(content, images) }} />
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect } from 'react';

export function usePreviewSync({ textareaRef, previewRef, activePageIdRef, setActivePageId, pages, activePageId }) {
  const syncPreview = useCallback(() => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;
    if (!textarea || !preview) return;

    const cursorPosition = textarea.selectionStart;
    const text = textarea.value;
    const lines = text.split('\n');
    const totalLines = lines.length;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const currentLine = textBeforeCursor.split('\n').length;
    const ratio = totalLines > 1
      ? (currentLine - 1) / (totalLines - 1)
      : cursorPosition / (text.length || 1);
    const maxScroll = Math.max(0, preview.scrollHeight - preview.clientHeight);
    preview.scrollTop = maxScroll * ratio;
  }, [previewRef, textareaRef]);

  const handleHeadingClick = useCallback((pageId, headingText) => {
    if (pageId !== activePageIdRef.current) {
      setActivePageId(pageId);
    }

    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const text = textarea.value;
      const lines = text.split('\n');
      let targetLineIndex = -1;
      let charIndex = 0;

      for (let index = 0; index < lines.length; index += 1) {
        const match = lines[index].match(/^(#{1,2})\s+(.+)$/);
        if (match && match[2].trim() === headingText) {
          targetLineIndex = index;
          break;
        }
        charIndex += lines[index].length + 1;
      }

      if (targetLineIndex === -1) return;

      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 24;
      textarea.scrollTop = Math.max(0, targetLineIndex * lineHeight - textarea.clientHeight / 4);
      syncPreview();
    }, 50);
  }, [activePageIdRef, setActivePageId, syncPreview, textareaRef]);

  useEffect(() => {
    const timer = setTimeout(syncPreview, 0);
    return () => clearTimeout(timer);
  }, [activePageId, pages, syncPreview]);

  return {
    syncPreview,
    handleHeadingClick,
  };
}

import { useRef, useCallback } from 'react';

export function useEditorManipulation({ 
  textareaRef, 
  fileInputRef, 
  activePageIdRef, 
  updatePageContent, 
  setImages 
}) {

  const insertText = useCallback((before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);
    const newText = currentVal.substring(0, start) + before + selectedText + after + currentVal.substring(end);
    
    updatePageContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [textareaRef, updatePageContent]);

  const handleTextareaKeyDown = useCallback((e) => {
    const isComposing = e.nativeEvent.isComposing;
    if (isComposing) return;

    if (e.key === 'Enter') {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineContent = val.substring(lineStart, start);

        if (lineContent.trimStart().startsWith('>')) {
            e.preventDefault();
            if (lineContent.trim() === '>') {
                const newVal = val.substring(0, lineStart) + '\n' + val.substring(end);
                
                updatePageContent(newVal);
                
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(lineStart + 1, lineStart + 1);
                }, 0);
            } else {
                const newVal = val.substring(0, start) + '\n> ' + val.substring(end);
                
                updatePageContent(newVal);

                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + 3, start + 3);
                }, 0);
            }
        }
    }
  }, [textareaRef, updatePageContent]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("画像サイズが大きすぎます（5MB以下にしてください）");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const imageId = Date.now().toString(36);
      setImages(prev => ({ ...prev, [imageId]: base64String }));
      
      const textarea = textareaRef.current;
      if (textarea) {
        const before = `![${file.name}](image:${imageId})`;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        const newText = currentVal.substring(0, start) + before + currentVal.substring(end);

        updatePageContent(newText);
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length);
        }, 0);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null; 
  }, [textareaRef, updatePageContent, setImages]);
  const triggerImageUpload = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, [fileInputRef]);

  return {
    insertText,
    handleTextareaKeyDown,
    handleImageUpload,
    triggerImageUpload
  };
}

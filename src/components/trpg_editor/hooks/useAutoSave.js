import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoSave({ pages, characters, images, pagesRef, charactersRef, imagesRef, onSave }) {
  const [saveStatus, setSaveStatus] = useState('保存済み');
  const immediateSaveRequested = useRef(false);

  // Core Save Logic
  const saveContent = useCallback(() => {
    onSave({ 
        pages: pagesRef.current, 
        characters: charactersRef.current, 
        images: imagesRef.current 
    });
    setSaveStatus('保存しました');
    setTimeout(() => setSaveStatus('保存済み'), 2000);
    immediateSaveRequested.current = false;
  }, [onSave, pagesRef, charactersRef, imagesRef]);

  // Debounce Effect
  useEffect(() => {
    if (immediateSaveRequested.current) {
        saveContent();
        return;
    }

    if (saveStatus !== '編集...') {
      setSaveStatus('編集...');
    }
    
    const timer = setTimeout(() => {
      saveContent();
    }, 2000); 

    return () => clearTimeout(timer);
  }, [pages, characters, images, saveContent]); // Trigger on content change

  // Immediate Save Trigger
  const requestImmediateSave = useCallback(() => {
      immediateSaveRequested.current = true;
      saveContent();
  }, [saveContent]);

  const updateScenarioTitle = useCallback((newTitle) => {
    onSave({ title: newTitle });
  }, [onSave]);

  return {
    saveStatus,
    setSaveStatus,
    requestImmediateSave,
    updateScenarioTitle
  };
}

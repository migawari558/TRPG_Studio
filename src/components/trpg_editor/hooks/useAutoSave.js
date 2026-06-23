import { useState, useEffect, useRef, useCallback } from 'react';

const SAVE_COMPLETE_DURATION_MS = 2000;
const SAVE_DEBOUNCE_MS = 2000;

export function useAutoSave({ pages, characters, images, pagesRef, charactersRef, imagesRef, onSave }) {
  const [saveStatus, setSaveStatus] = useState('保存済み');
  const immediateSaveRequested = useRef(false);
  const statusResetTimerRef = useRef(null);

  const markSaved = useCallback(() => {
    if (statusResetTimerRef.current) {
      clearTimeout(statusResetTimerRef.current);
    }

    setSaveStatus('保存しました');
    statusResetTimerRef.current = setTimeout(() => setSaveStatus('保存済み'), SAVE_COMPLETE_DURATION_MS);
  }, []);

  // Core Save Logic
  const saveContent = useCallback(() => {
    onSave({ 
        pages: pagesRef.current, 
        characters: charactersRef.current, 
        images: imagesRef.current 
    });
    markSaved();
    immediateSaveRequested.current = false;
  }, [onSave, pagesRef, charactersRef, imagesRef, markSaved]);

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
    }, SAVE_DEBOUNCE_MS); 

    return () => clearTimeout(timer);
  }, [pages, characters, images, saveContent]); // Trigger on content change

  useEffect(() => () => {
    if (statusResetTimerRef.current) {
      clearTimeout(statusResetTimerRef.current);
    }
  }, []);

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

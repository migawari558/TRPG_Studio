import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

export function useShortcuts({ 
  dataPath,
  insertText, 
  openSceneModal, 
  addNewPage, 
  toggleRightSidebar, 
  toggleLeftSidebar, 
  openCharPicker, 
  triggerImageUpload, 
  confirmClearPage 
}) {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      if (dataPath && fs && path) {
         const settingsDir = path.join(dataPath, 'settings');
         const settingsFile = path.join(settingsDir, 'settings.json');
         if (fs.existsSync(settingsFile)) {
           const content = fs.readFileSync(settingsFile, 'utf-8');
           const parsed = JSON.parse(content);
           return parsed.shortcuts 
             ? { ...DEFAULT_SHORTCUTS, ...parsed.shortcuts } 
             : { ...DEFAULT_SHORTCUTS, ...parsed };
         }
      }
      const saved = localStorage.getItem('trpg_shortcuts');
      return saved ? { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) } : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });

  const shortcutsRef = useRef(shortcuts);
  useEffect(() => { shortcutsRef.current = shortcuts; }, [shortcuts]);

  useEffect(() => {
    if (dataPath && fs && path) {
      try {
         if (!fs.existsSync(dataPath)) {
           fs.mkdirSync(dataPath, { recursive: true });
         }
         const settingsDir = path.join(dataPath, 'settings');
         if (!fs.existsSync(settingsDir)) {
           fs.mkdirSync(settingsDir, { recursive: true });
         }
         const settingsFile = path.join(settingsDir, 'settings.json');
         
         const dataToSave = { shortcuts };
         fs.writeFileSync(settingsFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      } catch (e) {
         console.error("Failed to save settings:", e);
         localStorage.setItem('trpg_shortcuts_emergency_backup', JSON.stringify(shortcuts));
      }
    } else {
      localStorage.setItem('trpg_shortcuts', JSON.stringify(shortcuts));
    }
  }, [shortcuts, dataPath]);

  const isShortcutMatch = (e, shortcut) => {
    if (!shortcut) return false;
    const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatch = (e.ctrlKey || e.metaKey) === shortcut.ctrl;
    const shiftMatch = e.shiftKey === shortcut.shift;
    const altMatch = e.altKey === shortcut.alt;
    return keyMatch && ctrlMatch && shiftMatch && altMatch;
  };

  const getShortcutLabel = useCallback((shortcutId) => {
    const s = shortcutsRef.current[shortcutId];
    if (!s) return '';
    let parts = [];
    if (s.ctrl) parts.push('Ctrl');
    if (s.shift) parts.push('Shift');
    if (s.alt) parts.push('Alt');
    parts.push(s.key.toUpperCase());
    return `${s.label} (${parts.join('+')})`;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore inputs except when needed (logic handled by caller usually, but safe to check here)
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          // If we want shortcuts to work in textarea (like Bold), we allow it.
          // But generally, global shortcuts shouldn't trigger if typing in a field unless it's a specific formatting shortcut.
          // We'll let the specific handlers inside insertText handle focus, but we need to prevent default if matched.
      }
      // Note: The caller (TRPGEditor) usually has logic to skip if modals are open. 
      // We will assume the caller manages the "should execute" state or we pass "isEnabled" prop.
      // For now, we'll keep the logic simple matching the original implementation which checked specifics in the handler.
      
      // Since we moved logic out, we might need 'isEnabled' check.
      // Let's rely on the fact that if a modal is open, this hook still runs.
      // The original code had explicit checks: `if (showCharPicker) return;` etc.
      // We'll add an `ignoreCondition` function prop.
    };
    // The actual event listener is better attached in the main component to share context (modals open etc),
    // OR we pass all "isModalOpen" flags here.
    // Given the complexity, let's just return the `handleKeyDown` logic or `shortcuts` and let the component attach the listener.
    // Wait, reusing `isShortcutMatch` is key.
  }, []);

  return {
    shortcuts,
    setShortcuts,
    shortcutsRef,
    isShortcutMatch,
    getShortcutLabel
  };
}

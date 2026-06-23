import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;
const LOCAL_STORAGE_KEY = 'trpg_shortcuts';
const EMERGENCY_BACKUP_KEY = 'trpg_shortcuts_emergency_backup';

const mergeShortcuts = (loadedShortcuts) => ({ ...DEFAULT_SHORTCUTS, ...loadedShortcuts });
const getSettingsFilePath = (targetDataPath) => path.join(targetDataPath, 'settings', 'settings.json');

export function useShortcuts({ dataPath }) {
  const loadShortcuts = useCallback((targetDataPath) => {
    try {
      if (targetDataPath && fs && path) {
         const settingsFile = getSettingsFilePath(targetDataPath);
         if (fs.existsSync(settingsFile)) {
           const content = fs.readFileSync(settingsFile, 'utf-8');
           const parsed = JSON.parse(content);
           return mergeShortcuts(parsed.shortcuts || parsed);
         }
      }
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? mergeShortcuts(JSON.parse(saved)) : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  }, []);

  const [shortcuts, setShortcuts] = useState(() => loadShortcuts(dataPath));

  const shortcutsRef = useRef(shortcuts);
  const hydratedDataPathRef = useRef(dataPath);
  const isHydratingRef = useRef(false);
  useEffect(() => { shortcutsRef.current = shortcuts; }, [shortcuts]);

  useEffect(() => {
    if (hydratedDataPathRef.current === dataPath) return;
    hydratedDataPathRef.current = dataPath;
    isHydratingRef.current = true;
    setShortcuts(loadShortcuts(dataPath));
  }, [dataPath, loadShortcuts]);

  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }

    if (dataPath && fs && path) {
      try {
         if (!fs.existsSync(dataPath)) {
           fs.mkdirSync(dataPath, { recursive: true });
         }
         const settingsDir = path.join(dataPath, 'settings');
         if (!fs.existsSync(settingsDir)) {
           fs.mkdirSync(settingsDir, { recursive: true });
         }
         const settingsFile = getSettingsFilePath(dataPath);
         fs.writeFileSync(settingsFile, JSON.stringify({ shortcuts }, null, 2), 'utf-8');
      } catch (e) {
         console.error("Failed to save settings:", e);
         localStorage.setItem(EMERGENCY_BACKUP_KEY, JSON.stringify(shortcuts));
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(shortcuts));
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
    const parts = [];
    if (s.ctrl) parts.push('Ctrl');
    if (s.shift) parts.push('Shift');
    if (s.alt) parts.push('Alt');
    parts.push(s.key.toUpperCase());
    return `${s.label} (${parts.join('+')})`;
  }, []);

  return {
    shortcuts,
    setShortcuts,
    shortcutsRef,
    isShortcutMatch,
    getShortcutLabel
  };
}

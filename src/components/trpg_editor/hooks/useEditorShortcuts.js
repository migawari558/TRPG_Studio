import { useEffect } from 'react';

export function useEditorShortcuts({
  shortcuts,
  isShortcutMatch,
  showCharPicker,
  showSceneModal,
  showAddPageModal,
  showDeleteModal,
  executeDeleteAction,
  insertText,
  openSceneModal,
  openAddPageModal,
  toggleNpcSidebar,
  togglePageSidebar,
  openCharPicker,
  triggerImageUpload,
  openSearch,
  openReplace,
  confirmClearPage,
}) {
  useEffect(() => {
    const shortcutActions = [
      [shortcuts.bold, () => insertText('**', '**')],
      [shortcuts.heading, () => insertText('## ')],
      [shortcuts.strikethrough, () => insertText('~~', '~~')],
      [shortcuts.info, () => insertText('> [タイトル] ')],
      [shortcuts.supplement, () => insertText('||', '||')],
      [shortcuts.sceneAdd, openSceneModal],
      [shortcuts.pageAdd, openAddPageModal],
      [shortcuts.npcList, toggleNpcSidebar],
      [shortcuts.pageList, togglePageSidebar],
      [shortcuts.dialogue, openCharPicker],
      [shortcuts.image, triggerImageUpload],
      [shortcuts.search, openSearch],
      [shortcuts.replace, openReplace],
      [shortcuts.clear, confirmClearPage],
    ];

    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT') return;
      if (showCharPicker || showSceneModal || showAddPageModal) return;

      if (showDeleteModal) {
        if (event.key === 'Enter') {
          event.preventDefault();
          executeDeleteAction();
        }
        return;
      }

      const matchedAction = shortcutActions.find(([shortcut]) => isShortcutMatch(event, shortcut));
      if (!matchedAction) return;

      event.preventDefault();
      matchedAction[1]();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    confirmClearPage,
    executeDeleteAction,
    insertText,
    isShortcutMatch,
    openAddPageModal,
    openCharPicker,
    openReplace,
    openSceneModal,
    openSearch,
    showAddPageModal,
    showCharPicker,
    showDeleteModal,
    showSceneModal,
    shortcuts,
    toggleNpcSidebar,
    togglePageSidebar,
    triggerImageUpload,
  ]);
}

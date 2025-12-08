import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditorHeader } from './EditorHeader';
import { PageSidebar } from './PageSidebar';
import { EditorToolbar } from './EditorToolbar';
import { EditorArea } from './EditorArea';
import { NpcSidebar } from './NpcSidebar';
import { CharacterPicker } from './CharacterPicker';
import { SceneModal } from './modals/SceneModal';
import { SettingsModal } from './modals/SettingsModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

// Hooks
import { useEditorState } from './hooks/useEditorState';
import { useAutoSave } from './hooks/useAutoSave';
import { useShortcuts } from './hooks/useShortcuts';
import { useExporter } from './hooks/useExporter';
import { useEditorManipulation } from './hooks/useEditorManipulation';

export function TRPGEditor({ scenario, onSave, onBack, isDarkMode, toggleTheme }) {
  // --- Refs (UI) ---
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- State & Logic Hooks ---
  const { 
    pages, setPages, 
    activePageId, setActivePageId, 
    characters, setCharacters, 
    images, setImages, 
    pagesRef, charactersRef, imagesRef, activePageIdRef,
    activePage, updatePageContent, updatePageTitle, 
    addNewPage, deletePage, clearPage, 
    addCharacter, removeCharacter
  } = useEditorState(scenario);

  const { 
    saveStatus, 
    requestImmediateSave, 
    updateScenarioTitle 
  } = useAutoSave({ 
    pages, characters, images, 
    pagesRef, charactersRef, imagesRef, 
    onSave 
  });

  const { 
    handleDownloadMd, 
    handleDownloadPageHtml, 
    handleDownloadScenarioHtml 
  } = useExporter({ 
    scenarioTitle: scenario.title, 
    pagesRef, imagesRef, activePageIdRef 
  });

  const { 
    insertText, 
    handleTextareaKeyDown, 
    handleImageUpload, 
    triggerImageUpload 
  } = useEditorManipulation({
    textareaRef, fileInputRef, activePageIdRef, 
    updatePageContent, setImages 
  });

  const { 
    shortcuts, setShortcuts, isShortcutMatch, getShortcutLabel 
  } = useShortcuts({});

  // --- UI State ---
  const [viewMode, setViewMode] = useState('split'); 
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  
  // --- Modals State ---
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  // --- Helpers & Handlers ---
  
  const handleBack = useCallback(() => {
    requestImmediateSave();
    onBack();
  }, [requestImmediateSave, onBack]);

  const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
  const handleSetViewMode = useCallback((mode) => setViewMode(mode), []);
  const handleInsertCharacter = useCallback((name) => insertText(`[${name}] `), [insertText]);
  const handleOpenSceneModal = useCallback(() => setShowSceneModal(true), []);
  const handleOpenCharPicker = useCallback(() => setShowCharPicker(true), []);
  const handleOpenSettings = useCallback(() => setShowSettingsModal(true), []);

  // --- Deletion Handlers ---
  const confirmDeletePage = useCallback((id) => {
    if (pagesRef.current.length <= 1) return;
    setDeleteTarget({ type: 'page', id });
    setShowDeleteModal(true);
  }, [pagesRef]);

  const confirmRemoveCharacter = useCallback((name) => {
    setDeleteTarget({ type: 'npc', name });
    setShowDeleteModal(true);
  }, []);

  const confirmClearPage = useCallback(() => {
    setDeleteTarget({ type: 'clear' });
    setShowDeleteModal(true);
  }, []);

  const executeDeleteAction = useCallback(() => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'npc') removeCharacter(deleteTarget.name);
    else if (deleteTarget.type === 'page') deletePage(deleteTarget.id);
    else if (deleteTarget.type === 'clear') clearPage();

    setShowDeleteModal(false);
    setDeleteTarget(null);
  }, [deleteTarget, removeCharacter, deletePage, clearPage]);

  // --- Keyboard Shortcuts Listener ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (showCharPicker || showSceneModal) return; 
      if (showDeleteModal) {
         if (e.key === 'Enter') {
             e.preventDefault();
             executeDeleteAction();
         }
         return;
      }
      
      if (isShortcutMatch(e, shortcuts.bold)) { e.preventDefault(); insertText('**', '**'); return; }
      if (isShortcutMatch(e, shortcuts.heading)) { e.preventDefault(); insertText('## '); return; }
      if (isShortcutMatch(e, shortcuts.strikethrough)) { e.preventDefault(); insertText('~~', '~~'); return; }
      if (isShortcutMatch(e, shortcuts.info)) { e.preventDefault(); insertText('> [タイトル] '); return; }
      if (isShortcutMatch(e, shortcuts.supplement)) { e.preventDefault(); insertText('||', '||'); return; }
      if (isShortcutMatch(e, shortcuts.sceneAdd)) { e.preventDefault(); setShowSceneModal(true); return; }
      if (isShortcutMatch(e, shortcuts.pageAdd)) { e.preventDefault(); addNewPage(); return; }
      if (isShortcutMatch(e, shortcuts.npcList)) { e.preventDefault(); setShowRightSidebar(prev => !prev); return; }
      if (isShortcutMatch(e, shortcuts.pageList)) { e.preventDefault(); setShowLeftSidebar(prev => !prev); return; }
      if (isShortcutMatch(e, shortcuts.dialogue)) { e.preventDefault(); setShowCharPicker(true); return; }
      if (isShortcutMatch(e, shortcuts.image)) { e.preventDefault(); triggerImageUpload(); return; }
      if (isShortcutMatch(e, shortcuts.clear)) { e.preventDefault(); confirmClearPage(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, showCharPicker, showSceneModal, showDeleteModal, executeDeleteAction, addNewPage, insertText, triggerImageUpload, confirmClearPage, isShortcutMatch]);

  // --- Scroll Sync ---
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
    let ratio = totalLines > 1 ? (currentLine - 1) / (totalLines - 1) : cursorPosition / (text.length || 1);
    const maxScroll = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = maxScroll * ratio;
  }, []);

  useEffect(() => {
      const timer = setTimeout(syncPreview, 0);
      return () => clearTimeout(timer);
  }, [pages, activePageId, syncPreview]);

  return (
    <div className={`h-screen w-full flex flex-col ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} transition-colors duration-300 text-sm`}> 
      
      <EditorHeader 
        scenarioTitle={scenario.title}
        onTitleChange={updateScenarioTitle}
        onBack={handleBack}
        saveStatus={saveStatus}
        isDarkMode={isDarkMode}
        toggleTheme={handleToggleTheme}
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        showLeftSidebar={showLeftSidebar}
        setShowLeftSidebar={setShowLeftSidebar}
        showRightSidebar={showRightSidebar}
        setShowRightSidebar={setShowRightSidebar}
        onOpenSettings={handleOpenSettings}
        onDownloadMd={handleDownloadMd}
        onDownloadPageHtml={handleDownloadPageHtml}
        onDownloadScenarioHtml={handleDownloadScenarioHtml}
        getShortcutLabel={getShortcutLabel}
      />

      <div className="flex-grow flex overflow-hidden relative">
        <PageSidebar 
          isOpen={showLeftSidebar}
          pages={pages}
          activePageId={activePageId}
          onPageSelect={setActivePageId}
          onAddPage={addNewPage}
          onDeletePage={confirmDeletePage}
          getShortcutLabel={getShortcutLabel}
        />

        <div className="flex-grow flex flex-col overflow-hidden bg-white dark:bg-gray-900 relative">
          <EditorToolbar 
            activePageTitle={activePage.title}
            onTitleChange={updatePageTitle}
            onInsertText={insertText}
            onOpenSceneModal={handleOpenSceneModal}
            onOpenCharPicker={handleOpenCharPicker}
            onTriggerImageUpload={triggerImageUpload}
            onClearPage={confirmClearPage}
            getShortcutLabel={getShortcutLabel}
            isDarkMode={isDarkMode}
          />

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          <div className="flex-grow flex h-full overflow-hidden relative">
            <CharacterPicker 
              isOpen={showCharPicker}
              onClose={() => setShowCharPicker(false)}
              characters={characters}
              onSelect={handleInsertCharacter}
              isDarkMode={isDarkMode}
            />

            <EditorArea 
              viewMode={viewMode}
              title={activePage.title}
              content={activePage.content}
              onChange={updatePageContent}
              images={images}
              textareaRef={textareaRef}
              previewRef={previewRef}
              onSyncPreview={syncPreview}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>
        </div>

        <NpcSidebar 
          isOpen={showRightSidebar}
          onClose={() => setShowRightSidebar(false)}
          characters={characters}
          onAddCharacter={addCharacter}
          onInsertCharacter={handleInsertCharacter}
          onDeleteCharacter={confirmRemoveCharacter}
        />
      </div>

      {/* Modals */}
      <SceneModal 
        isOpen={showSceneModal}
        onClose={() => setShowSceneModal(false)}
        onInsert={insertText}
        characters={characters}
        onAddCharacter={addCharacter}
        isDarkMode={isDarkMode}
      />
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        shortcuts={shortcuts}
        setShortcuts={setShortcuts}
        isDarkMode={isDarkMode}
      />
      <ConfirmationModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={executeDeleteAction}
        type="delete"
        title={deleteTarget?.type === 'npc' ? 'NPCを削除しますか？' : 
               deleteTarget?.type === 'page' ? 'ページを削除しますか？' : 
               deleteTarget?.type === 'clear' ? '内容をクリアしますか？' : '削除確認'}
        message={deleteTarget?.type === 'npc' ? `「${deleteTarget.name}」をリストから削除します。` : 'この操作は取り消せません。'}
        confirmText="実行する"
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

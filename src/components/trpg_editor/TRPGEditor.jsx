import React, { useRef, useCallback, useDeferredValue } from 'react';
import { EditorHeader } from './EditorHeader';
import { PageSidebar } from './PageSidebar';
import { NpcSidebar } from './NpcSidebar';
import { EditorWorkspace } from './EditorWorkspace';
import { EditorEmptyState } from './EditorEmptyState';
import { EditorModals } from './EditorModals';

// Hooks
import { useEditorState } from './hooks/useEditorState';
import { useAutoSave } from './hooks/useAutoSave';
import { useShortcuts } from './hooks/useShortcuts';
import { useExporter } from './hooks/useExporter';
import { useEditorManipulation } from './hooks/useEditorManipulation';
import { useDeleteConfirmation } from './hooks/useDeleteConfirmation';
import { usePreviewSync } from './hooks/usePreviewSync';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { useEditorUiState } from './hooks/useEditorUiState';

export function TRPGEditor({ 
  scenario, onSave, onBack, isDarkMode, toggleTheme, 
  appTheme, setAppTheme,
  colorMode, setColorMode,
  dataPath, setDataPath,
  editorFontFamily, setEditorFontFamily,
  editorFontSize, setEditorFontSize
}) {
  const isSimpleTheme = appTheme === 'simple';
  // --- Refs (UI) ---
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- State & Logic Hooks ---
  const { 
    pages,
    activePageId, setActivePageId, 
    characters,
    images, setImages,
    pagesRef, charactersRef, imagesRef, activePageIdRef,
    activePage, updatePageContent, updatePageTitle, 
    addNewPage, deletePage, clearPage, reorderPages,
    addCharacter, removeCharacter, renameCharacter
  } = useEditorState(scenario);
  const deferredActivePageContent = useDeferredValue(activePage?.content || '');

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
  } = useShortcuts({ dataPath });

  const {
    viewMode,
    showLeftSidebar,
    setShowLeftSidebar,
    showRightSidebar,
    setShowRightSidebar,
    showCharPicker,
    setShowCharPicker,
    showSearchWidget,
    setShowSearchWidget,
    showSceneModal,
    setShowSceneModal,
    showSettingsModal,
    setShowSettingsModal,
    showAddPageModal,
    setShowAddPageModal,
    newPageTitle,
    setNewPageTitle,
    handleToggleTheme,
    handleSetViewMode,
    handleOpenSceneModal,
    handleOpenCharPicker,
    handleOpenSettings,
    toggleNpcSidebar,
    togglePageSidebar,
    openSearch,
    openReplace,
    handleOpenAddPageModal,
    executeAddPage,
  } = useEditorUiState({ addNewPage, toggleTheme });

  // --- Helpers & Handlers ---
  
  const handleBack = useCallback(() => {
    requestImmediateSave();
    onBack();
  }, [requestImmediateSave, onBack]);

  const handleInsertCharacter = useCallback((name) => insertText(`[${name}] `), [insertText]);

  const {
    showDeleteModal,
    confirmDeletePage,
    confirmRemoveCharacter,
    confirmClearPage,
    closeDeleteModal,
    executeDeleteAction,
    deleteModalTitle,
    deleteModalMessage,
  } = useDeleteConfirmation({ removeCharacter, deletePage, clearPage });

  const { syncPreview, handleHeadingClick } = usePreviewSync({
    textareaRef,
    previewRef,
    activePageIdRef,
    setActivePageId,
    pages,
    activePageId,
  });

  useEditorShortcuts({
    shortcuts,
    isShortcutMatch,
    showCharPicker,
    showSceneModal,
    showAddPageModal,
    showDeleteModal,
    executeDeleteAction,
    insertText,
    openSceneModal: handleOpenSceneModal,
    openAddPageModal: handleOpenAddPageModal,
    toggleNpcSidebar,
    togglePageSidebar,
    openCharPicker: handleOpenCharPicker,
    triggerImageUpload,
    openSearch,
    openReplace,
    confirmClearPage,
  });

  return (
    <div className={`h-screen w-full flex flex-col ${isDarkMode ? 'dark text-gray-100' : 'text-gray-900'} ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950' : 'bg-stone-100') : ''} transition-colors duration-300 text-sm`}>
      
      <EditorHeader 
        scenarioTitle={scenario.title}
          onTitleChange={updateScenarioTitle}
          onBack={handleBack}
          saveStatus={saveStatus}
          appTheme={appTheme}
          isDarkMode={isDarkMode}
        toggleTheme={handleToggleTheme}
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        showLeftSidebar={showLeftSidebar}
        setShowLeftSidebar={setShowLeftSidebar}
        onOpenSettings={handleOpenSettings}
        onDownloadMd={handleDownloadMd}
        onDownloadPageHtml={handleDownloadPageHtml}
        onDownloadScenarioHtml={handleDownloadScenarioHtml}
        onClearPage={confirmClearPage}
        getShortcutLabel={getShortcutLabel}
      />

      <div className="flex-grow flex overflow-hidden relative">
        <PageSidebar 
          isOpen={showLeftSidebar}
          pages={pages}
          activePageId={activePageId}
          activePageOutlineContent={deferredActivePageContent}
          onPageSelect={setActivePageId}
          onAddPage={handleOpenAddPageModal}
          onDeletePage={confirmDeletePage}
          onReorderPages={reorderPages}
          onHeadingClick={handleHeadingClick}
          getShortcutLabel={getShortcutLabel}
          appTheme={appTheme}
          isDarkMode={isDarkMode}
        />

        <div className="flex-grow flex flex-col overflow-hidden relative">
          {activePage ? (
            <EditorWorkspace
              activePage={activePage}
              characters={characters}
              editorFontFamily={editorFontFamily}
              editorFontSize={editorFontSize}
              fileInputRef={fileInputRef}
              getShortcutLabel={getShortcutLabel}
              handleImageUpload={handleImageUpload}
              handleInsertCharacter={handleInsertCharacter}
              handleOpenCharPicker={handleOpenCharPicker}
              handleOpenSceneModal={handleOpenSceneModal}
              images={images}
              insertText={insertText}
              appTheme={appTheme}
              isDarkMode={isDarkMode}
              onKeyDown={handleTextareaKeyDown}
              onSyncPreview={syncPreview}
              previewRef={previewRef}
              setShowCharPicker={setShowCharPicker}
              setShowSearchWidget={setShowSearchWidget}
              showCharPicker={showCharPicker}
              showSearchWidget={showSearchWidget}
              textareaRef={textareaRef}
              toggleNpcSidebar={toggleNpcSidebar}
              triggerImageUpload={triggerImageUpload}
              updatePageContent={updatePageContent}
              updatePageTitle={updatePageTitle}
              viewMode={viewMode}
            />
          ) : (
            <EditorEmptyState isDarkMode={isDarkMode} onAddPage={handleOpenAddPageModal} />
          )}
        </div>

        <NpcSidebar 
          isOpen={showRightSidebar}
          onClose={() => setShowRightSidebar(false)}
          characters={characters}
          onAddCharacter={addCharacter}
          onRenameCharacter={renameCharacter}
          onDeleteCharacter={confirmRemoveCharacter}
          appTheme={appTheme}
          isDarkMode={isDarkMode}
        />
      </div>

      <EditorModals
        addPageModal={{
          isOpen: showAddPageModal,
          onClose: () => setShowAddPageModal(false),
          onConfirm: executeAddPage,
          value: newPageTitle,
          onChange: setNewPageTitle,
        }}
        characters={characters}
        dataPath={dataPath}
        appTheme={appTheme}
        colorMode={colorMode}
        deleteModal={{
          isOpen: showDeleteModal,
          onClose: closeDeleteModal,
          onConfirm: executeDeleteAction,
          title: deleteModalTitle,
          message: deleteModalMessage,
        }}
        editorFontFamily={editorFontFamily}
        editorFontSize={editorFontSize}
        isDarkMode={isDarkMode}
        sceneModal={{
          isOpen: showSceneModal,
          onClose: () => setShowSceneModal(false),
        }}
        settingsModal={{
          isOpen: showSettingsModal,
          onClose: () => setShowSettingsModal(false),
        }}
        setAppTheme={setAppTheme}
        setColorMode={setColorMode}
        setDataPath={setDataPath}
        setEditorFontFamily={setEditorFontFamily}
        setEditorFontSize={setEditorFontSize}
        shortcuts={shortcuts}
        onAddCharacter={addCharacter}
        onInsertText={insertText}
        setShortcuts={setShortcuts}
      />
    </div>
  );
}

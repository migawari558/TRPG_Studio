import React from 'react';
import { CharacterPicker } from './CharacterPicker';
import { EditorArea } from './EditorArea';
import { EditorToolbar } from './EditorToolbar';

export function EditorWorkspace({
  activePage,
  appTheme,
  characters,
  editorFontFamily,
  editorFontSize,
  fileInputRef,
  getShortcutLabel,
  handleImageUpload,
  handleInsertCharacter,
  handleOpenCharPicker,
  handleOpenSceneModal,
  images,
  insertText,
  isDarkMode,
  onKeyDown,
  onSyncPreview,
  previewRef,
  setShowCharPicker,
  setShowSearchWidget,
  showCharPicker,
  showSearchWidget,
  textareaRef,
  toggleNpcSidebar,
  triggerImageUpload,
  updatePageContent,
  updatePageTitle,
  viewMode,
}) {
  return (
    <>
      <EditorToolbar
        activePageTitle={activePage.title}
        onTitleChange={updatePageTitle}
        onInsertText={insertText}
        onOpenSceneModal={handleOpenSceneModal}
        onOpenCharPicker={handleOpenCharPicker}
        onTriggerImageUpload={triggerImageUpload}
        onToggleNpcList={toggleNpcSidebar}
        onToggleSearch={setShowSearchWidget}
        getShortcutLabel={getShortcutLabel}
        appTheme={appTheme}
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
          onSyncPreview={onSyncPreview}
          onKeyDown={onKeyDown}
          editorFontFamily={editorFontFamily}
          editorFontSize={editorFontSize}
          appTheme={appTheme}
          isDarkMode={isDarkMode}
          showSearchWidget={showSearchWidget}
          setShowSearchWidget={setShowSearchWidget}
        />
      </div>
    </>
  );
}

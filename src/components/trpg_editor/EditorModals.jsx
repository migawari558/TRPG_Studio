import React, { Suspense, lazy } from 'react';
import { FileText } from 'lucide-react';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { PromptModal } from '../modals/PromptModal';

const SceneModal = lazy(() => import('./modals/SceneModal').then((module) => ({ default: module.SceneModal })));
const SettingsModal = lazy(() => import('./modals/SettingsModal').then((module) => ({ default: module.SettingsModal })));

export function EditorModals({
  addPageModal,
  appTheme,
  characters,
  colorMode,
  dataPath,
  deleteModal,
  editorFontFamily,
  editorFontSize,
  isDarkMode,
  sceneModal,
  settingsModal,
  setAppTheme,
  setColorMode,
  setDataPath,
  setEditorFontFamily,
  setEditorFontSize,
  shortcuts,
  onAddCharacter,
  onInsertText,
  setShortcuts,
}) {
  return (
    <>
      <Suspense fallback={null}>
        {sceneModal.isOpen && (
          <SceneModal
            isOpen={sceneModal.isOpen}
            onClose={sceneModal.onClose}
            onInsert={onInsertText}
            characters={characters}
            onAddCharacter={onAddCharacter}
            isDarkMode={isDarkMode}
          />
        )}
        {settingsModal.isOpen && (
          <SettingsModal
            isOpen={settingsModal.isOpen}
            onClose={settingsModal.onClose}
            shortcuts={shortcuts}
            setShortcuts={setShortcuts}
            isDarkMode={isDarkMode}
            appTheme={appTheme}
            setAppTheme={setAppTheme}
            colorMode={colorMode}
            setColorMode={setColorMode}
            dataPath={dataPath}
            setDataPath={setDataPath}
            editorFontFamily={editorFontFamily}
            setEditorFontFamily={setEditorFontFamily}
            editorFontSize={editorFontSize}
            setEditorFontSize={setEditorFontSize}
          />
        )}
      </Suspense>
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.onClose}
        onConfirm={deleteModal.onConfirm}
        type="delete"
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText="実行する"
        isDarkMode={isDarkMode}
      />
      <PromptModal
        isOpen={addPageModal.isOpen}
        onClose={addPageModal.onClose}
        onConfirm={addPageModal.onConfirm}
        title="新規ページの追加"
        placeholder="ページ名を入力..."
        value={addPageModal.value}
        onChange={addPageModal.onChange}
        confirmText="追加する"
        Icon={FileText}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

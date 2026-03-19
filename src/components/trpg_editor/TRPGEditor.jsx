import React, { useState, useRef, useCallback, useEffect } from 'react';
import { EditorHeader } from './EditorHeader';
import { PageSidebar } from './PageSidebar';
import { EditorToolbar } from './EditorToolbar';
import { EditorArea } from './EditorArea';
import { NpcSidebar } from './NpcSidebar';
import { CharacterPicker } from './CharacterPicker';
import { SceneModal } from './modals/SceneModal';
import { SettingsModal } from './modals/SettingsModal';
import { ConfirmationModal } from '../modals/ConfirmationModal';
import { PromptModal } from '../modals/PromptModal';
import { FileText, Plus } from 'lucide-react';

// Hooks
import { useEditorState } from './hooks/useEditorState';
import { useAutoSave } from './hooks/useAutoSave';
import { useShortcuts } from './hooks/useShortcuts';
import { useExporter } from './hooks/useExporter';
import { useEditorManipulation } from './hooks/useEditorManipulation';

export function TRPGEditor({ 
  scenario, onSave, onBack, isDarkMode, toggleTheme, 
  dataPath, setDataPath,
  editorFontFamily, setEditorFontFamily,
  editorFontSize, setEditorFontSize
}) {
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
    addNewPage, deletePage, clearPage, reorderPages,
    addCharacter, removeCharacter, renameCharacter
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
  } = useShortcuts({ dataPath });

  // --- UI State ---
  const [viewMode, setViewMode] = useState('split'); 
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [showSearchWidget, setShowSearchWidget] = useState(null); // 'search' | 'replace' | null
  
  // --- Modals State ---
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

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

  const handleOpenAddPageModal = useCallback(() => {
    setNewPageTitle('');
    setShowAddPageModal(true);
  }, []);

  const executeAddPage = useCallback(() => {
    if (newPageTitle.trim()) {
      addNewPage(newPageTitle.trim());
      setShowAddPageModal(false);
    }
  }, [newPageTitle, addNewPage]);

  // --- Deletion Handlers ---
  const confirmDeletePage = useCallback((id) => {
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
      if (showCharPicker || showSceneModal || showAddPageModal) return; 
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
      if (isShortcutMatch(e, shortcuts.pageAdd)) { e.preventDefault(); handleOpenAddPageModal(); return; }
      if (isShortcutMatch(e, shortcuts.npcList)) { e.preventDefault(); setShowRightSidebar(prev => !prev); return; }
      if (isShortcutMatch(e, shortcuts.pageList)) { e.preventDefault(); setShowLeftSidebar(prev => !prev); return; }
      if (isShortcutMatch(e, shortcuts.dialogue)) { e.preventDefault(); setShowCharPicker(true); return; }
      if (isShortcutMatch(e, shortcuts.search)) { e.preventDefault(); setShowSearchWidget('search'); return; }
      if (isShortcutMatch(e, shortcuts.replace)) { e.preventDefault(); setShowSearchWidget('replace'); return; }
      if (isShortcutMatch(e, shortcuts.clear)) { e.preventDefault(); confirmClearPage(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, showCharPicker, showSceneModal, showDeleteModal, showAddPageModal, executeDeleteAction, handleOpenAddPageModal, insertText, triggerImageUpload, confirmClearPage, isShortcutMatch]);

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
    const maxScroll = Math.max(0, preview.scrollHeight - preview.clientHeight);
    preview.scrollTop = maxScroll * ratio;
  }, []);

  const handleHeadingClick = useCallback((pageId, headingText) => {
    if (pageId !== activePageIdRef.current) {
      setActivePageId(pageId);
    }
    
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const text = textarea.value;
      const lines = text.split('\n');
      let targetLineIndex = -1;
      let charIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^(#{1,2})\s+(.+)$/);
        if (match && match[2].trim() === headingText) {
          targetLineIndex = i;
          break;
        }
        charIndex += lines[i].length + 1; // +1 for newline
      }
      
      if (targetLineIndex !== -1) {
        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);
        
        // 計算で算出した行の高さを使ってテキストエリアをスクロール
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10) || 24;
        textarea.scrollTop = Math.max(0, targetLineIndex * lineHeight - textarea.clientHeight / 4);
        
        // プレビュー画面のスクロールも同期
        syncPreview();
      }
    }, 50);
  }, [setActivePageId, syncPreview, activePageIdRef]);

  useEffect(() => {
      const timer = setTimeout(syncPreview, 0);
      return () => clearTimeout(timer);
  }, [pages, activePageId, syncPreview]);

  return (
    <div className={`h-screen w-full flex flex-col ${isDarkMode ? 'dark text-gray-100' : 'text-gray-900'} transition-colors duration-300 text-sm`}>
      
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
          onPageSelect={setActivePageId}
          onAddPage={handleOpenAddPageModal}
          onDeletePage={confirmDeletePage}
          onReorderPages={reorderPages}
          onHeadingClick={handleHeadingClick}
          getShortcutLabel={getShortcutLabel}
          isDarkMode={isDarkMode}
        />

        <div className="flex-grow flex flex-col overflow-hidden relative">
          {activePage ? (
            <>
              <EditorToolbar 
                activePageTitle={activePage.title}
                onTitleChange={updatePageTitle}
                onInsertText={insertText}
                onOpenSceneModal={handleOpenSceneModal}
                onOpenCharPicker={handleOpenCharPicker}
                onTriggerImageUpload={triggerImageUpload}
                onToggleNpcList={() => setShowRightSidebar(!showRightSidebar)}
                onToggleSearch={setShowSearchWidget}
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
                  editorFontFamily={editorFontFamily}
                  editorFontSize={editorFontSize}
                  isDarkMode={isDarkMode}
                  showSearchWidget={showSearchWidget}
                  setShowSearchWidget={setShowSearchWidget}
                />
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-md border shadow-lg ${isDarkMode ? 'bg-gray-800/40 border-white/10' : 'bg-white/40 border-white/40'}`}>
                <FileText size={24} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <h3 className="text-lg font-bold mb-2">ページがありません</h3>
              <p className="text-sm max-w-sm leading-relaxed mb-6 opacity-70">
                シナリオには現在ページが存在しません。<br/>
                左のサイドバー、または下のボタンから最初のページを追加して執筆を始めてください。
              </p>
              <button 
                onClick={handleOpenAddPageModal}
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl backdrop-blur-md transition-all shadow-lg active:scale-95 font-bold ${isDarkMode ? 'bg-indigo-600/80 hover:bg-indigo-500/90 border border-white/10' : 'bg-indigo-600/90 hover:bg-indigo-500 border border-white/20'}`}
              >
                <Plus size={16} />
                <span>最初のページを作成</span>
              </button>
            </div>
          )}
        </div>

        <NpcSidebar 
          isOpen={showRightSidebar}
          onClose={() => setShowRightSidebar(false)}
          characters={characters}
          onAddCharacter={addCharacter}
          onRenameCharacter={renameCharacter}
          onDeleteCharacter={confirmRemoveCharacter}
          isDarkMode={isDarkMode}
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
        dataPath={dataPath}
        setDataPath={setDataPath}
        editorFontFamily={editorFontFamily}
        setEditorFontFamily={setEditorFontFamily}
        editorFontSize={editorFontSize}
        setEditorFontSize={setEditorFontSize}
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

      <PromptModal 
        isOpen={showAddPageModal}
        onClose={() => setShowAddPageModal(false)}
        onConfirm={executeAddPage}
        title="新規ページの追加"
        placeholder="ページ名を入力..."
        value={newPageTitle}
        onChange={setNewPageTitle}
        confirmText="追加する"
        Icon={FileText}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseMarkdown } from '../../utils/markdownParser';
import { DEFAULT_SHORTCUTS } from '../../constants/shortcuts';
import { EditorHeader } from './EditorHeader';
import { PageSidebar } from './PageSidebar';
import { EditorToolbar } from './EditorToolbar';
import { EditorArea } from './EditorArea';
import { NpcSidebar } from './NpcSidebar';
import { CharacterPicker } from './CharacterPicker';
import { SceneModal } from './modals/SceneModal';
import { SettingsModal } from './modals/SettingsModal';
import { ConfirmationModal } from './modals/ConfirmationModal';

export function TRPGEditor({ scenario, onSave, onBack, isDarkMode, toggleTheme }) {
  // State: Content
  const [pages, setPages] = useState(scenario.pages);
  const [activePageId, setActivePageId] = useState(scenario.pages[0]?.id);
  const [characters, setCharacters] = useState(scenario.characters);
  const [images, setImages] = useState(scenario.images || {});
  
  // Refs for State (to stabilize callbacks)
  const pagesRef = useRef(pages);
  const charactersRef = useRef(characters);
  const imagesRef = useRef(images);
  const activePageIdRef = useRef(activePageId);

  // Sync Refs with State
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { charactersRef.current = characters; }, [characters]);
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => { activePageIdRef.current = activePageId; }, [activePageId]);

  // State: UI
  const [viewMode, setViewMode] = useState('split'); 
  const [saveStatus, setSaveStatus] = useState('保存済み');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);

  // State: Modals
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); 

  // State: Shortcuts
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem('trpg_shortcuts');
      return saved ? { ...DEFAULT_SHORTCUTS, ...JSON.parse(saved) } : DEFAULT_SHORTCUTS;
    } catch {
      return DEFAULT_SHORTCUTS;
    }
  });
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => { shortcutsRef.current = shortcuts; }, [shortcuts]);

  // Refs
  const textareaRef = useRef(null);
  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Ref for tracking immediate save request
  const immediateSaveRequested = useRef(false);

  // --- Auto-save (Debounce Logic) ---
  const saveContent = useCallback(() => {
      onSave({ 
          pages: pagesRef.current, 
          characters: charactersRef.current, 
          images: imagesRef.current 
      });
      setSaveStatus('保存しました');
      setTimeout(() => setSaveStatus('保存済み'), 2000);
      immediateSaveRequested.current = false;
  }, [onSave]);

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
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [pages, characters, images, saveContent]); // Trigger on any content change

  // --- Helpers ---
  const getActivePage = () => pages.find(p => p.id === activePageId) || pages[0];
  const activePage = getActivePage();

  const updatePageContent = useCallback((newContent) => {
    setPages(currentPages => 
      currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: newContent } : p)
    );
  }, []); 

  const updatePageTitle = useCallback((newTitle) => {
    setPages(currentPages => 
      currentPages.map(p => p.id === activePageIdRef.current ? { ...p, title: newTitle } : p)
    );
  }, []);

  const updateScenarioTitle = useCallback((newTitle) => {
    // Immediate save for title changes
    onSave({ title: newTitle });
  }, [onSave]);

  const requestImmediateSave = useCallback(() => {
      immediateSaveRequested.current = true;
      // Trigger effect by forcing a re-render if needed, but usually state change triggers it.
      // If we just want to save current state:
      saveContent();
  }, [saveContent]);

  const handleBack = useCallback(() => {
      requestImmediateSave();
      onBack();
  }, [requestImmediateSave, onBack]);

  const addNewPage = useCallback(() => {
    const newId = Date.now().toString();
    setPages(currentPages => {
      const newPage = { id: newId, title: `新規ページ ${currentPages.length + 1}`, content: '' };
      return [...currentPages, newPage];
    });
    // Switch page triggers immediate save of previous context ideally, but here we just update state
    setActivePageId(newId);
  }, []);

  const addCharacter = useCallback((name) => {
    setCharacters(prev => {
      if (!prev.includes(name)) return [...prev, name];
      return prev;
    });
  }, []);

  // --- Editor Manipulation ---
  const insertText = useCallback((before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);
    const newText = currentVal.substring(0, start) + before + selectedText + after + currentVal.substring(end);
    
    setPages(currentPages => 
        currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: newText } : p)
    );
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, []);

  const handleTextareaKeyDown = useCallback((e) => {
    const isComposing = e.nativeEvent.isComposing;
    if (isComposing) return;

    if (e.key === 'Enter') {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineContent = val.substring(lineStart, start);

        if (lineContent.trimStart().startsWith('>')) {
            e.preventDefault();
            if (lineContent.trim() === '>') {
                const newVal = val.substring(0, lineStart) + '\n' + val.substring(end);
                
                setPages(currentPages => 
                    currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: newVal } : p)
                );
                
                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(lineStart + 1, lineStart + 1);
                }, 0);
                // Explicit Enter usually means a thought is finished, we could trigger save?
                // Let's stick to debounce for now to avoid too many writes.
            } else {
                const newVal = val.substring(0, start) + '\n> ' + val.substring(end);
                
                setPages(currentPages => 
                    currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: newVal } : p)
                );

                setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + 3, start + 3);
                }, 0);
            }
        }
    }
  }, []);

  // --- Image Upload ---
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert("画像サイズが大きすぎます（5MB以下にしてください）");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const imageId = Date.now().toString(36);
      setImages(prev => ({ ...prev, [imageId]: base64String }));
      
      const textarea = textareaRef.current;
      if (textarea) {
        const before = `![${file.name}](image:${imageId})`;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        const newText = currentVal.substring(0, start) + before + currentVal.substring(end);

        setPages(currentPages => 
            currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: newText } : p)
        );
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length);
        }, 0);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null; 
  }, []);

  const triggerImageUpload = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  // --- Deletion Logic ---
  const confirmDeletePage = useCallback((id) => {
    if (pagesRef.current.length <= 1) return;
    setDeleteTarget({ type: 'page', id: id });
    setShowDeleteModal(true);
  }, []);

  const confirmRemoveCharacter = useCallback((name) => {
    setDeleteTarget({ type: 'npc', name: name });
    setShowDeleteModal(true);
  }, []);

  const confirmClearPage = useCallback(() => {
    setDeleteTarget({ type: 'clear' });
    setShowDeleteModal(true);
  }, []);

  const executeDeleteAction = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'npc') {
      setCharacters(prev => prev.filter(c => c !== deleteTarget.name));
    } else if (deleteTarget.type === 'page') {
      setPages(prev => {
          const newPages = prev.filter(p => p.id !== deleteTarget.id);
          if (activePageIdRef.current === deleteTarget.id) {
            setActivePageId(newPages[0].id);
          }
          return newPages;
      });
    } else if (deleteTarget.type === 'clear') {
       setPages(currentPages => 
            currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: '' } : p)
       );
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  // --- Shortcuts ---
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
      if (e.target.tagName === 'INPUT') return;
      if (showCharPicker) return; 
      if (showSceneModal) return; 
      if (showDeleteModal) {
         if (e.key === 'Enter') {
             e.preventDefault();
             executeDeleteAction();
         }
         return;
      }
      
      const s = shortcutsRef.current;

      if (isShortcutMatch(e, s.bold)) { e.preventDefault(); insertText('**', '**'); return; }
      if (isShortcutMatch(e, s.heading)) { e.preventDefault(); insertText('## '); return; }
      if (isShortcutMatch(e, s.strikethrough)) { e.preventDefault(); insertText('~~', '~~'); return; }
      if (isShortcutMatch(e, s.info)) { e.preventDefault(); insertText('> [タイトル] '); return; }
      if (isShortcutMatch(e, s.supplement)) { e.preventDefault(); insertText('||', '||'); return; }
      if (isShortcutMatch(e, s.sceneAdd)) { e.preventDefault(); setShowSceneModal(true); return; }
      if (isShortcutMatch(e, s.pageAdd)) { e.preventDefault(); addNewPage(); return; }
      if (isShortcutMatch(e, s.npcList)) { e.preventDefault(); setShowRightSidebar(prev => !prev); return; }
      if (isShortcutMatch(e, s.pageList)) { e.preventDefault(); setShowLeftSidebar(prev => !prev); return; }
      
      if (isShortcutMatch(e, s.dialogue)) { e.preventDefault(); setShowCharPicker(true); return; }
      if (isShortcutMatch(e, s.image)) { e.preventDefault(); triggerImageUpload(); return; }
      if (isShortcutMatch(e, s.clear)) { e.preventDefault(); confirmClearPage(); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCharPicker, showSceneModal, showDeleteModal, executeDeleteAction, addNewPage, insertText, triggerImageUpload, confirmClearPage]);

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

    let ratio = 0;
    if (totalLines > 1) {
      ratio = (currentLine - 1) / (totalLines - 1);
    } else {
      ratio = cursorPosition / (text.length || 1);
    }
    const maxScroll = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = maxScroll * ratio;
  }, []);

  useEffect(() => {
      const timer = setTimeout(syncPreview, 0);
      return () => clearTimeout(timer);
  }, [pages, activePageId, syncPreview]);

  // --- Export Functions ---
  const generateHtmlContent = (htmlContent, pageTitle) => {
    const tailwindConfig = `<script>tailwind = { darkMode: 'class' }</script><script src="https://cdn.tailwindcss.com"></script>`;
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        body { font-family: 'Noto Sans JP', sans-serif; background-color: #f3f4f6 !important; color: #111827 !important; }
        .container { background-color: #ffffff !important; color: #111827 !important; }
        @media print {
          body { padding: 0; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .container { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
          .break-after-page { page-break-after: always; }
          .copy-btn { display: none !important; }
        }
      </style>
    `;
    const script = `
      <script>
        document.addEventListener('click', function(e) {
          if (e.target.classList.contains('copy-btn')) {
             const container = e.target.closest('.group');
             const contentDiv = container.querySelector('.info-content');
             if(contentDiv){
                 const t = contentDiv.innerText;
                 const a = document.createElement("textarea");
                 a.value = t; document.body.appendChild(a); a.select();
                 document.execCommand('copy'); document.body.removeChild(a);
                 const o = e.target.innerText; e.target.innerText='完了';
                 setTimeout(()=>{e.target.innerText=o},1500);
             }
          }
        });
      </script>
    `;
    return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageTitle}</title>${tailwindConfig}${styles}</head><body class="bg-gray-100 text-gray-900 p-4 md:p-8 min-h-screen"><div class="container max-w-3xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-lg border border-gray-200"><h1 class="text-3xl font-bold mb-8 text-center border-b-2 border-gray-100 pb-4 text-gray-900">${pageTitle}</h1>${htmlContent}</div>${script}</body></html>`;
  };

  const handleDownloadMd = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    let combinedText = currentPages.map(p => `# ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    combinedText = combinedText.replace(/!\[(.*?)\]\(image:(.*?)\)/g, (match, alt, id) => {
      const src = currentImages[id];
      return src ? `![${alt}](${src})` : match;
    });
    const blob = new Blob([combinedText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenario.title]);

  const handleDownloadPageHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const activeId = activePageIdRef.current;
    const activePage = currentPages.find(p => p.id === activeId) || currentPages[0];
    const currentImages = imagesRef.current;
    
    const rawHtml = parseMarkdown(activePage.content, currentImages);
    const cleanHtml = rawHtml.replace(/dark:[^\s"']+/g, '');
    const contentHtml = `<section class="mb-8"><h2 class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${activePage.title}</h2><div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">${cleanHtml}</div></section>`;
    const fullHtml = generateHtmlContent(contentHtml, scenario.title);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenario.title]);

  const handleDownloadScenarioHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    
    const contentHtml = currentPages.map(page => `
      <section class="mb-8 break-after-page">
        <h2 class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2>
        <div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">
          ${parseMarkdown(page.content, currentImages).replace(/dark:[^\s"']+/g, '')}
        </div>
      </section>
    `).join('');
    const fullHtml = generateHtmlContent(contentHtml, scenario.title);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenario.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenario.title]);

  // Callbacks for simple state setters
  const handleOpenSceneModal = useCallback(() => setShowSceneModal(true), []);
  const handleOpenCharPicker = useCallback(() => setShowCharPicker(true), []);
  const handleOpenSettings = useCallback(() => setShowSettingsModal(true), []);
  const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
  const handleSetViewMode = useCallback((mode) => setViewMode(mode), []);
  const handleInsertCharacter = useCallback((name) => insertText(`[${name}] `), [insertText]);

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

          {/* Hidden Inputs */}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

          {/* Main Area */}
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

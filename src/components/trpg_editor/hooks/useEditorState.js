import { useState, useRef, useEffect, useCallback } from 'react';

export function useEditorState(scenario) {
  // State
  const [pages, setPages] = useState(scenario.pages);
  const [activePageId, setActivePageId] = useState(scenario.pages[0]?.id);
  const [characters, setCharacters] = useState(scenario.characters);
  const [images, setImages] = useState(scenario.images || {});

  // Refs (for stable access in callbacks/effects)
  const pagesRef = useRef(pages);
  const charactersRef = useRef(characters);
  const imagesRef = useRef(images);
  const activePageIdRef = useRef(activePageId);

  // Sync Refs
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { charactersRef.current = characters; }, [characters]);
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => { activePageIdRef.current = activePageId; }, [activePageId]);

  // Derived State
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  // Actions
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

  const addNewPage = useCallback((customTitle) => {
    const newId = Date.now().toString();
    setPages(currentPages => {
      const title = customTitle || `新規ページ ${currentPages.length + 1}`;
      const newPage = { id: newId, title: title, content: '' };
      return [...currentPages, newPage];
    });
    setActivePageId(newId);
  }, []);

  const deletePage = useCallback((id) => {
    setPages(prev => {
        const newPages = prev.filter(p => p.id !== id);
        if (activePageIdRef.current === id) {
          setActivePageId(newPages[0]?.id);
        }
        return newPages;
    });
  }, []);

  const clearPage = useCallback(() => {
    setPages(currentPages => 
         currentPages.map(p => p.id === activePageIdRef.current ? { ...p, content: '' } : p)
    );
  }, []);

  const reorderPages = useCallback((startIndex, endIndex) => {
    setPages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const addCharacter = useCallback((name) => {
    setCharacters(prev => {
      if (!prev.includes(name)) return [...prev, name];
      return prev;
    });
  }, []);

  const removeCharacter = useCallback((name) => {
    setCharacters(prev => prev.filter(c => c !== name));
  }, []);

  const renameCharacter = useCallback((oldName, newName) => {
    if (!newName || newName === oldName) return;
    setCharacters(prev => {
      if (prev.includes(newName)) return prev;
      return prev.map(c => c === oldName ? newName : c);
    });
  }, []);

  return {
    pages, setPages,
    activePageId, setActivePageId,
    characters, setCharacters,
    images, setImages,
    pagesRef, charactersRef, imagesRef, activePageIdRef,
    activePage,
    updatePageContent,
    updatePageTitle,
    addNewPage,
    deletePage,
    clearPage,
    reorderPages,
    addCharacter,
    removeCharacter,
    renameCharacter
  };
}

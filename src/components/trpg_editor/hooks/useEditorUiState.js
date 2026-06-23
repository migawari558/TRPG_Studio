import { useCallback, useState } from 'react';

export function useEditorUiState({ addNewPage, toggleTheme }) {
  const [viewMode, setViewMode] = useState('split');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [showSearchWidget, setShowSearchWidget] = useState(null);
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleToggleTheme = useCallback(() => toggleTheme(), [toggleTheme]);
  const handleSetViewMode = useCallback((mode) => setViewMode(mode), []);
  const handleOpenSceneModal = useCallback(() => setShowSceneModal(true), []);
  const handleOpenCharPicker = useCallback(() => setShowCharPicker(true), []);
  const handleOpenSettings = useCallback(() => setShowSettingsModal(true), []);
  const toggleNpcSidebar = useCallback(() => setShowRightSidebar((prev) => !prev), []);
  const togglePageSidebar = useCallback(() => setShowLeftSidebar((prev) => !prev), []);
  const openSearch = useCallback(() => setShowSearchWidget('search'), []);
  const openReplace = useCallback(() => setShowSearchWidget('replace'), []);

  const handleOpenAddPageModal = useCallback(() => {
    setNewPageTitle('');
    setShowAddPageModal(true);
  }, []);

  const executeAddPage = useCallback(() => {
    const title = newPageTitle.trim();

    if (!title) return;

    addNewPage(title);
    setShowAddPageModal(false);
  }, [addNewPage, newPageTitle]);

  return {
    viewMode,
    setViewMode,
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
  };
}

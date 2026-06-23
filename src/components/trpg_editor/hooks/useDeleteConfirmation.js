import { useCallback, useMemo, useState } from 'react';

export function useDeleteConfirmation({ removeCharacter, deletePage, clearPage }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openDeleteModal = useCallback((target) => {
    setDeleteTarget(target);
    setShowDeleteModal(true);
  }, []);

  const confirmDeletePage = useCallback((id) => {
    openDeleteModal({ type: 'page', id });
  }, [openDeleteModal]);

  const confirmRemoveCharacter = useCallback((name) => {
    openDeleteModal({ type: 'npc', name });
  }, [openDeleteModal]);

  const confirmClearPage = useCallback(() => {
    openDeleteModal({ type: 'clear' });
  }, [openDeleteModal]);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const executeDeleteAction = useCallback(() => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'npc') {
      removeCharacter(deleteTarget.name);
    } else if (deleteTarget.type === 'page') {
      deletePage(deleteTarget.id);
    } else if (deleteTarget.type === 'clear') {
      clearPage();
    }

    setShowDeleteModal(false);
    setDeleteTarget(null);
  }, [clearPage, deletePage, deleteTarget, removeCharacter]);

  const deleteModalTitle = useMemo(() => {
    if (deleteTarget?.type === 'npc') return 'NPCを削除しますか？';
    if (deleteTarget?.type === 'page') return 'ページを削除しますか？';
    if (deleteTarget?.type === 'clear') return '内容をクリアしますか？';
    return '削除確認';
  }, [deleteTarget]);

  const deleteModalMessage = useMemo(() => (
    deleteTarget?.type === 'npc'
      ? `「${deleteTarget.name}」をリストから削除します。`
      : 'この操作は取り消せません。'
  ), [deleteTarget]);

  return {
    showDeleteModal,
    deleteTarget,
    confirmDeletePage,
    confirmRemoveCharacter,
    confirmClearPage,
    closeDeleteModal,
    executeDeleteAction,
    deleteModalTitle,
    deleteModalMessage,
  };
}

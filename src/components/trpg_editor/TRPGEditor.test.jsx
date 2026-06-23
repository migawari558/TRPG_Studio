import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TRPGEditor } from './TRPGEditor';

describe('TRPGEditor', () => {
  const baseScenario = {
    id: 'scenario-1',
    title: 'テストシナリオ',
    pages: [{ id: 'page-1', title: '導入', content: '最初の本文' }],
    characters: ['GM', 'NPC'],
    images: {},
  };

  beforeEach(() => {
    localStorage.clear();
  });

  const renderEditor = (scenario = baseScenario, onSave = vi.fn()) => render(
    <TRPGEditor
      scenario={scenario}
      onSave={onSave}
      onBack={vi.fn()}
      isDarkMode={false}
      toggleTheme={vi.fn()}
      dataPath=""
      setDataPath={vi.fn()}
      editorFontFamily="monospace"
      setEditorFontFamily={vi.fn()}
      editorFontSize={14}
      setEditorFontSize={vi.fn()}
    />,
  );

  it('adds a page through the page-add shortcut flow', async () => {
    const user = userEvent.setup();
    renderEditor();

    fireEvent.keyDown(window, { key: 'P', ctrlKey: true, shiftKey: true });
    await user.type(screen.getByPlaceholderText('ページ名を入力...'), '追加ページ');
    await user.click(screen.getByText('追加する'));

    expect(await screen.findAllByText('追加ページ')).toHaveLength(3);
    expect(screen.getByText('ページ')).toBeInTheDocument();
  });

  it('clears the active page after confirmation from the clear shortcut', async () => {
    const user = userEvent.setup();
    renderEditor();

    const textarea = screen.getByPlaceholderText('ここにシナリオを入力...');
    expect(textarea).toHaveValue('最初の本文');

    fireEvent.keyDown(window, { key: 'Delete', ctrlKey: true, shiftKey: true });
    expect(await screen.findByText('内容をクリアしますか？')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Enter' });
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });

    await user.click(screen.getByTitle('一覧へ戻る'));
  });

  it('triggers image upload from the image shortcut', () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    renderEditor();

    fireEvent.keyDown(window, { key: 'G', ctrlKey: true, shiftKey: true });

    expect(clickSpy).toHaveBeenCalled();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SceneModal } from './SceneModal';

describe('SceneModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onInsert: vi.fn(),
    characters: ['NPC1', 'NPC2'],
    onAddCharacter: vi.fn(),
    isDarkMode: false,
  };

  it('shows a validation alert when required fields are missing', async () => {
    const user = userEvent.setup();
    render(<SceneModal {...baseProps} />);

    await user.click(screen.getByText('追加する'));

    expect(await screen.findByText('シーン名とシーン番号は必須です。')).toBeInTheDocument();
  });

  it('inserts a scene after confirmation when optional fields are missing', async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    const onClose = vi.fn();

    render(<SceneModal {...baseProps} onInsert={onInsert} onClose={onClose} />);

    const titleInput = screen.getAllByRole('textbox')[0];
    await user.type(titleInput, '潜入');
    await user.click(screen.getByText('追加する'));
    await user.click(screen.getByText('OK'));

    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('## ● シーン1：潜入'));
    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('**[登場NPC：なし]**'));
    expect(onClose).toHaveBeenCalled();
  });

  it('adds a new npc and includes selections in inserted scene text', async () => {
    const user = userEvent.setup();
    const onInsert = vi.fn();
    const onAddCharacter = vi.fn();

    render(<SceneModal {...baseProps} onInsert={onInsert} onAddCharacter={onAddCharacter} />);

    await user.type(screen.getAllByRole('textbox')[0], '潜入');
    await user.type(screen.getByPlaceholderText('例: 全員'), '全員');
    await user.click(screen.getByLabelText('NPC1'));
    await user.type(screen.getByPlaceholderText('新規NPCを追加'), '新NPC');
    await user.click(screen.getAllByRole('button')[1]);
    await user.click(screen.getByText('追加する'));

    expect(onAddCharacter).toHaveBeenCalledWith('新NPC');
    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('（PC 全員）'));
    expect(onInsert).toHaveBeenCalledWith(expect.stringContaining('登場NPC：NPC1、新NPC'));
  });
});

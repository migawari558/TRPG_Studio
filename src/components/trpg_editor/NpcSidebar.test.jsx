import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NpcSidebar } from './NpcSidebar';

describe('NpcSidebar', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    characters: ['GM', 'NPC'],
    onAddCharacter: vi.fn(),
    onRenameCharacter: vi.fn(),
    onDeleteCharacter: vi.fn(),
    isDarkMode: false,
  };

  it('adds a new character from the input form', async () => {
    const user = userEvent.setup();
    const onAddCharacter = vi.fn();

    render(<NpcSidebar {...baseProps} onAddCharacter={onAddCharacter} />);

    await user.type(screen.getByPlaceholderText('名前を追加...'), '新NPC');
    await user.keyboard('{Enter}');

    expect(onAddCharacter).toHaveBeenCalledWith('新NPC');
  });

  it('renames a character on blur after editing', async () => {
    const user = userEvent.setup();
    const onRenameCharacter = vi.fn();

    render(<NpcSidebar {...baseProps} onRenameCharacter={onRenameCharacter} />);

    await user.click(screen.getByText('NPC'));
    const input = screen.getByDisplayValue('NPC');
    await user.clear(input);
    await user.type(input, '村人');
    fireEvent.blur(input);

    expect(onRenameCharacter).toHaveBeenCalledWith('NPC', '村人');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchReplaceWidget } from './SearchReplaceWidget';

describe('SearchReplaceWidget', () => {
  const baseProps = {
    mode: 'replace',
    searchQuery: 'alpha',
    setSearchQuery: vi.fn(),
    replaceQuery: 'omega',
    setReplaceQuery: vi.fn(),
    matchesCount: 3,
    currentMatchIndex: 1,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onReplace: vi.fn(),
    onReplaceAll: vi.fn(),
    onClose: vi.fn(),
    isDarkMode: false,
    onSearchModeToggle: vi.fn(),
  };

  it('handles search keyboard shortcuts and toggle actions', async () => {
    const user = userEvent.setup();
    render(<SearchReplaceWidget {...baseProps} />);

    const searchInput = screen.getByPlaceholderText('検索...');
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    fireEvent.keyDown(searchInput, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(searchInput, { key: 'Escape' });
    await user.click(screen.getByTitle('置換の切り替え'));

    expect(baseProps.onNext).toHaveBeenCalled();
    expect(baseProps.onPrev).toHaveBeenCalled();
    expect(baseProps.onClose).toHaveBeenCalled();
    expect(baseProps.onSearchModeToggle).toHaveBeenCalled();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('handles replace keyboard actions and buttons', async () => {
    const user = userEvent.setup();
    render(<SearchReplaceWidget {...baseProps} />);

    const replaceInput = screen.getByPlaceholderText('置換...');
    fireEvent.keyDown(replaceInput, { key: 'Enter' });
    await user.click(screen.getByTitle('すべて置換'));

    expect(baseProps.onReplace).toHaveBeenCalled();
    expect(baseProps.onReplaceAll).toHaveBeenCalled();
  });
});

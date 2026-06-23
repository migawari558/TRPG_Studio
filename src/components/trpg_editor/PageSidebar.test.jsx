import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageSidebar } from './PageSidebar';

describe('PageSidebar', () => {
  const pages = [
    { id: 'page-1', title: '導入', content: '# 概要\n本文' },
    { id: 'page-2', title: '戦闘', content: '内容' },
  ];

  const baseProps = {
    isOpen: true,
    pages,
    activePageId: 'page-1',
    activePageOutlineContent: pages[0].content,
    onPageSelect: vi.fn(),
    onAddPage: vi.fn(),
    onDeletePage: vi.fn(),
    onReorderPages: vi.fn(),
    onHeadingClick: vi.fn(),
    getShortcutLabel: vi.fn(() => 'ページ追加 (Ctrl+Shift+P)'),
    isDarkMode: false,
  };

  it('expands headings and forwards heading clicks', async () => {
    const user = userEvent.setup();
    render(<PageSidebar {...baseProps} />);

    await user.click(screen.getByText('導入'));
    await user.click(screen.getByText('概要'));

    expect(baseProps.onPageSelect).toHaveBeenCalledWith('page-1');
    expect(baseProps.onHeadingClick).toHaveBeenCalledWith('page-1', '概要');
  });

  it('forwards delete and add actions', async () => {
    const user = userEvent.setup();
    render(<PageSidebar {...baseProps} />);

    await user.click(screen.getAllByRole('button')[0]);
    await user.click(screen.getByText('新規ページを追加'));

    expect(baseProps.onDeletePage).toHaveBeenCalledWith('page-1');
    expect(baseProps.onAddPage).toHaveBeenCalled();
  });
});

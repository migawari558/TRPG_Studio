import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useEditorState } from './useEditorState';

describe('useEditorState', () => {
  it('updates pages, characters, and active page consistently', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);

    const initialScenario = {
      pages: [
        { id: 'page-1', title: '導入', content: '開始' },
        { id: 'page-2', title: '戦闘', content: '敵が出る' },
      ],
      characters: ['GM', 'PL1'],
      images: {},
    };

    const { result } = renderHook(() => useEditorState(initialScenario));

    act(() => {
      result.current.updatePageContent('更新後');
      result.current.updatePageTitle('新しい導入');
      result.current.addNewPage('追加ページ');
      result.current.addCharacter('NPC');
      result.current.renameCharacter('PL1', 'PL2');
      result.current.reorderPages(2, 1);
      result.current.deletePage('1234567890');
    });

    expect(result.current.pages).toEqual([
      { id: 'page-1', title: '新しい導入', content: '更新後' },
      { id: 'page-2', title: '戦闘', content: '敵が出る' },
    ]);
    expect(result.current.characters).toEqual(['GM', 'PL2', 'NPC']);

    act(() => {
      result.current.setActivePageId('page-2');
    });
    act(() => {
      result.current.clearPage();
      result.current.removeCharacter('NPC');
    });

    expect(result.current.pages[1].content).toBe('');
    expect(result.current.activePage.id).toBe('page-2');
    expect(result.current.characters).toEqual(['GM', 'PL2']);
  });
});

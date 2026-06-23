import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useAutoSave } from './useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces content saves and restores saved status', () => {
    const onSave = vi.fn();
    const pagesRef = { current: [{ id: 'page-1', content: 'updated' }] };
    const charactersRef = { current: ['GM'] };
    const imagesRef = { current: { hero: 'data:image/png;base64,test' } };

    const { result, rerender } = renderHook(
      ({ pages }) => useAutoSave({
        pages,
        characters: charactersRef.current,
        images: imagesRef.current,
        pagesRef,
        charactersRef,
        imagesRef,
        onSave,
      }),
      {
        initialProps: { pages: [{ id: 'page-1', content: 'initial' }] },
      },
    );

    expect(result.current.saveStatus).toBe('編集...');
    expect(onSave).not.toHaveBeenCalled();

    rerender({ pages: [{ id: 'page-1', content: 'updated' }] });
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      pages: pagesRef.current,
      characters: charactersRef.current,
      images: imagesRef.current,
    });
    expect(result.current.saveStatus).toBe('保存しました');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.saveStatus).toBe('保存済み');
  });

  it('saves immediately when requested and forwards title updates', () => {
    const onSave = vi.fn();
    const refs = {
      pagesRef: { current: [{ id: 'page-1', content: 'body' }] },
      charactersRef: { current: ['GM'] },
      imagesRef: { current: {} },
    };

    const { result } = renderHook(() => useAutoSave({
      pages: refs.pagesRef.current,
      characters: refs.charactersRef.current,
      images: refs.imagesRef.current,
      ...refs,
      onSave,
    }));

    act(() => {
      result.current.requestImmediateSave();
    });
    expect(onSave).toHaveBeenCalledWith({
      pages: refs.pagesRef.current,
      characters: refs.charactersRef.current,
      images: refs.imagesRef.current,
    });

    act(() => {
      result.current.updateScenarioTitle('新タイトル');
    });
    expect(onSave).toHaveBeenCalledWith({ title: '新タイトル' });
  });
});

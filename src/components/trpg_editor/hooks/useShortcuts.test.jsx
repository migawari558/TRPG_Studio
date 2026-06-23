import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createFsMock = (files = {}) => {
  const store = new Map(Object.entries(files));

  return {
    store,
    existsSync: vi.fn((target) => store.has(target)),
    readFileSync: vi.fn((target) => store.get(target)),
    writeFileSync: vi.fn((target, content) => {
      store.set(target, content);
    }),
    mkdirSync: vi.fn((target) => {
      store.set(target, '__dir__');
    }),
  };
};

describe('useShortcuts', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    delete window.require;
  });

  it('loads shortcuts from localStorage when no data path is set', async () => {
    localStorage.setItem('trpg_shortcuts', JSON.stringify({
      bold: { id: 'bold', label: '太字', key: 'x', ctrl: true, shift: false, alt: false },
    }));

    const { useShortcuts } = await import('./useShortcuts');
    const { result } = renderHook(() => useShortcuts({ dataPath: '' }));

    expect(result.current.shortcuts.bold.key).toBe('x');
    expect(result.current.getShortcutLabel('bold')).toBe('太字 (Ctrl+X)');
  });

  it('reloads shortcuts from the new data path without overwriting existing settings', async () => {
    const settingsPathA = '/data-a/settings/settings.json';
    const settingsPathB = '/data-b/settings/settings.json';
    const fsMock = createFsMock({
      '/data-a': '__dir__',
      '/data-a/settings': '__dir__',
      [settingsPathA]: JSON.stringify({
        shortcuts: {
          bold: { id: 'bold', label: '太字', key: 'q', ctrl: true, shift: false, alt: false },
        },
      }),
      '/data-b': '__dir__',
      '/data-b/settings': '__dir__',
      [settingsPathB]: JSON.stringify({
        shortcuts: {
          bold: { id: 'bold', label: '太字', key: 'w', ctrl: true, shift: false, alt: false },
        },
      }),
    });

    window.require = vi.fn((moduleName) => {
      if (moduleName === 'fs') return fsMock;
      if (moduleName === 'path') return { join: (...parts) => parts.join('/') };
      return null;
    });

    const { useShortcuts } = await import('./useShortcuts');
    const { result, rerender } = renderHook(
      ({ dataPath }) => useShortcuts({ dataPath }),
      { initialProps: { dataPath: '/data-a' } },
    );

    expect(result.current.shortcuts.bold.key).toBe('q');

    rerender({ dataPath: '/data-b' });

    await waitFor(() => {
      expect(result.current.shortcuts.bold.key).toBe('w');
    });

    expect(fsMock.writeFileSync).not.toHaveBeenCalledWith(
      settingsPathB,
      expect.stringContaining('"key": "q"'),
      'utf-8',
    );
  });

  it('writes updated shortcuts to the selected data path', async () => {
    const settingsPath = '/workspace/settings/settings.json';
    const fsMock = createFsMock({
      '/workspace': '__dir__',
      '/workspace/settings': '__dir__',
      [settingsPath]: JSON.stringify({ shortcuts: {} }),
    });

    window.require = vi.fn((moduleName) => {
      if (moduleName === 'fs') return fsMock;
      if (moduleName === 'path') return { join: (...parts) => parts.join('/') };
      return null;
    });

    const { useShortcuts } = await import('./useShortcuts');
    const { result } = renderHook(() => useShortcuts({ dataPath: '/workspace' }));

    act(() => {
      result.current.setShortcuts((prev) => ({
        ...prev,
        bold: { ...prev.bold, key: 'z' },
      }));
    });

    await waitFor(() => {
      expect(fsMock.writeFileSync).toHaveBeenLastCalledWith(
        settingsPath,
        expect.stringContaining('"key": "z"'),
        'utf-8',
      );
    });
  });
});

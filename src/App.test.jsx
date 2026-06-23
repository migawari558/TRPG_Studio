import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const scenarioDashboardMock = vi.fn();
const trpgEditorMock = vi.fn();

const createFsMock = (files = {}) => {
  const store = new Map(Object.entries(files));
  return {
    existsSync: vi.fn((target) => store.has(target)),
    mkdirSync: vi.fn((target) => {
      store.set(target, '__dir__');
    }),
    readdirSync: vi.fn((target) => {
      const prefix = `${target}/`;
      return Array.from(store.keys())
        .filter((key) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
        .map((key) => key.slice(prefix.length));
    }),
    readFileSync: vi.fn((target) => store.get(target)),
    writeFileSync: vi.fn((target, content) => {
      store.set(target, content);
    }),
    unlinkSync: vi.fn((target) => {
      store.delete(target);
    }),
  };
};

const loadApp = async () => {
  vi.resetModules();
  vi.doMock('./components/ScenarioDashboard', () => ({
    ScenarioDashboard: (props) => {
      scenarioDashboardMock(props);
      const importFile = new File(['# imported'], 'imported.md', { type: 'text/markdown' });
      importFile.__mockContent = '# 導入\n\n本文';
      return (
        <div>
          <div data-testid="dashboard-scenarios">{props.scenarios.map((scenario) => scenario.title).join(',')}</div>
          <button onClick={() => props.onSelect(props.scenarios[0]?.id)}>open-editor</button>
          <button onClick={() => props.onCreate('追加シナリオ')}>create-scenario</button>
          <button onClick={() => props.onImport(importFile)}>import-scenario</button>
        </div>
      );
    },
  }));
  vi.doMock('./components/trpg_editor/TRPGEditor', () => ({
    TRPGEditor: (props) => {
      trpgEditorMock(props);
      return (
        <div>
          <div data-testid="editor-title">{props.scenario.title}</div>
          <button onClick={() => props.onSave({ title: '更新後シナリオ' })}>save-editor</button>
          <button onClick={props.onBack}>back-editor</button>
        </div>
      );
    },
  }));

  const module = await import('./App');
  return module.default;
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    scenarioDashboardMock.mockReset();
    trpgEditorMock.mockReset();
    delete window.require;
    class MockFileReader {
      readAsText(file) {
        this.onload?.({ target: { result: file.__mockContent || '# imported' } });
      }
    }
    global.FileReader = MockFileReader;
  });

  it('loads scenarios from localStorage when no data path is configured', async () => {
    localStorage.setItem('trpg_scenarios', JSON.stringify([
      { id: 'scenario-1', title: '保存済みシナリオ', pages: [], characters: ['GM'], images: {}, lastModified: 1 },
    ]));

    const App = await loadApp();
    render(<App />);

    expect(await screen.findByTestId('dashboard-scenarios')).toHaveTextContent('保存済みシナリオ');
  });

  it('saves scenario changes from the editor back into dashboard state', async () => {
    const user = userEvent.setup();
    localStorage.setItem('trpg_scenarios', JSON.stringify([
      { id: 'scenario-1', title: '元タイトル', pages: [], characters: ['GM'], images: {}, lastModified: 1 },
    ]));

    const App = await loadApp();
    render(<App />);

    await user.click(await screen.findByText('open-editor'));
    expect(await screen.findByTestId('editor-title')).toHaveTextContent('元タイトル');

    await user.click(screen.getByText('save-editor'));
    await user.click(screen.getByText('back-editor'));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-scenarios')).toHaveTextContent('更新後シナリオ');
    });
  });

  it('imports a markdown scenario into dashboard state', async () => {
    const user = userEvent.setup();
    localStorage.setItem('trpg_scenarios', JSON.stringify([]));

    const App = await loadApp();
    render(<App />);

    await user.click(screen.getByText('import-scenario'));

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-scenarios')).toHaveTextContent('imported');
    });
  });

  it('loads scenarios from a filesystem-backed data path and syncs new scenarios back', async () => {
    const user = userEvent.setup();
    localStorage.setItem('trpg_data_path', '/data');
    const fsMock = createFsMock({
      '/data': '__dir__',
      '/data/scenario': '__dir__',
      '/data/scenario/scenario-1.json': JSON.stringify({
        id: 'scenario-1',
        title: 'ファイル保存シナリオ',
        pages: [],
        characters: ['GM'],
        images: {},
        lastModified: 1,
        sortOrder: 0,
      }),
    });
    window.require = vi.fn((name) => {
      if (name === 'fs') return fsMock;
      if (name === 'path') return { join: (...parts) => parts.join('/') };
      return null;
    });

    const App = await loadApp();
    render(<App />);

    expect(await screen.findByTestId('dashboard-scenarios')).toHaveTextContent('ファイル保存シナリオ');

    await user.click(screen.getByText('create-scenario'));

    await waitFor(() => {
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        expect.stringMatching(/^\/data\/scenario\/.+\.json$/),
        expect.stringContaining('追加シナリオ'),
        'utf-8',
      );
    });
  });

  it('loads and persists scenarios using a real temporary data directory', async () => {
    const user = userEvent.setup();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trpg-studio-test-'));
    const scenarioDir = path.join(tempDir, 'scenario');
    fs.mkdirSync(scenarioDir, { recursive: true });
    fs.writeFileSync(path.join(scenarioDir, 'scenario-1.json'), JSON.stringify({
      id: 'scenario-1',
      title: '実ディレクトリシナリオ',
      pages: [],
      characters: ['GM'],
      images: {},
      lastModified: 1,
      sortOrder: 0,
    }), 'utf-8');

    localStorage.setItem('trpg_data_path', tempDir);
    window.require = vi.fn((name) => {
      if (name === 'fs') return fs;
      if (name === 'path') return path;
      return null;
    });

    try {
      const App = await loadApp();
      render(<App />);

      expect(await screen.findByTestId('dashboard-scenarios')).toHaveTextContent('実ディレクトリシナリオ');

      await user.click(screen.getByText('create-scenario'));

      await waitFor(() => {
        const filenames = fs.readdirSync(scenarioDir);
        expect(filenames.some((filename) => filename !== 'scenario-1.json')).toBe(true);
      });

      const savedContents = fs.readdirSync(scenarioDir)
        .map((filename) => fs.readFileSync(path.join(scenarioDir, filename), 'utf-8'))
        .join('\n');
      expect(savedContents).toContain('追加シナリオ');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

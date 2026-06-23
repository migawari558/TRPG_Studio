import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EDITOR_FONT_OPTIONS } from '../../../constants/editorFonts';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';

const loadSettingsModal = async () => {
  const module = await import('./SettingsModal');
  return module.SettingsModal;
};

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    delete window.require;
  });

  const getBaseProps = () => ({
    isOpen: true,
    onClose: vi.fn(),
    shortcuts: DEFAULT_SHORTCUTS,
    setShortcuts: vi.fn(),
    isDarkMode: false,
    appTheme: 'default',
    setAppTheme: vi.fn(),
    colorMode: 'light',
    setColorMode: vi.fn(),
    dataPath: '',
    setDataPath: vi.fn(),
    editorFontFamily: EDITOR_FONT_OPTIONS[0].value,
    setEditorFontFamily: vi.fn(),
    editorFontSize: 14,
    setEditorFontSize: vi.fn(),
  });

  it('shows an error for relative data paths and does not close', async () => {
    const user = userEvent.setup();
    const fsMock = {
      existsSync: vi.fn(() => true),
      statSync: vi.fn(() => ({ isDirectory: () => true })),
    };
    const pathMock = { isAbsolute: vi.fn(() => false) };
    window.require = vi.fn((name) => {
      if (name === 'fs') return fsMock;
      if (name === 'path') return pathMock;
      return null;
    });

    const SettingsModal = await loadSettingsModal();
    const props = getBaseProps();
    render(<SettingsModal {...props} />);

    const pathInput = screen.getByPlaceholderText('例: C:\\TRPG_Data または /home/user/TRPG_Data');
    await user.type(pathInput, 'relative/path');
    await user.click(screen.getByText('完了'));

    expect(await screen.findByText('「絶対パス」（フルパス）で指定してください。')).toBeInTheDocument();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('saves font and data path settings when validation passes', async () => {
    const user = userEvent.setup();
    const fsMock = {
      existsSync: vi.fn(() => true),
      statSync: vi.fn(() => ({ isDirectory: () => true })),
    };
    const pathMock = { isAbsolute: vi.fn(() => true) };
    window.require = vi.fn((name) => {
      if (name === 'fs') return fsMock;
      if (name === 'path') return pathMock;
      return null;
    });

    const SettingsModal = await loadSettingsModal();
    const props = getBaseProps();
    render(<SettingsModal {...props} />);

    await user.click(screen.getByRole('button', { name: 'エディタ' }));
    await user.selectOptions(screen.getByLabelText('フォントファミリー'), EDITOR_FONT_OPTIONS[2].value);
    const numberInput = screen.getByRole('spinbutton');
    await user.clear(numberInput);
    await user.type(numberInput, '18');
    await user.click(screen.getByRole('button', { name: '一般' }));
    await user.selectOptions(screen.getByLabelText('テーマ'), 'default');
    await user.click(screen.getByRole('button', { name: 'ダーク' }));
    const pathInput = screen.getByPlaceholderText('例: C:\\TRPG_Data または /home/user/TRPG_Data');
    await user.type(pathInput, '/home/user/TRPG_Data');
    await user.click(screen.getByText('完了'));

    expect(props.setAppTheme).toHaveBeenCalledWith('default');
    expect(props.setColorMode).toHaveBeenCalledWith('dark');
    expect(props.setDataPath).toHaveBeenCalledWith('/home/user/TRPG_Data');
    expect(props.setEditorFontFamily).toHaveBeenCalledWith(EDITOR_FONT_OPTIONS[2].value);
    expect(props.setEditorFontSize).toHaveBeenCalledWith(18);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('hides the editor tab when editor settings are not passed', async () => {
    const SettingsModal = await loadSettingsModal();
    const props = getBaseProps();
    delete props.editorFontFamily;
    delete props.setEditorFontFamily;
    delete props.editorFontSize;
    delete props.setEditorFontSize;

    render(<SettingsModal {...props} />);

    expect(screen.queryByRole('button', { name: 'エディタ' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '一般' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ショートカット' })).toBeInTheDocument();
  });
});

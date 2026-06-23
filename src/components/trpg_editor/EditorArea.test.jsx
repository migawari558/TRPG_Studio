import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorArea } from './EditorArea';

describe('EditorArea', () => {
  beforeEach(() => {
    document.execCommand = vi.fn(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('replaces all search matches from the search widget', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const textareaRef = React.createRef();
    const previewRef = React.createRef();

    render(
      <EditorArea
        viewMode="split"
        title="テスト"
        content="alpha beta alpha"
        onChange={onChange}
        images={{}}
        textareaRef={textareaRef}
        previewRef={previewRef}
        onSyncPreview={vi.fn()}
        onKeyDown={vi.fn()}
        editorFontFamily="monospace"
        editorFontSize={14}
        isDarkMode={false}
        showSearchWidget="replace"
        setShowSearchWidget={vi.fn()}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'alpha');
    await user.type(inputs[1], 'omega');
    await user.click(screen.getByTitle('すべて置換'));

    expect(onChange).toHaveBeenCalledWith('omega beta omega');
  });

  it('copies info block text from the preview action button', () => {
    const textareaRef = React.createRef();
    const previewRef = React.createRef();

    render(
      <EditorArea
        viewMode="preview"
        title="テスト"
        content={'> [メモ] これはコピー対象'}
        onChange={vi.fn()}
        images={{}}
        textareaRef={textareaRef}
        previewRef={previewRef}
        onSyncPreview={vi.fn()}
        onKeyDown={vi.fn()}
        editorFontFamily="monospace"
        editorFontSize={14}
        isDarkMode={false}
        showSearchWidget={null}
        setShowSearchWidget={vi.fn()}
      />,
    );

    const copyButton = screen.getByText('コピー');
    fireEvent.click(copyButton);

    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});

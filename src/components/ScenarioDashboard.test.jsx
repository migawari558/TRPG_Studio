import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScenarioDashboard } from './ScenarioDashboard';

vi.mock('./trpg_editor/hooks/useShortcuts', () => ({
  useShortcuts: () => ({
    shortcuts: {},
    setShortcuts: vi.fn(),
  }),
}));

describe('ScenarioDashboard', () => {
  const scenarios = [
    { id: 'scenario-1', title: 'シナリオA', pages: [{ content: '内容A' }], lastModified: 1 },
    { id: 'scenario-2', title: 'シナリオB', pages: [{ content: '内容B' }], lastModified: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a scenario from the prompt modal', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(
      <ScenarioDashboard
        scenarios={[]}
        onCreate={onCreate}
        onImport={vi.fn()}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onReorder={vi.fn()}
        isDarkMode={false}
        toggleTheme={vi.fn()}
        appTheme="default"
        setAppTheme={vi.fn()}
        colorMode="light"
        setColorMode={vi.fn()}
        dataPath=""
        setDataPath={vi.fn()}
      />,
    );

    await user.click(screen.getByText('新しいシナリオを作成する'));
    await user.type(screen.getByPlaceholderText('シナリオの名前を入力...'), '新規卓');
    await user.click(screen.getByText('作成する'));

    expect(onCreate).toHaveBeenCalledWith('新規卓');
  });

  it('confirms duplicate and delete actions before calling handlers', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();

    render(
      <ScenarioDashboard
        scenarios={scenarios}
        onCreate={vi.fn()}
        onImport={vi.fn()}
        onSelect={vi.fn()}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onReorder={vi.fn()}
        isDarkMode={false}
        toggleTheme={vi.fn()}
        appTheme="default"
        setAppTheme={vi.fn()}
        colorMode="light"
        setColorMode={vi.fn()}
        dataPath=""
        setDataPath={vi.fn()}
      />,
    );

    await user.click(screen.getAllByTitle('複製')[0]);
    await user.click(screen.getByText('複製する'));
    expect(onDuplicate).toHaveBeenCalledWith('scenario-1');

    await user.click(screen.getAllByTitle('削除')[0]);
    await user.click(screen.getByText('削除する'));
    expect(onDelete).toHaveBeenCalledWith('scenario-1');
  });
});

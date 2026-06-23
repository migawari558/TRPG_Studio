import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useExporter } from './useExporter';

describe('useExporter', () => {
  const createObjectURL = vi.fn(() => 'blob:mock-url');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports markdown with embedded data urls restored', async () => {
    const pagesRef = {
      current: [{ id: 'page-1', title: '導入', content: '![立ち絵](image:hero)' }],
    };
    const imagesRef = {
      current: { hero: 'data:image/png;base64,hero-image' },
    };
    const activePageIdRef = { current: 'page-1' };

    const { result } = renderHook(() => useExporter({
      scenarioTitle: '冒険',
      pagesRef,
      imagesRef,
      activePageIdRef,
    }));

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });

    act(() => {
      result.current.handleDownloadMd();
    });

    const exportedBlob = createObjectURL.mock.calls[0][0];
    expect(await exportedBlob.text()).toContain('![立ち絵](data:image/png;base64,hero-image)');
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('exports scenario html with embedded images and without dark classes', async () => {
    const pagesRef = {
      current: [
        { id: 'page-1', title: '導入', content: '## 概要\n![立ち絵](image:hero)\n[GM] テスト' },
      ],
    };
    const imagesRef = {
      current: { hero: 'data:image/png;base64,hero-image' },
    };
    const activePageIdRef = { current: 'page-1' };

    const { result } = renderHook(() => useExporter({
      scenarioTitle: '冒険',
      pagesRef,
      imagesRef,
      activePageIdRef,
    }));

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });

    act(() => {
      result.current.handleDownloadScenarioHtml();
    });

    const exportedBlob = createObjectURL.mock.calls[0][0];
    const html = await exportedBlob.text();
    expect(html).toContain('data:image/png;base64,hero-image');
    expect(html).not.toContain('dark:text');
    expect(html).toContain('導入');
    expect(html).toContain('<details class="toc');
    expect(html).toContain('<summary class="cursor-pointer list-none');
    expect(html).toContain('aria-label="目次"');
    expect(html).toContain('href="#page-1"');
    expect(html).toContain('href="#page-1-heading-1"');
    expect(html).toContain('id="page-1-heading-1"');
    expect(html).toContain('概要');
    expect(html).toContain('width: min(100%, max(48rem, calc(100vw - 4rem)))');
  });

  it('exports page html with a table of contents linked to headings', async () => {
    const pagesRef = {
      current: [
        { id: 'page-1', title: '導入', content: '## 概要\n### 注意点' },
      ],
    };
    const imagesRef = {
      current: {},
    };
    const activePageIdRef = { current: 'page-1' };

    const { result } = renderHook(() => useExporter({
      scenarioTitle: '冒険',
      pagesRef,
      imagesRef,
      activePageIdRef,
    }));

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });

    act(() => {
      result.current.handleDownloadPageHtml();
    });

    const exportedBlob = createObjectURL.mock.calls[0][0];
    const html = await exportedBlob.text();
    expect(html).toContain('<details class="toc');
    expect(html).toContain('aria-label="目次"');
    expect(html).toContain('href="#page-1"');
    expect(html).toContain('href="#page-1-heading-1"');
    expect(html).toContain('href="#page-1-heading-2"');
    expect(html).toContain('id="page-1-heading-1"');
    expect(html).toContain('id="page-1-heading-2"');
    expect(html).toContain('class="export-shell"');
  });
});

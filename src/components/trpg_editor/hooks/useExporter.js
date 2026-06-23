import { useCallback } from 'react';
import { parseMarkdown } from '../../../utils/markdownParser';

const DARK_CLASS_PATTERN = /dark:[^\s"']+/g;
const IMAGE_TOKEN_PATTERN = /!\[(.*?)\]\(image:(.*?)\)/g;
const TAG_PATTERN = /<[^>]+>/g;

const stripDarkClasses = (html) => html.replace(DARK_CLASS_PATTERN, '');
const stripTags = (value) => value.replace(TAG_PATTERN, '').trim();

const DEFAULT_EXPORT_FONT_FAMILY = 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
const DEFAULT_EXPORT_FONT_SIZE = 14;
const MARKDOWN_FILTERS = [{ name: 'Markdown', extensions: ['md'] }];
const HTML_FILTERS = [{ name: 'HTML', extensions: ['html'] }];
const PDF_FILTERS = [{ name: 'PDF', extensions: ['pdf'] }];

const sanitizeCssFontFamily = (value) => (
  String(value || DEFAULT_EXPORT_FONT_FAMILY).replace(/[;{}<>]/g, '').trim() || DEFAULT_EXPORT_FONT_FAMILY
);

const normalizeExportFontSize = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_EXPORT_FONT_SIZE;
  return Math.min(28, Math.max(10, parsed));
};

const addHeadingAnchors = (html, prefix) => {
  let headingIndex = 0;
  const headings = [];

  const anchoredHtml = html.replace(/<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, content) => {
    headingIndex += 1;
    const id = `${prefix}-heading-${headingIndex}`;
    const title = stripTags(content);

    headings.push({
      id,
      level: Number(level),
      title,
    });

    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });

  return { html: anchoredHtml, headings };
};

const buildTocHtml = (items) => {
  if (!items.length) return '';

  const links = items.map(({ id, title, depth = 0 }) => {
    const indentClass = depth === 0 ? '' : depth === 1 ? ' pl-4' : ' pl-8';
    const textClass = depth === 0 ? 'font-semibold text-gray-900' : 'text-sm text-gray-700';
    return `<li><a href="#${id}" class="block rounded-md px-3 py-2 hover:bg-gray-100 transition-colors${indentClass} ${textClass}">${title}</a></li>`;
  }).join('');

  return `
    <details class="toc mb-8 rounded-xl border border-gray-200 bg-gray-50" open>
      <summary class="cursor-pointer list-none px-4 py-3 text-sm font-bold tracking-wide text-gray-500">目次</summary>
      <nav class="border-t border-gray-200 px-4 py-3" aria-label="目次">
        <ul class="space-y-1">
          ${links}
        </ul>
      </nav>
    </details>
  `;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const saveWithBrowserPicker = async ({ content, filename, mimeType, extension, description }) => {
  if (!window.showSaveFilePicker) return false;

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description,
        accept: { [mimeType]: [`.${extension}`] },
      }],
    });
    const writable = await handle.createWritable();
    await writable.write(new Blob([content], { type: mimeType }));
    await writable.close();
    return true;
  } catch (error) {
    if (error?.name === 'AbortError') return true;
    throw error;
  }
};

const saveTextFile = async ({ content, filename, mimeType, extension, filters, description }) => {
  const ipcRenderer = getElectronIpc();

  if (ipcRenderer) {
    await ipcRenderer.invoke('save-export-file', {
      content,
      filename,
      extension,
      filters,
    });
    return;
  }

  const savedWithPicker = await saveWithBrowserPicker({
    content,
    filename,
    mimeType,
    extension,
    description,
  });
  if (savedWithPicker) return;

  downloadBlob(new Blob([content], { type: mimeType }), filename);
};

const buildExportStyles = ({ editorFontFamily, editorFontSize } = {}) => {
  const safeFontFamily = sanitizeCssFontFamily(editorFontFamily);
  const safeFontSize = normalizeExportFontSize(editorFontSize);

  return `
  <style>
    @page {
      size: A4;
      margin: 14mm;
    }
    html { scroll-behavior: smooth; }
    body,
    .pdf-export-root {
      font-family: ${safeFontFamily};
      font-size: ${safeFontSize}px;
      background-color: #f3f4f6 !important;
      color: #111827 !important;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    body {
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.45;
      margin: 0 0 34px;
      padding-bottom: 18px;
      text-align: center;
      border-bottom: 2px solid #f3f4f6;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.5;
      margin: 0 0 20px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    h3 {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.5;
      margin: 24px 0 12px;
    }
    p,
    li,
    .export-content {
      font-size: ${safeFontSize}px;
      line-height: 1.95;
    }
    .export-content {
      letter-spacing: 0;
    }
    .export-content br {
      line-height: 1.95;
    }
    .export-content h1 {
      margin: 32px 0 24px;
      padding: 16px 18px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
    }
    .export-content h2 {
      margin: 28px 0 16px;
      padding: 0 0 0 12px;
      border-bottom: none;
      border-left: 4px solid #0969da;
    }
    .export-content h3 {
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #d8dee4;
    }
    .export-content > div,
    .export-content .info-content,
    .export-content ul {
      margin-top: 10px;
      margin-bottom: 14px;
    }
    .export-content li {
      margin-bottom: 6px;
      padding-left: 4px;
    }
    .export-content .info-content {
      padding: 14px 16px;
      background: #ddf4ff;
      border-left: 4px solid #0969da;
      border-radius: 0 6px 6px 0;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    .export-shell {
      width: min(100%, max(48rem, calc(100vw - 4rem)));
      max-width: 96rem;
      margin: 0 auto;
    }
    .pdf-export-root .export-shell {
      width: 100% !important;
      max-width: 100% !important;
    }
    .pdf-export-root .container {
      padding: 32px !important;
    }
    .container { background-color: #ffffff !important; color: #111827 !important; }
    .toc summary::-webkit-details-marker { display: none; }
    .toc {
      margin-bottom: 32px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
    }
    .toc summary {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      color: #6b7280;
    }
    .toc nav {
      border-top: 1px solid #e5e7eb;
      padding: 12px 16px;
    }
    .toc ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .toc a {
      display: block;
      padding: 6px 10px;
      color: #0969da;
      text-decoration: none;
    }
    .toc summary::after {
      content: '-';
      float: right;
      font-size: 1rem;
      line-height: 1;
      color: #6b7280;
    }
    .toc:not([open]) summary::after { content: '+'; }
    .pdf-export-root .container {
      box-shadow: none !important;
      border: 1px solid #e5e7eb !important;
    }
    .pdf-export-root .break-after-page {
      break-after: page;
      page-break-after: always;
    }
    .pdf-export-root .copy-btn {
      display: none !important;
    }
    @media print {
      body { padding: 0; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .export-shell { width: 100% !important; max-width: 100% !important; }
      .container { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
      .export-content h1 { break-before: page; page-break-before: always; }
      .break-after-page { page-break-after: always; }
      .copy-btn { display: none !important; }
    }
  </style>
`;
};

const buildExportBodyHtml = (htmlContent, pageTitle, tocHtml = '') => (
  `<div class="export-shell"><div class="container bg-white p-6 md:p-10 shadow-lg rounded-lg border border-gray-200"><h1 class="text-3xl font-bold mb-8 text-center border-b-2 border-gray-100 pb-4 text-gray-900">${pageTitle}</h1>${tocHtml}${htmlContent}</div></div>`
);

const createPageExport = (page, currentImages) => {
  const cleanHtml = stripDarkClasses(parseMarkdown(page.content, currentImages));
  const sectionId = 'page-1';
  const { html: anchoredHtml, headings } = addHeadingAnchors(cleanHtml, sectionId);
  const tocItems = [{ id: sectionId, title: page.title, depth: 0 }, ...headings.map(({ id, title, level }) => ({
    id,
    title,
    depth: Math.max(1, level - 1),
  }))];
  const contentHtml = `<section class="mb-8"><h2 id="${sectionId}" class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2><div class="export-content prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">${anchoredHtml}</div></section>`;

  return {
    contentHtml,
    tocHtml: buildTocHtml(tocItems),
  };
};

const createScenarioExport = (pages, currentImages) => {
  const tocItems = [];
  const contentHtml = pages.map((page, pageIndex) => {
    const sectionId = `page-${pageIndex + 1}`;
    const { html: anchoredHtml, headings } = addHeadingAnchors(stripDarkClasses(parseMarkdown(page.content, currentImages)), sectionId);
    const breakClass = pageIndex < pages.length - 1 ? ' break-after-page' : '';

    tocItems.push({ id: sectionId, title: page.title, depth: 0 });
    headings.forEach(({ id, title, level }) => {
      tocItems.push({
        id,
        title,
        depth: Math.max(1, level - 1),
      });
    });

    return `
      <section class="mb-8${breakClass}">
        <h2 id="${sectionId}" class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2>
        <div class="export-content prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">
          ${anchoredHtml}
        </div>
      </section>
    `;
  }).join('');

  return {
    contentHtml,
    tocHtml: buildTocHtml(tocItems),
  };
};

const generateHtmlContent = (htmlContent, pageTitle, tocHtml = '', options = {}) => {
  const { includeTailwind = true, editorFontFamily, editorFontSize } = options;
  const tailwindConfig = includeTailwind
    ? `<script>tailwind = { darkMode: 'class' }</script><script src="https://cdn.tailwindcss.com"></script>`
    : '';
  const script = `
    <script>
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-btn')) {
           const container = e.target.closest('.group');
           const contentDiv = container.querySelector('.info-content');
           if(contentDiv){
               const t = contentDiv.innerText;
               const a = document.createElement("textarea");
               a.value = t; document.body.appendChild(a); a.select();
               document.execCommand('copy'); document.body.removeChild(a);
               const o = e.target.innerText; e.target.innerText='完了';
               setTimeout(()=>{e.target.innerText=o},1500);
           }
        }
      });
    </script>
  `;

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageTitle}</title>${tailwindConfig}${buildExportStyles({ editorFontFamily, editorFontSize })}</head><body class="bg-gray-100 text-gray-900 p-4 md:p-8 min-h-screen">${buildExportBodyHtml(htmlContent, pageTitle, tocHtml)}${script}</body></html>`;
};

const getElectronIpc = () => {
  try {
    return window.require?.('electron')?.ipcRenderer ?? null;
  } catch {
    return null;
  }
};

const openPrintablePdfFallback = (html) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  }, { once: true });
};

const downloadPdf = async ({ contentHtml, pageTitle, tocHtml, filename, editorFontFamily, editorFontSize }) => {
  const html = generateHtmlContent(contentHtml, pageTitle, tocHtml, {
    includeTailwind: false,
    editorFontFamily,
    editorFontSize,
  });
  const ipcRenderer = getElectronIpc();

  if (ipcRenderer) {
    await ipcRenderer.invoke('export-pdf', {
      html,
      filename,
      extension: 'pdf',
      filters: PDF_FILTERS,
    });
    return;
  }

  openPrintablePdfFallback(html);
};

export function useExporter({ scenarioTitle, pagesRef, imagesRef, activePageIdRef, editorFontFamily, editorFontSize }) {
  const handleDownloadMd = useCallback(async () => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    let combinedText = currentPages.map(p => `# ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    combinedText = combinedText.replace(IMAGE_TOKEN_PATTERN, (match, alt, id) => {
      const src = currentImages[id];
      return src ? `![${alt}](${src})` : match;
    });
    await saveTextFile({
      content: combinedText,
      filename: `${scenarioTitle}.md`,
      mimeType: 'text/markdown',
      extension: 'md',
      filters: MARKDOWN_FILTERS,
      description: 'Markdown',
    });
  }, [scenarioTitle, pagesRef, imagesRef]);

  const handleDownloadPageHtml = useCallback(async () => {
    const currentPages = pagesRef.current;
    const activeId = activePageIdRef.current;
    const activePage = currentPages.find(p => p.id === activeId) || currentPages[0];
    const currentImages = imagesRef.current;
    if (!activePage) return;

    const { contentHtml, tocHtml } = createPageExport(activePage, currentImages);
    await saveTextFile({
      content: generateHtmlContent(contentHtml, scenarioTitle, tocHtml, { editorFontFamily, editorFontSize }),
      filename: `${activePage.title}.html`,
      mimeType: 'text/html',
      extension: 'html',
      filters: HTML_FILTERS,
      description: 'HTML',
    });
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef, editorFontFamily, editorFontSize]);

  const handleDownloadScenarioHtml = useCallback(async () => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    if (!currentPages.length) return;

    const { contentHtml, tocHtml } = createScenarioExport(currentPages, currentImages);
    await saveTextFile({
      content: generateHtmlContent(contentHtml, scenarioTitle, tocHtml, { editorFontFamily, editorFontSize }),
      filename: `${scenarioTitle}.html`,
      mimeType: 'text/html',
      extension: 'html',
      filters: HTML_FILTERS,
      description: 'HTML',
    });
  }, [scenarioTitle, pagesRef, imagesRef, editorFontFamily, editorFontSize]);

  const handleDownloadPagePdf = useCallback(async () => {
    const currentPages = pagesRef.current;
    const activeId = activePageIdRef.current;
    const activePage = currentPages.find(p => p.id === activeId) || currentPages[0];
    const currentImages = imagesRef.current;
    if (!activePage) return;

    const { contentHtml, tocHtml } = createPageExport(activePage, currentImages);
    await downloadPdf({
      contentHtml,
      pageTitle: scenarioTitle,
      tocHtml,
      filename: `${activePage.title}.pdf`,
      editorFontFamily,
      editorFontSize,
    });
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef, editorFontFamily, editorFontSize]);

  const handleDownloadScenarioPdf = useCallback(async () => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    if (!currentPages.length) return;

    const { contentHtml, tocHtml } = createScenarioExport(currentPages, currentImages);
    await downloadPdf({
      contentHtml,
      pageTitle: scenarioTitle,
      tocHtml,
      filename: `${scenarioTitle}.pdf`,
      editorFontFamily,
      editorFontSize,
    });
  }, [scenarioTitle, pagesRef, imagesRef, editorFontFamily, editorFontSize]);

  return {
    handleDownloadMd,
    handleDownloadPageHtml,
    handleDownloadScenarioHtml,
    handleDownloadPagePdf,
    handleDownloadScenarioPdf,
  };
}

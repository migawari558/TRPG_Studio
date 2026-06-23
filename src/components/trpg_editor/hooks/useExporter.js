import { useCallback } from 'react';
import { parseMarkdown } from '../../../utils/markdownParser';

const DARK_CLASS_PATTERN = /dark:[^\s"']+/g;
const IMAGE_TOKEN_PATTERN = /!\[(.*?)\]\(image:(.*?)\)/g;
const TAG_PATTERN = /<[^>]+>/g;

const stripDarkClasses = (html) => html.replace(DARK_CLASS_PATTERN, '');
const stripTags = (value) => value.replace(TAG_PATTERN, '').trim();

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

const buildExportStyles = () => `
  <style>
    html { scroll-behavior: smooth; }
    body,
    .pdf-export-root {
      font-family: "Hiragino Sans", "Yu Gothic UI", "Meiryo", sans-serif;
      background-color: #f3f4f6 !important;
      color: #111827 !important;
      word-wrap: break-word;
      overflow-wrap: break-word;
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
    .container { background-color: #ffffff !important; color: #111827 !important; }
    .toc summary::-webkit-details-marker { display: none; }
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
      .break-after-page { page-break-after: always; }
      .copy-btn { display: none !important; }
    }
  </style>
`;

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
  const contentHtml = `<section class="mb-8"><h2 id="${sectionId}" class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2><div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">${anchoredHtml}</div></section>`;

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
        <div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">
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

const generateHtmlContent = (htmlContent, pageTitle, tocHtml = '') => {
  const tailwindConfig = `<script>tailwind = { darkMode: 'class' }</script><script src="https://cdn.tailwindcss.com"></script>`;
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

  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageTitle}</title>${tailwindConfig}${buildExportStyles()}</head><body class="bg-gray-100 text-gray-900 p-4 md:p-8 min-h-screen">${buildExportBodyHtml(htmlContent, pageTitle, tocHtml)}${script}</body></html>`;
};

const downloadPdf = async ({ contentHtml, pageTitle, tocHtml, filename }) => {
  const { default: html2pdf } = await import('html2pdf.js');
  const source = document.createElement('div');
  source.className = 'pdf-export-root';
  source.style.position = 'fixed';
  source.style.left = '-10000px';
  source.style.top = '0';
  source.style.width = '794px';
  source.style.background = '#ffffff';
  source.style.color = '#111827';
  source.style.zIndex = '-1';
  source.innerHTML = `${buildExportStyles()}${buildExportBodyHtml(contentHtml, pageTitle, tocHtml)}`;

  document.body.appendChild(source);

  try {
    await html2pdf()
      .set({
        filename,
        margin: [10, 10, 12, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: ['.toc', 'h1', 'h2', 'h3'],
        },
      })
      .from(source)
      .save();
  } finally {
    document.body.removeChild(source);
  }
};

export function useExporter({ scenarioTitle, pagesRef, imagesRef, activePageIdRef }) {
  const handleDownloadMd = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    let combinedText = currentPages.map(p => `# ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    combinedText = combinedText.replace(IMAGE_TOKEN_PATTERN, (match, alt, id) => {
      const src = currentImages[id];
      return src ? `![${alt}](${src})` : match;
    });
    downloadBlob(new Blob([combinedText], { type: 'text/markdown' }), `${scenarioTitle}.md`);
  }, [scenarioTitle, pagesRef, imagesRef]);

  const handleDownloadPageHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const activeId = activePageIdRef.current;
    const activePage = currentPages.find(p => p.id === activeId) || currentPages[0];
    const currentImages = imagesRef.current;
    if (!activePage) return;

    const { contentHtml, tocHtml } = createPageExport(activePage, currentImages);
    downloadBlob(new Blob([generateHtmlContent(contentHtml, scenarioTitle, tocHtml)], { type: 'text/html' }), `${activePage.title}.html`);
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef]);

  const handleDownloadScenarioHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    if (!currentPages.length) return;

    const { contentHtml, tocHtml } = createScenarioExport(currentPages, currentImages);
    downloadBlob(new Blob([generateHtmlContent(contentHtml, scenarioTitle, tocHtml)], { type: 'text/html' }), `${scenarioTitle}.html`);
  }, [scenarioTitle, pagesRef, imagesRef]);

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
    });
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef]);

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
    });
  }, [scenarioTitle, pagesRef, imagesRef]);

  return {
    handleDownloadMd,
    handleDownloadPageHtml,
    handleDownloadScenarioHtml,
    handleDownloadPagePdf,
    handleDownloadScenarioPdf,
  };
}

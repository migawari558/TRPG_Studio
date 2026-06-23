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
    body {
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 32px;
      padding-bottom: 18px;
      text-align: center;
      border-bottom: 2px solid #f3f4f6;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      line-height: 1.4;
      margin: 0 0 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb;
    }
    h3 {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.4;
      margin: 18px 0 10px;
    }
    p, li {
      font-size: 13px;
      line-height: 1.75;
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
      color: #111827;
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

const extractMarkdownHeadings = (content) => (
  content
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      level: match[1].length,
      title: match[2].replace(/[*_~`]/g, '').trim(),
    }))
);

const cleanMarkdownLine = (line) => (
  line
    .replace(/^#{1,6}\s+/, '')
    .replace(/^>\s?/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .trim()
);

const loadPdfImage = (src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = src;
});

const createPdfRenderer = () => {
  const scale = 2;
  const width = 794 * scale;
  const height = 1123 * scale;
  const margin = 64 * scale;
  const contentWidth = width - margin * 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const pages = [];
  let y = margin;

  const resetPage = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#111827';
    y = margin;
  };

  const commitPage = () => {
    pages.push(canvas.toDataURL('image/jpeg', 0.96));
    resetPage();
  };

  const ensureSpace = (neededHeight) => {
    if (y + neededHeight > height - margin) {
      commitPage();
    }
  };

  const setFont = ({ size = 14, weight = 400, color = '#111827' } = {}) => {
    ctx.font = `${weight} ${size * scale}px "Yu Gothic UI", "Meiryo", sans-serif`;
    ctx.fillStyle = color;
  };

  const drawRule = () => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(width - margin, y);
    ctx.stroke();
    y += 16 * scale;
  };

  const wrapText = (text, maxWidth) => {
    const chars = [...text];
    const lines = [];
    let current = '';

    chars.forEach((char) => {
      const next = current + char;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    });

    if (current) lines.push(current);
    return lines;
  };

  const drawText = (text, options = {}) => {
    const {
      size = 14,
      weight = 400,
      color = '#111827',
      lineHeight = size * 1.75,
      indent = 0,
      gapAfter = 8,
    } = options;
    const safeText = text || ' ';
    setFont({ size, weight, color });
    const lines = wrapText(safeText, contentWidth - indent * scale);
    const blockHeight = (lines.length * lineHeight + gapAfter) * scale;
    ensureSpace(blockHeight);
    lines.forEach((line) => {
      ctx.fillText(line, margin + indent * scale, y);
      y += lineHeight * scale;
    });
    y += gapAfter * scale;
  };

  const drawImage = async (src, alt) => {
    if (!src) {
      drawText(`[画像: ${alt || 'image'}]`, { size: 12, color: '#6b7280' });
      return;
    }

    const image = await loadPdfImage(src);
    if (!image) {
      drawText(`[画像: ${alt || 'image'}]`, { size: 12, color: '#6b7280' });
      return;
    }

    const ratio = Math.min(contentWidth / image.width, 360 * scale / image.height, 1);
    const imageWidth = image.width * ratio;
    const imageHeight = image.height * ratio;
    ensureSpace(imageHeight + 24 * scale);
    ctx.drawImage(image, margin, y, imageWidth, imageHeight);
    y += imageHeight + 16 * scale;
  };

  resetPage();

  return {
    drawRule,
    drawText,
    drawImage,
    commitPage,
    getPages: () => pages,
  };
};

const drawMarkdownContent = async (renderer, content, images) => {
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const imageMatch = line.match(IMAGE_TOKEN_PATTERN);
    if (imageMatch) {
      const tokenPattern = new RegExp(IMAGE_TOKEN_PATTERN.source, 'g');
      let match;
      while ((match = tokenPattern.exec(line)) !== null) {
        await renderer.drawImage(images[match[2]], match[1]);
      }
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const size = level === 1 ? 22 : level === 2 ? 18 : 15;
      renderer.drawText(cleanMarkdownLine(line), { size, weight: 700, gapAfter: 10 });
      if (level <= 2) renderer.drawRule();
      continue;
    }

    const cleaned = cleanMarkdownLine(line);
    if (!cleaned) {
      renderer.drawText(' ', { size: 8, lineHeight: 8, gapAfter: 0 });
      continue;
    }

    renderer.drawText(cleaned, { size: 13 });
  }
};

const downloadPdf = async ({ pages, pageTitle, currentImages, filename }) => {
  const { jsPDF } = await import('jspdf');
  const renderer = createPdfRenderer();

  renderer.drawText(pageTitle, { size: 26, weight: 700, gapAfter: 12 });
  renderer.drawRule();
  renderer.drawText('目次', { size: 18, weight: 700, gapAfter: 12 });
  pages.forEach((page, pageIndex) => {
    renderer.drawText(`${pageIndex + 1}. ${page.title}`, { size: 13, weight: 700, gapAfter: 4 });
    extractMarkdownHeadings(page.content).forEach((heading) => {
      renderer.drawText(heading.title, {
        size: 11,
        color: '#4b5563',
        indent: Math.max(1, heading.level) * 12,
        gapAfter: 2,
      });
    });
  });

  renderer.commitPage();

  for (const page of pages) {
    renderer.drawText(page.title, { size: 22, weight: 700, gapAfter: 12 });
    renderer.drawRule();
    await drawMarkdownContent(renderer, page.content, currentImages);
    renderer.commitPage();
  }

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const renderedPages = renderer.getPages();
  renderedPages.forEach((image, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(image, 'JPEG', 0, 0, 210, 297);
  });

  downloadBlob(pdf.output('blob'), filename);
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

    await downloadPdf({
      pages: [activePage],
      pageTitle: scenarioTitle,
      currentImages,
      filename: `${activePage.title}.pdf`,
    });
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef]);

  const handleDownloadScenarioPdf = useCallback(async () => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    if (!currentPages.length) return;

    await downloadPdf({
      pages: currentPages,
      pageTitle: scenarioTitle,
      currentImages,
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

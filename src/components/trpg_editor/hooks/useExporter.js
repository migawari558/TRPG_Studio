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

export function useExporter({ scenarioTitle, pagesRef, imagesRef, activePageIdRef }) {
  const generateHtmlContent = (htmlContent, pageTitle, tocHtml = '') => {
    const tailwindConfig = `<script>tailwind = { darkMode: 'class' }</script><script src="https://cdn.tailwindcss.com"></script>`;
    const styles = `
      <style>
        html { scroll-behavior: smooth; }
        body { 
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
        .container { background-color: #ffffff !important; color: #111827 !important; }
        .toc summary::-webkit-details-marker { display: none; }
        .toc summary::after {
          content: '−';
          float: right;
          font-size: 1rem;
          line-height: 1;
          color: #6b7280;
        }
        .toc:not([open]) summary::after { content: '+'; }
        @media print {
          body { padding: 0; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .export-shell { width: 100% !important; max-width: 100% !important; }
          .container { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; }
          .break-after-page { page-break-after: always; }
          .copy-btn { display: none !important; }
        }
      </style>
    `;
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
    return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageTitle}</title>${tailwindConfig}${styles}</head><body class="bg-gray-100 text-gray-900 p-4 md:p-8 min-h-screen"><div class="export-shell"><div class="container bg-white p-6 md:p-10 shadow-lg rounded-lg border border-gray-200"><h1 class="text-3xl font-bold mb-8 text-center border-b-2 border-gray-100 pb-4 text-gray-900">${pageTitle}</h1>${tocHtml}${htmlContent}</div></div>${script}</body></html>`;
  };

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
    
    const cleanHtml = stripDarkClasses(parseMarkdown(activePage.content, currentImages));
    const sectionId = 'page-1';
    const { html: anchoredHtml, headings } = addHeadingAnchors(cleanHtml, sectionId);
    const tocItems = [{ id: sectionId, title: activePage.title, depth: 0 }, ...headings.map(({ id, title, level }) => ({
      id,
      title,
      depth: Math.max(1, level - 1),
    }))];
    const contentHtml = `<section class="mb-8"><h2 id="${sectionId}" class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${activePage.title}</h2><div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">${anchoredHtml}</div></section>`;
    downloadBlob(new Blob([generateHtmlContent(contentHtml, scenarioTitle, buildTocHtml(tocItems))], { type: 'text/html' }), `${activePage.title}.html`);
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef]);

  const handleDownloadScenarioHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;

    const tocItems = [];
    const contentHtml = currentPages.map((page, pageIndex) => {
      const sectionId = `page-${pageIndex + 1}`;
      const { html: anchoredHtml, headings } = addHeadingAnchors(stripDarkClasses(parseMarkdown(page.content, currentImages)), sectionId);

      tocItems.push({ id: sectionId, title: page.title, depth: 0 });
      headings.forEach(({ id, title, level }) => {
        tocItems.push({
          id,
          title,
          depth: Math.max(1, level - 1),
        });
      });

      return `
      <section class="mb-8 break-after-page">
        <h2 id="${sectionId}" class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2>
        <div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">
          ${anchoredHtml}
        </div>
      </section>
    `;
    }).join('');
    downloadBlob(new Blob([generateHtmlContent(contentHtml, scenarioTitle, buildTocHtml(tocItems))], { type: 'text/html' }), `${scenarioTitle}.html`);
  }, [scenarioTitle, pagesRef, imagesRef]);

  return {
    handleDownloadMd,
    handleDownloadPageHtml,
    handleDownloadScenarioHtml
  };
}

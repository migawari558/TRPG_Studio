import { useCallback } from 'react';
import { parseMarkdown } from '../../../utils/markdownParser';

export function useExporter({ scenarioTitle, pagesRef, imagesRef, activePageIdRef }) {
  
  const generateHtmlContent = (htmlContent, pageTitle) => {
    const tailwindConfig = `<script>tailwind = { darkMode: 'class' }</script><script src="https://cdn.tailwindcss.com"></script>`;
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        body { 
          font-family: 'Noto Sans JP', sans-serif; 
          background-color: #f3f4f6 !important; 
          color: #111827 !important;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .container { background-color: #ffffff !important; color: #111827 !important; }
        @media print {
          body { padding: 0; background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
    return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${pageTitle}</title>${tailwindConfig}${styles}</head><body class="bg-gray-100 text-gray-900 p-4 md:p-8 min-h-screen"><div class="container max-w-3xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-lg border border-gray-200"><h1 class="text-3xl font-bold mb-8 text-center border-b-2 border-gray-100 pb-4 text-gray-900">${pageTitle}</h1>${htmlContent}</div>${script}</body></html>`;
  };

  const handleDownloadMd = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    let combinedText = currentPages.map(p => `# ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
    combinedText = combinedText.replace(/!\\\[(.*?) E\]\(image:(.*?)\)/g, (match, alt, id) => {
      const src = currentImages[id];
      return src ? `![${alt}](${src})` : match;
    });
    const blob = new Blob([combinedText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenarioTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenarioTitle, pagesRef, imagesRef]);

  const handleDownloadPageHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const activeId = activePageIdRef.current;
    const activePage = currentPages.find(p => p.id === activeId) || currentPages[0];
    const currentImages = imagesRef.current;
    
    const rawHtml = parseMarkdown(activePage.content, currentImages);
    const cleanHtml = rawHtml.replace(/dark:[^\s"']+/g, '');
    const contentHtml = `<section class="mb-8"><h2 class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${activePage.title}</h2><div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">${cleanHtml}</div></section>`;
    const fullHtml = generateHtmlContent(contentHtml, scenarioTitle);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenarioTitle, pagesRef, activePageIdRef, imagesRef]);

  const handleDownloadScenarioHtml = useCallback(() => {
    const currentPages = pagesRef.current;
    const currentImages = imagesRef.current;
    
    const contentHtml = currentPages.map(page => `
      <section class="mb-8 break-after-page">
        <h2 class="text-xl font-bold mb-4 pb-1 border-b border-gray-200 text-gray-900">${page.title}</h2>
        <div class="prose prose-sm max-w-none text-gray-800 leading-relaxed text-sm">
          ${parseMarkdown(page.content, currentImages).replace(/dark:[^\s"']+/g, '')}
        </div>
      </section>
    `).join('');
    const fullHtml = generateHtmlContent(contentHtml, scenarioTitle);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenarioTitle}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [scenarioTitle, pagesRef, imagesRef]);

  return {
    handleDownloadMd,
    handleDownloadPageHtml,
    handleDownloadScenarioHtml
  };
}

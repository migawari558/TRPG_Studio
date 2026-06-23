const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const escapeAttribute = (value) => escapeHtml(value)
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderImageTag = (src, alt) => (
  `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`
);

const renderDialogue = (html) => html.replace(/^\[(.*?)\]\s*(.*)$/gm, (match, name, content) => (
  `<div class="mb-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-100"><strong class="font-bold text-indigo-600 dark:text-indigo-400 select-none mr-1">${name}</strong><span class="text-indigo-600 dark:text-indigo-400 font-bold">「</span>${content}<span class="text-indigo-600 dark:text-indigo-400 font-bold">」</span></div>`
));

const renderInfoBlocks = (html) => html.replace(/(^&gt;[ \t].+(?:\n&gt;[ \t].+)*)/gm, (match) => {
  const lines = match.split('\n');
  const firstLineContent = lines[0].replace(/^&gt;[ \t]/, '');
  const titleMatch = firstLineContent.match(/^\[(.*?)\][ \t]*(.*)$/);
  const titleHtml = titleMatch
    ? `<div class="font-bold text-indigo-700 dark:text-indigo-300 mb-1 block text-sm">[${titleMatch[1]}]</div>`
    : '';
  const bodyLines = titleMatch ? [titleMatch[2], ...lines.slice(1)] : [firstLineContent, ...lines.slice(1)];
  const contentBody = bodyLines
    .map((line, index) => (index === 0 ? line : line.replace(/^&gt;[ \t]/, '')))
    .join('\n');

  return `<div class="relative group mt-2 mb-2"><div class="info-content bg-indigo-50 dark:bg-gray-800 border-l-4 border-indigo-400 p-4 pr-16 text-gray-800 dark:text-gray-200 rounded-r leading-relaxed text-sm">${titleHtml}<div class="inline-block">${contentBody}</div></div><button class="copy-btn absolute top-2 right-2 bg-white dark:bg-gray-700 text-xs font-medium px-2 py-1 rounded border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-pointer z-10">コピー</button></div>`;
});

const renderLists = (html) => {
  const listItemHtml = html.replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc marker:text-indigo-500 pl-1">$1</li>');
  const wrappedListHtml = listItemHtml.replace(/((?:<li [^>]+>.*?<\/li>(?:\n|$))+)/g, '<ul class="mt-2 mb-2 space-y-1">$1</ul>');
  return wrappedListHtml.replace(/(<ul[^>]*>)([\s\S]*?)(<\/ul>)/g, (match, open, content, close) => (
    open + content.replace(/\n/g, '') + close
  ));
};

const renderImages = (html, images) => {
  const withStoredImages = html.replace(/!\[(.*?)\]\(image:(.*?)\)/g, (match, alt, id) => {
    const src = images[id];
    return src ? renderImageTag(src, alt) : match;
  });

  return withStoredImages.replace(/!\[(.*?)\]\((data:image\/.*?)\)/g, (match, alt, src) => (
    renderImageTag(src, alt)
  ));
};

export const parseMarkdown = (text, images = {}) => {
  if (!text) return '';

  let html = escapeHtml(text);

  html = renderDialogue(html);
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2 text-gray-700 dark:text-gray-200 border-b pb-1 border-gray-300 dark:border-gray-600">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-100 border-l-4 border-indigo-500 pl-3">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2 text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 py-4 rounded-lg shadow-sm">$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-gray-400 dark:text-gray-500">$1</del>');
  html = html.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-200 dark:border-gray-700 border-dashed" />');
  html = renderInfoBlocks(html);
  html = html.replace(/\|\|([\s\S]*?)\|\|/g, '<div class="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm p-3 mt-1 mb-1 rounded border border-gray-200 dark:border-gray-700 leading-relaxed">$1</div>');
  html = renderLists(html);
  html = renderImages(html, images);
  html = html.replace(/(<\/(h1|h2|h3|div|ul|blockquote)>)\n/g, '$1');
  html = html.replace(/\n/g, '<br />');

  return html;
};

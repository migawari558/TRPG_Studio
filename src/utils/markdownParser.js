export const parseMarkdown = (text, images = {}) => {

  if (!text) return '';

  let html = text;



  // 1. Calculate Max Name Length for Dialogue Alignment

  const nameMatches = [...text.matchAll(/^\[(.*?)\]/gm)];

  let maxNameLength = 0;

  nameMatches.forEach(m => {

    let len = 0;

    const str = m[1];

    // Count visual length: Full-width = 1, Half-width = 0.5

    for (let i = 0; i < str.length; i++) {

      len += (str.charCodeAt(i) > 255) ? 1 : 0.5;

    }

    if (len > maxNameLength) maxNameLength = len;

  });



  // Set width based on calculated max length. 

  // Minimum 3em to prevent too narrow columns.

  const nameColumnWidth = (maxNameLength + 0.5) + 'em';



  // 2. Sanitize HTML

  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");



  // 3. Custom TRPG Dialogue

  // Using fixed width style for name column to align text

  html = html.replace(/^\[(.*?)\]\s*(.*)$/gm, (match, name, content) => {

    return `<div class="flex gap-3 mb-1.5 items-start group">

      <div class="flex-shrink-0 pt-2 text-right font-bold text-sm text-indigo-600 dark:text-indigo-400 select-none" style="width: ${nameColumnWidth};">${name}</div>

      <div class="flex-grow bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg rounded-tl-none text-gray-800 dark:text-gray-100 leading-relaxed shadow-sm border border-gray-200 dark:border-gray-600 text-sm">${content}</div>

    </div>`;

  });



  // Headers

  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-2 text-gray-700 dark:text-gray-200 border-b pb-1 border-gray-300 dark:border-gray-600">$1</h3>');

  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-3 text-gray-800 dark:text-gray-100 border-l-4 border-indigo-500 pl-3">$1</h2>');

  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-4 mb-2 text-center text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 py-4 rounded-lg shadow-sm">$1</h1>');



  // Formatting

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>');

  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 dark:text-gray-400">$1</em>');

  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-gray-400 dark:text-gray-500">$1</del>');

  html = html.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-200 dark:border-gray-700 border-dashed" />');



  // Blocks (Multi-line supported)

  html = html.replace(/(^&gt;[ \t].+(?:\n&gt;[ \t].+)*)/gm, (match) => {

    const lines = match.split('\n');



    let firstLineContent = lines[0].replace(/^&gt;[ \t]/, '');

    let titleHtml = '';

    let contentBody = '';



    const titleMatch = firstLineContent.match(/^\[(.*?)\][ \t]*(.*)$/);

    if (titleMatch) {

      const titleText = titleMatch[1];

      titleHtml = `<div class="font-bold text-indigo-700 dark:text-indigo-300 mb-1 block text-sm">[${titleText}]</div>`;

      contentBody = titleMatch[2];

    } else {

      contentBody = firstLineContent;

    }



    for (let i = 1; i < lines.length; i++) {

      const lineContent = lines[i].replace(/^&gt;[ \t]/, '');

      contentBody += '\n' + lineContent;

    }



    return `<div class="relative group mt-2 mb-2"><div class="info-content bg-indigo-50 dark:bg-gray-800 border-l-4 border-indigo-400 p-4 pr-16 text-gray-800 dark:text-gray-200 rounded-r leading-relaxed text-sm">${titleHtml}<div class="inline-block">${contentBody}</div></div><button class="copy-btn absolute top-2 right-2 bg-white dark:bg-gray-700 text-xs font-medium px-2 py-1 rounded border border-gray-200 dark:border-gray-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-pointer z-10">コピー</button></div>`;

  });

  html = html.replace(/\|\|([\s\S]*?)\|\|/g, '<div class="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm p-3 mt-1 mb-1 rounded border border-gray-200 dark:border-gray-700 leading-relaxed">$1</div>');



  // Lists

  html = html.replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc marker:text-indigo-500 pl-1">$1</li>');

  html = html.replace(/((?:<li [^>]+>.*?<\/li>(?:\n|$))+)/g, '<ul class="mt-2 mb-2 space-y-1">$1</ul>');

  html = html.replace(/(<ul[^>]*>)([\s\S]*?)(<\/ul>)/g, (match, open, content, close) => {

    return open + content.replace(/\n/g, '') + close;

  });



  // Image parsing

  html = html.replace(/!\[(.*?)\]\(image:(.*?)\)/g, (match, alt, id) => {

    const src = images[id] || '';

    return `<img src="${src}" alt="${alt}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`;

  });

  html = html.replace(/!\[(.*?)\]\((data:image\/.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md my-4" />');



  html = html.replace(/(<\/(h1|h2|h3|div|ul|blockquote)>)\n/g, '$1');

  html = html.replace(/\n/g, '<br />');

  return html;

};



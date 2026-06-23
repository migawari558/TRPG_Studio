import { generateId } from './helpers';

export const replaceEmbeddedImages = (content) => {
  const images = {};
  const processedContent = content.replace(/!\[(.*?)\]\((data:image\/.*?)\)/g, (match, alt, base64) => {
    const id = generateId();
    images[id] = base64;
    return `![${alt}](image:${id})`;
  });

  return { images, processedContent };
};

export const parseImportedPages = (content) => {
  const rawPages = content.split(/\n\n---\n\n/);

  return rawPages.map((pageContent, index) => {
    const trimmedPage = pageContent.trim();
    const lines = trimmedPage.split('\n');
    let title = `ページ ${index + 1}`;
    let body = trimmedPage;

    if (lines[0] && lines[0].startsWith('# ')) {
      title = lines[0].substring(2).trim();
      body = lines.slice(1).join('\n').trim();
    }

    return {
      id: generateId(),
      title,
      content: body,
    };
  });
};

export const extractImportedCharacters = (content) => {
  const charSet = new Set(['GM', 'PL1']);
  const charRegex = /^\[(.*?)\]/gm;
  let match;

  while ((match = charRegex.exec(content)) !== null) {
    if (match[1]) {
      charSet.add(match[1]);
    }
  }

  return Array.from(charSet);
};

export const createImportedScenario = ({ fileName, content }) => {
  const { images, processedContent } = replaceEmbeddedImages(content);
  const pages = parseImportedPages(processedContent);

  return {
    id: generateId(),
    title: fileName.replace(/\.md$/, ''),
    pages: pages.length > 0 ? pages : [{ id: generateId(), title: 'メイン', content: processedContent }],
    characters: extractImportedCharacters(processedContent),
    images,
    lastModified: Date.now(),
  };
};

export const readFileAsText = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (event) => resolve(event.target.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsText(file);
});

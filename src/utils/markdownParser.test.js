import { describe, expect, it } from 'vitest';
import { parseMarkdown } from './markdownParser';

describe('parseMarkdown', () => {
  it('escapes dangerous alt text when rendering embedded images', () => {
    const html = parseMarkdown('![x" onerror="alert(1)](image:test)', {
      test: 'data:image/png;base64,abc123',
    });

    expect(html).toContain('src="data:image/png;base64,abc123"');
    expect(html).toContain('alt="x&quot; onerror=&quot;alert(1)"');
    expect(html).not.toContain('onerror="alert(1)" class=');
  });

  it('renders data url images and leaves missing image ids untouched', () => {
    const html = parseMarkdown([
      '![inline](data:image/png;base64,xyz)',
      '![missing](image:unknown)',
    ].join('\n'));

    expect(html).toContain('src="data:image/png;base64,xyz"');
    expect(html).toContain('![missing](image:unknown)');
  });
});

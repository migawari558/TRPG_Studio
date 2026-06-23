export const EDITOR_FONT_OPTIONS = [
  {
    value: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    label: '等幅フォント (Monospace)',
  },
  {
    value: '"BIZ UDPGothic", "Yu Gothic UI", "Hiragino Sans", "Meiryo", sans-serif',
    label: 'ゴシック体 (システム標準)',
  },
  {
    value: '"BIZ UDPMincho", "Yu Mincho", "Hiragino Mincho ProN", "MS PMincho", serif',
    label: '明朝体 (システム標準)',
  },
  {
    value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    label: 'システム標準 (Sans-serif)',
  },
  {
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
    label: 'システム標準 (Serif)',
  },
];

const LEGACY_FONT_FAMILY_MAP = {
  monospace: EDITOR_FONT_OPTIONS[0].value,
  "'Noto Sans JP', sans-serif": EDITOR_FONT_OPTIONS[1].value,
  "'Noto Serif JP', serif": EDITOR_FONT_OPTIONS[2].value,
  'sans-serif': EDITOR_FONT_OPTIONS[3].value,
  serif: EDITOR_FONT_OPTIONS[4].value,
};

export function normalizeEditorFontFamily(value) {
  if (!value) return EDITOR_FONT_OPTIONS[0].value;
  return LEGACY_FONT_FAMILY_MAP[value] || value;
}

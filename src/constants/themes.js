export const APP_THEMES = [
  {
    id: 'default',
    label: 'defaultテーマ',
    description: '既存の装飾的なテーマです。',
    rootClassName: 'theme-default',
    backgroundStyle: 'decorative',
    editorStyle: 'glass',
  },
  {
    id: 'simple',
    label: 'simpleテーマ',
    description: '白黒2トーンで構成された、フラットで簡素なテーマです。',
    rootClassName: 'theme-simple',
    backgroundStyle: 'plain',
    editorStyle: 'minimal',
  },
  {
    id: 'github',
    label: 'GitHubテーマ',
    description: 'GitHub Primer風のキャンバス、境界線、青アクセントで構成されたテーマです。',
    rootClassName: 'theme-github',
    backgroundStyle: 'plain',
    editorStyle: 'minimal',
  },
];

export const DEFAULT_APP_THEME = APP_THEMES[0].id;

export const getAppThemeDefinition = (themeId) => (
  APP_THEMES.find((theme) => theme.id === themeId) ?? APP_THEMES[0]
);

// Expanded Shortcut Definitions
export const DEFAULT_SHORTCUTS = {
  // Text Formatting
  bold: { id: 'bold', label: '太字', key: 'b', ctrl: true, shift: false, alt: false },
  heading: { id: 'heading', label: '見出し', key: 'h', ctrl: true, shift: false, alt: false },
  strikethrough: { id: 'strikethrough', label: '取り消し線', key: '-', ctrl: true, shift: true, alt: false },
  info: { id: 'info', label: '情報ブロック', key: 'i', ctrl: true, shift: false, alt: false },
  supplement: { id: 'supplement', label: '補足ブロック', key: '/', ctrl: true, shift: false, alt: false },
  
  // Insertions
  dialogue: { id: 'dialogue', label: 'セリフ追加', key: 'd', ctrl: true, shift: false, alt: false },
  image: { id: 'image', label: '画像挿入', key: 'g', ctrl: true, shift: true, alt: false },
  sceneAdd: { id: 'sceneAdd', label: 'シーン追加', key: 's', ctrl: true, shift: true, alt: false },
  
  // Actions
  clear: { id: 'clear', label: 'ページ全消去', key: 'delete', ctrl: true, shift: true, alt: false },
  pageAdd: { id: 'pageAdd', label: 'ページ追加', key: 'p', ctrl: true, shift: true, alt: false },
  
  // View Toggles
  npcList: { id: 'npcList', label: 'NPCリスト切替', key: 'u', ctrl: true, shift: true, alt: false },
  pageList: { id: 'pageList', label: 'ページ一覧切替', key: 'l', ctrl: true, shift: true, alt: false },
};

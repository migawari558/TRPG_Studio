import React, { memo } from 'react';
import {
  Clapperboard, MessageSquarePlus, Strikethrough, Clipboard, Info,
  Image as ImageIcon, Trash2, Type, Bold
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

export const EditorToolbar = memo(function EditorToolbar({
  activePageTitle,
  onTitleChange,
  onInsertText,
  onOpenSceneModal,
  onOpenCharPicker,
  onTriggerImageUpload,
  onClearPage,
  getShortcutLabel,
  isDarkMode
}) {
  return (
    <div className="h-10 flex items-center px-6 border-b border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0 gap-6">
      <input
        type="text"
        value={activePageTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        className="flex-1 font-bold text-lg bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-900 dark:text-white"
        placeholder="ページタイトルを入力..."
      />

      <div className="flex items-center gap-1 bg-gray-100 h-7 dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <ToolbarButton icon={<Clapperboard size={12} />} label="シーン" tooltip={getShortcutLabel('sceneAdd')} onClick={onOpenSceneModal} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<MessageSquarePlus size={12} />} label="セリフ" tooltip={getShortcutLabel('dialogue')} onClick={onOpenCharPicker} isDarkMode={isDarkMode} />

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <ToolbarButton icon={<Type size={12} />} label="見出し" tooltip={getShortcutLabel('heading')} onClick={() => onInsertText('## ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Bold size={12} />} label="太字" tooltip={getShortcutLabel('bold')} onClick={() => onInsertText('**', '**')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Strikethrough size={12} />} label="打消" tooltip={getShortcutLabel('strikethrough')} onClick={() => onInsertText('~~', '~~')} isDarkMode={isDarkMode} />

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <ToolbarButton icon={<Clipboard size={12} />} label="情報" tooltip={getShortcutLabel('info')} onClick={() => onInsertText('> [タイトル] ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Info size={12} />} label="補足" tooltip={getShortcutLabel('supplement')} onClick={() => onInsertText('||', '||')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<ImageIcon size={12} />} label="画像" tooltip={getShortcutLabel('image')} onClick={onTriggerImageUpload} isDarkMode={isDarkMode} />

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

        <ToolbarButton icon={<Trash2 size={12} />} label="クリア" tooltip={getShortcutLabel('clear')} onClick={onClearPage} danger isDarkMode={isDarkMode} />
      </div>
    </div>
  );
});

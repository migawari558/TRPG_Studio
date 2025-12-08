import React, { memo } from 'react';
import { 
  Clapperboard, MessageSquarePlus, Strikethrough, Clipboard, Info, 
  Image as ImageIcon, Trash2, Type
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
    <div className="h-10 flex items-center px-3 border-b border-gray-200 dark:border-gray-700 shrink-0 gap-3 bg-gray-50 dark:bg-gray-800">
      <input 
        type="text" 
        value={activePageTitle} 
        onChange={(e) => onTitleChange(e.target.value)} 
        className="flex-1 font-bold text-xs bg-transparent border-none focus:outline-none" 
        placeholder="ページタイトル" 
      />
      <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
      <div className="flex items-center gap-1">
        <ToolbarButton icon={<Clapperboard size={14} />} label="シーン" tooltip={getShortcutLabel('sceneAdd')} onClick={onOpenSceneModal} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<MessageSquarePlus size={14} />} label="セリフ" tooltip={getShortcutLabel('dialogue')} onClick={onOpenCharPicker} isDarkMode={isDarkMode} />
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <ToolbarButton icon={<Type size={14} />} label="見出し" tooltip={getShortcutLabel('heading')} onClick={() => onInsertText('## ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Strikethrough size={14} />} label="打消" tooltip={getShortcutLabel('strikethrough')} onClick={() => onInsertText('~~', '~~')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<span className="font-bold font-serif">B</span>} label="太字" tooltip={getShortcutLabel('bold')} onClick={() => onInsertText('**', '**')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Clipboard size={14} />} label="情報" tooltip={getShortcutLabel('info')} onClick={() => onInsertText('> [タイトル] ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Info size={14} />} label="補足" tooltip={getShortcutLabel('supplement')} onClick={() => onInsertText('||', '||')} isDarkMode={isDarkMode} />
        
        <ToolbarButton icon={<ImageIcon size={14} />} label="画像" tooltip={getShortcutLabel('image')} onClick={onTriggerImageUpload} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Trash2 size={14} />} label="クリア" tooltip={getShortcutLabel('clear')} onClick={onClearPage} danger isDarkMode={isDarkMode} />
      </div>
    </div>
  );
});
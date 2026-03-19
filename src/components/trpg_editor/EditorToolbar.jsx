import React, { memo, useState } from 'react';
import {
  Clapperboard, MessageSquarePlus, Strikethrough, Clipboard, Info,
  Image as ImageIcon, Type, Bold, Users, Edit2, Search, Replace
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { PromptModal } from '../modals/PromptModal';

export const EditorToolbar = memo(function EditorToolbar({
  activePageTitle,
  onTitleChange,
  onInsertText,
  onOpenSceneModal,
  onOpenCharPicker,
  onTriggerImageUpload,
  onToggleNpcList,
  onToggleSearch,
  getShortcutLabel,
  isDarkMode
}) {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleOpenRename = () => {
    setTempTitle(activePageTitle);
    setShowRenameModal(true);
  };

  const handleSaveRename = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setShowRenameModal(false);
  };

  return (
    <div className={`h-10 flex items-center px-2 sm:px-6 border-b z-10 shrink-0 gap-2 sm:gap-6 relative ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div 
        className={`group flex-1 cursor-pointer flex items-center gap-2 min-w-[40px] px-2 py-1 -ml-2 rounded-lg transition-colors backdrop-blur-sm ${isDarkMode ? 'hover:bg-gray-800/50 text-white' : 'hover:bg-white/50 text-gray-900'}`}
        onClick={handleOpenRename}
        title="ページ名を変更"
      >
        <div className="font-bold text-base sm:text-lg truncate leading-tight">
          {activePageTitle || 'ページタイトル'}
        </div>
        <button className="text-gray-400 hover:text-indigo-500 transition-colors shrink-0">
          <Edit2 size={14} />
        </button>
      </div>

      <div className={`flex items-center gap-1 h-9 p-1 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05)] border-t border-l border-b border-r overflow-x-auto shrink-0 max-w-[70vw] sm:max-w-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] backdrop-blur-xl ${isDarkMode ? 'bg-gray-800/50 border-t-white/20 border-l-white/20 border-b-black/40 border-r-black/40' : 'bg-white/50 border-t-white/80 border-l-white/80 border-b-white/20 border-r-white/20'}`}>
        <ToolbarButton icon={<Clapperboard size={12} />} label="シーン" tooltip={getShortcutLabel('sceneAdd')} onClick={onOpenSceneModal} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<MessageSquarePlus size={12} />} label="セリフ" tooltip={getShortcutLabel('dialogue')} onClick={onOpenCharPicker} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Users size={12} />} label="NPC" tooltip={getShortcutLabel('npcList')} onClick={onToggleNpcList} isDarkMode={isDarkMode} />

        <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

        <ToolbarButton icon={<Type size={12} />} label="見出し" tooltip={getShortcutLabel('heading')} onClick={() => onInsertText('## ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Bold size={12} />} label="太字" tooltip={getShortcutLabel('bold')} onClick={() => onInsertText('**', '**')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Strikethrough size={12} />} label="打消" tooltip={getShortcutLabel('strikethrough')} onClick={() => onInsertText('~~', '~~')} isDarkMode={isDarkMode} />

        <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

        <ToolbarButton icon={<Clipboard size={12} />} label="情報" tooltip={getShortcutLabel('info')} onClick={() => onInsertText('> [タイトル] ')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Info size={12} />} label="補足" tooltip={getShortcutLabel('supplement')} onClick={() => onInsertText('||', '||')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<ImageIcon size={12} />} label="画像" tooltip={getShortcutLabel('image')} onClick={onTriggerImageUpload} isDarkMode={isDarkMode} />
        
        <div className={`w-px h-5 mx-2 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

        <ToolbarButton icon={<Search size={12} />} label="検索" tooltip={getShortcutLabel('search')} onClick={() => onToggleSearch('search')} isDarkMode={isDarkMode} />
        <ToolbarButton icon={<Replace size={12} />} label="置換" tooltip={getShortcutLabel('replace')} onClick={() => onToggleSearch('replace')} isDarkMode={isDarkMode} />
      </div>

      <PromptModal 
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleSaveRename}
        title="ページ名の変更"
        placeholder="ページタイトル"
        value={tempTitle}
        onChange={setTempTitle}
        Icon={Edit2}
        isDarkMode={isDarkMode}
      />
    </div>
  );
});

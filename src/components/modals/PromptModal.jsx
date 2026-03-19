import React from 'react';

export function PromptModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  placeholder, 
  value, 
  onChange, 
  confirmText = '保存する', 
  cancelText = 'キャンセル', 
  Icon, 
  isDarkMode 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm rounded-3xl shadow-2xl border backdrop-blur-2xl ${isDarkMode ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/60 border-white/60 text-gray-900'} scale-100 transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-indigo-500" />}
            {title}
          </h3>
          <div className="mb-6">
            <input 
              type="text" 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onConfirm(); }}
              className={`w-full p-3 rounded-xl border shadow-inner backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/40 border-white/10 text-white focus:bg-gray-800/60' : 'bg-white/30 border-white/40 text-gray-900 focus:bg-white/50'} focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all`}
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm shadow-sm active:scale-95 ${isDarkMode ? 'hover:bg-gray-800/60 bg-gray-900/40 text-gray-300 border-white/10' : 'hover:bg-white/80 bg-white/40 text-gray-700 border-white/40'}`}
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              disabled={!value.trim()}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${isDarkMode ? 'bg-indigo-600/80 border-white/10 hover:bg-indigo-500/90' : 'bg-indigo-600/90 border-white/30 hover:bg-indigo-500'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

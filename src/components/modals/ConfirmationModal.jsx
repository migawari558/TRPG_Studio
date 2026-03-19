import React from 'react';
import { AlertTriangle, CheckCircle, Copy } from 'lucide-react';

export function ConfirmationModal({ 
  isOpen, onClose, onConfirm, title, message, type = 'info', 
  confirmText = 'OK', cancelText = 'キャンセル', isDarkMode 
}) {
  if (!isOpen) return null;

  let Icon = CheckCircle;
  let iconColor = 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
  let btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 text-white';

  if (type === 'alert') {
    Icon = AlertTriangle;
    iconColor = 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
    btnColor = 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-white';
  } else if (type === 'delete') {
    Icon = AlertTriangle;
    iconColor = 'text-red-500 bg-red-100 dark:bg-red-900/30';
    btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-500/30 text-white';
  } else if (type === 'duplicate') {
    Icon = Copy;
    iconColor = 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400';
    btnColor = 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 text-white';
  }

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm rounded-3xl shadow-2xl border backdrop-blur-2xl ${isDarkMode ? 'bg-gray-900/70 border-white/10 text-white' : 'bg-white/60 border-white/60 text-gray-900'} scale-100 transform transition-all overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 shadow-inner border backdrop-blur-md ${isDarkMode ? 'border-white/10' : 'border-white/50'} ${iconColor}`}>
            <Icon className="h-7 w-7" />
          </div>
          {title && <h3 className="text-xl font-bold mb-2">{title}</h3>}
          <p className="text-sm opacity-80 whitespace-pre-line leading-relaxed mb-6 px-4">
            {message}
          </p>
          <div className="flex justify-center gap-3">
            {type !== 'alert' && (
              <button 
                onClick={onClose} 
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border backdrop-blur-sm shadow-sm active:scale-95 ${isDarkMode ? 'hover:bg-gray-800/60 bg-gray-900/40 text-gray-300 border-white/10' : 'hover:bg-white/80 bg-white/40 text-gray-700 border-white/40'}`}
              >
                {cancelText}
              </button>
            )}
            <button 
              onClick={onConfirm} 
              autoFocus 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-98 ${btnColor}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

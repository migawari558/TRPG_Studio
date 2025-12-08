import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, type = 'info', confirmText = 'OK', cancelText = 'キャンセル', isDarkMode }) {
  if (!isOpen) return null;

  let Icon = CheckCircle;
  let iconColor = 'text-blue-500';
  let btnColor = 'bg-blue-600 hover:bg-blue-700';

  if (type === 'alert') {
    Icon = AlertTriangle;
    iconColor = 'text-yellow-500';
    btnColor = 'bg-yellow-500 hover:bg-yellow-600';
  } else if (type === 'delete') {
    Icon = AlertTriangle;
    iconColor = 'text-red-600';
    btnColor = 'bg-red-600 hover:bg-red-700';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-xs rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        <div className="p-5 text-center">
          <Icon className={`h-10 w-10 mx-auto mb-3 ${iconColor}`} />
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <p className="text-xs mb-4 opacity-70 whitespace-pre-line">
            {message}
          </p>
          <div className="flex justify-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
              {cancelText}
            </button>
            <button onClick={onConfirm} autoFocus className={`px-3 py-1.5 rounded text-xs text-white ${btnColor}`}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

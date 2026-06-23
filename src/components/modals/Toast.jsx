import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';

export function Toast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <Info size={18} className="text-blue-400" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors ml-2">
        <X size={16} />
      </button>
    </div>
  );
}

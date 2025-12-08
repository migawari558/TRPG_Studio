import React, { memo } from 'react';

export const ToolbarButton = memo(function ToolbarButton({ icon, label, tooltip, onClick, danger = false, isDarkMode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${danger ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`} title={tooltip || label}>
      {icon}<span className="hidden lg:inline">{label}</span>
    </button>
  );
});
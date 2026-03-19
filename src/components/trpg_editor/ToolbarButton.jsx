import React, { memo } from 'react';

export const ToolbarButton = memo(function ToolbarButton({ icon, label, tooltip, onClick, danger = false, isDarkMode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] border ${danger ? 'text-red-500 hover:bg-red-100/60 border-transparent hover:border-white/60 hover:shadow-md dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-500/30 active:scale-95' : 'text-gray-700 hover:bg-white/80 border-transparent hover:border-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:text-gray-200 dark:hover:bg-white/10 dark:hover:border-white/20 active:scale-95'}`} title={tooltip || label}>
      {icon}<span className="hidden lg:inline">{label}</span>
    </button>
  );
});
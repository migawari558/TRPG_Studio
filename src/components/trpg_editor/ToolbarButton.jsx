import React, { memo } from 'react';

export const ToolbarButton = memo(function ToolbarButton({ icon, label, tooltip, onClick, danger = false, appTheme, isDarkMode }) {
  const isSimpleTheme = appTheme === 'simple';
  return (
    <button onClick={onClick} className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${isSimpleTheme ? (danger ? (isDarkMode ? 'text-red-300 bg-transparent hover:bg-red-500/12 border-transparent active:scale-95' : 'text-red-700 bg-transparent hover:bg-black/6 border-transparent active:scale-95') : (isDarkMode ? 'text-white/82 bg-transparent hover:bg-white/8 border-transparent active:scale-95' : 'text-black/80 bg-transparent hover:bg-black/6 border-transparent active:scale-95')) : (danger ? 'rounded-lg backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-red-500 hover:bg-red-100/60 border-transparent hover:border-white/60 hover:shadow-md dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-500/30 active:scale-95' : 'rounded-lg backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-gray-700 hover:bg-white/80 border-transparent hover:border-white/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:text-gray-200 dark:hover:bg-white/10 dark:hover:border-white/20 active:scale-95')}`} title={tooltip || label}>
      {icon}<span className="hidden lg:inline">{label}</span>
    </button>
  );
});

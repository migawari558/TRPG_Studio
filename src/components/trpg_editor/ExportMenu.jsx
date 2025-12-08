import React, { useState, useEffect, useRef } from 'react';
import { Download, ChevronDown, FileText, File, FileCode } from 'lucide-react';

export function ExportMenu({ onDownloadMd, onDownloadPageHtml, onDownloadScenarioHtml, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-0.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
        title="保存・エクスポート"
      >
        <Download size={16} />
        <ChevronDown size={12} />
      </button>
      
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-xl border z-50 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="py-1">
            <button onClick={() => { onDownloadMd(); setIsOpen(false); }} className={`block w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <FileText size={14} className="text-indigo-500" /> 
              <span>Markdownで保存 <span className="text-[10px] opacity-50 ml-auto">.md</span></span>
            </button>
            <div className={`border-t my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
            <button onClick={() => { onDownloadPageHtml(); setIsOpen(false); }} className={`block w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <File size={14} className="text-green-500" /> 
              <span>ページをHTMLで保存 <span className="text-[10px] opacity-50 ml-auto">.html</span></span>
            </button>
            <button onClick={() => { onDownloadScenarioHtml(); setIsOpen(false); }} className={`block w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              <FileCode size={14} className="text-blue-500" /> 
              <span>全シナリオをHTMLで保存 <span className="text-[10px] opacity-50 ml-auto">.html</span></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { TRPGEditor } from './components/trpg_editor/TRPGEditor';
import { ScenarioDashboard } from './components/ScenarioDashboard';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { Toast } from './components/modals/Toast';
import { normalizeEditorFontFamily } from './constants/editorFonts';
import { DEFAULT_APP_THEME, getAppThemeDefinition } from './constants/themes';
import { useScenarioManager } from './hooks/useScenarioManager';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;
const APP_THEME_STORAGE_KEY = 'trpg_app_theme';
const COLOR_MODE_STORAGE_KEY = 'trpg_color_mode';
const FONT_FAMILY_STORAGE_KEY = 'trpg_editor_font_family';
const FONT_SIZE_STORAGE_KEY = 'trpg_editor_font_size';

// -----------------------------------------------------------------------------
// Main App Container
// -----------------------------------------------------------------------------

export default function App() {
  const {
    dataPath,
    setDataPath,
    scenarios,
    activeScenario,
    setActiveScenarioId,
    toastMessage,
    setToastMessage,
    showMissingFolderModal,
    missingFolderPath,
    handleMissingFolderChoice,
    handleCreateScenario,
    handleImportScenario,
    handleDeleteScenario,
    handleDuplicateScenario,
    handleReorderScenarios,
    saveActiveScenario,
  } = useScenarioManager({ fsModule: fs, pathModule: path });
  const [appTheme, setAppTheme] = useState(() => localStorage.getItem(APP_THEME_STORAGE_KEY) || DEFAULT_APP_THEME);
  const [colorMode, setColorMode] = useState(() => localStorage.getItem(COLOR_MODE_STORAGE_KEY) || 'light');
  const [editorFontFamily, setEditorFontFamily] = useState(() => normalizeEditorFontFamily(localStorage.getItem(FONT_FAMILY_STORAGE_KEY)));
  const [editorFontSize, setEditorFontSize] = useState(() => parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY) || '14', 10));
  const isDarkMode = colorMode === 'dark';
  const themeDefinition = getAppThemeDefinition(appTheme);

  useEffect(() => {
    localStorage.setItem(APP_THEME_STORAGE_KEY, appTheme);
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
    localStorage.setItem(FONT_FAMILY_STORAGE_KEY, editorFontFamily);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, editorFontSize.toString());
  }, [appTheme, colorMode, editorFontFamily, editorFontSize]);

  return (
    <div
      data-app-theme={themeDefinition.id}
      className={`${isDarkMode ? 'dark' : ''} ${themeDefinition.rootClassName} text-gray-900 dark:text-gray-100 min-h-screen relative overflow-hidden font-sans`}
    >
      {themeDefinition.backgroundStyle === 'plain' ? (
        <div className={`fixed inset-0 z-[-1] transition-colors duration-300 pointer-events-none ${isDarkMode ? 'bg-zinc-950' : 'bg-stone-100'}`}>
          <div className={`absolute inset-x-0 top-0 h-16 ${isDarkMode ? 'bg-black' : 'bg-white'}`}></div>
        </div>
      ) : (
        <div className={`fixed inset-0 z-[-1] transition-colors duration-500 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-pink-400/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Global Font Style Definition */}
      <style>{`
        body {
          font-family: "Hiragino Sans", "Yu Gothic UI", "Meiryo", sans-serif;
        }
        button, input, select, textarea {
          font: inherit;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 15s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <ConfirmationModal 
        isOpen={showMissingFolderModal}
        onClose={() => handleMissingFolderChoice(false)}
        onConfirm={() => handleMissingFolderChoice(true)}
        type="alert"
        title="保存先フォルダが見つかりません"
        message={`前回の保存先が見つかりません。\n(${missingFolderPath})\n\n同じ場所に新しい空フォルダを作成して開始しますか？「キャンセル」を押すと、一時的にブラウザストレージを使用して起動します。`}
        confirmText="新規フォルダを作成"
        cancelText="キャンセル (一時保存)"
        isDarkMode={isDarkMode}
      />

      {activeScenario ? (
        <TRPGEditor 
          key={activeScenario.id}
          scenario={activeScenario}
          onSave={saveActiveScenario}
          onBack={() => setActiveScenarioId(null)}
          isDarkMode={isDarkMode}
          toggleTheme={() => setColorMode(isDarkMode ? 'light' : 'dark')}
          appTheme={appTheme}
          setAppTheme={setAppTheme}
          colorMode={colorMode}
          setColorMode={setColorMode}
          dataPath={dataPath}
          setDataPath={setDataPath}
          editorFontFamily={editorFontFamily}
          setEditorFontFamily={setEditorFontFamily}
          editorFontSize={editorFontSize}
          setEditorFontSize={setEditorFontSize}
        />
      ) : (
        <ScenarioDashboard 
          scenarios={scenarios}
          onCreate={handleCreateScenario}
          onImport={handleImportScenario}
          onSelect={setActiveScenarioId}
          onDelete={handleDeleteScenario}
          onDuplicate={handleDuplicateScenario}
          onReorder={handleReorderScenarios}
          isDarkMode={isDarkMode}
          toggleTheme={() => setColorMode(isDarkMode ? 'light' : 'dark')}
          appTheme={appTheme}
          setAppTheme={setAppTheme}
          colorMode={colorMode}
          setColorMode={setColorMode}
          dataPath={dataPath}
          setDataPath={setDataPath}
        />
      )}
    </div>
  );
}

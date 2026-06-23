import React, { useMemo, useState } from 'react';
import { Settings, X, RotateCcw, AlertTriangle, Palette, Type, Keyboard } from 'lucide-react';
import { EDITOR_FONT_OPTIONS, normalizeEditorFontFamily } from '../../../constants/editorFonts';
import { DEFAULT_SHORTCUTS } from '../../../constants/shortcuts';
import { APP_THEMES, getAppThemeDefinition } from '../../../constants/themes';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

const TAB_ICONS = {
  general: Palette,
  editor: Type,
  shortcuts: Keyboard,
};

export function SettingsModal({
  isOpen,
  onClose,
  shortcuts,
  setShortcuts,
  isDarkMode,
  appTheme = 'default',
  setAppTheme,
  colorMode = 'light',
  setColorMode,
  dataPath = '',
  setDataPath,
  editorFontFamily,
  setEditorFontFamily,
  editorFontSize,
  setEditorFontSize,
}) {
  const isSimpleTheme = getAppThemeDefinition(appTheme).editorStyle === 'minimal';
  const [editingShortcutId, setEditingShortcutId] = useState(null);
  const [tempDataPath, setTempDataPath] = useState(dataPath || '');
  const [errorPopupMessage, setErrorPopupMessage] = useState('');
  const [tempAppTheme, setTempAppTheme] = useState(appTheme);
  const [tempColorMode, setTempColorMode] = useState(colorMode || 'light');
  const [tempFontFamily, setTempFontFamily] = useState(normalizeEditorFontFamily(editorFontFamily));
  const [tempFontSize, setTempFontSize] = useState(editorFontSize || 14);

  const tabs = useMemo(() => {
    const availableTabs = [{ id: 'general', label: '一般' }];
    if (setEditorFontFamily && setEditorFontSize) {
      availableTabs.push({ id: 'editor', label: 'エディタ' });
    }
    availableTabs.push({ id: 'shortcuts', label: 'ショートカット' });
    return availableTabs;
  }, [setEditorFontFamily, setEditorFontSize]);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'general');

  React.useEffect(() => {
    if (!isOpen) return;

    setTempDataPath(dataPath || '');
    setTempAppTheme(appTheme || 'default');
    setTempColorMode(colorMode || 'light');
    setTempFontFamily(normalizeEditorFontFamily(editorFontFamily));
    setTempFontSize(editorFontSize || 14);
    setActiveTab(tabs[0]?.id || 'general');
    setErrorPopupMessage('');
    setEditingShortcutId(null);
  }, [isOpen, dataPath, appTheme, colorMode, editorFontFamily, editorFontSize, tabs]);

  if (!isOpen) return null;

  const previewThemeDefinition = getAppThemeDefinition(tempAppTheme);
  const isMinimalPreviewTheme = previewThemeDefinition.editorStyle === 'minimal';

  const handleSaveSettings = () => {
    if (tempDataPath && tempDataPath !== dataPath) {
      if (!fs || !path) {
        setErrorPopupMessage('デスクトップアプリ版でのみフォルダの指定が可能です。ブラウザ環境では利用できません。');
        return;
      }
      try {
        if (!path.isAbsolute(tempDataPath)) {
          setErrorPopupMessage('「絶対パス」（フルパス）で指定してください。');
          return;
        }
        if (!fs.existsSync(tempDataPath)) {
          setErrorPopupMessage('指定されたフォルダは存在しません。事前に作成してください。');
          return;
        }
        if (!fs.statSync(tempDataPath).isDirectory()) {
          setErrorPopupMessage('指定されたパスはフォルダではありません。');
          return;
        }
      } catch (e) {
        setErrorPopupMessage('フォルダの確認に失敗しました。パスが正しいか確認してください。');
        return;
      }

      if (setDataPath) setDataPath(tempDataPath);
    } else if (tempDataPath === '' && dataPath !== '') {
      if (setDataPath) setDataPath('');
    }

    if (setAppTheme) setAppTheme(tempAppTheme);
    if (setColorMode) setColorMode(tempColorMode);
    if (setEditorFontFamily) setEditorFontFamily(tempFontFamily);
    if (setEditorFontSize) setEditorFontSize(Number(tempFontSize));

    onClose();
  };

  const handleShortcutRecord = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const newShortcut = {
      ...shortcuts[id],
      key: e.key.length === 1 ? e.key.toLowerCase() : e.key,
      ctrl: e.ctrlKey || e.metaKey,
      shift: e.shiftKey,
      alt: e.altKey,
    };
    setShortcuts({ ...shortcuts, [id]: newShortcut });
    setEditingShortcutId(null);
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <section className={isSimpleTheme ? 'pb-6 border-b theme-simple-hr' : ''}>
        <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">テーマ設定</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              テーマ
            </label>
            <select
              aria-label="テーマ"
              value={tempAppTheme}
              onChange={(e) => setTempAppTheme(e.target.value)}
              className={`w-full p-3 border text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${isMinimalPreviewTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 focus:bg-zinc-950 text-white' : 'bg-white border-stone-300 focus:bg-white text-gray-900') : (isDarkMode ? 'rounded-xl shadow-inner backdrop-blur-sm bg-gray-800/40 border-white/10 focus:bg-gray-800/60 text-white' : 'rounded-xl shadow-inner backdrop-blur-sm bg-white/30 border-white/40 focus:bg-white/50 text-gray-900')}`}
            >
              {APP_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.label}</option>
              ))}
            </select>
            <p className="text-[11px] mt-2 text-gray-500 dark:text-gray-400">
              {previewThemeDefinition.description}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              カラーモード
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'light', label: 'ライト' },
                { value: 'dark', label: 'ダーク' },
              ].map((modeOption) => (
                <button
                  key={modeOption.value}
                  type="button"
                  onClick={() => setTempColorMode(modeOption.value)}
                  className={`p-3 border text-sm font-medium transition-all ${
                    tempColorMode === modeOption.value
                      ? isMinimalPreviewTheme
                        ? (isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                        : isDarkMode
                        ? 'rounded-2xl bg-indigo-600/80 text-white border-white/10 shadow-lg shadow-indigo-500/20 backdrop-blur-xl'
                        : 'rounded-2xl bg-indigo-600/90 text-white border-white/30 shadow-lg shadow-indigo-500/20 backdrop-blur-xl'
                      : isMinimalPreviewTheme
                        ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100')
                        : isDarkMode
                        ? 'rounded-2xl bg-gray-800/18 border-white/5 text-gray-400 hover:bg-gray-800/30 hover:text-gray-200 backdrop-blur-lg'
                        : 'rounded-2xl bg-white/18 border-white/30 text-gray-600 hover:bg-white/30 hover:text-gray-800 backdrop-blur-lg'
                  }`}
                >
                  {modeOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h4 className="font-bold mb-4 text-xs uppercase tracking-wide text-gray-500">データ保存先フォルダ</h4>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            シナリオファイルの保存先 (絶対パス)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tempDataPath}
              onChange={(e) => setTempDataPath(e.target.value)}
              placeholder="例: C:\TRPG_Data または /home/user/TRPG_Data"
              className={`flex-1 p-3 border text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 focus:bg-zinc-950 text-white' : 'bg-white border-stone-300 focus:bg-white text-gray-900') : (isDarkMode ? 'rounded-xl shadow-inner backdrop-blur-sm bg-gray-800/40 border-white/10 focus:bg-gray-800/60' : 'rounded-xl shadow-inner backdrop-blur-sm bg-white/30 border-white/40 focus:bg-white/50')}`}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            指定したフォルダ内に、シナリオ毎のJSONファイルが保存されます。「完了」を押すと現在のデータが自動で移行されます。未指定時はローカルストレージに保存されます。
          </p>
        </div>
      </section>
    </div>
  );

  const renderEditorTab = () => (
    <div>
      <h4 className={`font-bold mb-4 text-xs uppercase tracking-wide text-gray-500 ${isSimpleTheme ? 'pb-4 border-b theme-simple-hr' : ''}`}>エディタ設定</h4>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              フォントファミリー
            </label>
            <select
              aria-label="フォントファミリー"
              value={tempFontFamily}
              onChange={(e) => setTempFontFamily(e.target.value)}
              className={`w-full p-3 border text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 focus:bg-zinc-950 text-white' : 'bg-white border-stone-300 focus:bg-white text-gray-900') : (isDarkMode ? 'rounded-xl shadow-inner backdrop-blur-sm bg-gray-800/40 border-white/10 focus:bg-gray-800/60 text-white' : 'rounded-xl shadow-inner backdrop-blur-sm bg-white/30 border-white/40 focus:bg-white/50 text-gray-900')}`}
            >
              {EDITOR_FONT_OPTIONS.map((fontOption) => (
                <option key={fontOption.value} value={fontOption.value} className="dark:bg-gray-800">
                  {fontOption.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              サイズ (px)
            </label>
            <input
              type="number"
              min="10"
              max="40"
              value={tempFontSize}
              onChange={(e) => setTempFontSize(e.target.value)}
              className={`w-full p-3 border text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 text-center ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 focus:bg-zinc-950 text-white' : 'bg-white border-stone-300 focus:bg-white text-gray-900') : (isDarkMode ? 'rounded-xl shadow-inner backdrop-blur-sm bg-gray-800/40 border-white/10 focus:bg-gray-800/60 text-white' : 'rounded-xl shadow-inner backdrop-blur-sm bg-white/30 border-white/40 focus:bg-white/50 text-gray-900')}`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderShortcutsTab = () => (
    <div>
      <h4 className={`font-bold mb-4 text-xs uppercase tracking-wide text-gray-500 ${isSimpleTheme ? 'pb-4 border-b theme-simple-hr' : ''}`}>ショートカット</h4>
      <div className="space-y-3">
        {Object.values(shortcuts).map((s) => (
          <div key={s.id} className={`flex items-center justify-between p-3 border transition-colors ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-600' : 'bg-white border-stone-300 hover:border-stone-500') : (isDarkMode ? 'rounded-xl backdrop-blur-sm shadow-sm bg-gray-800/30 border-white/5 hover:border-white/20' : 'rounded-xl backdrop-blur-sm shadow-sm bg-white/40 border-white/40 hover:border-white/80')}`}>
            <span className="font-bold text-sm">{s.label}</span>
            <button
              onClick={() => setEditingShortcutId(s.id)}
              className={`px-4 py-2 text-xs font-mono min-w-[120px] text-center transition-all border active:scale-98 ${
                editingShortcutId === s.id
                  ? isSimpleTheme
                    ? (isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                    : isDarkMode
                    ? 'bg-indigo-500/80 text-white border-white/10 ring-2 ring-indigo-500/50'
                    : 'bg-indigo-600/90 text-white border-white/40 ring-2 ring-indigo-500/50'
                  : isSimpleTheme
                    ? (isDarkMode ? 'bg-zinc-900 border-zinc-700 hover:bg-zinc-800' : 'bg-stone-100 border-stone-300 hover:bg-white')
                    : isDarkMode
                    ? 'bg-gray-800/50 border-white/10 hover:bg-gray-700/50'
                    : 'bg-white/60 border-white/60 hover:bg-white/80'
              }`}
              onKeyDown={(e) => handleShortcutRecord(e, s.id)}
            >
              {editingShortcutId === s.id ? 'キーを押す...' : [s.ctrl && 'Ctrl', s.shift && 'Shift', s.alt && 'Alt', s.key.toUpperCase()].filter(Boolean).join(' + ')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`theme-simple-frame w-full max-w-3xl flex flex-col max-h-[85vh] border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-stone-300 text-gray-900') : (isDarkMode ? 'rounded-3xl shadow-2xl backdrop-blur-2xl bg-gray-900/70 border-white/10 text-white' : 'rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/60 border-white/60 text-gray-900')} scale-100 transform transition-all`}>
        <div className={`theme-simple-divider flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-white/10' : 'border-white/40'}`}>
          <h3 className="font-bold flex items-center gap-3 text-lg">
            <div className={`p-2 border ${isSimpleTheme ? (isDarkMode ? 'bg-zinc-950 border-zinc-700 text-zinc-300' : 'bg-stone-100 border-stone-300 text-stone-600') : (isDarkMode ? 'rounded-xl shadow-inner backdrop-blur-md bg-gray-800/40 border-white/10 text-gray-300' : 'rounded-xl shadow-inner backdrop-blur-md bg-white/40 border-white/40 text-gray-600')}`}>
              <Settings size={20} />
            </div>
            設定
          </h3>
          <button onClick={onClose} className={`p-2 transition-colors active:scale-95 ${isSimpleTheme ? (isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-stone-100') : (isDarkMode ? 'rounded-xl backdrop-blur-sm hover:bg-gray-800/50' : 'rounded-xl backdrop-blur-sm hover:bg-white/50')}`}><X size={20} /></button>
        </div>

        <div className="flex flex-1 min-h-0">
          <aside className={`theme-simple-divider w-44 p-4 border-r space-y-2 ${isSimpleTheme ? (isDarkMode ? 'border-zinc-700 bg-zinc-950' : 'border-stone-300 bg-stone-100') : (isDarkMode ? 'border-white/10 bg-black/10' : 'border-white/40 bg-white/20')}`}>
            {tabs.map((tab) => {
              const Icon = TAB_ICONS[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`theme-simple-divider w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all border ${
                    activeTab === tab.id
                      ? isSimpleTheme
                        ? (isDarkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                        : isDarkMode
                        ? 'rounded-2xl bg-indigo-600/80 text-white border-white/10 shadow-lg shadow-indigo-500/20 backdrop-blur-xl'
                        : 'rounded-2xl bg-indigo-600/90 text-white border-white/30 shadow-lg shadow-indigo-500/20 backdrop-blur-xl'
                      : isSimpleTheme
                        ? (isDarkMode ? 'text-zinc-300 hover:bg-zinc-800 border-zinc-800' : 'text-stone-700 hover:bg-white border-stone-300')
                        : isDarkMode
                        ? 'rounded-2xl text-gray-400 hover:bg-gray-800/30 hover:text-gray-200 border border-transparent bg-gray-800/18 backdrop-blur-lg'
                        : 'rounded-2xl text-gray-600 hover:bg-white/30 hover:text-gray-800 border border-transparent bg-white/18 backdrop-blur-lg'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </aside>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'editor' && renderEditorTab()}
            {activeTab === 'shortcuts' && renderShortcutsTab()}
          </div>
        </div>

        <div className={`theme-simple-divider p-5 border-t flex justify-between ${isSimpleTheme ? (isDarkMode ? 'border-zinc-700 bg-zinc-950' : 'border-stone-300 bg-stone-100') : (isDarkMode ? 'rounded-b-3xl backdrop-blur-xl border-white/10 bg-gray-900/40' : 'rounded-b-3xl backdrop-blur-xl border-white/40 bg-white/40')}`}>
          <button onClick={() => setShortcuts(DEFAULT_SHORTCUTS)} className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-2 active:scale-98 border ${isSimpleTheme ? (isDarkMode ? 'text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700' : 'text-stone-700 hover:text-black hover:bg-white border-stone-300') : (isDarkMode ? 'rounded-xl backdrop-blur-sm border-transparent shadow-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 hover:border-white/10' : 'rounded-xl backdrop-blur-sm border-transparent shadow-sm text-gray-600 hover:text-gray-800 hover:bg-white/60 hover:border-white/40')}`}>
            <RotateCcw size={16} /> 初期設定に戻す
          </button>
          <button onClick={handleSaveSettings} className={`px-6 py-2.5 text-sm font-bold active:scale-98 transition-all border ${isSimpleTheme ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 border-white' : 'bg-black text-white hover:bg-stone-800 border-black') : (isDarkMode ? 'text-white rounded-xl shadow-lg shadow-indigo-500/20 bg-indigo-600/80 hover:bg-indigo-500/90 border-white/10' : 'text-white rounded-xl shadow-lg shadow-indigo-500/20 bg-indigo-600/90 hover:bg-indigo-500 border-white/30')}`}>
            完了
          </button>
        </div>
      </div>

      {errorPopupMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-xs rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
            <div className="p-5 text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold mb-2">エラー</h3>
              <p className={`text-xs mb-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} break-words whitespace-pre-wrap`}>
                {errorPopupMessage}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setErrorPopupMessage('')}
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

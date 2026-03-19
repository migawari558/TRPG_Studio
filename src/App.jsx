import React, { useState, useEffect } from 'react';
import { TRPGEditor } from './components/trpg_editor/TRPGEditor';
import { ScenarioDashboard } from './components/ScenarioDashboard';
import { generateId } from './utils/helpers';
import { ConfirmationModal } from './components/modals/ConfirmationModal';
import { Toast } from './components/modals/Toast';

const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

// -----------------------------------------------------------------------------
// Main App Container
// -----------------------------------------------------------------------------

export default function App() {
  const [dataPath, setDataPath] = useState(() => localStorage.getItem('trpg_data_path') || '');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMissingFolderModal, setShowMissingFolderModal] = useState(false);
  const [missingFolderPath, setMissingFolderPath] = useState('');
  
  const [editorFontFamily, setEditorFontFamily] = useState(() => localStorage.getItem('trpg_editor_font_family') || 'monospace');
  const [editorFontSize, setEditorFontSize] = useState(() => parseInt(localStorage.getItem('trpg_editor_font_size') || '14', 10));

  useEffect(() => {
    localStorage.setItem('trpg_editor_font_family', editorFontFamily);
    localStorage.setItem('trpg_editor_font_size', editorFontSize.toString());
  }, [editorFontFamily, editorFontSize]);

  useEffect(() => {
    let loadedScenarios = [];
    if (dataPath && fs && path) {
      try {
        if (!fs.existsSync(dataPath)) {
          setMissingFolderPath(dataPath);
          setShowMissingFolderModal(true);
          return; // Wait for user choice before setting isLoaded
        }

        const scenarioPath = path.join(dataPath, 'scenario');
        if (!fs.existsSync(scenarioPath)) fs.mkdirSync(scenarioPath, { recursive: true });

        const files = fs.readdirSync(scenarioPath);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(scenarioPath, file), 'utf-8');
            loadedScenarios.push(JSON.parse(content));
          }
        }
        loadedScenarios.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      } catch (e) {
        console.error("Failed to load scenarios from folder:", e);
      }
    } else {
      loadedScenarios = JSON.parse(localStorage.getItem('trpg_scenarios') || '[]');
      const oldData = localStorage.getItem('trpg_data');
      if (oldData && loadedScenarios.length === 0) {
        try {
          const pages = JSON.parse(oldData);
          const characters = JSON.parse(localStorage.getItem('trpg_characters') || '[]');
          const newScenario = {
            id: generateId(), title: '移行されたシナリオ', pages, characters, images: {}, lastModified: Date.now(), sortOrder: 0
          };
          loadedScenarios.push(newScenario);
        } catch (e) { console.error("Migration failed", e); }
      }
    }
    setScenarios(loadedScenarios);
    setIsLoaded(true);
  }, []); // Run ONLY on mount! 

  useEffect(() => {
    if (dataPath !== (localStorage.getItem('trpg_data_path') || '')) {
      localStorage.setItem('trpg_data_path', dataPath);
    }
  }, [dataPath]);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (dataPath && fs && path) {
      try {
        if (!fs.existsSync(dataPath)) {
          fs.mkdirSync(dataPath, { recursive: true });
          setToastMessage('保存先フォルダが消失していたため、自動で作り直し復元しました');
        }

        const scenarioPath = path.join(dataPath, 'scenario');
        if (!fs.existsSync(scenarioPath)) fs.mkdirSync(scenarioPath, { recursive: true });

        const existingFiles = fs.readdirSync(scenarioPath).filter(f => f.endsWith('.json'));
        const currentIds = scenarios.map(s => `${s.id}.json`);
        for (const file of existingFiles) {
          if (!currentIds.includes(file)) {
            fs.unlinkSync(path.join(scenarioPath, file));
          }
        }
        
        scenarios.forEach((scenario, index) => {
          const s = { ...scenario, sortOrder: index };
          fs.writeFileSync(path.join(scenarioPath, `${scenario.id}.json`), JSON.stringify(s, null, 2), 'utf-8');
        });
      } catch (e) {
        console.error("Failed to sync scenarios to folder:", e);
        setToastMessage('エラー: ドライブ切断等により保存できませんでした。一時領域に緊急保存を行いました。');
        localStorage.setItem('trpg_scenarios_emergency_backup', JSON.stringify(scenarios.map((s, idx) => ({ ...s, sortOrder: idx }))));
      }
    } else {
      if (scenarios.length > 0 || localStorage.getItem('trpg_scenarios')) {
        localStorage.setItem('trpg_scenarios', JSON.stringify(scenarios.map((s, idx) => ({ ...s, sortOrder: idx }))));
      }
    }
  }, [scenarios, dataPath, isLoaded]);

  const handleMissingFolderChoice = (createEmpty) => {
    if (createEmpty) {
      try {
        if (fs && missingFolderPath) {
          fs.mkdirSync(missingFolderPath, { recursive: true });
          
          let loadedScenarios = [];
          const scenarioPath = path.join(missingFolderPath, 'scenario');
          if (fs.existsSync(scenarioPath)) {
            const files = fs.readdirSync(scenarioPath);
            for (const file of files) {
              if (file.endsWith('.json')) {
                const content = fs.readFileSync(path.join(scenarioPath, file), 'utf-8');
                loadedScenarios.push(JSON.parse(content));
              }
            }
            loadedScenarios.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
          }
          
          setScenarios(loadedScenarios);
          setIsLoaded(true);
          setToastMessage(loadedScenarios.length > 0 ? '保存先フォルダを再認識し、データを読み込みました' : '新しい空の保存先フォルダを作成しました');
          setShowMissingFolderModal(false);
        }
      } catch (err) {
        alert("ドライブ切断等によりフォルダ作成に失敗しました。\nキャンセルを選んで一時保存モードで起動してください。\n\n詳細: " + err.message);
      }
    } else {
      setDataPath('');
      const saved = JSON.parse(localStorage.getItem('trpg_scenarios') || '[]');
      setScenarios(saved);
      setIsLoaded(true);
      setShowMissingFolderModal(false);
    }
  };

  const handleSaveScenario = React.useCallback((id, updatedData) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updatedData, lastModified: Date.now() } : s));
  }, []);

  const handleCreateScenario = React.useCallback((customTitle) => {
    const title = customTitle || '新規シナリオ';
    const newScenario = {
      id: generateId(),
      title: title,
      pages: [],
      characters: ['GM', 'PL1'],
      images: {},
      lastModified: Date.now(),
    };
    setScenarios(prev => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
  }, []);

  const handleImportScenario = React.useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const fileName = file.name.replace(/\.md$/, '');
      
      const images = {};
      let processedContent = content.replace(/!\[(.*?)\]\((data:image\/.*?)\)/g, (match, alt, base64) => {
        const id = generateId();
        images[id] = base64;
        return `![${alt}](image:${id})`;
      });

      const rawPages = processedContent.split(/\n\n---\n\n/);
      
      const pages = rawPages.map((pageContent, index) => {
        const lines = pageContent.trim().split('\n');
        let title = `ページ ${index + 1}`;
        let body = pageContent.trim();

        if (lines[0] && lines[0].startsWith('# ')) {
          title = lines[0].substring(2).trim();
          body = lines.slice(1).join('\n').trim();
        }
        
        return {
          id: generateId(),
          title,
          content: body
        };
      });

      const charSet = new Set(['GM', 'PL1']);
      const charRegex = /^\[(.*?)\]/gm;
      let match;
      while ((match = charRegex.exec(processedContent)) !== null) {
        if (match[1]) charSet.add(match[1]);
      }

      const newScenario = {
        id: generateId(),
        title: fileName,
        pages: pages.length > 0 ? pages : [{ id: generateId(), title: 'メイン', content: processedContent }],
        characters: Array.from(charSet),
        images: images,
        lastModified: Date.now(),
      };

      setScenarios(prev => [newScenario, ...prev]);
    };
    reader.readAsText(file);
  }, []);

  const handleDeleteScenario = React.useCallback((id) => {
    setScenarios(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleDuplicateScenario = React.useCallback((id) => {
    setScenarios(prev => {
        const target = prev.find(s => s.id === id);
        if (!target) return prev;
        const newScenario = {
          ...target,
          id: generateId(),
          title: `${target.title} のコピー`,
          lastModified: Date.now(),
        };
        return [newScenario, ...prev];
    });
  }, []);

  const handleReorderScenarios = React.useCallback((startIndex, endIndex) => {
    setScenarios(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const onSaveCurrentScenario = React.useCallback((data) => {
    if (activeScenarioId) {
      handleSaveScenario(activeScenarioId, data);
    }
  }, [activeScenarioId, handleSaveScenario]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''} text-gray-900 dark:text-gray-100 min-h-screen relative overflow-hidden font-sans`}>
      {/* Ambient liquid glass background */}
      <div className={`fixed inset-0 z-[-1] transition-colors duration-500 pointer-events-none ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-pink-400/20 dark:bg-pink-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Global Font Style Definition */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;700&display=swap');
        body, div, span, h1, h2, h3, h4, h5, h6, p, a, button, input, select, li, ul, ol {
          font-family: 'Noto Sans JP', sans-serif !important;
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
          onSave={onSaveCurrentScenario}
          onBack={() => setActiveScenarioId(null)}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
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
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
          dataPath={dataPath}
          setDataPath={setDataPath}
        />
      )}
    </div>
  );
}
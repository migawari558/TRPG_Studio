import React, { useState, useEffect } from 'react';
import { TRPGEditor } from './components/trpg_editor/TRPGEditor';
import { ScenarioDashboard } from './components/ScenarioDashboard';
import { generateId } from './utils/helpers';

// -----------------------------------------------------------------------------
// Main App Container
// -----------------------------------------------------------------------------

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadedScenarios = JSON.parse(localStorage.getItem('trpg_scenarios') || '[]');
    const oldData = localStorage.getItem('trpg_data');
    
    if (oldData && loadedScenarios.length === 0) {
      try {
        const pages = JSON.parse(oldData);
        const characters = JSON.parse(localStorage.getItem('trpg_characters') || '[]');
        const newScenario = {
          id: generateId(),
          title: '移行されたシナリオ',
          pages: pages,
          characters: characters,
          images: {}, 
          lastModified: Date.now(),
        };
        loadedScenarios.push(newScenario);
      } catch (e) {
        console.error("Migration failed", e);
      }
    }
    setScenarios(loadedScenarios);
  }, []);

  useEffect(() => {
    if (scenarios.length > 0) {
      localStorage.setItem('trpg_scenarios', JSON.stringify(scenarios));
    }
  }, [scenarios]);

  const handleSaveScenario = React.useCallback((id, updatedData) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updatedData, lastModified: Date.now() } : s));
  }, []);

  const handleCreateScenario = React.useCallback(() => {
    const newScenario = {
      id: generateId(),
      title: '新規シナリオ',
      pages: [{ id: 'p1', title: 'メイン', content: '# 新規シナリオ\n\n' }],
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

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  const onSaveCurrentScenario = React.useCallback((data) => {
    if (activeScenarioId) {
      handleSaveScenario(activeScenarioId, data);
    }
  }, [activeScenarioId, handleSaveScenario]);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      {/* Global Font Style Definition */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
        body, div, span, h1, h2, h3, h4, h5, h6, p, a, button, input, textarea, select, li, ul, ol {
          font-family: 'Noto Sans JP', sans-serif !important;
        }
      `}</style>

      {activeScenario ? (
        <TRPGEditor 
          key={activeScenario.id}
          scenario={activeScenario}
          onSave={onSaveCurrentScenario}
          onBack={() => setActiveScenarioId(null)}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        <ScenarioDashboard 
          scenarios={scenarios}
          onCreate={handleCreateScenario}
          onImport={handleImportScenario}
          onSelect={setActiveScenarioId}
          onDelete={handleDeleteScenario}
          onDuplicate={handleDuplicateScenario}
          isDarkMode={isDarkMode}
          toggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      )}
    </div>
  );
}
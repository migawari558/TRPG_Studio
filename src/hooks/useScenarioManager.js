import { useCallback, useEffect, useMemo, useState } from 'react';
import { generateId } from '../utils/helpers';
import { createImportedScenario, readFileAsText } from '../utils/scenarioImport';
import {
  DATA_PATH_STORAGE_KEY,
  loadInitialScenarios,
  loadScenariosFromFolder,
  loadScenariosFromLocalStorage,
  saveEmergencyBackup,
  syncScenarioPersistence,
} from '../utils/scenarioStorage';

export function useScenarioManager({ fsModule, pathModule }) {
  const [dataPath, setDataPath] = useState(() => localStorage.getItem(DATA_PATH_STORAGE_KEY) || '');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMissingFolderModal, setShowMissingFolderModal] = useState(false);
  const [missingFolderPath, setMissingFolderPath] = useState('');

  useEffect(() => {
    try {
      const result = loadInitialScenarios({ dataPath, fsModule, pathModule });
      if (result.needsMissingFolderResolution) {
        setMissingFolderPath(result.missingFolderPath);
        setShowMissingFolderModal(true);
        return;
      }

      setScenarios(result.scenarios);
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
      setScenarios([]);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (dataPath !== (localStorage.getItem(DATA_PATH_STORAGE_KEY) || '')) {
      localStorage.setItem(DATA_PATH_STORAGE_KEY, dataPath);
    }
  }, [dataPath]);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      const result = syncScenarioPersistence({ dataPath, scenarios, fsModule, pathModule });
      if (result.restoredMissingFolder) {
        setToastMessage('保存先フォルダが消失していたため、自動で作り直し復元しました');
      }
    } catch (error) {
      console.error('Failed to sync scenarios:', error);
      setToastMessage('エラー: ドライブ切断等により保存できませんでした。一時領域に緊急保存を行いました。');
      saveEmergencyBackup(scenarios);
    }
  }, [dataPath, fsModule, isLoaded, pathModule, scenarios]);

  const handleMissingFolderChoice = useCallback((createEmpty) => {
    if (!createEmpty) {
      setDataPath('');
      setScenarios(loadScenariosFromLocalStorage());
      setIsLoaded(true);
      setShowMissingFolderModal(false);
      return;
    }

    try {
      if (!fsModule || !missingFolderPath) return;

      fsModule.mkdirSync(missingFolderPath, { recursive: true });
      const loadedScenarios = loadScenariosFromFolder({ basePath: missingFolderPath, fsModule, pathModule });
      setScenarios(loadedScenarios);
      setIsLoaded(true);
      setToastMessage(
        loadedScenarios.length > 0
          ? '保存先フォルダを再認識し、データを読み込みました'
          : '新しい空の保存先フォルダを作成しました',
      );
      setShowMissingFolderModal(false);
    } catch (error) {
      alert(
        `ドライブ切断等によりフォルダ作成に失敗しました。\nキャンセルを選んで一時保存モードで起動してください。\n\n詳細: ${error.message}`,
      );
    }
  }, [fsModule, missingFolderPath, pathModule]);

  const handleSaveScenario = useCallback((id, updatedData) => {
    setScenarios((prev) => prev.map((scenario) => (
      scenario.id === id
        ? { ...scenario, ...updatedData, lastModified: Date.now() }
        : scenario
    )));
  }, []);

  const handleCreateScenario = useCallback((customTitle) => {
    const newScenario = {
      id: generateId(),
      title: customTitle || '新規シナリオ',
      pages: [],
      characters: ['GM', 'PL1'],
      images: {},
      lastModified: Date.now(),
    };

    setScenarios((prev) => [newScenario, ...prev]);
    setActiveScenarioId(newScenario.id);
  }, []);

  const handleImportScenario = useCallback(async (file) => {
    const content = await readFileAsText(file);
    const newScenario = createImportedScenario({ fileName: file.name, content });
    setScenarios((prev) => [newScenario, ...prev]);
  }, []);

  const handleDeleteScenario = useCallback((id) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  }, []);

  const handleDuplicateScenario = useCallback((id) => {
    setScenarios((prev) => {
      const target = prev.find((scenario) => scenario.id === id);
      if (!target) return prev;

      return [
        {
          ...target,
          id: generateId(),
          title: `${target.title} のコピー`,
          lastModified: Date.now(),
        },
        ...prev,
      ];
    });
  }, []);

  const handleReorderScenarios = useCallback((startIndex, endIndex) => {
    setScenarios((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId),
    [activeScenarioId, scenarios],
  );

  const saveActiveScenario = useCallback((updatedData) => {
    if (activeScenarioId) {
      handleSaveScenario(activeScenarioId, updatedData);
    }
  }, [activeScenarioId, handleSaveScenario]);

  return {
    dataPath,
    setDataPath,
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    activeScenario,
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
  };
}

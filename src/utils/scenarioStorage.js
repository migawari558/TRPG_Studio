import { generateId } from './helpers';

export const DATA_PATH_STORAGE_KEY = 'trpg_data_path';
export const SCENARIOS_STORAGE_KEY = 'trpg_scenarios';
export const EMERGENCY_BACKUP_STORAGE_KEY = 'trpg_scenarios_emergency_backup';
export const LEGACY_DATA_STORAGE_KEY = 'trpg_data';
export const LEGACY_CHARACTERS_STORAGE_KEY = 'trpg_characters';

export const sortScenarios = (items) => [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
export const withSortOrder = (items) => items.map((scenario, index) => ({ ...scenario, sortOrder: index }));

export const getScenarioDirectory = (pathModule, basePath) => pathModule.join(basePath, 'scenario');

export const loadScenariosFromFolder = ({ basePath, fsModule, pathModule }) => {
  const scenarioPath = getScenarioDirectory(pathModule, basePath);
  if (!fsModule.existsSync(scenarioPath)) {
    fsModule.mkdirSync(scenarioPath, { recursive: true });
  }

  const loadedScenarios = fsModule.readdirSync(scenarioPath)
    .filter((file) => file.endsWith('.json'))
    .map((file) => JSON.parse(fsModule.readFileSync(pathModule.join(scenarioPath, file), 'utf-8')));

  return sortScenarios(loadedScenarios);
};

export const syncScenariosToFolder = ({ basePath, scenarios, fsModule, pathModule }) => {
  const scenarioPath = getScenarioDirectory(pathModule, basePath);
  if (!fsModule.existsSync(scenarioPath)) {
    fsModule.mkdirSync(scenarioPath, { recursive: true });
  }

  const normalizedScenarios = withSortOrder(scenarios);
  const existingFiles = fsModule.readdirSync(scenarioPath).filter((file) => file.endsWith('.json'));
  const currentFiles = new Set(normalizedScenarios.map((scenario) => `${scenario.id}.json`));

  existingFiles.forEach((file) => {
    if (!currentFiles.has(file)) {
      fsModule.unlinkSync(pathModule.join(scenarioPath, file));
    }
  });

  normalizedScenarios.forEach((scenario) => {
    fsModule.writeFileSync(
      pathModule.join(scenarioPath, `${scenario.id}.json`),
      JSON.stringify(scenario, null, 2),
      'utf-8',
    );
  });
};

export const loadScenariosFromLocalStorage = () => JSON.parse(localStorage.getItem(SCENARIOS_STORAGE_KEY) || '[]');

export const saveScenariosToLocalStorage = (scenarios) => {
  localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(withSortOrder(scenarios)));
};

export const loadLegacyScenario = () => {
  const oldData = localStorage.getItem(LEGACY_DATA_STORAGE_KEY);
  if (!oldData) return null;

  try {
    const pages = JSON.parse(oldData);
    const characters = JSON.parse(localStorage.getItem(LEGACY_CHARACTERS_STORAGE_KEY) || '[]');
    return {
      id: generateId(),
      title: '移行されたシナリオ',
      pages,
      characters,
      images: {},
      lastModified: Date.now(),
      sortOrder: 0,
    };
  } catch (error) {
    console.error('Migration failed', error);
    return null;
  }
};

export const loadInitialScenarios = ({ dataPath, fsModule, pathModule }) => {
  if (dataPath && fsModule && pathModule) {
    if (!fsModule.existsSync(dataPath)) {
      return {
        scenarios: [],
        missingFolderPath: dataPath,
        needsMissingFolderResolution: true,
      };
    }

    return {
      scenarios: loadScenariosFromFolder({ basePath: dataPath, fsModule, pathModule }),
      missingFolderPath: '',
      needsMissingFolderResolution: false,
    };
  }

  const loadedScenarios = loadScenariosFromLocalStorage();
  if (loadedScenarios.length > 0) {
    return {
      scenarios: loadedScenarios,
      missingFolderPath: '',
      needsMissingFolderResolution: false,
    };
  }

  const legacyScenario = loadLegacyScenario();
  return {
    scenarios: legacyScenario ? [legacyScenario] : [],
    missingFolderPath: '',
    needsMissingFolderResolution: false,
  };
};

export const syncScenarioPersistence = ({ dataPath, scenarios, fsModule, pathModule }) => {
  if (dataPath && fsModule && pathModule) {
    if (!fsModule.existsSync(dataPath)) {
      fsModule.mkdirSync(dataPath, { recursive: true });
      syncScenariosToFolder({ basePath: dataPath, scenarios, fsModule, pathModule });
      return { restoredMissingFolder: true };
    }

    syncScenariosToFolder({ basePath: dataPath, scenarios, fsModule, pathModule });
    return { restoredMissingFolder: false };
  }

  if (scenarios.length > 0 || localStorage.getItem(SCENARIOS_STORAGE_KEY)) {
    saveScenariosToLocalStorage(scenarios);
  }

  return { restoredMissingFolder: false };
};

export const saveEmergencyBackup = (scenarios) => {
  localStorage.setItem(EMERGENCY_BACKUP_STORAGE_KEY, JSON.stringify(withSortOrder(scenarios)));
};

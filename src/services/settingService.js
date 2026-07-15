import settings from '../mock-data/settings';

let currentSettings = { ...settings };

export const getAllSettings = async () => ({ ...currentSettings });

export const updateSettings = async (newSettings) => {
  currentSettings = { ...currentSettings, ...newSettings };
};

const settingService = { getAllSettings, updateSettings };

export default settingService;

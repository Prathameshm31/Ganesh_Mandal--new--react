import apiClient from '../api/apiClient';

export const getAllSettings = async () => {
  const response = await apiClient.get('/settings');
  return response.data;
};

export const updateSettings = async (newSettings) => {
  const response = await apiClient.put('/settings', newSettings);
  return response.data;
};

const settingService = { getAllSettings, updateSettings };

export default settingService;

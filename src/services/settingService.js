import api from './api';

export const getAllSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data || {};
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch settings';
    throw new Error(message);
  }
};

export const updateSettings = async (settings) => {
  try {
    await api.put('/settings', settings);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update settings';
    throw new Error(message);
  }
};

const settingService = { getAllSettings, updateSettings };

export default settingService;

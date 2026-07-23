import apiClient from '../api/apiClient';

export const getAllMurtis = async () => {
  const response = await apiClient.get('/murti');
  return response.data;
};

export const getMurtiById = async (id) => {
  const response = await apiClient.get(`/murti/${id}`);
  return response.data;
};

export const getCurrentYearMurti = async () => {
  const response = await apiClient.get('/murti/current-year');
  return response.data;
};

export const getMurtiHistory = async (year) => {
  const response = await apiClient.get('/murti/history', { params: { year } });
  return response.data;
};

export const searchMurtiByDonor = async (donorName) => {
  const response = await apiClient.get('/murti/search', { params: { donorName } });
  return response.data;
};

export const filterMurtiByYear = async (year) => {
  const response = await apiClient.get('/murti/filter', { params: { year } });
  return response.data;
};

export const createMurti = async (murti) => {
  const response = await apiClient.post('/murti', murti);
  return response.data;
};

export const updateMurti = async (id, murti) => {
  const response = await apiClient.put(`/murti/${id}`, murti);
  return response.data;
};

export const deleteMurti = async (id) => {
  await apiClient.delete(`/murti/${id}`);
};

export const uploadMurtiPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/murti/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { url: response.data };
};

const murtiService = {
  getAllMurtis, getMurtiById, getCurrentYearMurti, getMurtiHistory,
  searchMurtiByDonor, filterMurtiByYear, createMurti, updateMurti, deleteMurti, uploadMurtiPhoto,
};

export default murtiService;

import apiClient from '../api/apiClient';

export const getPrasadByYear = async (festivalYear) => {
  const response = await apiClient.get(`/prasad/year/${festivalYear}`);
  return response.data;
};

export const getPrasadById = async (id) => {
  const response = await apiClient.get(`/prasad/${id}`);
  return response.data;
};

export const getPrasadByYearAndDay = async (festivalYear, festivalDay) => {
  const response = await apiClient.get(`/prasad/year/${festivalYear}/day/${festivalDay}`);
  return response.data;
};

export const searchPrasad = async (keyword) => {
  const response = await apiClient.get('/prasad/search', { params: { keyword } });
  return response.data;
};

export const createPrasad = async (data) => {
  const response = await apiClient.post('/prasad', data);
  return response.data;
};

export const updatePrasad = async (id, data) => {
  const response = await apiClient.put(`/prasad/${id}`, data);
  return response.data;
};

export const deletePrasad = async (id) => {
  await apiClient.delete(`/prasad/${id}`);
};

const prasadSponsorshipService = {
  getPrasadByYear, getPrasadById, getPrasadByYearAndDay,
  searchPrasad, createPrasad, updatePrasad, deletePrasad,
};

export default prasadSponsorshipService;

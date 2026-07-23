import apiClient from '../api/apiClient';

export const getColonies = async () => {
  const response = await apiClient.get('/colonies');
  return response.data;
};

export const getColonyById = async (id) => {
  const response = await apiClient.get(`/colonies/${id}`);
  return response.data;
};

export const addColony = async (colony) => {
  const response = await apiClient.post('/colonies', colony);
  return response.data;
};

export const updateColony = async (id, colony) => {
  const response = await apiClient.put(`/colonies/${id}`, colony);
  return response.data;
};

export const deleteColony = async (id) => {
  await apiClient.delete(`/colonies/${id}`);
  return { id, deleted: true };
};

const colonyService = { getColonies, getColonyById, addColony, updateColony, deleteColony };

export default colonyService;

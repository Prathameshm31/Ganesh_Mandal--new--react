import api from './api';

export const getColonies = async () => {
  try {
    const response = await api.get('/colonies');
    return response.data || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch colonies';
    throw new Error(message);
  }
};

export const getColonyById = async (id) => {
  try {
    const response = await api.get(`/colonies/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to fetch colony ${id}`;
    throw new Error(message);
  }
};

export const addColony = async (colony) => {
  try {
    const response = await api.post('/colonies', colony);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to add colony';
    throw new Error(message);
  }
};

export const updateColony = async (id, colony) => {
  try {
    const response = await api.put(`/colonies/${id}`, colony);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to update colony ${id}`;
    throw new Error(message);
  }
};

export const deleteColony = async (id) => {
  try {
    const response = await api.delete(`/colonies/${id}`);
    return response.data || { id, deleted: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to delete colony ${id}`;
    throw new Error(message);
  }
};

const colonyService = {
  getColonies,
  getColonyById,
  addColony,
  updateColony,
  deleteColony,
};

export default colonyService;

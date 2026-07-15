import api from './api';

export const getActivities = async () => {
  try {
    const response = await api.get('/activities');
    return response.data || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch activities';
    throw new Error(message);
  }
};

export const getActivityById = async (id) => {
  try {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to fetch activity ${id}`;
    throw new Error(message);
  }
};

export const addActivity = async (activity) => {
  try {
    const response = await api.post('/activities', activity);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to add activity';
    throw new Error(message);
  }
};

export const updateActivity = async (id, activity) => {
  try {
    const response = await api.put(`/activities/${id}`, activity);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to update activity ${id}`;
    throw new Error(message);
  }
};

export const deleteActivity = async (id) => {
  try {
    const response = await api.delete(`/activities/${id}`);
    return response.data || { id, deleted: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to delete activity ${id}`;
    throw new Error(message);
  }
};

const activityService = {
  getActivities,
  getActivityById,
  addActivity,
  updateActivity,
  deleteActivity,
};

export default activityService;

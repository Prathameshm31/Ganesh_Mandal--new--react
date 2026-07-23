import apiClient from '../api/apiClient';

export const getActivities = async () => {
  const response = await apiClient.get('/activities');
  return response.data;
};

export const getActivityById = async (id) => {
  const response = await apiClient.get(`/activities/${id}`);
  return response.data;
};

export const addActivity = async (activity) => {
  const response = await apiClient.post('/activities', activity);
  return response.data;
};

export const updateActivity = async (id, activity) => {
  const response = await apiClient.put(`/activities/${id}`, activity);
  return response.data;
};

export const deleteActivity = async (id) => {
  await apiClient.delete(`/activities/${id}`);
  return { id, deleted: true };
};

const activityService = { getActivities, getActivityById, addActivity, updateActivity, deleteActivity };

export default activityService;

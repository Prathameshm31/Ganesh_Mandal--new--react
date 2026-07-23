import apiClient from '../api/apiClient';

export const getNotificationDashboard = async () => {
  const response = await apiClient.get('/notifications/dashboard');
  return response.data;
};

export const getNotificationHistory = async (filters = {}) => {
  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.channel) params.channel = filters.channel;
  if (filters.eventId) params.eventId = filters.eventId;
  if (filters.userId) params.userId = filters.userId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  const response = await apiClient.get('/notifications/history', { params });
  return response.data;
};

export const getNotificationById = async (id) => {
  const response = await apiClient.get(`/notifications/${id}`);
  return response.data;
};

export const sendNotification = async (request) => {
  await apiClient.post('/notifications/send', request);
};

export const sendReminder = async (request) => {
  await apiClient.post('/notifications/reminder', request);
};

export const resendNotification = async (id) => {
  const response = await apiClient.post(`/notifications/${id}/resend`);
  return response.data;
};

export const getTemplates = async () => {
  const response = await apiClient.get('/notification-templates');
  return response.data;
};

export const getTemplateById = async (id) => {
  const response = await apiClient.get(`/notification-templates/${id}`);
  return response.data;
};

export const createTemplate = async (template) => {
  const response = await apiClient.post('/notification-templates', template);
  return response.data;
};

export const updateTemplate = async (id, template) => {
  const response = await apiClient.put(`/notification-templates/${id}`, template);
  return response.data;
};

export const deleteTemplate = async (id) => {
  await apiClient.delete(`/notification-templates/${id}`);
};

export const getNotificationConfig = async () => {
  const response = await apiClient.get('/notification-config');
  return response.data;
};

export const updateNotificationConfig = async (newConfig) => {
  const response = await apiClient.put('/notification-config', newConfig);
  return response.data;
};

const notificationService = {
  getNotificationDashboard, getNotificationHistory, getNotificationById,
  sendNotification, sendReminder, resendNotification,
  getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate,
  getNotificationConfig, updateNotificationConfig,
};

export default notificationService;

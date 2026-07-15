import api from './api';

const toFrontendNotification = (n) => ({
  id: n.id,
  userId: n.userId,
  eventId: n.eventId,
  notificationType: n.notificationType,
  channel: n.channel,
  receiver: n.receiver,
  message: n.message,
  status: n.status,
  errorMessage: n.errorMessage,
  sentTime: n.sentTime,
  createdAt: n.createdAt,
});

export const getNotificationDashboard = async () => {
  try {
    const response = await api.get('/notifications/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load dashboard');
  }
};

export const getNotificationHistory = async (filters = {}) => {
  try {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.channel) params.channel = filters.channel;
    if (filters.eventId) params.eventId = filters.eventId;
    if (filters.userId) params.userId = filters.userId;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    const response = await api.get('/notifications/history', { params });
    return (response.data || []).map(toFrontendNotification);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load history');
  }
};

export const getNotificationById = async (id) => {
  try {
    const response = await api.get(`/notifications/${id}`);
    return toFrontendNotification(response.data);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load notification');
  }
};

export const sendNotification = async (request) => {
  try {
    await api.post('/notifications/send', request);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send notification');
  }
};

export const sendReminder = async (request) => {
  try {
    await api.post('/notifications/reminder', request);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to send reminder');
  }
};

export const resendNotification = async (id) => {
  try {
    const response = await api.post(`/notifications/${id}/resend`);
    return toFrontendNotification(response.data);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to resend');
  }
};

export const getTemplates = async () => {
  try {
    const response = await api.get('/notification-templates');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load templates');
  }
};

export const getTemplateById = async (id) => {
  try {
    const response = await api.get(`/notification-templates/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load template');
  }
};

export const createTemplate = async (template) => {
  try {
    const response = await api.post('/notification-templates', template);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create template');
  }
};

export const updateTemplate = async (id, template) => {
  try {
    const response = await api.put(`/notification-templates/${id}`, template);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update template');
  }
};

export const deleteTemplate = async (id) => {
  try {
    await api.delete(`/notification-templates/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete template');
  }
};

export const getNotificationConfig = async () => {
  try {
    const response = await api.get('/notification-config');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to load config');
  }
};

export const updateNotificationConfig = async (config) => {
  try {
    const response = await api.put('/notification-config', config);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update config');
  }
};

const notificationService = {
  getNotificationDashboard,
  getNotificationHistory,
  getNotificationById,
  sendNotification,
  sendReminder,
  resendNotification,
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getNotificationConfig,
  updateNotificationConfig,
};

export default notificationService;

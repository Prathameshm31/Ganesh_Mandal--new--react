import notificationsData from '../mock-data/notifications';

let history = [...notificationsData.history];
let templates = [...notificationsData.templates];
let config = { ...notificationsData.config };

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
  const sent = history.filter((n) => n.status === 'Sent').length;
  const failed = history.filter((n) => n.status === 'Failed').length;
  const pending = history.filter((n) => n.status === 'Pending').length;
  return { total: history.length, sent, failed, pending, templates: templates.length };
};

export const getNotificationHistory = async (filters = {}) => {
  return history
    .filter((n) => {
      if (filters.status && n.status !== filters.status) return false;
      if (filters.channel && n.channel !== filters.channel) return false;
      if (filters.eventId && n.eventId !== filters.eventId) return false;
      if (filters.userId && n.userId !== filters.userId) return false;
      return true;
    })
    .map(toFrontendNotification);
};

export const getNotificationById = async (id) => {
  const n = history.find((item) => item.id === id);
  return n ? toFrontendNotification(n) : null;
};

export const sendNotification = async (request) => {
  const newNotification = {
    id: `NTF-${String(history.length + 1).padStart(4, '0')}`,
    ...request,
    status: 'Sent',
    sentTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  history.push(newNotification);
};

export const sendReminder = async (request) => {
  await sendNotification({ ...request, notificationType: 'Event Reminder' });
};

export const resendNotification = async (id) => {
  const n = history.find((item) => item.id === id);
  if (!n) throw new Error('Notification not found');
  const resent = { ...n, status: 'Sent', sentTime: new Date().toISOString() };
  history.push(resent);
  return toFrontendNotification(resent);
};

export const getTemplates = async () => templates;

export const getTemplateById = async (id) =>
  templates.find((t) => t.id === id) || null;

export const createTemplate = async (template) => {
  const newTemplate = { ...template, id: `TPL-${String(templates.length + 1).padStart(4, '0')}` };
  templates.push(newTemplate);
  return newTemplate;
};

export const updateTemplate = async (id, template) => {
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error('Template not found');
  templates[idx] = { ...templates[idx], ...template };
  return templates[idx];
};

export const deleteTemplate = async (id) => {
  templates = templates.filter((t) => t.id !== id);
};

export const getNotificationConfig = async () => ({ ...config });

export const updateNotificationConfig = async (newConfig) => {
  config = { ...config, ...newConfig };
  return config;
};

const notificationService = {
  getNotificationDashboard, getNotificationHistory, getNotificationById,
  sendNotification, sendReminder, resendNotification,
  getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate,
  getNotificationConfig, updateNotificationConfig,
};

export default notificationService;

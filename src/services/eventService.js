import apiClient from '../api/apiClient';

const EVENT_CATEGORIES = ['Before Festival', 'Day 1', 'Daily', 'Special Days', 'Final Day'];
const FESTIVAL_DAYS = ['Pre-Festival', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Final Day', 'Daily'];
const STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

export const getAllEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data;
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
};

export const searchEvents = async ({ keyword, category, festivalDay, festivalYear, status } = {}) => {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (category) params.category = category;
  if (festivalDay) params.festivalDay = festivalDay;
  if (festivalYear) params.festivalYear = festivalYear;
  if (status) params.status = status;
  const response = await apiClient.get('/events/search', { params });
  return response.data;
};

export const createEvent = async (data) => {
  const response = await apiClient.post('/events', data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await apiClient.put(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  await apiClient.delete(`/events/${id}`);
};

const eventService = {
  getAllEvents, getEventById, searchEvents, createEvent, updateEvent, deleteEvent,
  EVENT_CATEGORIES, FESTIVAL_DAYS, STATUSES,
};
export default eventService;

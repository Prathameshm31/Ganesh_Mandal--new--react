import api from './api';

const EVENT_CATEGORIES = ['Before Festival', 'Day 1', 'Daily', 'Special Days', 'Final Day'];
const FESTIVAL_DAYS = ['Pre-Festival', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Final Day', 'Daily'];

const STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

const toFrontend = (e) => ({
  id: String(e.id), eventName: e.eventName || '', eventCategory: e.eventCategory || '',
  festivalDay: e.festivalDay || '', festivalYear: e.festivalYear || '',
  date: e.date || '', startTime: e.startTime || '', endTime: e.endTime || '',
  venue: e.venue || '', description: e.description || '',
  organizer: e.organizer || '', coordinator: e.coordinator || '',
  budget: e.budget != null ? Number(e.budget) : null, status: e.status || 'Planned',
});

const toBackend = (e) => ({
  eventName: e.eventName, eventCategory: e.eventCategory || null, festivalDay: e.festivalDay || null,
  festivalYear: e.festivalYear, date: e.date || null, startTime: e.startTime || null,
  endTime: e.endTime || null, venue: e.venue || null, description: e.description || null,
  organizer: e.organizer || null, coordinator: e.coordinator || null, budget: e.budget || null,
  status: e.status || 'Planned',
});

export const getAllEvents = async () => {
  const r = await api.get('/events');
  return (r.data || []).map(toFrontend);
};

export const getEventById = async (id) => {
  const r = await api.get(`/events/${id}`);
  return toFrontend(r.data);
};

export const searchEvents = async ({ keyword, category, festivalDay, festivalYear, status } = {}) => {
  const r = await api.get('/events/search', { params: { keyword, category, festivalDay, festivalYear, status } });
  return (r.data || []).map(toFrontend);
};

export const createEvent = async (data) => {
  const r = await api.post('/events', toBackend(data));
  return toFrontend(r.data);
};

export const updateEvent = async (id, data) => {
  const r = await api.put(`/events/${id}`, toBackend(data));
  return toFrontend(r.data);
};

export const deleteEvent = async (id) => {
  await api.delete(`/events/${id}`);
};

const eventService = {
  getAllEvents, getEventById, searchEvents, createEvent, updateEvent, deleteEvent,
  EVENT_CATEGORIES, FESTIVAL_DAYS, STATUSES,
};
export default eventService;

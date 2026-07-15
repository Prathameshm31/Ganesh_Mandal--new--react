import eventsData from '../mock-data/events';

let events = [...eventsData];
let nextId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;

const toFrontend = (e) => ({
  id: String(e.id), eventName: e.eventName || '', eventCategory: e.eventCategory || '',
  festivalDay: e.festivalDay || '', festivalYear: e.festivalYear || '',
  date: e.date || '', startTime: e.startTime || '', endTime: e.endTime || '',
  venue: e.venue || '', description: e.description || '',
  organizer: e.organizer || '', coordinator: e.coordinator || '',
  budget: e.budget != null ? Number(e.budget) : null, status: e.status || 'Planned',
});

const EVENT_CATEGORIES = ['Before Festival', 'Day 1', 'Daily', 'Special Days', 'Final Day'];
const FESTIVAL_DAYS = ['Pre-Festival', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Final Day', 'Daily'];
const STATUSES = ['Planned', 'In Progress', 'Completed', 'Cancelled'];

export const getAllEvents = async () => events.map(toFrontend);

export const getEventById = async (id) => {
  const e = events.find((ev) => ev.id === Number(id));
  return e ? toFrontend(e) : null;
};

export const searchEvents = async ({ keyword, category, festivalDay, festivalYear, status } = {}) => {
  return events
    .filter((e) => {
      if (keyword && !e.eventName.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (category && e.eventCategory !== category) return false;
      if (festivalDay && e.festivalDay !== festivalDay) return false;
      if (festivalYear && e.festivalYear !== festivalYear) return false;
      if (status && e.status !== status) return false;
      return true;
    })
    .map(toFrontend);
};

export const createEvent = async (data) => {
  const newEvent = { ...data, id: nextId++ };
  events.push(newEvent);
  return toFrontend(newEvent);
};

export const updateEvent = async (id, data) => {
  const idx = events.findIndex((e) => e.id === Number(id));
  if (idx === -1) throw new Error('Event not found');
  events[idx] = { ...events[idx], ...data };
  return toFrontend(events[idx]);
};

export const deleteEvent = async (id) => {
  events = events.filter((e) => e.id !== Number(id));
};

const eventService = {
  getAllEvents, getEventById, searchEvents, createEvent, updateEvent, deleteEvent,
  EVENT_CATEGORIES, FESTIVAL_DAYS, STATUSES,
};
export default eventService;

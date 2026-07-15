import api from './api';

const toFrontend = (a) => ({
  id: String(a.id), volunteerId: String(a.volunteerId), volunteerName: a.volunteerName || '',
  volunteerMobile: a.volunteerMobile || '', volunteerRole: a.volunteerRole || '',
  eventId: String(a.eventId), eventName: a.eventName || '',
  attendanceDate: a.attendanceDate || '', status: a.status || '', remarks: a.remarks || '',
});

const toBackend = (a) => ({
  volunteerId: Number(a.volunteerId), eventId: Number(a.eventId),
  attendanceDate: a.attendanceDate, status: a.status, remarks: a.remarks || null,
});

export const markAttendance = async (data) => {
  const r = await api.post('/attendance', toBackend(data));
  return toFrontend(r.data);
};

export const markBulkAttendance = async (list) => {
  const r = await api.post('/attendance/bulk', list.map(toBackend));
  return (r.data || []).map(toFrontend);
};

export const getAttendanceByEvent = async (eventId) => {
  const r = await api.get(`/attendance/by-event/${eventId}`);
  return (r.data || []).map(toFrontend);
};

export const getAttendanceByEventAndDate = async (eventId, date) => {
  const r = await api.get('/attendance/by-event-date', { params: { eventId, date } });
  return (r.data || []).map(toFrontend);
};

export const getAttendanceByVolunteer = async (volunteerId) => {
  const r = await api.get(`/attendance/by-volunteer/${volunteerId}`);
  return (r.data || []).map(toFrontend);
};

export const getAttendanceStats = async (festivalYear) => {
  const r = await api.get('/attendance/stats', { params: { festivalYear } });
  return r.data;
};

export const deleteAttendance = async (id) => {
  await api.delete(`/attendance/${id}`);
};

const attendanceService = {
  markAttendance, markBulkAttendance, getAttendanceByEvent, getAttendanceByEventAndDate,
  getAttendanceByVolunteer, getAttendanceStats, deleteAttendance,
};
export default attendanceService;

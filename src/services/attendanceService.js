import apiClient from '../api/apiClient';

export const markAttendance = async (data) => {
  const response = await apiClient.post('/attendance', data);
  return response.data;
};

export const markBulkAttendance = async (list) => {
  const response = await apiClient.post('/attendance/bulk', list);
  return response.data;
};

export const getAttendanceByEvent = async (eventId) => {
  const response = await apiClient.get(`/attendance/by-event/${eventId}`);
  return response.data;
};

export const getAttendanceByEventAndDate = async (eventId, date) => {
  const response = await apiClient.get('/attendance/by-event-date', { params: { eventId, date } });
  return response.data;
};

export const getAttendanceByVolunteer = async (volunteerId) => {
  const response = await apiClient.get(`/attendance/by-volunteer/${volunteerId}`);
  return response.data;
};

export const getAttendanceStats = async (festivalYear) => {
  const params = {};
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/attendance/stats', { params });
  return response.data;
};

export const deleteAttendance = async (id) => {
  await apiClient.delete(`/attendance/${id}`);
};

const attendanceService = {
  markAttendance, markBulkAttendance, getAttendanceByEvent, getAttendanceByEventAndDate,
  getAttendanceByVolunteer, getAttendanceStats, deleteAttendance,
};
export default attendanceService;

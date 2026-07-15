import attendanceData from '../mock-data/attendance';

let attendance = [...attendanceData];

const toFrontend = (a) => ({
  id: String(a.id), volunteerId: String(a.volunteerId), volunteerName: a.volunteerName || '',
  volunteerMobile: a.volunteerMobile || '', volunteerRole: a.volunteerRole || '',
  eventId: String(a.eventId), eventName: a.eventName || '',
  attendanceDate: a.attendanceDate || '', status: a.status || '', remarks: a.remarks || '',
});

export const markAttendance = async (data) => {
  const record = { ...data, id: `ATT-${String(attendance.length + 1).padStart(4, '0')}` };
  attendance.push(record);
  return toFrontend(record);
};

export const markBulkAttendance = async (list) => {
  const records = list.map((item, i) => ({
    ...item,
    id: `ATT-${String(attendance.length + i + 1).padStart(4, '0')}`,
  }));
  attendance.push(...records);
  return records.map(toFrontend);
};

export const getAttendanceByEvent = async (eventId) =>
  attendance.filter((a) => String(a.eventId) === String(eventId)).map(toFrontend);

export const getAttendanceByEventAndDate = async (eventId, date) =>
  attendance
    .filter((a) => String(a.eventId) === String(eventId) && a.attendanceDate === date)
    .map(toFrontend);

export const getAttendanceByVolunteer = async (volunteerId) =>
  attendance.filter((a) => String(a.volunteerId) === String(volunteerId)).map(toFrontend);

export const getAttendanceStats = async (festivalYear) => {
  const filtered = festivalYear
    ? attendance.filter((a) => a.attendanceDate && a.attendanceDate.startsWith(festivalYear))
    : attendance;
  const total = filtered.length;
  const present = filtered.filter((a) => a.status === 'Present').length;
  const late = filtered.filter((a) => a.status === 'Late').length;
  const absent = filtered.filter((a) => a.status === 'Absent').length;
  return { total, present, late, absent };
};

export const deleteAttendance = async (id) => {
  attendance = attendance.filter((a) => String(a.id) !== String(id));
};

const attendanceService = {
  markAttendance, markBulkAttendance, getAttendanceByEvent, getAttendanceByEventAndDate,
  getAttendanceByVolunteer, getAttendanceStats, deleteAttendance,
};
export default attendanceService;

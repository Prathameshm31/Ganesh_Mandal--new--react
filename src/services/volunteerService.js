import api from './api';

const CATEGORIES = [
  { name: 'Core Committee', roles: ['President','Vice President','Secretary','Joint Secretary','Treasurer','Joint Treasurer'] },
  { name: 'Event Management', roles: ['Event Organizer','Event Coordinator','Stage Manager','Guest Management','Anchor/Host','Competition Coordinator','Cultural Program Coordinator','Prize Distribution Coordinator'] },
  { name: 'Decoration & Murti', roles: ['Decoration Head','Decoration Team','Lighting Team','Flower Decoration Team','Ganesh Murti Management','Visarjan Coordinator'] },
  { name: 'Social Media & Marketing', roles: ['Social Media Manager','Instagram Handler','Facebook Handler','YouTube Handler','WhatsApp Community Admin','Content Creator','Photographer','Videographer','Graphic Designer','Live Streaming Coordinator'] },
  { name: 'Finance', roles: ['Cash Collection Volunteer','Online Payment Coordinator','Receipt Management','Donation Collection','Sponsor Coordinator','Expense Management'] },
  { name: 'Prasad & Food', roles: ['Prasad Coordinator','Prasad Distribution Team','Food Arrangement Team','Drinking Water Management'] },
  { name: 'Security & Safety', roles: ['Security Head','Crowd Management','Parking Coordinator','First Aid Volunteer','Emergency Response Team'] },
  { name: 'Logistics', roles: ['Sound System Coordinator','Electrical Team','Generator Management','Seating Arrangement','Cleaning Team','Material Management'] },
  { name: 'Public Relations', roles: ['VIP Guest Coordinator','Media Coordinator','Announcement Coordinator','Public Help Desk'] },
];

const CARD_CONFIGS = [
  { key: 'totalVolunteers', label: 'Total Volunteers', icon: 'Users', color: 'blue', filter: null },
  { key: 'activeVolunteers', label: 'Active Volunteers', icon: 'UserCheck', color: 'green', filter: { status: 'Active' } },
  { key: 'coreCommittee', label: 'Committee Members', icon: 'Shield', color: 'purple', filter: { roles: 'President,Vice President,Secretary,Joint Secretary,Treasurer,Joint Treasurer' } },
  { key: 'eventOrganizers', label: 'Event Organizers', icon: 'Calendar', color: 'orange', filter: { roles: 'Event Organizer,Event Coordinator' } },
  { key: 'socialMediaTeam', label: 'Social Media Team', icon: 'Camera', color: 'pink', filter: { roles: 'Social Media Manager,Instagram Handler,Facebook Handler,YouTube Handler,WhatsApp Community Admin,Content Creator,Photographer,Videographer,Graphic Designer,Live Streaming Coordinator' } },
  { key: 'financeTeam', label: 'Finance Team', icon: 'DollarSign', color: 'indigo', filter: { roles: 'Cash Collection Volunteer,Online Payment Coordinator,Receipt Management,Donation Collection,Sponsor Coordinator,Expense Management' } },
  { key: 'decorationTeam', label: 'Decoration Team', icon: 'Palette', color: 'amber', filter: { roles: 'Decoration Head,Decoration Team,Lighting Team,Flower Decoration Team,Ganesh Murti Management,Visarjan Coordinator' } },
  { key: 'prasadTeam', label: 'Prasad Team', icon: 'UtensilsCrossed', color: 'teal', filter: { roles: 'Prasad Coordinator,Prasad Distribution Team,Food Arrangement Team,Drinking Water Management' } },
  { key: 'securityTeam', label: 'Security Team', icon: 'ShieldAlert', color: 'red', filter: { roles: 'Security Head,Crowd Management,Parking Coordinator,First Aid Volunteer,Emergency Response Team' } },
  { key: 'logisticsTeam', label: 'Logistics Team', icon: 'Truck', color: 'cyan', filter: { roles: 'Sound System Coordinator,Electrical Team,Generator Management,Seating Arrangement,Cleaning Team,Material Management' } },
  { key: 'todayAssigned', label: "Today's Duty", icon: 'Bell', color: 'amber', filter: { type: 'assignedDate', date: 'today' } },
  { key: 'upcomingDuties', label: 'Upcoming Duties', icon: 'Clock', color: 'blue', filter: { type: 'upcoming' } },
  { key: 'birthdayThisMonth', label: 'Birthdays This Month', icon: 'Gift', color: 'teal', filter: { type: 'birthdayMonth' } },
];

const toFrontend = (v) => ({
  id: String(v.id), name: v.name || '', mobile: v.mobile || '', email: v.email || '',
  address: v.address || '', profilePhoto: v.profilePhoto || '', dateOfBirth: v.dateOfBirth || '',
  gender: v.gender || '', bloodGroup: v.bloodGroup || '', emergencyContact: v.emergencyContact || '',
  aadhaarNumber: v.aadhaarNumber || '', festivalYear: v.festivalYear || '',
  category: v.category || '', role: v.role || '', skills: v.skills || '',
  experience: v.experience || '', availability: v.availability || '',
  joiningDate: v.joiningDate || '', status: v.status || 'Active',
});

const toBackend = (v) => ({
  name: v.name, mobile: v.mobile, email: v.email || null, address: v.address || null,
  profilePhoto: v.profilePhoto || null, dateOfBirth: v.dateOfBirth || null,
  gender: v.gender || null, bloodGroup: v.bloodGroup || null,
  emergencyContact: v.emergencyContact || null, aadhaarNumber: v.aadhaarNumber || null,
  festivalYear: v.festivalYear, category: v.category, role: v.role,
  skills: v.skills || null, experience: v.experience || null, availability: v.availability || null,
  joiningDate: v.joiningDate || null, status: v.status || 'Active',
});

export const getAllVolunteers = async () => {
  const r = await api.get('/volunteers');
  return (r.data || []).map(toFrontend);
};

export const getVolunteerById = async (id) => {
  const r = await api.get(`/volunteers/${id}`);
  return toFrontend(r.data);
};

export const getVolunteerDetail = async (id) => {
  const r = await api.get(`/volunteers/${id}/detail`);
  return r.data;
};

export const searchVolunteers = async ({ keyword, category, role, status, festivalYear } = {}) => {
  const r = await api.get('/volunteers/search', { params: { keyword, category, role, status, festivalYear } });
  return (r.data || []).map(toFrontend);
};

export const searchFiltered = async (params = {}) => {
  const r = await api.get('/volunteers/search', { params });
  return (r.data || []).map(toFrontend);
};

export const getVolunteersByRoles = async (roles, festivalYear) => {
  const r = await api.get('/volunteers/by-roles', { params: { roles: roles.join(','), festivalYear } });
  return (r.data || []).map(toFrontend);
};

export const getByAssignedDate = async (date) => {
  const r = await api.get('/volunteers/by-assigned-date', { params: { date } });
  return (r.data || []).map(toFrontend);
};

export const createVolunteer = async (data) => {
  const r = await api.post('/volunteers', toBackend(data));
  return toFrontend(r.data);
};

export const updateVolunteer = async (id, data) => {
  const r = await api.put(`/volunteers/${id}`, toBackend(data));
  return toFrontend(r.data);
};

export const deleteVolunteer = async (id) => {
  await api.delete(`/volunteers/${id}`);
};

export const getVolunteerDashboard = async (festivalYear) => {
  const r = await api.get('/volunteer-dashboard', { params: { festivalYear } });
  return r.data;
};

export const getDashboardSummary = async (festivalYear) => {
  const r = await api.get('/volunteer-dashboard/summary', { params: { festivalYear } });
  return r.data;
};

export const getBirthdays = async (festivalYear) => {
  const r = await api.get('/volunteers/birthdays', { params: { festivalYear } });
  return (r.data || []).map(toFrontend);
};

const volunteerService = {
  getAllVolunteers, getVolunteerById, getVolunteerDetail, searchVolunteers, searchFiltered,
  getVolunteersByRoles, getByAssignedDate, createVolunteer, updateVolunteer, deleteVolunteer,
  getVolunteerDashboard, getDashboardSummary, getBirthdays, CATEGORIES, CARD_CONFIGS,
};
export default volunteerService;

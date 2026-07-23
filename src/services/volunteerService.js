import apiClient from '../api/apiClient';

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

export const getAllVolunteers = async () => {
  const response = await apiClient.get('/volunteers');
  return response.data;
};

export const getVolunteerById = async (id) => {
  const response = await apiClient.get(`/volunteers/${id}`);
  return response.data;
};

export const getVolunteerDetail = async (id) => {
  const response = await apiClient.get(`/volunteers/${id}/detail`);
  return response.data;
};

export const searchVolunteers = async ({ keyword, category, role, status, festivalYear } = {}) => {
  const params = {};
  if (keyword) params.keyword = keyword;
  if (category) params.category = category;
  if (role) params.role = role;
  if (status) params.status = status;
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/volunteers/search', { params });
  return response.data;
};

export const searchFiltered = async (params = {}) => {
  const response = await apiClient.get('/volunteers/search', { params });
  return response.data;
};

export const getVolunteersByRoles = async (roles, festivalYear) => {
  const params = { roles: Array.isArray(roles) ? roles.join(',') : roles };
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/volunteers/by-roles', { params });
  return response.data;
};

export const getByAssignedDate = async (date) => {
  const response = await apiClient.get('/volunteers/by-assigned-date', { params: { date } });
  return response.data;
};

export const createVolunteer = async (data) => {
  const response = await apiClient.post('/volunteers', data);
  return response.data;
};

export const updateVolunteer = async (id, data) => {
  const response = await apiClient.put(`/volunteers/${id}`, data);
  return response.data;
};

export const deleteVolunteer = async (id) => {
  await apiClient.delete(`/volunteers/${id}`);
};

export const getVolunteerDashboard = async (festivalYear) => {
  const params = {};
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/volunteer-dashboard', { params });
  return response.data;
};

export const getDashboardSummary = async (festivalYear) => {
  const params = {};
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/volunteer-dashboard/summary', { params });
  return response.data;
};

export const getBirthdays = async (festivalYear) => {
  const params = {};
  if (festivalYear) params.festivalYear = festivalYear;
  const response = await apiClient.get('/volunteers/birthdays', { params });
  return response.data;
};

const volunteerService = {
  getAllVolunteers, getVolunteerById, getVolunteerDetail, searchVolunteers, searchFiltered,
  getVolunteersByRoles, getByAssignedDate, createVolunteer, updateVolunteer, deleteVolunteer,
  getVolunteerDashboard, getDashboardSummary, getBirthdays, CATEGORIES, CARD_CONFIGS,
};
export default volunteerService;

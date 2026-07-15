import volunteersData from '../mock-data/volunteers';

let volunteers = [...volunteersData];

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

export const getAllVolunteers = async () => volunteers.map(toFrontend);

export const getVolunteerById = async (id) => {
  const v = volunteers.find((vol) => String(vol.id) === String(id));
  return v ? toFrontend(v) : null;
};

export const getVolunteerDetail = async (id) => {
  const v = volunteers.find((vol) => String(vol.id) === String(id));
  return v ? toFrontend(v) : null;
};

export const searchVolunteers = async ({ keyword, category, role, status, festivalYear } = {}) => {
  return volunteers
    .filter((v) => {
      if (keyword && !v.name.toLowerCase().includes(keyword.toLowerCase()) && !v.mobile.includes(keyword)) return false;
      if (category && v.category !== category) return false;
      if (role && v.role !== role) return false;
      if (status && v.status !== status) return false;
      if (festivalYear && v.festivalYear !== festivalYear) return false;
      return true;
    })
    .map(toFrontend);
};

export const searchFiltered = async (params = {}) => {
  return volunteers
    .filter((v) => {
      if (params.keyword && !v.name.toLowerCase().includes(params.keyword.toLowerCase())) return false;
      if (params.category && v.category !== params.category) return false;
      if (params.role && v.role !== params.role) return false;
      if (params.status && v.status !== params.status) return false;
      if (params.festivalYear && v.festivalYear !== params.festivalYear) return false;
      if (params.roles) {
        const rolesList = params.roles.split(',');
        if (!rolesList.includes(v.role)) return false;
      }
      return true;
    })
    .map(toFrontend);
};

export const getVolunteersByRoles = async (roles, festivalYear) => {
  return volunteers
    .filter((v) => {
      if (!roles.includes(v.role)) return false;
      if (festivalYear && v.festivalYear !== festivalYear) return false;
      return true;
    })
    .map(toFrontend);
};

export const getByAssignedDate = async (date) => {
  return volunteers.map(toFrontend);
};

export const createVolunteer = async (data) => {
  volunteers.push(data);
  return toFrontend(data);
};

export const updateVolunteer = async (id, data) => {
  const idx = volunteers.findIndex((v) => String(v.id) === String(id));
  if (idx === -1) throw new Error('Volunteer not found');
  volunteers[idx] = { ...volunteers[idx], ...data };
  return toFrontend(volunteers[idx]);
};

export const deleteVolunteer = async (id) => {
  volunteers = volunteers.filter((v) => String(v.id) !== String(id));
};

export const getVolunteerDashboard = async (festivalYear) => {
  const filtered = festivalYear ? volunteers.filter((v) => v.festivalYear === festivalYear) : volunteers;
  const roles = {};
  filtered.forEach((v) => { roles[v.role] = (roles[v.role] || 0) + 1; });
  return { total: filtered.length, roles };
};

export const getDashboardSummary = async (festivalYear) => {
  const filtered = festivalYear ? volunteers.filter((v) => v.festivalYear === festivalYear) : volunteers;
  return { total: filtered.length, active: filtered.filter((v) => v.status === 'Active').length };
};

export const getBirthdays = async (festivalYear) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  return volunteers
    .filter((v) => {
      if (!v.dateOfBirth) return false;
      const dob = new Date(v.dateOfBirth);
      return dob.getMonth() === currentMonth;
    })
    .map(toFrontend);
};

const volunteerService = {
  getAllVolunteers, getVolunteerById, getVolunteerDetail, searchVolunteers, searchFiltered,
  getVolunteersByRoles, getByAssignedDate, createVolunteer, updateVolunteer, deleteVolunteer,
  getVolunteerDashboard, getDashboardSummary, getBirthdays, CATEGORIES, CARD_CONFIGS,
};
export default volunteerService;

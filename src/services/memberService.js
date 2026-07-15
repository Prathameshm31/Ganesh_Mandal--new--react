import api from './api';

const toFrontendMember = (m) => ({
  id: String(m.id),
  fullName: m.name,
  mobileNumber: m.mobile,
  whatsappNumber: m.whatsappNumber || '',
  email: m.email || '',
  address: m.address || '',
  colony: m.colony || '',
  area: m.area || '',
  houseNumber: m.houseNumber || '',
  familyMembers: m.familyMembers || 1,
  occupation: m.occupation || '',
  profilePhoto: m.profilePhoto,
  status: m.status || 'Active',
  notes: m.notes || '',
  joinDate: m.joinDate || (m.createdAt ? m.createdAt.split('T')[0] : ''),
  lastYearAmount: m.lastYearAmount,
});

const toBackendMember = (m) => ({
  name: m.fullName,
  mobile: m.mobileNumber,
  whatsappNumber: m.whatsappNumber,
  email: m.email,
  address: m.address,
  colony: m.colony,
  area: m.area,
  houseNumber: m.houseNumber,
  familyMembers: m.familyMembers,
  occupation: m.occupation,
  profilePhoto: m.profilePhoto,
  status: m.status,
  notes: m.notes,
  joinDate: m.joinDate,
  lastYearAmount: m.lastYearAmount,
});

const paginate = (list, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  return {
    data: list.slice(start, start + limit),
    total: list.length,
    page,
    limit,
    totalPages: Math.ceil(list.length / limit) || 1,
  };
};

export const getMembers = async ({ page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' } = {}) => {
  try {
    const response = await api.get('/members');
    const members = (response.data || []).map(toFrontendMember);
    const sorted = [...members].sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return paginate(sorted, page, limit);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch members';
    throw new Error(message);
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await api.get(`/members/${id}`);
    return toFrontendMember(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to fetch member ${id}`;
    throw new Error(message);
  }
};

export const addMember = async (member) => {
  try {
    const response = await api.post('/members', toBackendMember(member));
    return toFrontendMember(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to add member';
    throw new Error(message);
  }
};

export const updateMember = async (id, member) => {
  try {
    const response = await api.put(`/members/${id}`, toBackendMember(member));
    return toFrontendMember(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to update member ${id}`;
    throw new Error(message);
  }
};

export const deleteMember = async (id) => {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data || { id, deleted: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to delete member ${id}`;
    throw new Error(message);
  }
};

export const searchMembers = async (query) => {
  try {
    const response = await api.get('/members/search', { params: { keyword: query } });
    return (response.data || []).map(toFrontendMember);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to search members';
    throw new Error(message);
  }
};

export const filterMembers = async (criteria) => {
  try {
    const params = {};
    if (criteria.status) params.status = criteria.status;
    if (criteria.colony) params.colony = criteria.colony;
    if (criteria.occupation) params.occupation = criteria.occupation;
    const response = await api.get('/members/search', { params });
    return (response.data || []).map(toFrontendMember);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to filter members';
    throw new Error(message);
  }
};

export const getAllMembers = async () => {
  try {
    const response = await api.get('/members');
    return (response.data || []).map(toFrontendMember);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch all members';
    throw new Error(message);
  }
};

const memberService = {
  getMembers,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
  searchMembers,
  filterMembers,
  getAllMembers,
};

export default memberService;

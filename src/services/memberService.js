import apiClient from '../api/apiClient';

export const getMembers = async ({ page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc' } = {}) => {
  const params = { page: page - 1, size: limit, sortBy, sortOrder };
  const response = await apiClient.get('/members', { params });
  const springPage = response.data;
  return {
    data: springPage.content || springPage,
    total: springPage.totalElements ?? (Array.isArray(springPage) ? springPage.length : 0),
    page, limit,
    totalPages: springPage.totalPages ?? 1,
  };
};

export const getMemberById = async (id) => {
  const response = await apiClient.get(`/members/${id}`);
  return response.data;
};

export const addMember = async (member) => {
  const response = await apiClient.post('/members', member);
  return response.data;
};

export const updateMember = async (id, member) => {
  const response = await apiClient.put(`/members/${id}`, member);
  return response.data;
};

export const deleteMember = async (id) => {
  await apiClient.delete(`/members/${id}`);
  return { id, deleted: true };
};

export const searchMembers = async (query) => {
  const response = await apiClient.get('/members/search', { params: { keyword: query } });
  return response.data;
};

export const filterMembers = async (criteria = {}) => {
  const params = {};
  if (criteria.keyword) params.keyword = criteria.keyword;
  if (criteria.status) params.status = criteria.status;
  if (criteria.colony) params.colony = criteria.colony;
  if (criteria.occupation) params.occupation = criteria.occupation;
  if (criteria.festivalYear) params.festivalYear = criteria.festivalYear;
  if (criteria.committeeCategory) params.committeeCategory = criteria.committeeCategory;
  if (criteria.roleId) params.roleId = criteria.roleId;
  const response = await apiClient.get('/members/search', { params });
  return response.data;
};

export const getAllMembers = async () => {
  const response = await apiClient.get('/members');
  return response.data;
};

export const getMembersByRole = async (roleId) => {
  const response = await apiClient.get(`/members/by-role/${roleId}`);
  return response.data;
};

export const assignMemberRole = async (memberId, roleId) => {
  const response = await apiClient.put(`/members/${memberId}/assign-role/${roleId}`);
  return response.data;
};

const memberService = {
  getMembers, getMemberById, addMember, updateMember,
  deleteMember, searchMembers, filterMembers, getAllMembers,
  getMembersByRole, assignMemberRole,
};

export default memberService;

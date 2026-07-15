import membersData from '../mock-data/members';

let members = [...membersData];

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
  const sorted = [...members].sort((a, b) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  return paginate(sorted, page, limit);
};

export const getMemberById = async (id) =>
  members.find((m) => String(m.id) === String(id)) || null;

export const addMember = async (member) => {
  const newMember = { ...member };
  members.push(newMember);
  return newMember;
};

export const updateMember = async (id, member) => {
  const idx = members.findIndex((m) => String(m.id) === String(id));
  if (idx === -1) throw new Error('Member not found');
  members[idx] = { ...members[idx], ...member };
  return members[idx];
};

export const deleteMember = async (id) => {
  members = members.filter((m) => String(m.id) !== String(id));
  return { id, deleted: true };
};

export const searchMembers = async (query) => {
  const q = (query || '').toLowerCase();
  return members.filter(
    (m) =>
      (m.fullName || '').toLowerCase().includes(q) ||
      (m.mobileNumber || '').includes(q) ||
      (m.colony || '').toLowerCase().includes(q)
  );
};

export const filterMembers = async (criteria) => {
  return members.filter((m) => {
    if (criteria.status && m.status !== criteria.status) return false;
    if (criteria.colony && m.colony !== criteria.colony) return false;
    if (criteria.occupation && m.occupation !== criteria.occupation) return false;
    return true;
  });
};

export const getAllMembers = async () => members;

const memberService = {
  getMembers, getMemberById, addMember, updateMember,
  deleteMember, searchMembers, filterMembers, getAllMembers,
};

export default memberService;

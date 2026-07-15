import api from './api';

const toFrontend = (p) => ({
  id: String(p.id),
  festivalYear: p.festivalYear || '',
  festivalDay: p.festivalDay || '',
  prasadDate: p.prasadDate || '',
  prasadName: p.prasadName || '',
  sponsoredBy: p.sponsoredBy || '',
  mobileNumber: p.mobileNumber || '',
  address: p.address || '',
  quantity: p.quantity || '',
  estimatedCost: p.estimatedCost != null ? Number(p.estimatedCost) : null,
  donationAmount: p.donationAmount != null ? Number(p.donationAmount) : null,
  preparedBy: p.preparedBy || '',
  distributionTime: p.distributionTime || '',
  status: p.status || 'Pending',
  notes: p.notes || '',
});

const toBackend = (p) => ({
  festivalYear: p.festivalYear,
  festivalDay: p.festivalDay,
  prasadDate: p.prasadDate || null,
  prasadName: p.prasadName,
  sponsoredBy: p.sponsoredBy,
  mobileNumber: p.mobileNumber,
  address: p.address,
  quantity: p.quantity,
  estimatedCost: p.estimatedCost || null,
  donationAmount: p.donationAmount || null,
  preparedBy: p.preparedBy,
  distributionTime: p.distributionTime,
  status: p.status || 'Pending',
  notes: p.notes,
});

export const getPrasadByYear = async (festivalYear) => {
  const response = await api.get(`/prasad/year/${festivalYear}`);
  return (response.data || []).map(toFrontend);
};

export const getPrasadById = async (id) => {
  const response = await api.get(`/prasad/${id}`);
  return toFrontend(response.data);
};

export const getPrasadByYearAndDay = async (festivalYear, festivalDay) => {
  const response = await api.get(`/prasad/year/${festivalYear}/day/${festivalDay}`);
  return (response.data || []).map(toFrontend);
};

export const searchPrasad = async (keyword) => {
  const response = await api.get('/prasad/search', { params: { keyword } });
  return (response.data || []).map(toFrontend);
};

export const createPrasad = async (data) => {
  const response = await api.post('/prasad', toBackend(data));
  return toFrontend(response.data);
};

export const updatePrasad = async (id, data) => {
  const response = await api.put(`/prasad/${id}`, toBackend(data));
  return toFrontend(response.data);
};

export const deletePrasad = async (id) => {
  await api.delete(`/prasad/${id}`);
};

const prasadSponsorshipService = {
  getPrasadByYear,
  getPrasadById,
  getPrasadByYearAndDay,
  searchPrasad,
  createPrasad,
  updatePrasad,
  deletePrasad,
};

export default prasadSponsorshipService;

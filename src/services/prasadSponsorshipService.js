import prasadData from '../mock-data/prasad';

let prasad = [...prasadData];

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

export const getPrasadByYear = async (festivalYear) =>
  prasad.filter((p) => p.festivalYear === String(festivalYear)).map(toFrontend);

export const getPrasadById = async (id) => {
  const p = prasad.find((item) => item.id === Number(id));
  return p ? toFrontend(p) : null;
};

export const getPrasadByYearAndDay = async (festivalYear, festivalDay) =>
  prasad
    .filter((p) => p.festivalYear === String(festivalYear) && p.festivalDay === festivalDay)
    .map(toFrontend);

export const searchPrasad = async (keyword) =>
  prasad
    .filter((p) => p.prasadName && p.prasadName.toLowerCase().includes((keyword || '').toLowerCase()))
    .map(toFrontend);

export const createPrasad = async (data) => {
  const newPrasad = { ...data, id: prasad.length > 0 ? Math.max(...prasad.map((p) => p.id)) + 1 : 1 };
  prasad.push(newPrasad);
  return toFrontend(newPrasad);
};

export const updatePrasad = async (id, data) => {
  const idx = prasad.findIndex((p) => p.id === Number(id));
  if (idx === -1) throw new Error('Prasad not found');
  prasad[idx] = { ...prasad[idx], ...data };
  return toFrontend(prasad[idx]);
};

export const deletePrasad = async (id) => {
  prasad = prasad.filter((p) => p.id !== Number(id));
};

const prasadSponsorshipService = {
  getPrasadByYear, getPrasadById, getPrasadByYearAndDay,
  searchPrasad, createPrasad, updatePrasad, deletePrasad,
};

export default prasadSponsorshipService;

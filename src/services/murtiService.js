import api from './api';

const toFrontendMurti = (m) => ({
  id: String(m.id),
  festivalYear: m.festivalYear || '',
  murtiName: m.murtiName || '',
  donatedBy: m.donatedBy || '',
  mobileNumber: m.mobileNumber || '',
  address: m.address || '',
  murtiHeight: m.murtiHeight || '',
  murtiType: m.murtiType || '',
  artistName: m.artistName || '',
  workshopName: m.workshopName || '',
  installationDate: m.installationDate || '',
  visarjanDate: m.visarjanDate || '',
  estimatedCost: m.estimatedCost != null ? Number(m.estimatedCost) : null,
  isSponsored: m.isSponsored || 'No',
  donationAmount: m.donationAmount != null ? Number(m.donationAmount) : null,
  photoUrl: m.photoUrl || '',
  remarks: m.remarks || '',
});

const toBackendMurti = (m) => ({
  festivalYear: m.festivalYear,
  murtiName: m.murtiName,
  donatedBy: m.donatedBy,
  mobileNumber: m.mobileNumber,
  address: m.address,
  murtiHeight: m.murtiHeight,
  murtiType: m.murtiType,
  artistName: m.artistName,
  workshopName: m.workshopName,
  installationDate: m.installationDate || null,
  visarjanDate: m.visarjanDate || null,
  estimatedCost: m.estimatedCost || null,
  isSponsored: m.isSponsored || 'No',
  donationAmount: m.donationAmount || null,
  photoUrl: m.photoUrl || null,
  remarks: m.remarks,
});

export const getAllMurtis = async () => {
  try {
    const response = await api.get('/murti');
    return (response.data || []).map(toFrontendMurti);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch murti records';
    throw new Error(message);
  }
};

export const getMurtiById = async (id) => {
  try {
    const response = await api.get(`/murti/${id}`);
    return toFrontendMurti(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch murti details';
    throw new Error(message);
  }
};

export const getCurrentYearMurti = async () => {
  try {
    const response = await api.get('/murti/current-year');
    if (!response.data) return null;
    return toFrontendMurti(response.data);
  } catch (error) {
    return null;
  }
};

export const getMurtiHistory = async (year) => {
  try {
    const response = await api.get('/murti/history', { params: { year } });
    return (response.data || []).map(toFrontendMurti);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch murti history';
    throw new Error(message);
  }
};

export const searchMurtiByDonor = async (donorName) => {
  try {
    const response = await api.get('/murti/search', { params: { donorName } });
    return (response.data || []).map(toFrontendMurti);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to search murti';
    throw new Error(message);
  }
};

export const filterMurtiByYear = async (year) => {
  try {
    const response = await api.get('/murti/filter', { params: { year } });
    return (response.data || []).map(toFrontendMurti);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to filter murti';
    throw new Error(message);
  }
};

export const createMurti = async (murti) => {
  try {
    const response = await api.post('/murti', toBackendMurti(murti));
    return toFrontendMurti(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create murti record';
    throw new Error(message);
  }
};

export const updateMurti = async (id, murti) => {
  try {
    const response = await api.put(`/murti/${id}`, toBackendMurti(murti));
    return toFrontendMurti(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update murti record';
    throw new Error(message);
  }
};

export const deleteMurti = async (id) => {
  try {
    await api.delete(`/murti/${id}`);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete murti record';
    throw new Error(message);
  }
};

export const uploadMurtiPhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/murti/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to upload photo';
    throw new Error(message);
  }
};

const murtiService = {
  getAllMurtis,
  getMurtiById,
  getCurrentYearMurti,
  getMurtiHistory,
  searchMurtiByDonor,
  filterMurtiByYear,
  createMurti,
  updateMurti,
  deleteMurti,
  uploadMurtiPhoto,
};

export default murtiService;

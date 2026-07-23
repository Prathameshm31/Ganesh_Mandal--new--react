import apiClient from '../api/apiClient';

export const getDonations = async ({ page = 1, limit = 10, sortBy = 'collectionDate', sortOrder = 'desc' } = {}) => {
  const params = { page: page - 1, size: limit, sortBy, sortOrder };
  const response = await apiClient.get('/collections', { params });
  const springPage = response.data;
  return {
    data: springPage.content || springPage,
    total: springPage.totalElements ?? (Array.isArray(springPage) ? springPage.length : 0),
    page,
    limit,
    totalPages: springPage.totalPages ?? 1,
  };
};

export const getDonationById = async (id) => {
  const response = await apiClient.get(`/collections/${id}`);
  return response.data;
};

export const addDonation = async (donation) => {
  const response = await apiClient.post('/collections', donation);
  return response.data;
};

export const updateDonation = async (id, donation) => {
  const response = await apiClient.put(`/collections/${id}`, donation);
  return response.data;
};

export const deleteDonation = async (id) => {
  await apiClient.delete(`/collections/${id}`);
  return { id, deleted: true };
};

export const getDonationsByMember = async (memberId) => {
  const response = await apiClient.get(`/collections/member/${memberId}`);
  return response.data;
};

export const getDonationsByDateRange = async (startDate, endDate) => {
  const response = await apiClient.get('/collections/search', {
    params: { startDate, endDate, page: 0, size: 10000 },
  });
  const springPage = response.data;
  return springPage.content || springPage;
};

export const getDonationsByColony = async (colony) => {
  const response = await apiClient.get('/collections/search', {
    params: { colony },
  });
  const springPage = response.data;
  return springPage.content || springPage;
};

export const getDonationsByPaymentMode = async (mode) => {
  const response = await apiClient.get('/collections/search', {
    params: { paymentMode: mode },
  });
  const springPage = response.data;
  return springPage.content || springPage;
};

export const getAllDonations = async () => {
  const response = await apiClient.get('/collections');
  return response.data;
};

const donationService = {
  getDonations, getDonationById, addDonation, updateDonation,
  deleteDonation, getDonationsByMember, getDonationsByDateRange,
  getDonationsByColony, getDonationsByPaymentMode, getAllDonations,
};

export default donationService;

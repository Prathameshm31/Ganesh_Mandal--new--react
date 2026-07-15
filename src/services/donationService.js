import api from './api';

const toFrontendDonation = (d) => ({
  id: String(d.id),
  memberId: d.memberId != null ? String(d.memberId) : '',
  memberName: d.memberName || '',
  amount: typeof d.amount === 'number' ? d.amount : Number(d.amount || 0),
  paymentMode: d.paymentMode ? d.paymentMode.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Cash',
  donationDate: d.collectionDate || d.donationDate || '',
  receiptNumber: d.receiptNumber || '',
  collectorName: d.collectorName || '',
  remarks: d.remarks || '',
  colony: d.colony || '',
});

const toBackendDonation = (d) => ({
  memberId: d.memberId && !isNaN(Number(d.memberId)) ? Number(d.memberId) : null,
  amount: Number(d.amount),
  paymentMode: d.paymentMode,
  transactionId: d.transactionId || '',
  collectionDate: d.donationDate || d.collectionDate,
  receiptNumber: d.receiptNumber || '',
  collectorName: d.collectorName || '',
  remarks: d.remarks || '',
  colony: d.colony || '',
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

export const getDonations = async ({ page = 1, limit = 10, sortBy = 'donationDate', sortOrder = 'desc' } = {}) => {
  try {
    const response = await api.get('/collections');
    const donations = (response.data || []).map(toFrontendDonation);
    const sorted = [...donations].sort((a, b) => {
      const aVal = a[sortBy] ?? '';
      const bVal = b[sortBy] ?? '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return paginate(sorted, page, limit);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch donations';
    throw new Error(message);
  }
};

export const getDonationById = async (id) => {
  try {
    const response = await api.get(`/collections/${id}`);
    return toFrontendDonation(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to fetch donation ${id}`;
    throw new Error(message);
  }
};

export const addDonation = async (donation) => {
  try {
    const response = await api.post('/collections', toBackendDonation(donation));
    return toFrontendDonation(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to add donation';
    throw new Error(message);
  }
};

export const updateDonation = async (id, donation) => {
  try {
    const response = await api.put(`/collections/${id}`, toBackendDonation(donation));
    return toFrontendDonation(response.data);
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to update donation ${id}`;
    throw new Error(message);
  }
};

export const deleteDonation = async (id) => {
  try {
    const response = await api.delete(`/collections/${id}`);
    return response.data || { id, deleted: true };
  } catch (error) {
    const message = error.response?.data?.message || error.message || `Failed to delete donation ${id}`;
    throw new Error(message);
  }
};

export const getDonationsByMember = async (memberId) => {
  try {
    const response = await api.get(`/collections/member/${memberId}`);
    return (response.data || []).map(toFrontendDonation);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch donations by member';
    throw new Error(message);
  }
};

export const getDonationsByDateRange = async (startDate, endDate) => {
  try {
    const all = await getAllDonations();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return all.filter((d) => {
      const date = new Date(d.donationDate);
      return date >= start && date <= end;
    });
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch donations by date range';
    throw new Error(message);
  }
};

export const getDonationsByColony = async (colony) => {
  try {
    const all = await getAllDonations();
    return all.filter((d) => d.colony === colony);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch donations by colony';
    throw new Error(message);
  }
};

export const getDonationsByPaymentMode = async (mode) => {
  try {
    const all = await getAllDonations();
    return all.filter((d) => d.paymentMode === mode);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch donations by payment mode';
    throw new Error(message);
  }
};

export const getAllDonations = async () => {
  try {
    const response = await api.get('/collections');
    return (response.data || []).map(toFrontendDonation);
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch all donations';
    throw new Error(message);
  }
};

const donationService = {
  getDonations,
  getDonationById,
  addDonation,
  updateDonation,
  deleteDonation,
  getDonationsByMember,
  getDonationsByDateRange,
  getDonationsByColony,
  getDonationsByPaymentMode,
  getAllDonations,
};

export default donationService;

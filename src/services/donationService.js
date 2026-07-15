import donationsData from '../mock-data/donations';

let donations = [...donationsData];

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
  const sorted = [...donations].sort((a, b) => {
    const aVal = a[sortBy] ?? '';
    const bVal = b[sortBy] ?? '';
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  return paginate(sorted, page, limit);
};

export const getDonationById = async (id) =>
  donations.find((d) => String(d.id) === String(id)) || null;

export const addDonation = async (donation) => {
  const newDonation = { ...donation };
  donations.push(newDonation);
  return newDonation;
};

export const updateDonation = async (id, donation) => {
  const idx = donations.findIndex((d) => String(d.id) === String(id));
  if (idx === -1) throw new Error('Donation not found');
  donations[idx] = { ...donations[idx], ...donation };
  return donations[idx];
};

export const deleteDonation = async (id) => {
  donations = donations.filter((d) => String(d.id) !== String(id));
  return { id, deleted: true };
};

export const getDonationsByMember = async (memberId) =>
  donations.filter((d) => String(d.memberId) === String(memberId));

export const getDonationsByDateRange = async (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return donations.filter((d) => {
    const date = new Date(d.donationDate);
    return date >= start && date <= end;
  });
};

export const getDonationsByColony = async (colony) =>
  donations.filter((d) => d.colony === colony);

export const getDonationsByPaymentMode = async (mode) =>
  donations.filter((d) => d.paymentMode === mode);

export const getAllDonations = async () => donations;

const donationService = {
  getDonations, getDonationById, addDonation, updateDonation,
  deleteDonation, getDonationsByMember, getDonationsByDateRange,
  getDonationsByColony, getDonationsByPaymentMode, getAllDonations,
};

export default donationService;

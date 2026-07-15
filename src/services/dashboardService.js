import api from './api';

const toNumber = (v) => (v != null ? Number(v) : 0);

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

const toFrontendDonation = (d) => ({
  id: String(d.id),
  memberId: d.memberId != null ? String(d.memberId) : '',
  memberName: d.memberName || '',
  amount: toNumber(d.amount),
  paymentMode: d.paymentMode ? d.paymentMode.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Cash',
  donationDate: d.collectionDate || d.donationDate || '',
  receiptNumber: d.receiptNumber || '',
  collectorName: d.collectorName || '',
  remarks: d.remarks || '',
  colony: d.colony || '',
});

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    const data = response.data || {};
    return {
      totalMembers: toNumber(data.totalMembers),
      activeMembers: toNumber(data.activeMembers),
      totalDonations: toNumber(data.totalCollection),
      totalDonationCount: toNumber(data.totalDonationCount),
      avgDonation: toNumber(data.avgDonation),
      totalColonies: toNumber(data.totalColonies),
      totalActivities: toNumber(data.totalActivities),
      upcomingActivities: toNumber(data.upcomingActivities),
      todayCollection: toNumber(data.todayCollection),
      onlineCollection: toNumber(data.onlineCollection),
      cashCollection: toNumber(data.cashCollection),
      thisYearCollection: toNumber(data.thisYearCollection),
      pendingMembers: toNumber(data.pendingMembers),
      collectionGoal: toNumber(data.collectionGoal),
      currentYearMurti: data.currentYearMurti || null,
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
    throw new Error(message);
  }
};

export const getMonthlyCollection = async () => {
  try {
    const response = await api.get('/dashboard/monthly-collection');
    return (response.data || []).map((item) => ({
      month: item.month,
      amount: toNumber(item.amount),
    }));
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch monthly collection';
    throw new Error(message);
  }
};

export const getColonyWiseCollection = async () => {
  try {
    const response = await api.get('/dashboard/colony-wise');
    return (response.data || []).map((item) => ({
      colonyName: item.colonyName,
      amount: toNumber(item.amount),
    }));
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch colony-wise collection';
    throw new Error(message);
  }
};

export const getPaymentModeBreakdown = async () => {
  try {
    const response = await api.get('/dashboard/payment-mode-breakdown');
    return (response.data || []).map((item) => ({
      mode: item.mode,
      amount: toNumber(item.amount),
      percentage: toNumber(item.percentage),
    }));
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch payment mode breakdown';
    throw new Error(message);
  }
};

export const getYearlyTrend = async () => {
  try {
    const response = await api.get('/dashboard/yearly-trend');
    return (response.data || []).map((item) => ({
      year: toNumber(item.year),
      amount: toNumber(item.amount),
    }));
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch yearly trend';
    throw new Error(message);
  }
};

export const getTopDonors = async (limit = 5) => {
  try {
    const response = await api.get('/dashboard/top-donors', { params: { limit } });
    return (response.data || []).map((item) => ({
      memberId: item.memberId != null ? String(item.memberId) : '',
      memberName: item.memberName || 'Unknown',
      totalAmount: toNumber(item.totalAmount),
    }));
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch top donors';
    throw new Error(message);
  }
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get('/dashboard/recent-activity');
    const data = response.data || {};
    return {
      recentDonations: (data.recentDonations || []).map((d) => ({
        type: 'donation',
        ...toFrontendDonation(d),
      })),
      recentMembers: (data.recentMembers || []).map((m) => ({
        type: 'member',
        ...toFrontendMember(m),
      })),
      upcomingActivities: (data.upcomingActivities || []).map((a) => ({
        type: 'activity',
        ...a,
        budget: toNumber(a.budget),
      })),
    };
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch recent activity';
    throw new Error(message);
  }
};

const dashboardService = {
  getDashboardStats,
  getMonthlyCollection,
  getColonyWiseCollection,
  getPaymentModeBreakdown,
  getYearlyTrend,
  getTopDonors,
  getRecentActivity,
};

export default dashboardService;

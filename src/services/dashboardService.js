import apiClient from '../api/apiClient';

export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const getMonthlyCollection = async () => {
  const response = await apiClient.get('/dashboard/monthly-collection');
  return response.data;
};

export const getColonyWiseCollection = async () => {
  const response = await apiClient.get('/dashboard/colony-wise');
  return response.data;
};

export const getPaymentModeBreakdown = async () => {
  const response = await apiClient.get('/dashboard/payment-mode-breakdown');
  return response.data;
};

export const getYearlyTrend = async () => {
  const response = await apiClient.get('/dashboard/yearly-trend');
  return response.data;
};

export const getTopDonors = async (limit = 5) => {
  const response = await apiClient.get('/dashboard/top-donors', { params: { limit } });
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await apiClient.get('/dashboard/recent-activity');
  return response.data;
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

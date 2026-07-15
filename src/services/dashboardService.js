import {
  getDashboardStats as _getDashboardStats,
  getMonthlyCollection as _getMonthlyCollection,
  getColonyWiseCollection as _getColonyWiseCollection,
  getPaymentModeBreakdown as _getPaymentModeBreakdown,
  getYearlyTrend as _getYearlyTrend,
  getTopDonors as _getTopDonors,
  getRecentActivity as _getRecentActivity,
} from '../mock-data/dashboard';

export const getDashboardStats = async () => _getDashboardStats();
export const getMonthlyCollection = async () => _getMonthlyCollection();
export const getColonyWiseCollection = async () => _getColonyWiseCollection();
export const getPaymentModeBreakdown = async () => _getPaymentModeBreakdown();
export const getYearlyTrend = async () => _getYearlyTrend();
export const getTopDonors = async (limit = 5) => _getTopDonors(limit);
export const getRecentActivity = async () => _getRecentActivity();

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

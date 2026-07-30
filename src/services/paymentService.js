import apiClient from '../api/apiClient';

export const createPaymentOrder = async (data) => {
  const response = await apiClient.post('/payments/create-order', data);
  return response.data;
};

export const verifyPayment = async (data) => {
  const response = await apiClient.post('/payments/verify', data);
  return response.data;
};

export const verifyWithGateway = async (id) => {
  const response = await apiClient.post(`/payments/${id}/verify-with-gateway`);
  return response.data;
};

export const getPaymentDashboard = async () => {
  const response = await apiClient.get('/payments/dashboard');
  return response.data;
};

export const searchPayments = async ({
  status, startDate, endDate, donationType, paymentGateway,
  donorName, mobile, email, search,
  page = 0, size = 10, sortBy = 'createdAt', sortOrder = 'DESC'
} = {}) => {
  const params = { page, size, sortBy, sortOrder };
  if (status) params.status = status;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  if (donationType) params.donationType = donationType;
  if (paymentGateway) params.paymentGateway = paymentGateway;
  if (donorName) params.donorName = donorName;
  if (mobile) params.mobile = mobile;
  if (email) params.email = email;
  if (search) params.search = search;
  const response = await apiClient.get('/payments', { params });
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await apiClient.get(`/payments/${id}`);
  return response.data;
};

export const getPaymentAuditLogs = async (id) => {
  const response = await apiClient.get(`/payments/${id}/audit-logs`);
  return response.data;
};

export const getGatewayConfig = async () => {
  const response = await apiClient.get('/payments/gateway-config');
  return response.data;
};

export const getReportByGateway = async () => {
  const response = await apiClient.get('/payments/reports/by-gateway');
  return response.data;
};

const paymentService = {
  createPaymentOrder, verifyPayment, verifyWithGateway,
  getPaymentDashboard, searchPayments, getPaymentById,
  getPaymentAuditLogs, getGatewayConfig, getReportByGateway,
};

export default paymentService;

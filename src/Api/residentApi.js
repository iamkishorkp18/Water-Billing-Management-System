import api from './apiClient';

export const getMyUsageHistory = (householdId) => api.get(`/usage-logs/household/${householdId}`);
export const getMyBills = (householdId) => api.get(`/bills/household/${householdId}`);
export const getMyAlerts = (householdId) => api.get(`/alerts/household/${householdId}`);
export const downloadInvoice = (billId) => api.get(`/bills/${billId}/invoice`, { responseType: 'blob' });
export const getMyPayments = (householdId) => api.get(`/bills/payments/household/${householdId}`);
export const createPaymentOrder = (billId) => api.post(`/payments/create-order/${billId}`);
export const verifyPayment = (data) => api.post('/payments/verify', data);

export const downloadCurrentBill = (billId) =>
  api.get(`/bills/${billId}/invoice`, { responseType: 'blob' });

export const downloadPaidBill = (billId) =>
  api.get(`/bills/${billId}/paid-invoice`, { responseType: 'blob' });

export const downloadAllCurrentBills = (householdId, year, month) =>
  api.get(`/bills/household/${householdId}/current-pdf`, {
    params: { year, month },
    responseType: 'blob'
  });

export const downloadAllPaidBills = (householdId, year, month) =>
  api.get(`/bills/household/${householdId}/history-pdf`, {
    params: { year, month },
    responseType: 'blob'
  });
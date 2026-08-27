import api from './apiClient';

// RESIDENT DATA
export const getMyUsageHistory = id =>
  api.get(`/usage-logs/household/${id}`);

export const getMyBills = id =>
  api.get(`/bills/household/${id}`);

export const getMyAlerts = id =>
  api.get(`/alerts/household/${id}`);

export const getMyNotifications = id =>
  api.get(`/notifications/household/${id}`);

export const getMyComplaints = id =>
  api.get(`/complaints/household/${id}`);

export const getMyPayments = id =>
  api.get(`/bills/payments/household/${id}`);

// PAYMENTS
export const createPaymentOrder = id =>
  api.post(`/payments/create-order/${id}`);

export const verifyPayment = data =>
  api.post('/payments/verify', data);

// BILL DOWNLOAD
export const downloadInvoice = id =>
  api.get(`/bills/${id}/invoice`, {
    responseType: 'blob'
  });

export const downloadCurrentBill = id =>
  api.get(`/bills/${id}/invoice`, {
    responseType: 'blob'
  });

export const downloadPaidBill = id =>
  api.get(`/bills/${id}/paid-invoice`, {
    responseType: 'blob'
  });

export const downloadAllCurrentBills = (id, year, month) =>
  api.get(`/bills/household/${id}/current-pdf`, {
    params: { year, month },
    responseType: 'blob'
  });

export const downloadAllPaidBills = (id, year, month) =>
  api.get(`/bills/household/${id}/history-pdf`, {
    params: { year, month },
    responseType: 'blob'
  });

// PROFILE
export const getMyProfile = () =>
  api.get('/profiles/me');

export const updateMyProfile = data =>
  api.put('/profiles/me', data);

export const uploadProfilePhoto = file => {
  const formData = new FormData();
  formData.append('photo', file);

  return api.post('/profiles/me/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getProfilePhotoUrl = () =>
  `${api.defaults.baseURL}/profiles/me/photo`;
import api from './apiClient';

// =========================================================
// RESIDENT DATA
// =========================================================

export const getMyUsageHistory = householdId =>
  api.get(`/usage-logs/household/${householdId}`);

export const getMyBills = householdId =>
  api.get(`/bills/household/${householdId}`);

export const getMyAlerts = householdId =>
  api.get(`/alerts/household/${householdId}`);

export const getMyNotifications = householdId =>
  api.get(`/notifications/household/${householdId}`);

export const getMyComplaints = householdId =>
  api.get(`/complaints/household/${householdId}`);

export const getMyPayments = householdId =>
  api.get(`/bills/payments/household/${householdId}`);

// =========================================================
// PAYMENTS
// =========================================================

export const createPaymentOrder = billId =>
  api.post(`/payments/create-order/${billId}`);

export const verifyPayment = data =>
  api.post('/payments/verify', data);

// =========================================================
// BILL DOWNLOAD
// =========================================================

export const downloadInvoice = billId =>
  api.get(`/bills/${billId}/invoice`, {
    responseType: 'blob'
  });

export const downloadCurrentBill = billId =>
  api.get(`/bills/${billId}/invoice`, {
    responseType: 'blob'
  });

export const downloadPaidBill = billId =>
  api.get(`/bills/${billId}/paid-invoice`, {
    responseType: 'blob'
  });

export const downloadAllCurrentBills = (
  householdId,
  year,
  month
) =>
  api.get(
    `/bills/household/${householdId}/current-pdf`,
    {
      params: {
        year,
        month
      },
      responseType: 'blob'
    }
  );

export const downloadAllPaidBills = (
  householdId,
  year,
  month
) =>
  api.get(
    `/bills/household/${householdId}/history-pdf`,
    {
      params: {
        year,
        month
      },
      responseType: 'blob'
    }
  );

// =========================================================
// PROFILE
// =========================================================

export const getMyProfile = () =>
  api.get('/users/profile/me');

export const updateMyProfile = data =>
  api.put(
    '/users/profile/update',
    data
  );

export const uploadProfilePhoto = file => {

  const formData = new FormData();

  formData.append(
    'photo',
    file
  );

  return api.post(
    '/users/profile/photo',
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data'
      }
    }
  );
};

export const getProfilePhotoUrl = () =>
  `${api.defaults.baseURL}/users/profile/photo`;


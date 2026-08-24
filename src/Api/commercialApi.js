import api from './apiClient';


// ================= APARTMENTS =================

export const getMyApartments = () =>
  api.get('/apartments/my');


// ================= HOUSEHOLDS =================

export const getHouseholdsByApartment = (apartmentId) =>
  api.get(`/households/apartment/${apartmentId}`);

export const createHousehold = (data) =>
  api.post('/households', data);

export const deleteHousehold = (id) =>
  api.delete(`/households/${id}`);


// ================= RESIDENTS =================

export const createResident = (data) =>
  api.post('/users', data);

export const getResidentsForApartment = (apartmentId) =>
  api.get(`/users/residents/apartment/${apartmentId}`);

export const deleteResident = (id) =>
  api.delete(`/users/residents/${id}`);


// ================= USAGE / METER READINGS =================

export const logMeterReading = (data) =>
  api.post('/usage-logs', data);

export const getUsageForHousehold = (householdId) =>
  api.get(`/usage-logs/household/${householdId}`);


// ================= BILLS =================

export const generateBill = (householdId, billingMonth) =>
  api.post(
    `/bills/generate?householdId=${householdId}&billingMonth=${billingMonth}`
  );

export const getBillsForApartment = (apartmentId) =>
  api.get(`/bills/apartment/${apartmentId}`);

export const getBillsForHousehold = (householdId) =>
  api.get(`/bills/household/${householdId}`);

export const markBillAsPaid = (billId) =>
  api.post(`/bills/${billId}/mark-paid`);

export const recordPayment = (data) =>
  api.post('/bills/record-payment', data);

export const getBillsByStatus = (apartmentId, status) =>
  api.get(`/bills/apartment/${apartmentId}/status/${status}`);

export const searchBillsByFlat = (apartmentId, flatNumber) =>
  api.get(
    `/bills/apartment/${apartmentId}/search?flatNumber=${flatNumber}`
  );

export const getPaymentsForApartment = (apartmentId) =>
  api.get(`/bills/payments/apartment/${apartmentId}`);

export const downloadPaidBill = (billId) =>
  api.get(`/bills/${billId}/download`, {
    responseType: 'blob'
  });

// ================= ALERTS =================

export const getAlertsForHousehold = (householdId) =>
  api.get(`/alerts/household/${householdId}`);

export const checkAlertsForHousehold = (householdId) =>
  api.post(`/alerts/check/${householdId}`);


// ================= COMPLAINTS =================

export const createComplaint = (data) =>
  api.post('/complaints', data);

export const getComplaintsForApartment = (apartmentId) =>
  api.get(`/complaints/apartment/${apartmentId}`);

export const updateComplaintStatus = (id, status) =>
  api.post(`/complaints/${id}/status?status=${status}`);


// ================= NOTIFICATIONS =================

export const createNotification = (data) =>
  api.post('/notifications', data);


// ================= BULK WATER PURCHASES =================

export const getBulkPurchasesForApartment = (apartmentId) =>
  api.get(`/bulk-purchases/apartment/${apartmentId}`);

export const createBulkPurchase = (data) =>
  api.post('/bulk-purchases', data);

export const updateBulkPurchase = (id, data) =>
  api.put(`/bulk-purchases/${id}`, data);

export const deleteBulkPurchase = (id) =>
  api.delete(`/bulk-purchases/${id}`);
export const uploadBulkPurchasesCsv = (apartmentId, file) => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('apartmentId', apartmentId);

  return api.post(
    '/bulk-purchases/upload-csv',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};
export const getLatestCostPerUnit = (apartmentId) =>
  api.get(`/bulk-purchases/apartment/${apartmentId}/cost-per-unit`);


// ================= COMMERCIAL ADMINS =================

export const getCommercialAdmins = () =>
  api.get('/users/commercial-admins');

export const deleteCommercialAdmin = (id) =>
  api.delete(`/users/commercial-admins/${id}`);

export const restoreCommercialAdmin = (id) =>
  api.post(`/users/commercial-admins/${id}/restore`);

export const deleteComplaint = id => {
  return api.delete(`/complaints/${id}`);
};


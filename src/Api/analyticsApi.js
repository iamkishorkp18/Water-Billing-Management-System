import api from './apiClient';

/* =========================================================
   APARTMENTS
========================================================= */

export const getApartments = () =>
  api.get('/apartments');

export const createApartment = (data) =>
  api.post('/apartments', data);

export const deleteApartment = (id) =>
  api.delete(`/apartments/${id}`);

export const restoreApartment = (id) =>
  api.post(`/apartments/${id}/restore`);

/* =========================================================
   USERS
========================================================= */

export const getPendingAdmins = () =>
  api.get('/users/pending-admins');

export const approveAdmin = (id) =>
  api.post(`/users/${id}/approve`);

export const rejectAdmin = (id) =>
  api.post(`/users/${id}/reject`);

export const getCommercialAdmins = () =>
  api.get('/users/commercial-admins');

export const getResidentsForApartment = (
  apartmentId
) =>
  api.get(
    `/users/residents/apartment/${apartmentId}`
  );

export const deleteCommercialAdmin = (id) =>
  api.delete(
    `/users/commercial-admins/${id}`
  );

export const deleteResident = (id) =>
  api.delete(`/users/residents/${id}`);

/* =========================================================
   HOUSEHOLDS
========================================================= */

export const getHouseholdsByApartment = (
  apartmentId
) =>
  api.get(
    `/households/apartment/${apartmentId}`
  );

export const getUsageForHousehold = (
  householdId
) =>
  api.get(
    `/usage-logs/household/${householdId}`
  );

export const deleteHousehold = (id) =>
  api.delete(`/households/${id}`);

/* =========================================================
   USAGE
========================================================= */

export const getUsageForApartment = (
  apartmentId
) =>
  api.get(
    `/usage-logs/apartment/${apartmentId}`
  );

/* =========================================================
   BILLS
========================================================= */

export const getBillsForApartment = (
  apartmentId
) =>
  api.get(
    `/bills/apartment/${apartmentId}`
  );

export const markBillAsPaid = (billId) =>
  api.post(
    `/bills/${billId}/mark-paid`
  );

export const deleteBill = (billId) =>
  api.delete(`/bills/${billId}`);

/* =========================================================
   PAYMENTS
========================================================= */

export const getPaymentsForApartment = (
  apartmentId
) =>
  api.get(
    `/bills/payments/apartment/${apartmentId}`
  );

/* =========================================================
   ALERTS
========================================================= */

export const getUnresolvedAlerts = () =>
  api.get('/alerts/unresolved');

/* =========================================================
   COMPLAINTS
========================================================= */

export const getAllComplaints = () =>
  api.get('/complaints/all');

/* =========================================================
   ADMIN ASSIGNMENTS
========================================================= */

export const getAssignmentsForUser = (
  userId
) =>
  api.get(
    `/admin-assignments/user/${userId}`
  );

export const getAssignments = () =>
  api.get('/admin-assignments');

export const createAssignment = (data) =>
  api.post('/admin-assignments', data);

export const deleteAssignment = (id) =>
  api.delete(
    `/admin-assignments/${id}`
  );

/* =========================================================
   TARIFF PLANS
========================================================= */

export const getTariffForApartment = (
  apartmentId
) =>
  api.get(
    `/tariff-plans/apartment/${apartmentId}`
  );

export const createTariffPlan = (data) =>
  api.post('/tariff-plans', data);

export const updateTariffPlan = (
  id,
  data
) =>
  api.put(
    `/tariff-plans/${id}`,
    data
  );

export const deleteTariffPlan = (id) =>
  api.delete(
    `/tariff-plans/${id}`
  );

/* =========================================================
   THRESHOLD
========================================================= */

export const updateThreshold = (
  apartmentId,
  multiplier
) =>
  api.put(
    `/apartments/${apartmentId}/threshold?multiplier=${multiplier}`
  );
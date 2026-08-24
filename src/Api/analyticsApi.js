import api from "./apiClient";

export const getApartments = () => api.get("/apartments");

export const getPendingAdmins = () => api.get("/users/pending-admins");

export const getHouseholdsByApartment = (apartmentId) =>
  api.get(`/households/apartment/${apartmentId}`);

export const getUsageForApartment = (apartmentId) =>
  api.get(`/usage-logs/apartment/${apartmentId}`);

export const getBillsForApartment = (apartmentId) =>
  api.get(`/bills/apartment/${apartmentId}`);

export const getUnresolvedAlerts = () => api.get("/alerts/unresolved");

export const createApartment = (data) => api.post("/apartments", data);

export const approveAdmin = (id) => api.post(`/users/${id}/approve`);

export const rejectAdmin = (id) => api.post(`/users/${id}/reject`);

export const getCommercialAdmins = () => api.get("/users/commercial-admins");


export const getAssignmentsForUser = (userId) =>
  api.get(`/admin-assignments/user/${userId}`);

export const getResidentsForApartment = (apartmentId) =>
  api.get(`/users/residents/apartment/${apartmentId}`);

export const getUsageForHousehold = (householdId) =>
  api.get(`/usage-logs/household/${householdId}`);



export const createAssignment = (data) => api.post('/admin-assignments', data);

export const getAssignments = () => api.get("/admin-assignments");


export const deleteAssignment = (id) => api.delete(`/admin-assignments/${id}`);


export const markBillAsPaid = (billId) => api.post(`/bills/${billId}/mark-paid`);

export const getPaymentsForApartment = (apartmentId) => api.get(`/bills/payments/apartment/${apartmentId}`);
export const getAllComplaints = () => api.get('/complaints/all');

export const getTariffForApartment = (apartmentId) => api.get(`/tariff-plans/apartment/${apartmentId}`);
export const createTariffPlan = (data) => api.post('/tariff-plans', data);
export const updateTariffPlan = (id, data) => api.put(`/tariff-plans/${id}`, data);
export const deleteTariffPlan = (id) => api.delete(`/tariff-plans/${id}`);
export const updateThreshold = (apartmentId, multiplier) => api.put(`/apartments/${apartmentId}/threshold?multiplier=${multiplier}`);

export const deleteApartment = (id) => api.delete(`/apartments/${id}`);
export const restoreApartment = (id) => api.post(`/apartments/${id}/restore`);
export const deleteCommercialAdmin = (id) => api.delete(`/users/commercial-admins/${id}`);
export const deleteResident = (id) => api.delete(`/users/residents/${id}`);
export const deleteHousehold = (id) => api.delete(`/households/${id}`);

export const deleteBill = (billId) =>
  api.delete(`/bills/${billId}`);
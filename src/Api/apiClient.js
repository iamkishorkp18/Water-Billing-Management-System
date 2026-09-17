import axios from 'axios';

const api = axios.create({
  baseURL: 'https://water-billing-system-backend.onrender.com',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const loginUser = data => api.post('/auth/login', data);
export const registerUser = data => api.post('/users', data);

// TRASH
export const getDeletedApartments = () => api.get('/trash/apartments');
export const getDeletedCommercialAdmins = () => api.get('/trash/commercial-admins');
export const getDeletedResidents = () => api.get('/trash/residents');
export const getDeletedHouseholds = () => api.get('/trash/households');
export const getDeletedBills = () => api.get('/trash/bills');

// RESTORE
export const restoreApartment = id => api.post(`/apartments/${id}/restore`);
export const restoreCommercialAdmin = id =>
  api.post(`/users/commercial-admins/${id}/restore`);
export const restoreResident = id =>
  api.post(`/users/residents/${id}/restore`);
export const restoreHousehold = id =>
  api.post(`/households/${id}/restore`);
export const restoreBill = id =>
  api.post(`/bills/${id}/restore`);

// USERS / ADMINS
export const getCommercialAdmins = () =>
  api.get('/users/commercial-admins');

export const deleteCommercialAdmin = id =>
  api.delete(`/users/commercial-admins/${id}`);

// ASSIGNMENTS
export const getAssignmentsForUser = userId =>
  api.get(`/assignments/user/${userId}`);

export const createAssignment = data =>
  api.post('/assignments', data);

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });

export default api;

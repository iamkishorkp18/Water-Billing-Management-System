import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/users', data);

export default api;

// ===============================
// TRASH
// ===============================

export const getDeletedApartments = () =>
  api.get('/trash/apartments');

export const getDeletedCommercialAdmins = () =>
  api.get('/trash/commercial-admins');

export const getDeletedResidents = () =>
  api.get('/trash/residents');

export const getDeletedHouseholds = () =>
  api.get('/trash/households');

export const getDeletedBills = () =>
  api.get('/trash/bills');

// ===============================
// RESTORE
// ===============================

export const restoreApartment = (id) =>
  api.post(`/apartments/${id}/restore`);

export const restoreCommercialAdmin = (id) =>
  api.post(`/users/commercial-admins/${id}/restore`);

export const restoreResident = (id) =>
  api.post(`/users/residents/${id}/restore`);

export const restoreHousehold = (id) =>
  api.post(`/households/${id}/restore`);

export const restoreBill = (id) =>
  api.post(`/bills/${id}/restore`);

export const getCommercialAdmins = () =>
  api.get('/users/commercial-admins');

export const getAssignmentsForUser = (userId) =>
  api.get(`/assignments/user/${userId}`);

export const createAssignment = (data) =>
  api.post('/assignments', data);

export const deleteCommercialAdmin = (id) =>
  api.delete(`/users/commercial-admins/${id}`);
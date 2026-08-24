import api from './apiClient';

export const getPendingAdmins = () => api.get('/users/pending-admins');
export const approveAdmin = (id) => api.post(`/users/${id}/approve`);
export const rejectAdmin = (id) => api.post(`/users/${id}/reject`);
export const getApartments = () => api.get('/apartments');
export const createApartment = (data) => api.post('/apartments', data);
import api from './apiClient';

export const getMyProfile = () =>
  api.get('/profiles/me');

export const updateMyProfile = data =>
  api.put('/profiles/me', data);

export const uploadProfilePhoto = file => {
  const formData = new FormData();
  formData.append('photo', file);

  return api.post(
    '/profiles/me/photo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );
};

export const getProfilePhotoUrl = () =>
  `${api.defaults.baseURL}/profiles/me/photo`;
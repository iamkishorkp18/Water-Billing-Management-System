import api from './apiClient';

/* =========================================================
   GET MY PROFILE
========================================================= */

export const getMyProfile = () => {
  return api.get('/profiles/me');
};

/* =========================================================
   UPDATE MY PROFILE
========================================================= */

export const updateMyProfile = (data) => {
  return api.put('/profiles/me', data);
};

/* =========================================================
   UPLOAD PROFILE PHOTO
========================================================= */

export const uploadProfilePhoto = (file) => {
  const formData = new FormData();

  formData.append('photo', file);

  return api.post(
    '/profiles/me/photo',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

/* =========================================================
   GET PROFILE PHOTO
========================================================= */

export const getProfilePhoto = () => {
  return api.get(
    '/profiles/me/photo',
    {
      responseType: 'blob',
    }
  );
};

/* =========================================================
   PROFILE PHOTO URL
========================================================= */

export const getProfilePhotoUrl = () => {
  return `${api.defaults.baseURL}/profiles/me/photo`;
};
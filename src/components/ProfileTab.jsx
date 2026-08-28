import { useEffect, useState } from 'react';

import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getProfilePhoto,
} from '../Api/profileApi';

export default function ProfileTab({
  roleLabel = 'User',
  onPhotoUpdated,
}) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
    loadPhoto();

    return () => {
      setPhotoUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return null;
      });
    };
  }, []);

  // =========================================================
  // LOAD PROFILE DETAILS
  // =========================================================

  const loadProfile = async () => {
    try {
      const response = await getMyProfile();

      setProfile(response.data);
    } catch (error) {
      console.error('Profile load failed:', error);
    }
  };

  // =========================================================
  // LOAD PROFILE PHOTO
  // =========================================================

  const loadPhoto = async () => {
    try {
      const response = await getProfilePhoto();

      if (!response?.data) {
        return;
      }

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]);

      if (blob.size === 0) {
        return;
      }

      const url = URL.createObjectURL(blob);

      setPhotoUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return url;
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Photo load failed:', error);
      }
    }
  };

  // =========================================================
  // CHANGE FIELD
  // =========================================================

  const changeField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const saveProfile = async () => {
    if (!profile) {
      return;
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // SAVE PROFILE DETAILS
      // -----------------------------------------------------

      const response = await updateMyProfile({
        fullName: profile.fullName || '',
        age: profile.age ?? null,
        phoneNumber: profile.phoneNumber || '',
        occupancyType: profile.occupancyType || '',
        familyMembers: profile.familyMembers ?? null,
      });

      setProfile(response.data);

      // -----------------------------------------------------
      // SAVE PHOTO
      // -----------------------------------------------------

      if (photo) {
        await uploadProfilePhoto(photo);

        setPhoto(null);

        // Reload photo in ProfileTab
        await loadPhoto();

        // Tell parent dashboard to reload header photo
        if (onPhotoUpdated) {
          await onPhotoUpdated();
        }
      }

      // -----------------------------------------------------
      // RELOAD PROFILE
      // -----------------------------------------------------

      await loadProfile();

      setEditing(false);

      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Profile update failed:', error);

      alert(
        error.response?.data?.message ||
          'Failed to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = async () => {
    setEditing(false);
    setPhoto(null);

    await loadProfile();
    await loadPhoto();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!profile) {
    return (
      <div className="dash-section">
        <p className="empty-state">
          Loading profile...
        </p>
      </div>
    );
  }

  // =========================================================
  // VALUES
  // =========================================================

  const email =
    profile.email ||
    profile.user?.email ||
    localStorage.getItem('email') ||
    '—';

  const role =
    profile.role ||
    profile.user?.role ||
    roleLabel.toUpperCase();

  // Default first letter
  const initial =
    profile.fullName?.charAt(0)?.toUpperCase() ||
    roleLabel?.charAt(0)?.toUpperCase() ||
    'U';

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dash-section">

      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <div className="profile-header">

        <div className="profile-avatar-lg">

          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          ) : (
            initial
          )}

        </div>

        <div>
          <h2>
            {profile.fullName || roleLabel}
          </h2>

          <p>
            {roleLabel} Account
          </p>
        </div>

      </div>

      {/* =====================================================
          PHOTO UPLOAD
      ===================================================== */}

      {editing && (
        <div className="profile-photo-upload">

          <label>
            Change profile photo
          </label>

          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(event) => {
              const selectedFile =
                event.target.files?.[0] || null;

              setPhoto(selectedFile);
            }}
          />

          {photo && (
            <small>
              Selected: {photo.name}
            </small>
          )}

        </div>
      )}

      {/* =====================================================
          PROFILE INFORMATION
      ===================================================== */}

      <div className="resident-info-grid">

        {/* FULL NAME */}

        <div className="resident-info-item">

          <span className="lbl">
            Full Name
          </span>

          {editing ? (
            <input
              type="text"
              value={profile.fullName || ''}
              onChange={(event) =>
                changeField(
                  'fullName',
                  event.target.value
                )
              }
            />
          ) : (
            <span className="val">
              {profile.fullName || '—'}
            </span>
          )}

        </div>

        {/* EMAIL */}

        <div className="resident-info-item">

          <span className="lbl">
            Email
          </span>

          <span className="val">
            {email}
          </span>

        </div>

        {/* AGE */}

        <div className="resident-info-item">

          <span className="lbl">
            Age
          </span>

          {editing ? (
            <input
              type="number"
              min="1"
              max="120"
              value={profile.age ?? ''}
              onChange={(event) =>
                changeField(
                  'age',
                  event.target.value
                    ? Number(event.target.value)
                    : null
                )
              }
            />
          ) : (
            <span className="val">
              {profile.age ?? '—'}
            </span>
          )}

        </div>

        {/* PHONE */}

        <div className="resident-info-item">

          <span className="lbl">
            Phone Number
          </span>

          {editing ? (
            <input
              type="tel"
              value={profile.phoneNumber || ''}
              onChange={(event) =>
                changeField(
                  'phoneNumber',
                  event.target.value
                )
              }
            />
          ) : (
            <span className="val">
              {profile.phoneNumber || 'Not set'}
            </span>
          )}

        </div>

        {/* OCCUPANCY */}

        <div className="resident-info-item">

          <span className="lbl">
            Occupancy Type
          </span>

          {editing ? (
            <select
              value={profile.occupancyType || ''}
              onChange={(event) =>
                changeField(
                  'occupancyType',
                  event.target.value
                )
              }
            >
              <option value="">
                Select
              </option>

              <option value="Family">
                Family
              </option>

              <option value="Single">
                Single
              </option>

              <option value="Shared">
                Shared
              </option>

              <option value="Owner">
                Owner
              </option>

              <option value="Tenant">
                Tenant
              </option>
            </select>
          ) : (
            <span className="val">
              {profile.occupancyType || '—'}
            </span>
          )}

        </div>

        {/* FAMILY MEMBERS */}

        <div className="resident-info-item">

          <span className="lbl">
            Family Members
          </span>

          {editing ? (
            <input
              type="number"
              min="1"
              value={profile.familyMembers ?? ''}
              onChange={(event) =>
                changeField(
                  'familyMembers',
                  event.target.value
                    ? Number(event.target.value)
                    : null
                )
              }
            />
          ) : (
            <span className="val">
              {profile.familyMembers ?? '—'}
            </span>
          )}

        </div>

        {/* ACCOUNT TYPE */}

        <div className="resident-info-item">

          <span className="lbl">
            Account Type
          </span>

          <span className="val">
            {role}
          </span>

        </div>

      </div>

      {/* =====================================================
          BUTTONS
      ===================================================== */}

      <div className="profile-actions">

        {!editing ? (

          <button
            type="button"
            className="btn btn-fill"
            onClick={() => setEditing(true)}
          >
            ✏️ Edit Profile
          </button>

        ) : (

          <>
            <button
              type="button"
              className="btn btn-fill"
              disabled={saving}
              onClick={saveProfile}
            >
              {saving
                ? 'Saving...'
                : '💾 Save Changes'}
            </button>

            <button
              type="button"
              className="btn"
              disabled={saving}
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </>

        )}

      </div>

    </div>
  );
}
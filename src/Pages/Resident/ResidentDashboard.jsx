function ProfileTab() {

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const change = (field, value) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      const res = await updateMyProfile({
        fullName: profile.fullName,
        age: profile.age,
        phoneNumber: profile.phoneNumber,
        occupancyType: profile.occupancyType,
        familyMembers: profile.familyMembers
      });

      setProfile(res.data);
      setEditing(false);

      if (photo) {
        await uploadProfilePhoto(photo);
        setPhoto(null);
      }

      await loadProfile();

    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="dash-section">
        Loading profile...
      </div>
    );
  }

  const photoUrl =
    profile.profilePhoto
      ? `${getProfilePhotoUrl()}?t=${Date.now()}`
      : null;

  return (
    <div className="dash-section">

      <div className="profile-header">

        <div className="profile-avatar-lg">

          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Profile"
            />
          ) : (
            profile.fullName
              ?.charAt(0)
              .toUpperCase() || 'R'
          )}

        </div>

        <div>
          <h2>{profile.fullName || 'Resident'}</h2>
          <p>Resident Account</p>
        </div>

      </div>

      {editing && (
        <div className="profile-photo-upload">

          <label>
            Change profile photo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={e =>
              setPhoto(e.target.files[0])
            }
          />

        </div>
      )}

      <div className="resident-info-grid">

        <div className="resident-info-item">
          <span className="lbl">Full Name</span>

          {editing ? (
            <input
              value={profile.fullName || ''}
              onChange={e =>
                change(
                  'fullName',
                  e.target.value
                )
              }
            />
          ) : (
            <span className="val">
              {profile.fullName || '—'}
            </span>
          )}
        </div>

        <div className="resident-info-item">
          <span className="lbl">Email</span>
          <span className="val">
            {profile.user?.email || '—'}
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Age</span>

          {editing ? (
            <input
              type="number"
              value={profile.age || ''}
              onChange={e =>
                change(
                  'age',
                  Number(e.target.value)
                )
              }
            />
          ) : (
            <span className="val">
              {profile.age || '—'}
            </span>
          )}
        </div>

        <div className="resident-info-item">
          <span className="lbl">Phone Number</span>

          {editing ? (
            <input
              value={profile.phoneNumber || ''}
              onChange={e =>
                change(
                  'phoneNumber',
                  e.target.value
                )
              }
            />
          ) : (
            <span className="val">
              {profile.phoneNumber || 'Not set'}
            </span>
          )}
        </div>

        <div className="resident-info-item">
          <span className="lbl">Occupancy Type</span>

          {editing ? (
            <select
              value={profile.occupancyType || ''}
              onChange={e =>
                change(
                  'occupancyType',
                  e.target.value
                )
              }
            >
              <option value="">Select</option>
              <option value="Family">Family</option>
              <option value="Single">Single</option>
              <option value="Shared">Shared</option>
            </select>
          ) : (
            <span className="val">
              {profile.occupancyType || '—'}
            </span>
          )}
        </div>

        <div className="resident-info-item">
          <span className="lbl">Family Members</span>

          {editing ? (
            <input
              type="number"
              min="1"
              value={profile.familyMembers || ''}
              onChange={e =>
                change(
                  'familyMembers',
                  Number(e.target.value)
                )
              }
            />
          ) : (
            <span className="val">
              {profile.familyMembers || '—'}
            </span>
          )}
        </div>

        <div className="resident-info-item">
          <span className="lbl">Account Type</span>
          <span className="val">
            {profile.user?.role || 'RESIDENT'}
          </span>
        </div>

      </div>

      <div className="profile-actions">

        {!editing ? (
          <button
            className="btn btn-fill"
            onClick={() =>
              setEditing(true)
            }
          >
            ✏️ Edit Profile
          </button>
        ) : (
          <>
            <button
              className="btn btn-fill"
              disabled={saving}
              onClick={saveProfile}
            >
              {saving
                ? 'Saving...'
                : '💾 Save Changes'}
            </button>

            <button
              className="btn"
              onClick={() =>
                setEditing(false)
              }
            >
              Cancel
            </button>
          </>
        )}

      </div>

    </div>
  );
}
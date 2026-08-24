
import { useState } from 'react';
import ConfirmModal from '../../../components/ConfirmModal';
import { deleteApartment } from '../../../Api/analyticsApi';


function SettingsTab({
  apartments,
  setApartments,
  pendingAdmins,
  handleApprove,
  handleReject,
  showAptForm,
  setShowAptForm,
  newApt,
  setNewApt,
  handleCreateApartment,
  formMsg
}) {

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteApartment = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteApartment(deleteTarget.id);

      setApartments((prev) =>
        prev.filter((a) => a.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete apartment."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>

      <div className="dash-section">
        <h2>Pending Commercial Admin Approvals</h2>

        {pendingAdmins.length === 0 ? (
          <p>No pending approvals right now.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingAdmins.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>PENDING</td>
                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() => handleApprove(u.id)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn-sm btn-reject"
                      onClick={() => handleReject(u.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Manage Apartments</h2>

          <button
            className="btn btn-fill"
            onClick={() => setShowAptForm(!showAptForm)}
          >
            {showAptForm ? "Cancel" : "+ New Apartment"}
          </button>
        </div>

        {showAptForm && (
          <form onSubmit={handleCreateApartment} className="inline-form">

            {formMsg && (
              <div className="banner banner-error">{formMsg}</div>
            )}

            <div className="form-row-3">

              <input
                placeholder="Apartment name"
                value={newApt.name}
                onChange={(e) =>
                  setNewApt({ ...newApt, name: e.target.value })
                }
                required
              />

              <input
                placeholder="Address"
                value={newApt.address}
                onChange={(e) =>
                  setNewApt({ ...newApt, address: e.target.value })
                }
                required
              />

              <input
                placeholder="Ward"
                value={newApt.ward}
                onChange={(e) =>
                  setNewApt({ ...newApt, ward: e.target.value })
                }
              />

            </div>

            <button
              type="submit"
              className="btn btn-fill"
            >
              Create
            </button>

          </form>
        )}

        {deleteError && (
          <div className="banner banner-error">
            {deleteError}
          </div>
        )}

        <table className="data-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Ward</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {apartments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.name}</td>
                <td>{a.address}</td>
                <td>{a.ward}</td>

                <td>
                  <button
                    className="btn-sm btn-reject"
                    onClick={() => setDeleteTarget(a)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Apartment"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteApartment}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

    </>
  );
}

export default SettingsTab;
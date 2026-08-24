import { useEffect, useState } from 'react';
import {
  getCommercialAdmins,
  getAssignmentsForUser,
  getResidentsForApartment,
  createAssignment
} from "../../../Api/analyticsApi";

import { deleteCommercialAdmin } from "../../../Api/analyticsApi";

export default function CommercialAdminsTab({ apartments }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [assignedApts, setAssignedApts] = useState({});
  const [residentsByApt, setResidentsByApt] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [assignFormFor, setAssignFormFor] = useState(null);
  const [selectedAptToAssign, setSelectedAptToAssign] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await getCommercialAdmins();
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDetailFor = async (adminId) => {
    setLoadingDetail(true);
    try {
      const assignRes = await getAssignmentsForUser(adminId);
      const apts = assignRes.data.map((a) => a.apartment);

      setAssignedApts((prev) => ({
        ...prev,
        [adminId]: apts
      }));

      const residentsMap = {};

      await Promise.all(
        apts.map(async (apt) => {
          const res = await getResidentsForApartment(apt.id);
          residentsMap[apt.id] = res.data;
        })
      );

      setResidentsByApt((prev) => ({
        ...prev,
        ...residentsMap
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExpand = async (adminId) => {
    if (expandedId === adminId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(adminId);
    await loadDetailFor(adminId);
  };

  const handleAssign = async (adminId) => {
    if (!selectedAptToAssign) {
      setAssignMsg('Please select an apartment.');
      return;
    }

    setAssignMsg('');

    try {
      await createAssignment({
        user: { id: adminId },
        apartment: { id: Number(selectedAptToAssign) }
      });

      setAssignFormFor(null);
      setSelectedAptToAssign('');
      await loadDetailFor(adminId);
    } catch (err) {
      setAssignMsg(
        err.response?.data?.message || 'Failed to assign apartment.'
      );
    }
  };

  const handleDeleteAdmin = async (adminId, email) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Commercial Admin "${email}"?`
    );

    if (!confirmed) return;

    try {
      await deleteCommercialAdmin(adminId);

      setAdmins((prev) =>
        prev.filter((admin) => admin.id !== adminId)
      );

      if (expandedId === adminId) {
        setExpandedId(null);
      }

      alert('Commercial Admin deleted successfully.');
    } catch (err) {
      console.error('Delete Commercial Admin error:', err);

      alert(
        err.response?.data?.message ||
        'Failed to delete Commercial Admin.'
      );
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <h2>Commercial Admins ({admins.length})</h2>
      </div>

      {admins.length === 0 ? (
        <p className="empty-state">
          No approved Commercial Admins yet.
        </p>
      ) : (
        admins.map((admin) => {
          const assigned = assignedApts[admin.id] || [];
          const assignedIds = assigned.map((a) => a.id);

          const availableToAssign = apartments.filter(
            (a) => !assignedIds.includes(a.id)
          );

          return (
            <div key={admin.id} className="expandable-card">
              <div
                className="expandable-header"
                onClick={() => handleExpand(admin.id)}
              >
                <div>
                  <strong>{admin.email}</strong>

                  <span
                    className="badge badge-success"
                    style={{ marginLeft: 10 }}
                  >
                    APPROVED
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <button
                    type="button"
                    className="btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAdmin(admin.id, admin.email);
                    }}
                  >
                    🗑 Delete
                  </button>

                  <span>
                    {expandedId === admin.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedId === admin.id && (
                <div className="expandable-body">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 14,
                        color: 'var(--primary)'
                      }}
                    >
                      Assigned Apartments
                    </h4>

                    <button
                      className="btn-sm btn-approve"
                      onClick={() => {
                        setAssignFormFor(
                          assignFormFor === admin.id
                            ? null
                            : admin.id
                        );
                        setAssignMsg('');
                      }}
                    >
                      {assignFormFor === admin.id
                        ? 'Cancel'
                        : '+ Assign Apartment'}
                    </button>
                  </div>

                  {assignFormFor === admin.id && (
                    <div
                      className="inline-form"
                      style={{ marginBottom: 16 }}
                    >
                      {assignMsg && (
                        <div className="banner banner-error">
                          {assignMsg}
                        </div>
                      )}

                      {availableToAssign.length === 0 ? (
                        <p className="empty-state">
                          All apartments are already assigned to this admin.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <select
                            style={{
                              flex: 1,
                              padding: '10px 14px',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: 10
                            }}
                            value={selectedAptToAssign}
                            onChange={(e) =>
                              setSelectedAptToAssign(e.target.value)
                            }
                          >
                            <option value="">
                              Select an apartment
                            </option>

                            {availableToAssign.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>

                          <button
                            className="btn btn-fill"
                            onClick={() => handleAssign(admin.id)}
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loadingDetail &&
                  !assignedApts[admin.id] ? (
                    <p>Loading details...</p>
                  ) : assigned.length === 0 ? (
                    <p className="empty-state">
                      No apartments assigned to this admin yet.
                    </p>
                  ) : (
                    assigned.map((apt) => (
                      <div
                        key={apt.id}
                        style={{ marginBottom: 18 }}
                      >
                        <h4
                          style={{
                            fontSize: 14,
                            color: 'var(--primary)',
                            marginBottom: 8
                          }}
                        >
                          🏢 {apt.name} —{' '}
                          {(residentsByApt[apt.id] || []).length}{' '}
                          resident(s)
                        </h4>

                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Email</th>
                              <th>Flat</th>
                              <th>Occupancy</th>
                            </tr>
                          </thead>

                          <tbody>
                            {(residentsByApt[apt.id] || []).length ===
                            0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="empty-state"
                                >
                                  No residents added yet.
                                </td>
                              </tr>
                            ) : (
                              (residentsByApt[apt.id] || []).map(
                                (r) => (
                                  <tr key={r.id}>
                                    <td>{r.email}</td>
                                    <td>
                                      {r.household?.flatNumber || '-'}
                                    </td>
                                    <td>
                                      {r.household?.occupancy ?? '-'}
                                    </td>
                                  </tr>
                                )
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
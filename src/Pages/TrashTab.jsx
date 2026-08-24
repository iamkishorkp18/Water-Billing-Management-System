import { useEffect, useState } from 'react';

import {
  getDeletedApartments,
  getDeletedCommercialAdmins,
  getDeletedResidents,
  getDeletedHouseholds,
  getDeletedBills,

  restoreApartment,
  restoreCommercialAdmin,
  restoreResident,
  restoreHousehold,
  restoreBill
} from '../Api/apiClient';

function TrashTab() {

  const [apartments, setApartments] = useState([]);
  const [commercialAdmins, setCommercialAdmins] = useState([]);
  const [residents, setResidents] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTrash = async () => {

    setLoading(true);
    setError('');

    try {

      const [
        apartmentsRes,
        adminsRes,
        residentsRes,
        householdsRes,
        billsRes
      ] = await Promise.all([
        getDeletedApartments(),
        getDeletedCommercialAdmins(),
        getDeletedResidents(),
        getDeletedHouseholds(),
        getDeletedBills()
      ]);

      setApartments(apartmentsRes.data);
      setCommercialAdmins(adminsRes.data);
      setResidents(residentsRes.data);
      setHouseholds(householdsRes.data);
      setBills(billsRes.data);

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to load deleted items.'
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestoreApartment = async (id) => {
    try {
      await restoreApartment(id);

      setApartments(prev =>
        prev.filter(item => item.id !== id)
      );

      setMessage('Apartment restored successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to restore apartment.'
      );
    }
  };

  const handleRestoreAdmin = async (id) => {
    try {
      await restoreCommercialAdmin(id);

      setCommercialAdmins(prev =>
        prev.filter(item => item.id !== id)
      );

      setMessage('Commercial Admin restored successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to restore Commercial Admin.'
      );
    }
  };

  const handleRestoreResident = async (id) => {
    try {
      await restoreResident(id);

      setResidents(prev =>
        prev.filter(item => item.id !== id)
      );

      setMessage('Resident restored successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to restore resident.'
      );
    }
  };

  const handleRestoreHousehold = async (id) => {
    try {
      await restoreHousehold(id);

      setHouseholds(prev =>
        prev.filter(item => item.id !== id)
      );

      setMessage('Household restored successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to restore household.'
      );
    }
  };

  const handleRestoreBill = async (id) => {
    try {
      await restoreBill(id);

      setBills(prev =>
        prev.filter(item => item.id !== id)
      );

      setMessage('Invoice restored successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to restore invoice.'
      );
    }
  };

  if (loading) {
    return (
      <div className="dash-section">
        <h2>Trash</h2>
        <p>Loading deleted items...</p>
      </div>
    );
  }

  return (
    <div>

      <div className="dash-section-head">
        <div>
          <h2>🗑️ Trash</h2>
          <p>
            Deleted items are kept here and can be restored.
          </p>
        </div>

        <button
          className="btn btn-fill"
          onClick={loadTrash}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="banner banner-success">
          {message}
        </div>
      )}

      {error && (
        <div className="banner banner-error">
          {error}
        </div>
      )}

      {/* APARTMENTS */}

      <div className="dash-section">
        <h2>🏢 Deleted Apartments</h2>

        {apartments.length === 0 ? (
          <p>No deleted apartments.</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Deleted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {apartments.map(a => (
                <tr key={a.id}>

                  <td>{a.id}</td>
                  <td>{a.name}</td>
                  <td>{a.address}</td>
                  <td>{a.deletedAt || '-'}</td>

                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        handleRestoreApartment(a.id)
                      }
                    >
                      Restore
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}
      </div>

      {/* COMMERCIAL ADMINS */}

      <div className="dash-section">
        <h2>👨‍💼 Deleted Commercial Admins</h2>

        {commercialAdmins.length === 0 ? (
          <p>No deleted Commercial Admins.</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Deleted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {commercialAdmins.map(u => (
                <tr key={u.id}>

                  <td>{u.id}</td>
                  <td>{u.fullName || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.deletedAt || '-'}</td>

                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        handleRestoreAdmin(u.id)
                      }
                    >
                      Restore
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}
      </div>

      {/* RESIDENTS */}

      <div className="dash-section">
        <h2>👤 Deleted Residents</h2>

        {residents.length === 0 ? (
          <p>No deleted residents.</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Deleted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {residents.map(u => (
                <tr key={u.id}>

                  <td>{u.id}</td>
                  <td>{u.fullName || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.deletedAt || '-'}</td>

                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        handleRestoreResident(u.id)
                      }
                    >
                      Restore
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}
      </div>

      {/* HOUSEHOLDS */}

      <div className="dash-section">
        <h2>🏠 Deleted Households</h2>

        {households.length === 0 ? (
          <p>No deleted households.</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Flat Number</th>
                <th>Flat Size</th>
                <th>Deleted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {households.map(h => (
                <tr key={h.id}>

                  <td>{h.id}</td>
                  <td>{h.flatNumber}</td>
                  <td>{h.flatSize || '-'}</td>
                  <td>{h.deletedAt || '-'}</td>

                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        handleRestoreHousehold(h.id)
                      }
                    >
                      Restore
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}
      </div>

      {/* BILLS */}

      <div className="dash-section">
        <h2>🧾 Deleted Invoices</h2>

        {bills.length === 0 ? (
          <p>No deleted invoices.</p>
        ) : (
          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Billing Month</th>
                <th>Amount</th>
                <th>Deleted At</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {bills.map(b => (
                <tr key={b.id}>

                  <td>{b.id}</td>
                  <td>{b.billingMonth || '-'}</td>
                  <td>{b.amount || '-'}</td>
                  <td>{b.deletedAt || '-'}</td>

                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        handleRestoreBill(b.id)
                      }
                    >
                      Restore
                    </button>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}
      </div>

    </div>
  );
}

export default TrashTab;
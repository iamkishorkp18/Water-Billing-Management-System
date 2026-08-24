import { useEffect, useState } from 'react';

import {
  createResident,
  getUsageForHousehold,
  getBillsForHousehold,
  getAlertsForHousehold,
  deleteResident
} from "../../../Api/commercialApi";

import ConfirmModal from "../../../components/ConfirmModal";



function ResidentsTab({
  apartmentName,
  households,
  residents,
  setResidents
}) {

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    householdId: ''
  });

  const [msg, setMsg] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // BILL VIEW
  const [selectedBill, setSelectedBill] = useState(null);


  // ================= PAGINATION =================

  const [currentPage, setCurrentPage] = useState(1);

  const residentsPerPage = 10;


  // ================= RESET PAGE =================

  useEffect(() => {
    setCurrentPage(1);
  }, [residents.length]);


  // ================= PAGINATION CALCULATIONS =================

  const totalPages = Math.ceil(
    residents.length / residentsPerPage
  );

  const startIndex =
    (currentPage - 1) * residentsPerPage;

  const endIndex =
    startIndex + residentsPerPage;

  const currentResidents =
    residents.slice(startIndex, endIndex);


  // ================= CREATE RESIDENT =================

  const handleCreate = async e => {

    e.preventDefault();

    try {

      const res = await createResident({
        email: form.email,
        password: form.password,
        role: 'RESIDENT',
        isDeleted: false,
        household: {
          id: Number(form.householdId)
        }
      });

      setResidents(prev => [
        ...prev,
        res.data
      ]);

      setForm({
        email: '',
        password: '',
        householdId: ''
      });

      setShowForm(false);

      alert(
        'Resident created! Share the email and password directly.'
      );

    } catch (err) {

      setMsg(
        err.response?.data?.message ||
        'Failed to create resident.'
      );

    }
  };


  // ================= EXPAND RESIDENT =================

  const handleExpand = async r => {

    if (expandedId === r.id) {
      return setExpandedId(null);
    }

    setExpandedId(r.id);

    if (
      details[r.id] ||
      !r.household?.id
    ) {
      return;
    }

    setLoading(true);

    try {

      const [u, b, a] = await Promise.all([

        getUsageForHousehold(
          r.household.id
        ).catch(() => ({
          data: []
        })),

        getBillsForHousehold(
          r.household.id
        ).catch(() => ({
          data: []
        })),

        getAlertsForHousehold(
          r.household.id
        ).catch(() => ({
          data: []
        }))

      ]);

      setDetails(prev => ({
        ...prev,

        [r.id]: {
          usage: u.data,
          bills: b.data,
          alerts: a.data
        }

      }));

    } finally {

      setLoading(false);

    }
  };


  // ================= DELETE RESIDENT =================

  const handleDelete = async () => {

    try {

      await deleteResident(
        deleteTarget.id
      );

      setResidents(prev =>
        prev.filter(
          r => r.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);

      if (
        expandedId === deleteTarget.id
      ) {
        setExpandedId(null);
      }

    } catch (err) {

      setMsg(
        err.response?.data?.message ||
        'Failed to delete resident.'
      );

    }
  };


  // ================= PAGE CHANGE =================

  const changePage = page => {

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    setExpandedId(null);
  };


  // ================= PAGE NUMBERS =================

  const getPageNumbers = () => {

    const pages = [];

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };


  // ================= OPEN BILL =================

  const openBill = bill => {

    setSelectedBill(bill);

    document.body.style.overflow = 'hidden';
  };


  // ================= CLOSE BILL =================

  const closeBill = () => {

    setSelectedBill(null);

    document.body.style.overflow = 'auto';
  };


  // ================= BILL STATUS =================

  const getBillStatusClass = status => {

    if (
      String(status).toUpperCase() === 'PAID'
    ) {
      return 'resident-bill-status paid';
    }

    return 'resident-bill-status pending';
  };


  return (
    <div className="dash-section">


      {/* ================= HEADER ================= */}

      <div className="dash-section-head">

        <h2>
          Residents — {apartmentName}
        </h2>

        <button
          className="btn btn-fill"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? 'Cancel'
            : '+ Add Resident'}
        </button>

      </div>


      {/* ================= FORM ================= */}

      {showForm && (

        <form
          onSubmit={handleCreate}
          className="inline-form resident-form-animated"
        >

          {msg && (
            <div className="banner banner-error">
              {msg}
            </div>
          )}


          <div className="form-row-3">

            <input
              type="email"
              placeholder="Resident email"
              value={form.email}
              onChange={e =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
              required
            />


            <input
              type="password"
              placeholder="Temporary password"
              value={form.password}
              onChange={e =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              required
            />


            <select
              value={form.householdId}
              onChange={e =>
                setForm({
                  ...form,
                  householdId:
                    e.target.value
                })
              }
              required
            >

              <option value="">
                Select Household
              </option>

              {households.map(h => (

                <option
                  key={h.id}
                  value={h.id}
                >
                  {h.flatNumber}
                </option>

              ))}

            </select>

          </div>


          <button className="btn btn-fill">
            Create Resident Login
          </button>

        </form>

      )}


      {/* ================= RESIDENT LIST ================= */}

      {residents.length === 0 ? (

        <p className="empty-state">
          No residents added yet.
        </p>

      ) : (

        <div className="resident-list">

          {currentResidents.map(r => {

            const d = details[r.id];

            return (

              <div
                key={r.id}
                className={`expandable-card resident-card-animated ${
                  expandedId === r.id
                    ? 'resident-card-open'
                    : ''
                }`}
              >


                {/* ================= RESIDENT HEADER ================= */}

                <div className="expandable-header">

                  <div
                    onClick={() =>
                      handleExpand(r)
                    }
                    style={{
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >

                    <div className="resident-main-info">

                      <div className="resident-avatar">
                        {r.email
                          ?.charAt(0)
                          ?.toUpperCase() || 'R'}
                      </div>

                      <div>

                        <strong>
                          {r.email}
                        </strong>

                        <span className="resident-flat">
                          Flat{' '}
                          {r.household?.flatNumber || '-'}
                        </span>

                      </div>

                    </div>

                  </div>


                  <button
                    className="btn-sm btn-reject"
                    onClick={() =>
                      setDeleteTarget(r)
                    }
                  >
                    Delete
                  </button>


                  <span
                    onClick={() =>
                      handleExpand(r)
                    }
                    className="resident-expand-icon"
                  >
                    {expandedId === r.id
                      ? '▲'
                      : '▼'}
                  </span>

                </div>


                {/* ================= EXPANDED DETAILS ================= */}

                {expandedId === r.id && (

                  <div className="expandable-body resident-details-animated">

                    {loading && !d ? (

                      <div className="resident-loading">

                        <div className="loading-spinner"></div>

                        <p>
                          Loading resident details...
                        </p>

                      </div>

                    ) : !d ? (

                      <p className="empty-state">
                        No data.
                      </p>

                    ) : (

                      <>


                        {/* ================= ALERTS ================= */}

                        {d.alerts?.map(a => (

                          <div
                            key={a.id}
                            className="banner banner-error"
                          >
                            ⚠️ {a.message}
                          </div>

                        ))}


                        {/* ================= RESIDENT SUMMARY ================= */}

                        <div className="resident-summary">

                          <div className="resident-summary-item">

                            <span>
                              Household
                            </span>

                            <strong>
                              #{r.household?.id || '-'}
                            </strong>

                          </div>

                          <div className="resident-summary-item">

                            <span>
                              Flat
                            </span>

                            <strong>
                              {r.household?.flatNumber || '-'}
                            </strong>

                          </div>

                          <div className="resident-summary-item">

                            <span>
                              Total Bills
                            </span>

                            <strong>
                              {d.bills?.length || 0}
                            </strong>

                          </div>

                          <div className="resident-summary-item">

                            <span>
                              Paid Bills
                            </span>

                            <strong className="summary-paid">

                              {d.bills?.filter(
                                b =>
                                  String(b.status)
                                    .toUpperCase() === 'PAID'
                              ).length || 0}

                            </strong>

                          </div>

                          <div className="resident-summary-item">

                            <span>
                              Pending Bills
                            </span>

                            <strong className="summary-pending">

                              {d.bills?.filter(
                                b =>
                                  String(b.status)
                                    .toUpperCase() !== 'PAID'
                              ).length || 0}

                            </strong>

                          </div>

                        </div>


                        {/* ================= BILL TABLE ================= */}

                        <div className="resident-bills-wrapper">

                          <div className="resident-bills-title">

                            <div>

                              <h3>
                                🧾 Water Bill History
                              </h3>

                              <p>
                                Click "Open Bill" to view complete bill details.
                              </p>

                            </div>

                          </div>


                          <table className="data-table resident-bill-table">

                            <thead>

                              <tr>

                                <th>
                                  Bill
                                </th>

                                <th>
                                  Month
                                </th>

                                <th>
                                  Consumption
                                </th>

                                <th>
                                  Amount
                                </th>

                                <th>
                                  Status
                                </th>

                                <th>
                                  Action
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {d.bills.length === 0 ? (

                                <tr>

                                  <td
                                    colSpan={6}
                                    className="empty-state"
                                  >
                                    No bills yet.
                                  </td>

                                </tr>

                              ) : (

                                d.bills.map(b => (

                                  <tr
                                    key={b.id}
                                    className="bill-row-animated"
                                  >

                                    <td>

                                      <span className="bill-number">

                                        #
                                        {b.id}

                                      </span>

                                    </td>


                                    <td>

                                      <strong>
                                        {b.billingMonth}
                                      </strong>

                                    </td>


                                    <td>

                                      <span className="consumption-badge">

                                        💧 {Number(
                                          b.consumption || 0
                                        ).toFixed(2)}

                                        {' '}units

                                      </span>

                                    </td>


                                    <td>

                                      <strong className="bill-amount">

                                        ₹
                                        {Number(
                                          b.amount || 0
                                        ).toFixed(2)}

                                      </strong>

                                    </td>


                                    <td>

                                      <span
                                        className={getBillStatusClass(
                                          b.status
                                        )}
                                      >

                                        {String(
                                          b.status || 'PENDING'
                                        ).toUpperCase() === 'PAID'
                                          ? '✓ PAID'
                                          : '● PENDING'}

                                      </span>

                                    </td>


                                    <td>

                                      <button
                                        className="bill-open-btn"
                                        onClick={() =>
                                          openBill({
                                            ...b,
                                            resident: r
                                          })
                                        }
                                      >
                                        👁 Open Bill
                                      </button>

                                    </td>

                                  </tr>

                                ))

                              )}

                            </tbody>

                          </table>

                        </div>

                      </>

                    )}

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}


      {/* ================= PAGINATION ================= */}

      {residents.length > 0 && (

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            gap: 15,
            flexWrap: 'wrap'
          }}
        >

          <div
            style={{
              color: '#64748b',
              fontSize: 14
            }}
          >

            Showing{' '}

            <strong>
              {startIndex + 1}
            </strong>

            {' – '}

            <strong>
              {Math.min(
                endIndex,
                residents.length
              )}
            </strong>

            {' of '}

            <strong>
              {residents.length}
            </strong>

            {' residents'}

          </div>


          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >

            <button
              className="btn-sm"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                changePage(
                  currentPage - 1
                )
              }
              style={{
                padding: '7px 12px',
                cursor:
                  currentPage === 1
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  currentPage === 1
                    ? 0.5
                    : 1
              }}
            >
              ← Previous
            </button>


            {getPageNumbers().map(page => (

              <button
                key={page}
                className="btn-sm"
                onClick={() =>
                  changePage(page)
                }
                style={{
                  minWidth: 36,
                  padding: '7px 10px',
                  borderRadius: 8,
                  border:
                    currentPage === page
                      ? 'none'
                      : '1px solid #dbe4ea',
                  background:
                    currentPage === page
                      ? '#0f4c5c'
                      : 'white',
                  color:
                    currentPage === page
                      ? 'white'
                      : '#334155',
                  fontWeight:
                    currentPage === page
                      ? 700
                      : 500,
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>

            ))}


            <button
              className="btn-sm"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                changePage(
                  currentPage + 1
                )
              }
              style={{
                padding: '7px 12px',
                cursor:
                  currentPage === totalPages
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  currentPage === totalPages
                    ? 0.5
                    : 1
              }}
            >
              Next →
            </button>

          </div>

        </div>

      )}


      {/* ================= BILL VIEW MODAL ================= */}

      {selectedBill && (

        <div
          className="bill-modal-overlay"
          onClick={closeBill}
        >

          <div
            className="bill-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            {/* BILL HEADER */}

            <div className="bill-modal-header">

              <div>

                <div className="bill-company-label">
                  WATER BILL
                </div>

                <h2>
                  Water Consumption Invoice
                </h2>

                <p>
                  {apartmentName}
                </p>

              </div>

              <button
                className="bill-close-btn"
                onClick={closeBill}
              >
                ✕
              </button>

            </div>


            {/* STATUS */}

            <div className="bill-modal-status-row">

              <div>

                <span className="bill-label">
                  Bill Number
                </span>

                <strong>
                  BILL-{selectedBill.id}
                </strong>

              </div>


              <span
                className={getBillStatusClass(
                  selectedBill.status
                )}
              >

                {String(
                  selectedBill.status
                ).toUpperCase() === 'PAID'
                  ? '✓ PAID'
                  : '● PAYMENT PENDING'}

              </span>

            </div>


            {/* RESIDENT DETAILS */}

            <div className="bill-modal-section">

              <h3>
                Resident Details
              </h3>

              <div className="bill-details-grid">

                <div>
                  <span>
                    Resident
                  </span>

                  <strong>
                    {selectedBill.resident?.fullName ||
                      selectedBill.resident?.email ||
                      'Resident'}
                  </strong>
                </div>


                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedBill.resident?.email ||
                      '-'}
                  </strong>
                </div>


                <div>
                  <span>
                    Household ID
                  </span>

                  <strong>
                    #{selectedBill.resident?.household?.id ||
                      selectedBill.household?.id ||
                      '-'}
                  </strong>
                </div>


                <div>
                  <span>
                    Flat Number
                  </span>

                  <strong>
                    {selectedBill.resident?.household?.flatNumber ||
                      selectedBill.household?.flatNumber ||
                      '-'}
                  </strong>
                </div>

              </div>

            </div>


            {/* BILL PERIOD */}

            <div className="bill-modal-section">

              <h3>
                Billing Information
              </h3>

              <div className="bill-details-grid">

                <div>
                  <span>
                    Billing Month
                  </span>

                  <strong>
                    {selectedBill.billingMonth}
                  </strong>
                </div>


                <div>
                  <span>
                    Generated Date
                  </span>

                  <strong>
                    {selectedBill.generatedDate ||
                      '-'}
                  </strong>
                </div>


                <div>
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {selectedBill.dueDate ||
                      '-'}
                  </strong>
                </div>

              </div>

            </div>


            {/* METER READING */}

            <div className="bill-modal-section">

              <h3>
                💧 Water Meter Readings
              </h3>

              <div className="meter-reading-grid">

                <div className="meter-box">

                  <span>
                    Previous Reading
                  </span>

                  <strong>
                    {Number(
                      selectedBill.previousReading || 0
                    ).toFixed(2)}
                  </strong>

                  <small>
                    units
                  </small>

                </div>


                <div className="meter-arrow">
                  →
                </div>


                <div className="meter-box current">

                  <span>
                    Current Reading
                  </span>

                  <strong>
                    {Number(
                      selectedBill.currentReading || 0
                    ).toFixed(2)}
                  </strong>

                  <small>
                    units
                  </small>

                </div>


                <div className="meter-box consumption">

                  <span>
                    Consumption
                  </span>

                  <strong>
                    {Number(
                      selectedBill.consumption || 0
                    ).toFixed(2)}
                  </strong>

                  <small>
                    units
                  </small>

                </div>

              </div>

            </div>


            {/* AMOUNT */}

            <div className="bill-total-box">

              <div>

                <span>
                  Total Bill Amount
                </span>

                <small>
                  Water consumption charges
                </small>

              </div>

              <strong>
                ₹
                {Number(
                  selectedBill.amount || 0
                ).toFixed(2)}
              </strong>

            </div>


            {/* FOOTER */}

            <div className="bill-modal-footer">

              <span>
                💧 Water Billing Management System
              </span>

              <button
                className="btn btn-outline"
                onClick={closeBill}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ================= DELETE MODAL ================= */}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Resident"
        message={`Delete resident "${deleteTarget?.email}"?`}
        onConfirm={handleDelete}
        onCancel={() =>
          setDeleteTarget(null)
        }
      />


    </div>
  );
}


export default ResidentsTab;
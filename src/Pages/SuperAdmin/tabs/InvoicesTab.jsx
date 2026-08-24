import { useEffect, useState } from 'react';
import { deleteBill } from '../../../Api/analyticsApi';


export default function InvoicesTab({
  allBills,
  apartments,
  onMarkPaid
}) {
  const [bills, setBills] = useState(allBills || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState(null);

  const itemsPerPage = 10;

  // =========================================================
  // KEEP LOCAL BILLS UPDATED
  // =========================================================

  useEffect(() => {
    setBills(allBills || []);
  }, [allBills]);

  // =========================================================
  // DELETE INVOICE
  // =========================================================

  const handleDeleteInvoice = async (billId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this invoice?'
    );

    if (!confirmed) return;

    try {
      await deleteBill(billId);

      setBills((prevBills) =>
        prevBills.filter((bill) => bill.id !== billId)
      );

      setCurrentPage((prevPage) => {
        const remainingBills = bills.length - 1;

        const newTotalPages = Math.max(
          1,
          Math.ceil(
            remainingBills / itemsPerPage
          )
        );

        return Math.min(
          prevPage,
          newTotalPages
        );
      });

      alert('Invoice deleted successfully.');
    } catch (err) {
      console.error(
        'Delete invoice error:',
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to delete invoice.'
      );
    }
  };

  // =========================================================
  // VIEW BILL
  // =========================================================

  const openBill = (bill) => {
    setSelectedBill(bill);
  };

  const closeBill = () => {
    setSelectedBill(null);
  };

  // =========================================================
  // MARK PAID FROM MODAL
  // =========================================================

  const handleMarkPaidFromModal = () => {
    if (!selectedBill) return;

    if (selectedBill.status === 'PAID') {
      return;
    }

    onMarkPaid(
      selectedBill.id,
      selectedBill.household?.apartment?.id
    );

    setSelectedBill(null);
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getCommunityName = (bill) => {
    return (
      bill?.household?.apartment
        ?.communityName ||
      bill?.household?.apartment
        ?.community?.name ||
      bill?.household?.apartment
        ?.community ||
      bill?.apartment?.communityName ||
      bill?.apartment?.community?.name ||
      'Community'
    );
  };

  const getApartmentName = (bill) => {
    return (
      bill?.household?.apartment?.name ||
      bill?.apartment?.name ||
      '-'
    );
  };

  const getApartmentId = (bill) => {
    return (
      bill?.household?.apartment?.id ||
      bill?.apartment?.id ||
      '-'
    );
  };

  const getFlatNumber = (bill) => {
    return (
      bill?.household?.flatNumber ||
      bill?.household?.flatNo ||
      '-'
    );
  };

  const getHouseholdName = (bill) => {
    return (
      bill?.household?.name ||
      bill?.household?.householdName ||
      'Household'
    );
  };

  const getResidentName = (bill) => {
    return (
      bill?.household?.residentName ||
      bill?.household?.resident?.name ||
      bill?.household?.user?.name ||
      '-'
    );
  };

  const getOccupancy = (bill) => {
    return (
      bill?.household?.occupancy ??
      bill?.household?.members ??
      bill?.household?.memberCount ??
      '-'
    );
  };

  const getConsumption = (bill) => {
    return Number(
      bill?.consumption || 0
    );
  };

  const getAmount = (bill) => {
    return Number(
      bill?.amount || 0
    );
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      bills.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const currentBills = bills.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
  };

  // =========================================================
  // SUMMARY VALUES
  // =========================================================

  const paidCount = bills.filter(
    (bill) =>
      bill.status === 'PAID'
  ).length;

  const pendingCount =
    bills.length - paidCount;

  const totalAmount = bills.reduce(
    (sum, bill) =>
      sum + getAmount(bill),
    0
  );

  return (
    <>
      {/* =====================================================
          INVOICE SECTION
      ===================================================== */}

      <div className="dash-section superadmin-invoices-section">

        {/* =================================================
            ANIMATED HEADER
        ================================================= */}

        <div className="invoice-page-header">

          <div className="invoice-heading-content">

            <div className="invoice-water-icon">
              <span>💧</span>
            </div>

            <div>
              <div className="invoice-eyebrow">
                AQUALEDGER • BILLING
              </div>

              <h2>
                All Invoices
              </h2>

              <p>
                Manage, review and track
                apartment water invoices.
              </p>
            </div>

          </div>

          <div className="invoice-header-counter">

            <div className="counter-number">
              {bills.length}
            </div>

            <div className="counter-text">
              Total Invoices
            </div>

          </div>

        </div>

        {/* =================================================
            SUMMARY BAR
        ================================================= */}

        <div className="invoice-summary-bar">

          <div className="invoice-summary-item">

            <div className="summary-icon summary-blue">
              🧾
            </div>

            <div>
              <strong>
                {bills.length}
              </strong>

              <span>
                Total Invoices
              </span>
            </div>

          </div>

          <div className="summary-divider" />

          <div className="invoice-summary-item">

            <div className="summary-icon summary-green">
              ✓
            </div>

            <div>
              <strong>
                {paidCount}
              </strong>

              <span>
                Paid
              </span>
            </div>

          </div>

          <div className="summary-divider" />

          <div className="invoice-summary-item">

            <div className="summary-icon summary-orange">
              ⏳
            </div>

            <div>
              <strong>
                {pendingCount}
              </strong>

              <span>
                Pending
              </span>
            </div>

          </div>

          <div className="summary-divider" />

          <div className="invoice-summary-item">

            <div className="summary-icon summary-teal">
              ₹
            </div>

            <div>
              <strong>
                ₹{totalAmount.toFixed(2)}
              </strong>

              <span>
                Total Billing
              </span>
            </div>

          </div>

        </div>

        {/* =================================================
            TABLE TOOLBAR
        ================================================= */}

        <div className="invoice-toolbar">

          <div>

            <div className="toolbar-title">
              Invoice Records
            </div>

            <div className="toolbar-subtitle">
              Showing all generated water bills
            </div>

          </div>

          <div className="toolbar-live">

            <span className="live-dot" />

            Live Records

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="invoice-table-wrapper">

          <table className="data-table invoice-table">

            <thead>

              <tr>

                <th>
                  Invoice
                </th>

                <th>
                  Household
                </th>

                <th>
                  Apartment
                </th>

                <th>
                  Billing Month
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

              {bills.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="invoice-empty"
                  >

                    <div className="empty-invoice-icon">
                      🧾
                    </div>

                    <strong>
                      No invoices generated
                    </strong>

                    <span>
                      Generated invoices will
                      appear here.
                    </span>

                  </td>

                </tr>

              ) : (

                currentBills.map((b) => {

                  const isPaid =
                    b.status === 'PAID';

                  return (

                    <tr
                      key={b.id}
                      className="invoice-table-row"
                    >

                      {/* INVOICE */}

                      <td>

                        <div className="invoice-id-cell">

                          <div className="invoice-mini-icon">
                            🧾
                          </div>

                          <div>

                            <strong>
                              WTR-
                              {String(b.id)
                                .padStart(
                                  6,
                                  '0'
                                )}
                            </strong>

                            <small>
                              ID #{b.id}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* HOUSEHOLD */}

                      <td>

                        <div className="invoice-person-cell">

                          <div className="resident-avatar">
                            {getResidentName(
                              b
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {getResidentName(
                                b
                              )}
                            </strong>

                            <small>
                              Flat{' '}
                              {getFlatNumber(
                                b
                              )}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* APARTMENT */}

                      <td>

                        <div className="invoice-apartment-cell">

                          <strong>
                            {getApartmentName(
                              b
                            )}
                          </strong>

                          <small>
                            {getCommunityName(
                              b
                            )}
                          </small>

                        </div>

                      </td>

                      {/* MONTH */}

                      <td>

                        <div className="invoice-month-cell">

                          <strong>
                            {b.billingMonth ||
                              '-'}
                          </strong>

                          <small>
                            Billing cycle
                          </small>

                        </div>

                      </td>

                      {/* AMOUNT */}

                      <td>

                        <strong className="invoice-amount">
                          ₹
                          {getAmount(
                            b
                          ).toFixed(2)}
                        </strong>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`invoice-status ${
                            isPaid
                              ? 'invoice-status-paid'
                              : 'invoice-status-pending'
                          }`}
                        >

                          <span>
                            {isPaid
                              ? '✓'
                              : '●'}
                          </span>

                          {isPaid
                            ? 'PAID'
                            : 'PENDING'}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="invoice-actions">

                          <button
                            type="button"
                            className="invoice-view-btn"
                            onClick={() =>
                              openBill(b)
                            }
                          >
                            <span>
                              👁
                            </span>

                            View Bill

                          </button>

                          <button
                            type="button"
                            className="invoice-delete-btn"
                            onClick={() =>
                              handleDeleteInvoice(
                                b.id
                              )
                            }
                            title="Delete invoice"
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        {bills.length > itemsPerPage && (

          <div className="invoice-pagination">

            <div className="invoice-page-info">

              Showing{' '}
              <strong>
                {startIndex + 1}
              </strong>
              –
              <strong>
                {Math.min(
                  startIndex +
                    itemsPerPage,
                  bills.length
                )}
              </strong>{' '}
              of{' '}
              <strong>
                {bills.length}
              </strong>{' '}
              invoices

            </div>

            <div className="invoice-page-controls">

              <button
                type="button"
                className="invoice-pagination-btn"
                disabled={
                  safeCurrentPage === 1
                }
                onClick={() =>
                  changePage(
                    safeCurrentPage - 1
                  )
                }
              >
                ← Previous
              </button>

              <div className="invoice-page-number">
                Page{' '}
                <strong>
                  {safeCurrentPage}
                </strong>{' '}
                of{' '}
                <strong>
                  {totalPages}
                </strong>
              </div>

              <button
                type="button"
                className="invoice-pagination-btn"
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                onClick={() =>
                  changePage(
                    safeCurrentPage + 1
                  )
                }
              >
                Next →
              </button>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          VIEW BILL MODAL
      ===================================================== */}

      {selectedBill && (

        <div
          className="invoice-modal-overlay"
          onClick={closeBill}
        >

          <div
            className="invoice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL TOP */}

            <div className="invoice-modal-top">

              <div className="modal-brand">

                <div className="modal-brand-icon">
                  💧
                </div>

                <div>

                  <span>
                    AQUALEDGER
                  </span>

                  <small>
                    WATER BILL
                  </small>

                </div>

              </div>

              <button
                type="button"
                className="invoice-modal-close"
                onClick={closeBill}
              >
                ×
              </button>

            </div>

            {/* INVOICE HERO */}

            <div className="invoice-modal-hero">

              <div>

                <span>
                  INVOICE
                </span>

                <h2>
                  WTR-
                  {String(
                    selectedBill.id
                  ).padStart(
                    6,
                    '0'
                  )}
                </h2>

                <p>
                  Billing Month:{' '}
                  <strong>
                    {selectedBill.billingMonth ||
                      '-'}
                  </strong>
                </p>

              </div>

              <div
                className={`modal-status-large ${
                  selectedBill.status ===
                  'PAID'
                    ? 'paid'
                    : 'pending'
                }`}
              >

                <span>
                  {selectedBill.status ===
                  'PAID'
                    ? '✓'
                    : '●'}
                </span>

                {selectedBill.status ===
                'PAID'
                  ? 'PAID'
                  : 'PENDING'}

              </div>

            </div>

            {/* PROPERTY */}

            <div className="invoice-modal-section">

              <div className="modal-section-heading">

                <span className="section-heading-icon">
                  🏢
                </span>

                <div>

                  <h3>
                    Property Details
                  </h3>

                  <p>
                    Location associated
                    with this invoice
                  </p>

                </div>

              </div>

              <div className="invoice-detail-grid">

                <div className="invoice-detail-card">

                  <span>
                    Community
                  </span>

                  <strong>
                    {getCommunityName(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Apartment
                  </span>

                  <strong>
                    {getApartmentName(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Apartment ID
                  </span>

                  <strong>
                    #{getApartmentId(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Flat Number
                  </span>

                  <strong>
                    {getFlatNumber(
                      selectedBill
                    )}
                  </strong>

                </div>

              </div>

            </div>

            {/* HOUSEHOLD */}

            <div className="invoice-modal-section">

              <div className="modal-section-heading">

                <span className="section-heading-icon">
                  👨‍👩‍👧
                </span>

                <div>

                  <h3>
                    Household Details
                  </h3>

                  <p>
                    Resident and household
                    information
                  </p>

                </div>

              </div>

              <div className="invoice-detail-grid">

                <div className="invoice-detail-card">

                  <span>
                    Household
                  </span>

                  <strong>
                    {getHouseholdName(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Resident
                  </span>

                  <strong>
                    {getResidentName(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Flat Number
                  </span>

                  <strong>
                    {getFlatNumber(
                      selectedBill
                    )}
                  </strong>

                </div>

                <div className="invoice-detail-card">

                  <span>
                    Occupancy
                  </span>

                  <strong>
                    {getOccupancy(
                      selectedBill
                    )}
                  </strong>

                </div>

              </div>

            </div>

            {/* BILL SUMMARY */}

            <div className="invoice-modal-section">

              <div className="modal-section-heading">

                <span className="section-heading-icon">
                  💧
                </span>

                <div>

                  <h3>
                    Billing Information
                  </h3>

                  <p>
                    Water usage and invoice
                    calculation
                  </p>

                </div>

              </div>

              <div className="invoice-billing-summary">

                <div className="billing-summary-row">

                  <span>
                    Billing Month
                  </span>

                  <strong>
                    {selectedBill.billingMonth ||
                      '-'}
                  </strong>

                </div>

                <div className="billing-summary-row">

                  <span>
                    Water Consumption
                  </span>

                  <strong>
                    {getConsumption(
                      selectedBill
                    )}{' '}
                    units
                  </strong>

                </div>

                <div className="billing-summary-row">

                  <span>
                    Invoice Amount
                  </span>

                  <strong className="invoice-modal-amount">
                    ₹
                    {getAmount(
                      selectedBill
                    ).toFixed(2)}
                  </strong>

                </div>

                <div className="billing-summary-row">

                  <span>
                    Payment Status
                  </span>

                  <span
                    className={`invoice-status ${
                      selectedBill.status ===
                      'PAID'
                        ? 'invoice-status-paid'
                        : 'invoice-status-pending'
                    }`}
                  >

                    {selectedBill.status ===
                    'PAID'
                      ? '✓ PAID'
                      : '● PENDING'}

                  </span>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="invoice-modal-footer">

              {selectedBill.status !==
              'PAID' ? (

                <button
                  type="button"
                  className="invoice-modal-paid-btn"
                  onClick={
                    handleMarkPaidFromModal
                  }
                >
                  ✓ Mark Bill as Paid
                </button>

              ) : (

                <div className="invoice-already-paid">
                  ✓ Payment already completed
                </div>

              )}

              <button
                type="button"
                className="invoice-modal-close-btn"
                onClick={closeBill}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}
import { useState } from 'react';


export default function PaymentsAnalyticsTab({
  paymentsByApt,
  apartments
}) {
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const allPayments = Object.values(
    paymentsByApt || {}
  ).flat();

  const filteredPayments =
    selectedMethod === 'ALL'
      ? allPayments
      : allPayments.filter(
          (p) =>
            (p.paymentMethod || 'MANUAL') ===
            selectedMethod
        );

  const totalRevenue = allPayments.reduce(
    (sum, p) =>
      sum + Number(p.amount || 0),
    0
  );

  const filteredRevenue = filteredPayments.reduce(
    (sum, p) =>
      sum + Number(p.amount || 0),
    0
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPayments.length /
        ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * ITEMS_PER_PAGE;

  const paginatedPayments =
    filteredPayments.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  const handleMethodChange = (e) => {
    setSelectedMethod(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  /* =========================
     VIEW BILL
  ========================= */

  const openBill = (payment) => {
    setSelectedPayment(payment);
  };

  const closeBill = () => {
    setSelectedPayment(null);
  };

  /* =========================
     SAFE HELPERS
  ========================= */

  const getApartmentName = (payment) => {
    return (
      payment?.household?.apartment?.name ||
      payment?.apartment?.name ||
      payment?.apartmentName ||
      '-'
    );
  };

  const getCommunityName = (payment) => {
    return (
      payment?.household?.apartment
        ?.communityName ||
      payment?.household?.apartment
        ?.community?.name ||
      payment?.apartment?.communityName ||
      payment?.communityName ||
      'Community'
    );
  };

  const getFlatNumber = (payment) => {
    return (
      payment?.household?.flatNumber ||
      payment?.flatNumber ||
      '-'
    );
  };

  const getResidentName = (payment) => {
    return (
      payment?.household?.residentName ||
      payment?.household?.resident?.name ||
      payment?.residentName ||
      payment?.resident?.name ||
      '-'
    );
  };

  const getHouseholdName = (payment) => {
    return (
      payment?.household?.name ||
      payment?.household?.householdName ||
      '-'
    );
  };

  const getBillingMonth = (payment) => {
    return (
      payment?.bill?.billingMonth ||
      payment?.billingMonth ||
      '-'
    );
  };

  const getConsumption = (payment) => {
    return (
      payment?.bill?.consumption ??
      payment?.consumption ??
      0
    );
  };

  const getBillAmount = (payment) => {
    return Number(
      payment?.bill?.amount ??
        payment?.amount ??
        0
    );
  };

  return (
    <>
      {/* =====================================================
          PAYMENT ANALYTICS
      ===================================================== */}

      <div className="payments-analytics-page">

        {/* ================= STAT CARDS ================= */}

        <div className="payment-stat-grid">

          <div className="payment-stat-card revenue-card">
            <div className="payment-stat-icon">
              ₹
            </div>

            <div className="payment-stat-content">
              <span className="payment-stat-label">
                Total Revenue Collected
              </span>

              <strong className="payment-stat-value">
                ₹{totalRevenue.toFixed(2)}
              </strong>

              <span className="payment-stat-caption">
                Across all payment transactions
              </span>
            </div>
          </div>

          <div className="payment-stat-card transaction-card">
            <div className="payment-stat-icon">
              ⇄
            </div>

            <div className="payment-stat-content">
              <span className="payment-stat-label">
                Total Transactions
              </span>

              <strong className="payment-stat-value">
                {allPayments.length}
              </strong>

              <span className="payment-stat-caption">
                Recorded payment entries
              </span>
            </div>
          </div>

          <div className="payment-stat-card showing-card">
            <div className="payment-stat-icon">
              ◉
            </div>

            <div className="payment-stat-content">
              <span className="payment-stat-label">
                Showing Transactions
              </span>

              <strong className="payment-stat-value">
                {filteredPayments.length}
              </strong>

              <span className="payment-stat-caption">
                Based on selected filter
              </span>
            </div>
          </div>

          <div className="payment-stat-card filtered-card">
            <div className="payment-stat-icon">
              ✓
            </div>

            <div className="payment-stat-content">
              <span className="payment-stat-label">
                Filtered Revenue
              </span>

              <strong className="payment-stat-value">
                ₹{filteredRevenue.toFixed(2)}
              </strong>

              <span className="payment-stat-caption">
                Revenue from current selection
              </span>
            </div>
          </div>

        </div>


        {/* =====================================================
            PAYMENT TRANSACTIONS
        ===================================================== */}

        <div className="dash-section payment-transactions-section">

          {/* HEADER */}

          <div className="payment-section-header">

            <div className="payment-heading">

              <span className="payment-eyebrow">
                FINANCIAL ACTIVITY
              </span>

              <h2>
                Payment Transactions
              </h2>

              <p>
                View collected payments and
                complete bill information.
              </p>

            </div>

            {/* FILTER */}

            <div className="payment-method-filter">

              <label htmlFor="paymentMethod">
                Payment Method
              </label>

              <div className="payment-select-wrapper">

                <select
                  id="paymentMethod"
                  value={selectedMethod}
                  onChange={handleMethodChange}
                >
                  <option value="ALL">
                    All Payment Methods
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CASH">
                    Cash
                  </option>

                  <option value="MANUAL">
                    Manual
                  </option>

                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                </select>

                <span>
                 ⌄
                </span>

              </div>

            </div>

          </div>


          {/* TRANSACTION SUMMARY */}

          <div className="transaction-toolbar">

            <div className="transaction-result-info">

              <div className="transaction-live-dot" />

              <span>
                {filteredPayments.length}{' '}
                transactions found
              </span>

            </div>

            <div className="transaction-filter-chip">

              {selectedMethod === 'ALL'
                ? 'All Methods'
                : selectedMethod}

            </div>

          </div>


          {/* TABLE */}

          <div className="payments-table-wrapper">

            <table className="payments-table">

              <thead>

                <tr>
                  <th>Transaction</th>
                  <th>Resident / Flat</th>
                  <th>Apartment</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {paginatedPayments.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="payment-empty-cell"
                    >

                      <div className="payment-empty-state">

                        <div className="payment-empty-icon">
                          ₹
                        </div>

                        <strong>
                          No transactions found
                        </strong>

                        <span>
                          There are no payment
                          transactions matching
                          the selected method.
                        </span>

                      </div>

                    </td>

                  </tr>

                ) : (

                  paginatedPayments.map(
                    (p, index) => {

                      const method =
                        p.paymentMethod ||
                        'MANUAL';

                      return (

                        <tr
                          key={
                            p.id ||
                            p.transactionId ||
                            index
                          }
                        >

                          {/* TRANSACTION */}

                          <td>

                            <div className="transaction-id-cell">

                              <div className="transaction-icon">
                                ▤
                              </div>

                              <div>

                                <strong>
                                  {p.transactionId ||
                                    `TXN-${p.id || index + 1}`}
                                </strong>

                                <small>
                                  ID #{p.id || '-'}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* RESIDENT */}

                          <td>

                            <div className="resident-payment-cell">

                              <div className="resident-avatar">
                                {getResidentName(p)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <strong>
                                  {getResidentName(p)}
                                </strong>

                                <small>
                                  Flat {getFlatNumber(p)}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* APARTMENT */}

                          <td>

                            <div className="apartment-payment-cell">

                              <span className="building-mini-icon">
                                🏢
                              </span>

                              <div>

                                <strong>
                                  {getApartmentName(p)}
                                </strong>

                                <small>
                                  {getCommunityName(p)}
                                </small>

                              </div>

                            </div>

                          </td>


                          {/* AMOUNT */}

                          <td>

                            <strong className="payment-amount">
                              ₹
                              {Number(
                                p.amount || 0
                              ).toFixed(2)}
                            </strong>

                          </td>


                          {/* METHOD */}

                          <td>

                            <span
                              className={`payment-method-badge method-${method.toLowerCase()}`}
                            >

                              <span>
                                {method === 'UPI'
                                  ? '◉'
                                  : method === 'CASH'
                                  ? '₹'
                                  : method ===
                                    'BANK_TRANSFER'
                                  ? '⇄'
                                  : '▣'}
                              </span>

                              {method}

                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            <div className="payment-date-cell">

                              <strong>
                                {p.paymentDate ||
                                  '-'}
                              </strong>

                              <small>
                                Payment received
                              </small>

                            </div>

                          </td>


                          {/* ACTION */}

                          <td>

                            <button
                              type="button"
                              className="payment-view-bill-btn"
                              onClick={() =>
                                openBill(p)
                              }
                            >
                              <span>
                                👁
                              </span>

                              View Bill
                            </button>

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>


          {/* PAGINATION */}

          {filteredPayments.length >
            ITEMS_PER_PAGE && (

            <div className="payment-pagination">

              <div className="payment-pagination-info">

                Showing{' '}
                <strong>
                  {startIndex + 1}
                </strong>
                –
                <strong>
                  {Math.min(
                    startIndex +
                      ITEMS_PER_PAGE,
                    filteredPayments.length
                  )}
                </strong>{' '}

                of{' '}

                <strong>
                  {filteredPayments.length}
                </strong>{' '}
                transactions

              </div>


              <div className="payment-pagination-controls">

                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() =>
                    goToPage(
                      safePage - 1
                    )
                  }
                >
                  ← Previous
                </button>


                {Array.from(
                  {
                    length: totalPages
                  },
                  (_, i) => i + 1
                ).map((page) => (

                  <button
                    type="button"
                    key={page}
                    className={
                      safePage === page
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      goToPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}


                <button
                  type="button"
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    goToPage(
                      safePage + 1
                    )
                  }
                >
                  Next →
                </button>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          VIEW BILL MODAL
      ===================================================== */}

      {selectedPayment && (

        <div
          className="payment-bill-overlay"
          onClick={closeBill}
        >

          <div
            className="payment-bill-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="payment-modal-top">

              <div className="payment-modal-title">

                <div className="payment-modal-icon">
                  💧
                </div>

                <div>

                  <span>
                    WATER BILL
                  </span>

                  <h2>
                    Bill Details
                  </h2>

                  <p>
                    Transaction #
                    {selectedPayment.transactionId ||
                      selectedPayment.id ||
                      '-'}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="payment-modal-close"
                onClick={closeBill}
              >
                ×
              </button>

            </div>


            {/* PAID STATUS */}

            <div className="payment-modal-status">

              <div className="payment-status-left">

                <span className="payment-success-circle">
                  ✓
                </span>

                <div>

                  <strong>
                    Payment Successful
                  </strong>

                  <small>
                    Payment has been recorded
                  </small>

                </div>

              </div>

              <span className="payment-modal-paid-badge">
                PAID
              </span>

            </div>


            {/* PROPERTY */}

            <div className="payment-modal-section">

              <div className="payment-modal-section-heading">
                <span>🏢</span>
                <h3>
                  Property Details
                </h3>
              </div>

              <div className="payment-detail-grid">

                <div className="payment-detail-box">

                  <span>
                    Community
                  </span>

                  <strong>
                    {getCommunityName(
                      selectedPayment
                    )}
                  </strong>

                </div>

                <div className="payment-detail-box">

                  <span>
                    Apartment
                  </span>

                  <strong>
                    {getApartmentName(
                      selectedPayment
                    )}
                  </strong>

                </div>

                <div className="payment-detail-box">

                  <span>
                    Flat Number
                  </span>

                  <strong>
                    {getFlatNumber(
                      selectedPayment
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* HOUSEHOLD */}

            <div className="payment-modal-section">

              <div className="payment-modal-section-heading">
                <span>👨‍👩‍👧</span>

                <h3>
                  Household Details
                </h3>
              </div>

              <div className="payment-detail-grid">

                <div className="payment-detail-box">

                  <span>
                    Household
                  </span>

                  <strong>
                    {getHouseholdName(
                      selectedPayment
                    )}
                  </strong>

                </div>

                <div className="payment-detail-box">

                  <span>
                    Resident
                  </span>

                  <strong>
                    {getResidentName(
                      selectedPayment
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* BILL INFORMATION */}

            <div className="payment-modal-section">

              <div className="payment-modal-section-heading">
                <span>🧾</span>

                <h3>
                  Billing Information
                </h3>

              </div>

              <div className="payment-bill-summary">

                <div>
                  <span>
                    Billing Month
                  </span>

                  <strong>
                    {getBillingMonth(
                      selectedPayment
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Water Consumption
                  </span>

                  <strong>
                    {getConsumption(
                      selectedPayment
                    )}{' '}
                    units
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {selectedPayment.paymentMethod ||
                      'MANUAL'}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment Date
                  </span>

                  <strong>
                    {selectedPayment.paymentDate ||
                      '-'}
                  </strong>
                </div>

              </div>

            </div>


            {/* TOTAL */}

            <div className="payment-modal-total">

              <div>

                <span>
                  Total Bill Amount
                </span>

                <small>
                  Paid amount
                </small>

              </div>

              <strong>
                ₹
                {getBillAmount(
                  selectedPayment
                ).toFixed(2)}
              </strong>

            </div>


            {/* FOOTER */}

            <div className="payment-modal-footer">

              <div className="payment-receipt-note">
                ✓ Payment verified and recorded
              </div>

              <button
                type="button"
                onClick={closeBill}
                className="payment-modal-close-btn"
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
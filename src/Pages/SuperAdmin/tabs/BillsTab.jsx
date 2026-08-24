import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';


export default function BillingTab({
  apartments = [],
  billsByApt = {},
  monthlyConsumptionChart = [],
  onMarkPaid
}) {
  const [selectedApartment, setSelectedApartment] = useState('ALL');
  const [billFilter, setBillFilter] = useState('ALL');
  const [currentPages, setCurrentPages] = useState({});
  const [selectedBill, setSelectedBill] = useState(null);

  const rowsPerPage = 10;

  /* =========================================================
     HELPERS
  ========================================================= */

  const getCommunityName = (apartment) => {
    return (
      apartment?.communityName ||
      apartment?.community?.name ||
      (typeof apartment?.community === 'string'
        ? apartment.community
        : '') ||
      'Community'
    );
  };

  const getHousehold = (bill) => {
    return bill?.household || {};
  };

  const getFlatNumber = (household) => {
    return (
      household?.flatNumber ||
      household?.flatNo ||
      household?.flat ||
      '-'
    );
  };

  const getHouseholdName = (household) => {
    return (
      household?.name ||
      household?.householdName ||
      household?.familyName ||
      '-'
    );
  };

  const getResidentName = (household) => {
    return (
      household?.residentName ||
      household?.resident?.name ||
      household?.resident?.fullName ||
      household?.user?.name ||
      household?.user?.fullName ||
      '-'
    );
  };

  const getOccupancy = (household) => {
    return (
      household?.occupancy ??
      household?.memberCount ??
      household?.members ??
      '-'
    );
  };

  const formatAmount = (amount) => {
    const value = Number(amount ?? 0);

    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatConsumption = (value) => {
    const number = Number(value ?? 0);

    return number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const handleFilterChange = (filter) => {
    setBillFilter(filter);
    setCurrentPages({});
  };

  const handleApartmentChange = (value) => {
    setSelectedApartment(value);
    setCurrentPages({});
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const changePage = (aptId, page) => {
    setCurrentPages((previous) => ({
      ...previous,
      [aptId]: page
    }));
  };

  /* =========================================================
     BILL MODAL
  ========================================================= */

  const openBillModal = (bill, apartment) => {
    setSelectedBill({
      bill,
      apartment
    });
  };

  const closeBillModal = () => {
    setSelectedBill(null);
  };

  /* =========================================================
     MARK BILL PAID
     
     IMPORTANT:
     Payment action exists ONLY inside modal.
  ========================================================= */

  const handleMarkBillPaid = () => {
    if (!selectedBill) return;

    const { bill, apartment } = selectedBill;

    if (bill?.status === 'PAID') {
      return;
    }

    if (typeof onMarkPaid === 'function') {
      onMarkPaid(bill.id, apartment.id);
    }

    closeBillModal();
  };

  /* =========================================================
     FILTER BILL DATA
  ========================================================= */

  const getFilteredBills = (aptId) => {
    const bills = billsByApt?.[aptId] || [];

    if (billFilter === 'PAID') {
      return bills.filter(
        (bill) => bill?.status === 'PAID'
      );
    }

    if (billFilter === 'UNPAID') {
      return bills.filter(
        (bill) => bill?.status !== 'PAID'
      );
    }

    return bills;
  };

  /* =========================================================
     APARTMENT FILTER
  ========================================================= */

  const visibleApartments = apartments.filter(
    (apt) =>
      selectedApartment === 'ALL' ||
      String(apt.id) === String(selectedApartment)
  );

  /* =========================================================
     TOTAL COUNTS
  ========================================================= */

  const allBills = apartments.flatMap(
    (apt) => billsByApt?.[apt.id] || []
  );

  const paidCount = allBills.filter(
    (bill) => bill.status === 'PAID'
  ).length;

  const unpaidCount = allBills.filter(
    (bill) => bill.status !== 'PAID'
  ).length;

  const totalAmount = allBills.reduce(
    (total, bill) =>
      total + Number(bill.amount || 0),
    0
  );

  return (
    <>
      {/* =====================================================
          MONTHLY CONSUMPTION
      ===================================================== */}

      <section className="sa-billing-section">

        <div className="sa-section-heading">

          <div>
            <span className="sa-section-eyebrow">
              WATER ANALYTICS
            </span>

            <h2>
              Monthly Consumption
            </h2>

            <p>
              Track monthly water usage across all apartments.
            </p>
          </div>

        </div>

        {monthlyConsumptionChart.length === 0 ? (
          <div className="sa-empty-card">
            <div className="sa-empty-icon">
              💧
            </div>

            <h3>
              No consumption data
            </h3>

            <p>
              Monthly consumption data will appear here once usage is recorded.
            </p>
          </div>
        ) : (
          <div className="sa-consumption-card">

            <div className="sa-chart-top">

              <div>
                <span className="sa-chart-label">
                  TOTAL CONSUMPTION
                </span>

                <strong>
                  Monthly Usage
                </strong>
              </div>

              <div className="sa-chart-legend">
                <span className="sa-legend-dot" />
                Water Units
              </div>

            </div>

            <div className="sa-chart-wrapper">

              <ResponsiveContainer
                width="100%"
                height={340}
              >
                <BarChart
                  data={monthlyConsumptionChart}
                  barCategoryGap="30%"
                  margin={{
                    top: 30,
                    right: 20,
                    left: 0,
                    bottom: 5
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e8eef3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    fontSize={13}
                    tick={{
                      fill: '#64748b'
                    }}
                    axisLine={{
                      stroke: '#d7e0e7'
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 'dataMax']}
                    axisLine={false}
                    tick={false}
                    tickLine={false}
                    width={20}
                  />

                  <Tooltip
                    formatter={(value) => [
                      `${value} units`,
                      'Consumption'
                    ]}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow:
                        '0 10px 30px rgba(15, 23, 42, 0.12)'
                    }}
                    cursor={{
                      fill: 'rgba(20, 184, 166, 0.06)'
                    }}
                  />

                  <Bar
                    dataKey="total"
                    fill="#14b8a6"
                    maxBarSize={62}
                    radius={[7, 7, 0, 0]}
                  >
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(value) =>
                        value > 0 ? `${value}` : ''
                      }
                      fontSize={12}
                      fill="#0f4c5c"
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>
        )}
      </section>


      {/* =====================================================
          BILLING CYCLE
      ===================================================== */}

      <section className="sa-billing-section">

        {/* HEADER */}

        <div className="sa-billing-top">

          <div className="sa-billing-title">

            <span className="sa-section-eyebrow">
              BILLING MANAGEMENT
            </span>

            <h2>
              Water Bills
            </h2>

            <p>
              View, monitor and manage apartment water bills.
            </p>

          </div>


          {/* APARTMENT DROPDOWN */}

          <div className="sa-apartment-selector">

            <label htmlFor="superApartmentSelect">
              Apartment
            </label>

            <div className="sa-select-container">

              <select
                id="superApartmentSelect"
                value={selectedApartment}
                onChange={(e) =>
                  handleApartmentChange(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Apartments
                </option>

                {apartments.map((apt) => (
                  <option
                    key={apt.id}
                    value={apt.id}
                  >
                    {apt.name}
                  </option>
                ))}
              </select>

              <span className="sa-select-arrow">
               ⌄
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="sa-billing-summary">

          <div className="sa-summary-card">

            <div className="sa-summary-icon blue">
              🧾
            </div>

            <div>
              <span>
                Total Bills
              </span>

              <strong>
                {allBills.length}
              </strong>
            </div>

          </div>


          <div className="sa-summary-card">

            <div className="sa-summary-icon green">
              ✓
            </div>

            <div>
              <span>
                Paid Bills
              </span>

              <strong>
                {paidCount}
              </strong>
            </div>

          </div>


          <div className="sa-summary-card">

            <div className="sa-summary-icon orange">
              ⏳
            </div>

            <div>
              <span>
                Pending Bills
              </span>

              <strong>
                {unpaidCount}
              </strong>
            </div>

          </div>


          <div className="sa-summary-card">

            <div className="sa-summary-icon purple">
              ₹
            </div>

            <div>
              <span>
                Total Billing
              </span>

              <strong>
                ₹{formatAmount(totalAmount)}
              </strong>
            </div>

          </div>

        </div>


        {/* =================================================
            FILTER BUTTONS
        ================================================= */}

        <div className="sa-bill-filters">

          <button
            type="button"
            className={`sa-filter-btn ${
              billFilter === 'ALL'
                ? 'active-all'
                : ''
            }`}
            onClick={() =>
              handleFilterChange('ALL')
            }
          >
            <span className="filter-icon">
              ▦
            </span>

            <span>
              All Bills
            </span>
          </button>


          <button
            type="button"
            className={`sa-filter-btn ${
              billFilter === 'PAID'
                ? 'active-paid'
                : ''
            }`}
            onClick={() =>
              handleFilterChange('PAID')
            }
          >
            <span className="filter-icon">
              ✓
            </span>

            <span>
              Paid Bills
            </span>
          </button>


          <button
            type="button"
            className={`sa-filter-btn ${
              billFilter === 'UNPAID'
                ? 'active-unpaid'
                : ''
            }`}
            onClick={() =>
              handleFilterChange('UNPAID')
            }
          >
            <span className="filter-icon">
              ⏳
            </span>

            <span>
              Unpaid Bills
            </span>
          </button>

        </div>


        {/* =================================================
            BILL LIST
        ================================================= */}

        <div className="sa-bill-list">

          {visibleApartments.map((apt) => {

            const filteredBills =
              getFilteredBills(apt.id);

            const currentPage =
              currentPages[apt.id] || 1;

            const totalPages =
              Math.ceil(
                filteredBills.length /
                  rowsPerPage
              );

            const safeCurrentPage =
              totalPages > 0
                ? Math.min(
                    currentPage,
                    totalPages
                  )
                : 1;

            const startIndex =
              (safeCurrentPage - 1) *
              rowsPerPage;

            const currentBills =
              filteredBills.slice(
                startIndex,
                startIndex + rowsPerPage
              );

            const communityName =
              getCommunityName(apt);

            return (
              <div
                key={apt.id}
                className="sa-apartment-card"
              >

                {/* APARTMENT HEADER */}

                <div className="sa-apartment-header">

                  <div className="sa-apartment-info">

                    <div className="sa-apartment-icon">
                      🏢
                    </div>

                    <div>

                      <h3>
                        {apt.name}
                      </h3>

                      <p>
                        <span>
                          📍
                        </span>

                        {communityName}
                      </p>

                    </div>

                  </div>


                  <div className="sa-apartment-bill-count">
                    {filteredBills.length}{' '}
                    {filteredBills.length === 1
                      ? 'Bill'
                      : 'Bills'}
                  </div>

                </div>


                {/* TABLE */}

                <div className="sa-billing-table-wrapper">

                  <table className="sa-billing-table">

                    <thead>

                      <tr>
                        <th>
                          BILL
                        </th>

                        <th>
                          RESIDENT / FLAT
                        </th>

                        <th>
                          BILLING MONTH
                        </th>

                        <th>
                          CONSUMPTION
                        </th>

                        <th>
                          AMOUNT
                        </th>

                        <th>
                          STATUS
                        </th>

                        <th>
                          ACTION
                        </th>
                      </tr>

                    </thead>


                    <tbody>

                      {filteredBills.length === 0 ? (

                        <tr>

                          <td
                            colSpan={7}
                            className="sa-table-empty"
                          >

                            <div className="sa-no-bills">

                              <div>
                                🧾
                              </div>

                              <strong>
                                No bills found
                              </strong>

                              <span>
                                {billFilter === 'PAID'
                                  ? 'There are no paid bills for this apartment.'
                                  : billFilter === 'UNPAID'
                                  ? 'There are no unpaid bills for this apartment.'
                                  : 'No bills have been generated yet.'}
                              </span>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        currentBills.map((bill) => {

                          const household =
                            getHousehold(bill);

                          const isPaid =
                            bill.status === 'PAID';

                          return (
                            <tr
                              key={bill.id}
                              className="sa-bill-row"
                            >

                              {/* BILL */}

                              <td>

                                <div className="sa-bill-id">

                                  <div className="sa-bill-document">
                                    🧾
                                  </div>

                                  <div>

                                    <strong>
                                      {bill.billNumber ||
                                        `WTR-${String(
                                          bill.id
                                        ).padStart(
                                          6,
                                          '0'
                                        )}`}
                                    </strong>

                                    <small>
                                      ID #{bill.id}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              {/* RESIDENT / FLAT */}

                              <td>

                                <div className="sa-resident-cell">

                                  <div className="sa-resident-avatar">
                                    {getResidentName(
                                      household
                                    )
                                      .charAt(0)
                                      .toUpperCase() ||
                                      'R'}
                                  </div>

                                  <div>

                                    <strong>
                                      {getResidentName(
                                        household
                                      )}
                                    </strong>

                                    <small>
                                      Flat{' '}
                                      {getFlatNumber(
                                        household
                                      )}
                                    </small>

                                  </div>

                                </div>

                              </td>


                              {/* BILLING MONTH */}

                              <td>

                                <div className="sa-month-cell">

                                  <strong>
                                    {bill.billingMonth ||
                                      '-'}
                                  </strong>

                                  <small>
                                    Generated Bill
                                  </small>

                                </div>

                              </td>


                              {/* CONSUMPTION */}

                              <td>

                                <div className="sa-consumption-cell">

                                  <span className="sa-water-icon">
                                    💧
                                  </span>

                                  <strong>
                                    {formatConsumption(
                                      bill.consumption
                                    )}
                                  </strong>

                                  <small>
                                    units
                                  </small>

                                </div>

                              </td>


                              {/* AMOUNT */}

                              <td>

                                <strong className="sa-amount">
                                  ₹
                                  {formatAmount(
                                    bill.amount
                                  )}
                                </strong>

                              </td>


                              {/* STATUS */}

                              <td>

                                <span
                                  className={`sa-status ${
                                    isPaid
                                      ? 'paid'
                                      : 'pending'
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

                                <button
                                  type="button"
                                  className="sa-view-bill-btn"
                                  onClick={() =>
                                    openBillModal(
                                      bill,
                                      apt
                                    )
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
                        })

                      )}

                    </tbody>

                  </table>

                </div>


                {/* PAGINATION */}

                {totalPages > 1 && (

                  <div className="sa-pagination">

                    <button
                      type="button"
                      disabled={
                        safeCurrentPage === 1
                      }
                      onClick={() =>
                        changePage(
                          apt.id,
                          safeCurrentPage - 1
                        )
                      }
                    >
                      ← Previous
                    </button>


                    <div className="sa-page-numbers">

                      {Array.from(
                        {
                          length: totalPages
                        },
                        (_, index) =>
                          index + 1
                      ).map((page) => (

                        <button
                          key={page}
                          type="button"
                          className={
                            safeCurrentPage === page
                              ? 'active'
                              : ''
                          }
                          onClick={() =>
                            changePage(
                              apt.id,
                              page
                            )
                          }
                        >
                          {page}
                        </button>

                      ))}

                    </div>


                    <button
                      type="button"
                      disabled={
                        safeCurrentPage ===
                        totalPages
                      }
                      onClick={() =>
                        changePage(
                          apt.id,
                          safeCurrentPage + 1
                        )
                      }
                    >
                      Next →
                    </button>

                  </div>

                )}


                {filteredBills.length > 0 && (

                  <div className="sa-pagination-info">

                    Showing{' '}
                    <strong>
                      {startIndex + 1}
                    </strong>
                    –
                    <strong>
                      {Math.min(
                        startIndex +
                          rowsPerPage,
                        filteredBills.length
                      )}
                    </strong>{' '}
                    of{' '}
                    <strong>
                      {filteredBills.length}
                    </strong>{' '}
                    bills

                  </div>

                )}

              </div>
            );
          })}


          {/* NO APARTMENTS */}

          {visibleApartments.length === 0 && (

            <div className="sa-empty-apartments">

              <div className="sa-empty-building">
                🏢
              </div>

              <h3>
                No apartments available
              </h3>

              <p>
                There are no apartments available
                for billing.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          BILL DETAILS MODAL
      ===================================================== */}

      {selectedBill && (

        <div
          className="sa-bill-modal-overlay"
          onClick={closeBillModal}
        >

          <div
            className="sa-bill-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="sa-modal-header">

              <div className="sa-modal-title-area">

                <div className="sa-modal-document-icon">
                  🧾
                </div>

                <div>

                  <span>
                    WATER BILL
                  </span>

                  <h2>
                    Bill Details
                  </h2>

                  <p>
                    Bill #
                    {selectedBill.bill.billNumber ||
                      selectedBill.bill.id}
                  </p>

                </div>

              </div>


              <button
                type="button"
                className="sa-modal-close"
                onClick={closeBillModal}
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* STATUS STRIP */}

            <div className="sa-modal-status-strip">

              <div>

                <span className="sa-modal-status-label">
                  PAYMENT STATUS
                </span>

                <span
                  className={`sa-modal-status ${
                    selectedBill.bill.status ===
                    'PAID'
                      ? 'paid'
                      : 'pending'
                  }`}
                >
                  {selectedBill.bill.status ===
                  'PAID'
                    ? '✓ PAID'
                    : '● PENDING'}
                </span>

              </div>

              <div className="sa-modal-bill-id">
                Bill ID #{selectedBill.bill.id}
              </div>

            </div>


            {/* PROPERTY */}

            <div className="sa-modal-section">

              <div className="sa-modal-section-title">

                <span>
                  🏢
                </span>

                <div>
                  <h3>
                    Property Details
                  </h3>

                  <p>
                    Apartment and community information
                  </p>
                </div>

              </div>


              <div className="sa-detail-grid">

                <div className="sa-detail-card">

                  <span>
                    Community
                  </span>

                  <strong>
                    {getCommunityName(
                      selectedBill.apartment
                    )}
                  </strong>

                </div>


                <div className="sa-detail-card">

                  <span>
                    Apartment
                  </span>

                  <strong>
                    {selectedBill.apartment?.name ||
                      '-'}
                  </strong>

                </div>

              </div>

            </div>


            {/* HOUSEHOLD */}

            <div className="sa-modal-section">

              <div className="sa-modal-section-title">

                <span>
                  👨‍👩‍👧
                </span>

                <div>
                  <h3>
                    Household Details
                  </h3>

                  <p>
                    Resident and household information
                  </p>
                </div>

              </div>


              <div className="sa-detail-grid">

                <div className="sa-detail-card">

                  <span>
                    Flat Number
                  </span>

                  <strong>
                    {getFlatNumber(
                      selectedBill.bill.household
                    )}
                  </strong>

                </div>


                <div className="sa-detail-card">

                  <span>
                    Household
                  </span>

                  <strong>
                    {getHouseholdName(
                      selectedBill.bill.household
                    )}
                  </strong>

                </div>


                <div className="sa-detail-card">

                  <span>
                    Resident
                  </span>

                  <strong>
                    {getResidentName(
                      selectedBill.bill.household
                    )}
                  </strong>

                </div>


                <div className="sa-detail-card">

                  <span>
                    Occupancy
                  </span>

                  <strong>
                    {getOccupancy(
                      selectedBill.bill.household
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* BILL INFORMATION */}

            <div className="sa-modal-section">

              <div className="sa-modal-section-title">

                <span>
                  💧
                </span>

                <div>
                  <h3>
                    Billing Information
                  </h3>

                  <p>
                    Consumption and payment breakdown
                  </p>
                </div>

              </div>


              <div className="sa-bill-summary">

                <div className="sa-summary-line">

                  <span>
                    Billing Month
                  </span>

                  <strong>
                    {selectedBill.bill
                      .billingMonth || '-'}
                  </strong>

                </div>


                <div className="sa-summary-line">

                  <span>
                    Water Consumption
                  </span>

                  <strong>
                    {formatConsumption(
                      selectedBill.bill
                        .consumption
                    )}{' '}
                    units
                  </strong>

                </div>


                <div className="sa-summary-line">

                  <span>
                    Bill Amount
                  </span>

                  <strong className="sa-modal-amount">
                    ₹
                    {formatAmount(
                      selectedBill.bill.amount
                    )}
                  </strong>

                </div>


                <div className="sa-summary-line">

                  <span>
                    Payment Status
                  </span>

                  <span
                    className={`sa-status ${
                      selectedBill.bill.status ===
                      'PAID'
                        ? 'paid'
                        : 'pending'
                    }`}
                  >
                    {selectedBill.bill.status ===
                    'PAID'
                      ? '✓ PAID'
                      : '● PENDING'}
                  </span>

                </div>

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div className="sa-modal-footer">

              {selectedBill.bill.status !==
              'PAID' ? (

                <button
                  type="button"
                  className="sa-modal-paid-btn"
                  onClick={
                    handleMarkBillPaid
                  }
                >
                  <span>
                    ✓
                  </span>

                  Mark Bill as Paid
                </button>

              ) : (

                <div className="sa-modal-paid-message">
                  <span>
                    ✓
                  </span>

                  This bill has already been paid.
                </div>

              )}


              <button
                type="button"
                className="sa-modal-close-btn"
                onClick={closeBillModal}
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
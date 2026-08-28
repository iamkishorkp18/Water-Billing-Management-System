import { useEffect, useMemo, useState } from 'react';
import { recordPayment } from "../../../Api/commercialApi";

function BillingCycleTab({ bills, setBills }) {

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchFlat, setSearchFlat] = useState('');

  const [payFormFor, setPayFormFor] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRemarks, setPayRemarks] = useState('');
  const [msg, setMsg] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedBill, setSelectedBill] = useState(null);

  const billsPerPage = 10;

  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (bill) => {

    if (!bill?.status) {
      return 'PENDING';
    }

    return bill.status.toUpperCase();
  };


  const getStatusClass = (status) => {

    switch (status) {

      case 'PAID':
        return 'bill-status bill-status-paid';

      case 'PARTIALLY_PAID':
        return 'bill-status bill-status-partial';

      case 'OVERDUE':
        return 'bill-status bill-status-overdue';

      case 'PENDING':
      default:
        return 'bill-status bill-status-pending';
    }
  };


  const getStatusIcon = (status) => {

    switch (status) {

      case 'PAID':
        return '✓';

      case 'PARTIALLY_PAID':
        return '◐';

      case 'OVERDUE':
        return '!';

      case 'PENDING':
      default:
        return '◷';
    }
  };


  // =========================================================
  // FILTER
  // =========================================================

  const filtered = useMemo(() => {

    return bills.filter(b => {

      const status = getStatus(b);

      const matchesStatus =
        statusFilter === 'ALL' ||
        status === statusFilter;

      const flat =
        b.household?.flatNumber || '';

      const matchesFlat =
        !searchFlat ||
        flat
          .toLowerCase()
          .includes(searchFlat.toLowerCase());

      return matchesStatus && matchesFlat;

    });

  }, [bills, statusFilter, searchFlat]);


  // =========================================================
  // RESET PAGE
  // =========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchFlat]);


  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(
    filtered.length / billsPerPage
  );

  const startIndex =
    (currentPage - 1) * billsPerPage;

  const endIndex =
    startIndex + billsPerPage;

  const currentBills =
    filtered.slice(startIndex, endIndex);


  // =========================================================
  // PAYMENT
  // =========================================================

  const handlePay = async (e, bill) => {

    e.preventDefault();

    try {

      const res = await recordPayment({
        billId: bill.id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        remarks: payRemarks
      });

      setBills(prev =>
        prev.map(b =>
          b.id === bill.id
            ? {
                ...b,
                status: res.data.status
              }
            : b
        )
      );

      // Update opened bill also
      setSelectedBill(prev =>
        prev && prev.id === bill.id
          ? {
              ...prev,
              status: res.data.status
            }
          : prev
      );

      setPayFormFor(null);
      setPayAmount('');
      setPayRemarks('');
      setMsg('');

    } catch (err) {

      setMsg(
        err.response?.data?.message ||
        'Failed to record payment.'
      );
    }
  };


  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const changePage = page => {

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);
    setPayFormFor(null);
  };


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

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


  // =========================================================
  // OPEN BILL
  // =========================================================

  const openBill = (bill) => {

    setSelectedBill(bill);

    // close payment form
    setPayFormFor(null);

  };


  // =========================================================
  // CLOSE BILL
  // =========================================================

  const closeBill = () => {
    setSelectedBill(null);
  };


  // =========================================================
  // BILL NUMBER
  // =========================================================

  const getBillNumber = (bill) => {

    return (
      bill.billNumber ||
      bill.invoiceNumber ||
      `WTR-${String(bill.id).padStart(6, '0')}`
    );
  };


  // =========================================================
  // RESIDENT NAME
  // =========================================================

  const getResidentName = (bill) => {

    return (
      bill.residentName ||
      bill.household?.residentName ||
      bill.household?.name ||
      bill.user?.fullName ||
      bill.resident?.fullName ||
      'Resident'
    );
  };


  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return '-';
    }

    try {

      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );

    } catch {

      return date;
    }
  };


  // =========================================================
  // SUMMARY
  // =========================================================

 const summary = useMemo(() => {
  let total = 0;
  let paid = 0;
  let pending = 0;
  let overdue = 0;

  bills.forEach(bill => {
    // ✅ force all amounts to positive
    const amount = Math.abs(Number(bill.amount || 0));
    total += amount;

    if (String(bill.status || '').toUpperCase() === 'PAID') {
      paid += amount;
    } else {
      pending += amount;
    }

    // Example: mark overdue if dueDate < today
    if (bill.dueDate && new Date(bill.dueDate) < new Date() && bill.status !== 'PAID') {
      overdue += amount;
    }
  });

  return { total, paid, pending, overdue };
}, [bills]);



  return (
    <div className="billing-page">

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="bill-summary-grid">

        <div className="bill-summary-card bill-summary-total">

          <div className="bill-summary-icon">
            🧾
          </div>

          <div>
            <div className="bill-summary-label">
              Total Bills
            </div>

            <div className="bill-summary-value">
              {bills.length}
            </div>
          </div>

        </div>


        <div className="bill-summary-card bill-summary-paid">

          <div className="bill-summary-icon">
            ✓
          </div>

          <div>
            <div className="bill-summary-label">
              Paid Bills
            </div>

            <div className="bill-summary-value">
              {summary.paid}
            </div>
          </div>

        </div>


        <div className="bill-summary-card bill-summary-pending">

          <div className="bill-summary-icon">
            ◷
          </div>

          <div>
            <div className="bill-summary-label">
              Pending Bills
            </div>

            <div className="bill-summary-value">
              {summary.pending}
            </div>
          </div>

        </div>


        <div className="bill-summary-card bill-summary-money">

          <div className="bill-summary-icon">
            ₹
          </div>

          <div>
            <div className="bill-summary-label">
              Total Billing Amount
            </div>

            <div className="bill-summary-value">
              ₹{summary.total.toFixed(2)}
            </div>
          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN BILL SECTION
      ===================================================== */}

      <div className="dash-section billing-section">

        <div className="billing-header">

          <div>

            <div className="billing-title-row">

              <div className="billing-title-icon">
                💧
              </div>

              <div>

                <h2>
                  Water Bills
                </h2>

                <p>
                  Manage, view and record apartment water bills
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            MESSAGE
        =================================================== */}

        {msg && (

          <div className="billing-message">
            ⚠️ {msg}
          </div>

        )}


        {/* ===================================================
            FILTER BAR
        =================================================== */}

        <div className="billing-filter-bar">

          <div className="billing-search">

            <span>
              🔍
            </span>

            <input
              placeholder="Search by flat number..."
              value={searchFlat}
              onChange={e =>
                setSearchFlat(e.target.value)
              }
            />

          </div>


          <select
            className="billing-status-filter"
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Statuses
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="PARTIALLY_PAID">
              Partially Paid
            </option>

            <option value="OVERDUE">
              Overdue
            </option>

          </select>

        </div>


        {/* ===================================================
            BILL TABLE
        =================================================== */}

        <div className="bill-table-wrapper">

          <table className="data-table bill-table">

            <thead>

              <tr>

                <th>
                  Bill
                </th>

                <th>
                  Resident / Flat
                </th>

                <th>
                  Billing Month
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

              {currentBills.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="empty-state"
                  >

                    <div className="no-bills-box">

                      <div className="no-bills-icon">
                        🧾
                      </div>

                      <h3>
                        No bills found
                      </h3>

                      <p>
                        Try changing the search or status filter.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                currentBills.map(b => {

                  const status =
                    getStatus(b);

                  return (

                    <tr
                      key={b.id}
                      className="bill-row"
                    >

                      {/* BILL NUMBER */}

                      <td>

                        <div className="bill-number-box">

                          <div className="bill-mini-icon">
                            🧾
                          </div>

                          <div>

                            <strong>
                              {getBillNumber(b)}
                            </strong>

                            <small>
                              ID #{b.id}
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* RESIDENT */}

                      <td>

                        <div className="resident-cell">

                          <div className="resident-avatar">
                            {getResidentName(b)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {getResidentName(b)}
                            </strong>

                            <span>
                              Flat {b.household?.flatNumber || '-'}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* MONTH */}

                      <td>

                        <div className="month-cell">

                          <strong>
                            {b.billingMonth || '-'}
                          </strong>

                          {b.generatedDate && (

                            <small>
                              Generated {formatDate(b.generatedDate)}
                            </small>

                          )}

                        </div>

                      </td>


                      {/* CONSUMPTION */}

                      <td>

                        <div className="consumption-cell">

                          <span className="water-drop">
                            💧
                          </span>

                          <strong>
                            {Number(
                              b.consumption || 0
                            ).toFixed(2)}
                          </strong>

                          <small>
                            units
                          </small>

                        </div>

                      </td>


                      {/* AMOUNT */}

                      <td>

                        <div className="amount-cell">

                          ₹
                          {Number(
                            b.amount || 0
                          ).toFixed(2)}

                        </div>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={getStatusClass(status)}
                        >

                          <span>
                            {getStatusIcon(status)}
                          </span>

                          {status.replaceAll('_', ' ')}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="bill-actions">

                          <button
                            className="bill-view-btn"
                            onClick={() =>
                              openBill(b)
                            }
                          >
                            👁 View Bill
                          </button>


                          {status !== 'PAID' && (

                            <button
                              className="bill-pay-btn"
                              onClick={() => {

                                setPayFormFor(
                                  payFormFor === b.id
                                    ? null
                                    : b.id
                                );

                                setPayAmount(
                                  b.amount
                                );

                              }}
                            >

                              💳
                              {payFormFor === b.id
                                ? 'Cancel'
                                : 'Record Payment'}

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>


        {/* ===================================================
            PAGINATION
        =================================================== */}

        {filtered.length > 0 && (

          <div className="billing-pagination">

            <div>

              Showing{' '}

              <strong>
                {startIndex + 1}
              </strong>

              {' – '}

              <strong>
                {Math.min(
                  endIndex,
                  filtered.length
                )}
              </strong>

              {' of '}

              <strong>
                {filtered.length}
              </strong>

              {' bills'}

            </div>


            <div className="page-buttons">

              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() =>
                  changePage(currentPage - 1)
                }
              >
                ←
              </button>


              {getPageNumbers().map(page => (

                <button
                  key={page}
                  className={`page-btn ${
                    currentPage === page
                      ? 'page-btn-active'
                      : ''
                  }`}
                  onClick={() =>
                    changePage(page)
                  }
                >
                  {page}
                </button>

              ))}


              <button
                className="page-btn"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  changePage(currentPage + 1)
                }
              >
                →
              </button>

            </div>

          </div>

        )}


        {/* ===================================================
            PAYMENT FORM
        =================================================== */}

        {payFormFor && (() => {

          const bill =
            bills.find(
              b => b.id === payFormFor
            );

          if (!bill) {
            return null;
          }

          return (

            <form
              onSubmit={e =>
                handlePay(e, bill)
              }
              className="billing-payment-panel"
            >

              <div>

                <h3>
                  💳 Record Payment
                </h3>

                <p>
                  {getBillNumber(bill)}
                  {' • '}
                  Flat {bill.household?.flatNumber || '-'}
                </p>

              </div>


              <input
                type="number"
                value={payAmount}
                onChange={e =>
                  setPayAmount(e.target.value)
                }
                placeholder="Amount"
                required
              />


              <select
                value={payMethod}
                onChange={e =>
                  setPayMethod(e.target.value)
                }
              >

                <option value="CASH">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="CARD">
                  Card
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>

              </select>


              <input
                placeholder="Payment remarks"
                value={payRemarks}
                onChange={e =>
                  setPayRemarks(e.target.value)
                }
              />


              <button
                type="submit"
                className="confirm-payment-btn"
              >
                ✓ Confirm Payment
              </button>

            </form>

          );

        })()}

      </div>


      {/* =====================================================
          BILL VIEW MODAL
      ===================================================== */}

      {selectedBill && (

        <div
          className="bill-modal-overlay"
          onClick={closeBill}
        >

          <div
            className="real-bill-card"
            onClick={e =>
              e.stopPropagation()
            }
          >

            {/* BILL HEADER */}

            <div className="real-bill-header">

              <div>

                <div className="bill-brand">
                  💧 AquaLedger
                </div>

                <div className="bill-heading">
                  WATER BILL
                </div>

              </div>


              <button
                className="bill-close-btn"
                onClick={closeBill}
              >
                ×
              </button>

            </div>


            {/* STATUS */}

            <div className="bill-status-banner">

              <div>

                <small>
                  BILL STATUS
                </small>

                <strong>
                  {getStatus(selectedBill)
                    .replaceAll('_', ' ')}
                </strong>

              </div>

              <span
                className={getStatusClass(
                  getStatus(selectedBill)
                )}
              >
                {getStatusIcon(
                  getStatus(selectedBill)
                )}
                {getStatus(selectedBill)
                  .replaceAll('_', ' ')}
              </span>

            </div>


            {/* BILL INFO */}

            <div className="real-bill-info-grid">

              <div>
                <small>
                  Bill Number
                </small>

                <strong>
                  {getBillNumber(selectedBill)}
                </strong>
              </div>


              <div>
                <small>
                  Bill ID
                </small>

                <strong>
                  #{selectedBill.id}
                </strong>
              </div>


              <div>
                <small>
                  Billing Month
                </small>

                <strong>
                  {selectedBill.billingMonth || '-'}
                </strong>
              </div>


              <div>
                <small>
                  Generated Date
                </small>

                <strong>
                  {formatDate(
                    selectedBill.generatedDate
                  )}
                </strong>
              </div>

            </div>


            {/* RESIDENT DETAILS */}

            <div className="bill-detail-section">

              <div className="bill-detail-title">
                👤 Resident Details
              </div>

              <div className="resident-detail-card">

                <div className="large-resident-avatar">
                  {getResidentName(selectedBill)
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3>
                    {getResidentName(selectedBill)}
                  </h3>

                  <p>
                    Flat Number:{' '}
                    <strong>
                      {selectedBill.household?.flatNumber || '-'}
                    </strong>
                  </p>

                  <p>
                    Flat Size:{' '}
                    <strong>
                      {selectedBill.household?.flatSize || '-'}
                    </strong>
                  </p>

                  <p>
                    Occupancy:{' '}
                    <strong>
                      {selectedBill.household?.occupancy || '-'}
                    </strong>
                  </p>

                </div>

              </div>

            </div>


            {/* METER READING */}

            <div className="bill-detail-section">

              <div className="bill-detail-title">
                💧 Water Consumption
              </div>

              <div className="meter-grid">

                <div className="meter-card">

                  <span>
                    Previous Reading
                  </span>

                  <strong>
                    {selectedBill.previousReading ??
                      selectedBill.previousMeterReading ??
                      '-'}
                  </strong>

                  <small>
                    units
                  </small>

                </div>


                <div className="meter-arrow">
                  →
                </div>


                <div className="meter-card">

                  <span>
                    Current Reading
                  </span>

                  <strong>
                    {selectedBill.currentReading ??
                      selectedBill.currentMeterReading ??
                      '-'}
                  </strong>

                  <small>
                    units
                  </small>

                </div>


                <div className="meter-card meter-consumption">

                  <span>
                    Total Consumption
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


            {/* MONEY */}

            <div className="bill-payment-summary">

              <div>

                <span>
                  Water Consumption
                </span>

                <strong>
                  {Number(
                    selectedBill.consumption || 0
                  ).toFixed(2)} units
                </strong>

              </div>


              <div>

                <span>
                  Bill Amount
                </span>

                <strong className="bill-total-money">
                  ₹
                  {Number(
                    selectedBill.amount || 0
                  ).toFixed(2)}
                </strong>

              </div>

            </div>


            {/* DUE DATE */}

            <div className="bill-due-section">

              <div>
                📅
              </div>

              <div>

                <small>
                  Due Date
                </small>

                <strong>
                  {formatDate(
                    selectedBill.dueDate
                  )}
                </strong>

              </div>

            </div>


            {/* FOOTER */}

            <div className="real-bill-footer">

              <span>
                AquaLedger Water Billing System
              </span>

              <span>
                Thank you
              </span>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default BillingCycleTab;
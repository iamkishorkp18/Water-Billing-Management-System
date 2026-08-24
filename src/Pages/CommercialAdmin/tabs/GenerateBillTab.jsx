import { useEffect, useState } from 'react';

import {
  logMeterReading,
  generateBill,
  getUsageForHousehold,
  getBillsForHousehold
} from '../../../Api/commercialApi';

function GenerateBillTab({ households, onBillGenerated }) {
  const [household, setHousehold] = useState('');
  const [date, setDate] = useState('');
  const [reading, setReading] = useState('');
  const [usage, setUsage] = useState([]);
  const [bills, setBills] = useState([]);
  const [month, setMonth] = useState('');
  const [billFilter, setBillFilter] = useState('ALL');

  const [readPage, setReadPage] = useState(1);
  const [billPage, setBillPage] = useState(1);

  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const PER_PAGE = 5;

  // =========================================================
  // LOAD HOUSEHOLD DATA
  // =========================================================

  const loadData = async id => {
    if (!id) {
      setUsage([]);
      setBills([]);
      return;
    }

    try {
      setLoading(true);
      setMsg('');

      const [u, b] = await Promise.all([
        getUsageForHousehold(Number(id)),
        getBillsForHousehold(Number(id))
      ]);

      setUsage(u.data || []);
      setBills(b.data || []);

      setReadPage(1);
      setBillPage(1);

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        'Failed to load household data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT HOUSEHOLD
  // =========================================================

  const selectHousehold = e => {
    const id = e.target.value;

    setHousehold(id);
    setMsg('');
    setSuccess('');
    setMonth('');

    loadData(id);
  };

  // =========================================================
  // SAVE METER READING
  // =========================================================

  const saveReading = async e => {
    e.preventDefault();

    if (!household) {
      setMsg('Please select a household first.');
      return;
    }

    try {
      setMsg('');
      setSuccess('');

      await logMeterReading({
        household: {
          id: Number(household)
        },
        readingDate: date,
        meterReading: Number(reading)
      });

      setDate('');
      setReading('');

      setSuccess(
        'Meter reading saved successfully.'
      );

      await loadData(household);

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        'Failed to save meter reading.'
      );
    }
  };

  // =========================================================
  // READING DATE
  // =========================================================

  const readingDate = r =>
    r.readingDate ||
    r.date ||
    r.createdDate ||
    '';

  // =========================================================
  // READING VALUE
  // =========================================================

  const readingValue = r =>
    r.meterReading ??
    r.reading ??
    r.currentReading ??
    '-';

  // =========================================================
  // BILL MONTH
  // =========================================================

  const billMonth = b =>
    b.billingMonth ||
    b.month ||
    '-';

  // =========================================================
  // ACTIVE BILLS
  // =========================================================

  const activeBills = bills.filter(
    b => !b.isDeleted
  );

  // =========================================================
  // CHECK WHETHER A READING EXISTS FOR MONTH
  // =========================================================

  const hasReadingForMonth = selectedMonth => {
    if (!selectedMonth) {
      return false;
    }

    return usage.some(r => {
      const dateValue = readingDate(r);

      if (!dateValue) {
        return false;
      }

      return dateValue.substring(0, 7) === selectedMonth;
    });
  };

  // =========================================================
  // GET READING FOR MONTH
  // =========================================================

  const getReadingForMonth = selectedMonth => {
    if (!selectedMonth) {
      return null;
    }

    return usage.find(r => {
      const dateValue = readingDate(r);

      if (!dateValue) {
        return false;
      }

      return dateValue.substring(0, 7) === selectedMonth;
    });
  };

  // =========================================================
  // GET PREVIOUS MONTH
  // =========================================================

  const getPreviousMonth = selectedMonth => {
    if (!selectedMonth) {
      return '';
    }

    const [year, monthNumber] =
      selectedMonth.split('-').map(Number);

    const date = new Date(
      year,
      monthNumber - 2,
      1
    );

    const previousYear =
      date.getFullYear();

    const previousMonth =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    return `${previousYear}-${previousMonth}`;
  };

  // =========================================================
  // CHECK BOTH READINGS
  // =========================================================

  const getBillEligibility = selectedMonth => {
    if (!selectedMonth) {
      return {
        allowed: false,
        message: 'Please select a billing month.'
      };
    }

    const currentReading =
      getReadingForMonth(selectedMonth);

    if (!currentReading) {
      return {
        allowed: false,
        message:
          `No meter reading found for ${selectedMonth}. ` +
          `Please add the meter reading first.`
      };
    }

    const previousMonth =
      getPreviousMonth(selectedMonth);

    const previousReading =
      getReadingForMonth(previousMonth);

    if (!previousReading) {
      return {
        allowed: false,
        message:
          `Meter reading for ${previousMonth} is required ` +
          `to calculate ${selectedMonth} consumption.`
      };
    }

    return {
      allowed: true,
      message:
        `Readings available for ${previousMonth} and ${selectedMonth}.`
    };
  };

  // =========================================================
  // CHECK IF BILL ALREADY EXISTS
  // =========================================================

  const billExists = monthValue =>
    activeBills.some(
      b => billMonth(b) === monthValue
    );

  // =========================================================
  // GENERATE BILL
  // =========================================================

  const generate = async selectedMonth => {
    if (!selectedMonth) {
      setMsg(
        'Please select a billing month.'
      );
      return;
    }

    // -------------------------------------------------------
    // IMPORTANT VALIDATION
    // -------------------------------------------------------

    const eligibility =
      getBillEligibility(selectedMonth);

    if (!eligibility.allowed) {
      setMsg(eligibility.message);
      setSuccess('');
      return;
    }

    // -------------------------------------------------------
    // PREVENT DUPLICATE BILL
    // -------------------------------------------------------

    if (billExists(selectedMonth)) {
      setMsg(
        `A bill for ${selectedMonth} has already been generated.`
      );
      setSuccess('');
      return;
    }

    try {
      setMsg('');
      setSuccess('');

      const res = await generateBill(
        Number(household),
        selectedMonth
      );

      setSuccess(
        `Bill generated successfully: ₹${res.data.amount}`
      );

      setMonth('');

      await loadData(household);

      if (onBillGenerated) {
        onBillGenerated();
      }

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        'Failed to generate bill.'
      );
    }
  };

  // =========================================================
  // SELECTED MONTH ELIGIBILITY
  // =========================================================

  const eligibility =
    getBillEligibility(month);

  // =========================================================
  // ACTIVE BILLS FILTER
  // =========================================================

  const filteredBills =
    billFilter === 'ALL'
      ? activeBills
      : activeBills.filter(
          b => b.status === billFilter
        );

  // =========================================================
  // PAGINATION
  // =========================================================

  const readPages =
    Math.ceil(
      usage.length / PER_PAGE
    ) || 1;

  const billPages =
    Math.ceil(
      filteredBills.length / PER_PAGE
    ) || 1;

  const visibleReadings =
    usage.slice(
      (readPage - 1) * PER_PAGE,
      readPage * PER_PAGE
    );

  const visibleBills =
    filteredBills.slice(
      (billPage - 1) * PER_PAGE,
      billPage * PER_PAGE
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="dash-section meter-bill-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dash-section-head">

        <div>

          <h2>
            💧 Meter Readings & Billing
          </h2>

          <p className="section-subtitle">
            Save readings and generate bills for each household.
          </p>

        </div>

      </div>


      {/* =====================================================
          HOUSEHOLD
      ===================================================== */}

      <div className="household-select-box">

        <label>
          🏠 Select Household
        </label>

        <select
          value={household}
          onChange={selectHousehold}
        >

          <option value="">
            Choose Household
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


      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {msg && (
        <div className="banner banner-error">
          ⚠️ {msg}
        </div>
      )}

      {success && (
        <div className="banner banner-success">
          ✅ {success}
        </div>
      )}


      {/* =====================================================
          NO HOUSEHOLD
      ===================================================== */}

      {!household ? (

        <div className="empty-reading">

          🏠

          <h3>
            Select a household
          </h3>

          <p>
            Select a household to view readings and bills.
          </p>

        </div>

      ) : loading ? (

        <div className="empty-reading">
          Loading household data...
        </div>

      ) : (

        <>

          {/* =================================================
              SAVE READING
          ================================================= */}

          <div className="reading-form-card">

            <div className="card-title">

              <span>
                📟
              </span>

              <div>

                <h3>
                  Save Meter Reading
                </h3>

                <p>
                  Record the latest meter reading.
                </p>

              </div>

            </div>


            <form
              onSubmit={saveReading}
              className="reading-form"
            >

              <div>

                <label>
                  Reading Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={e =>
                    setDate(e.target.value)
                  }
                  required
                />

              </div>


              <div>

                <label>
                  Meter Reading
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter reading"
                  value={reading}
                  onChange={e =>
                    setReading(e.target.value)
                  }
                  required
                />

              </div>


              <button
                className="btn btn-fill"
              >
                💾 Save Reading
              </button>

            </form>

          </div>


          {/* =================================================
              SAVED READINGS
          ================================================= */}

          <div className="dash-section inner-section">

            <div className="dash-section-head">

              <div>

                <h2>
                  📊 Saved Meter Readings
                </h2>

                <span className="chart-subtitle">
                  Previous readings for selected household
                </span>

              </div>

              <span className="count-badge">
                {usage.length} Readings
              </span>

            </div>


            {!usage.length ? (

              <div className="empty-small">
                No meter readings saved yet.
              </div>

            ) : (

              <>

                <div className="reading-list">

                  {visibleReadings.map((r, i) => {

                    const dateValue =
                      readingDate(r);

                    const monthValue =
                      dateValue
                        ? dateValue.substring(0, 7)
                        : '';

                    const generated =
                      billExists(monthValue);

                    const previousMonth =
                      getPreviousMonth(
                        monthValue
                      );

                    const previousExists =
                      hasReadingForMonth(
                        previousMonth
                      );

                    const canGenerate =
                      !generated &&
                      hasReadingForMonth(
                        monthValue
                      ) &&
                      previousExists;

                    return (

                      <div
                        className="reading-row"
                        key={r.id || i}
                      >

                        <div className="reading-icon">
                          📟
                        </div>


                        <div className="reading-info">

                          <strong>
                            {readingValue(r)}
                          </strong>

                          <span>
                            Reading: {dateValue}
                          </span>

                        </div>


                        {/* =========================
                            BILL STATUS
                        ========================= */}

                        {generated ? (

                          <span className="generated-badge">
                            ✓ BILL GENERATED
                          </span>

                        ) : canGenerate ? (

                          <button
                            type="button"
                            className="generate-small"
                            onClick={() =>
                              generate(monthValue)
                            }
                          >
                            🧾 Generate Bill
                          </button>

                        ) : (

                          <span className="reading-required-badge">
                            ⚠️ Previous Reading Required
                          </span>

                        )}

                      </div>

                    );

                  })}

                </div>


                <Pagination
                  page={readPage}
                  pages={readPages}
                  setPage={setReadPage}
                />

              </>

            )}

          </div>


          {/* =================================================
              GENERATED BILLS
          ================================================= */}

          <div className="dash-section inner-section">

            <div className="dash-section-head">

              <div>

                <h2>
                  🧾 Generated Bills
                </h2>

                <span className="chart-subtitle">
                  Paid and pending bills
                </span>

              </div>

              <span className="count-badge">
                {filteredBills.length} Bills
              </span>

            </div>


            {/* BILL FILTER */}

            <div className="bill-filter">

              <label>
                Filter Bills
              </label>

              <select
                value={billFilter}
                onChange={e => {

                  setBillFilter(
                    e.target.value
                  );

                  setBillPage(1);

                }}
              >

                <option value="ALL">
                  All Bills
                </option>

                <option value="PAID">
                  Paid Bills
                </option>

                <option value="PENDING">
                  Pending Bills
                </option>

                <option value="PARTIALLY_PAID">
                  Partially Paid Bills
                </option>

                <option value="OVERDUE">
                  Overdue Bills
                </option>

              </select>

            </div>


            {!filteredBills.length ? (

              <div className="empty-small">

                No{' '}

                {billFilter === 'ALL'
                  ? ''
                  : billFilter.toLowerCase() + ' '}

                bills available.

              </div>

            ) : (

              <>

                <div className="bill-list">

                  {visibleBills.map((b, i) => (

                    <div
                      className="bill-row"
                      key={b.id || i}
                    >

                      <div className="bill-icon">
                        🧾
                      </div>


                      <div className="bill-info">

                        <strong>
                          {billMonth(b)}
                        </strong>

                        <span>
                          Consumption:{' '}
                          {b.consumption ?? '-'}
                        </span>

                      </div>


                      <div className="bill-amount">
                        ₹{b.amount ?? 0}
                      </div>


                      <span
                        className={`bill-status ${
                          b.status === 'PAID'
                            ? 'paid'
                            : b.status === 'OVERDUE'
                            ? 'overdue'
                            : 'pending'
                        }`}
                      >

                        {b.status === 'PAID'
                          ? '✓ PAID'
                          : b.status === 'OVERDUE'
                          ? '⚠ OVERDUE'
                          : b.status === 'PARTIALLY_PAID'
                          ? '◐ PARTIALLY PAID'
                          : '● PENDING'}

                      </span>

                    </div>

                  ))}

                </div>


                <Pagination
                  page={billPage}
                  pages={billPages}
                  setPage={setBillPage}
                />

              </>

            )}

          </div>


          {/* =================================================
              MANUAL BILL GENERATION
          ================================================= */}

          <div className="manual-bill">

            <div>

              <h3>
                🧾 Generate Bill for Month
              </h3>

              <p>
                Select a month only after the required
                meter readings have been entered.
              </p>

            </div>


            <div className="manual-controls">

              <input
                type="month"
                value={month}
                onChange={e => {

                  setMonth(e.target.value);
                  setMsg('');
                  setSuccess('');

                }}
              />


              <button
                type="button"
                className="btn btn-fill"
                disabled={
                  !month ||
                  !eligibility.allowed ||
                  billExists(month)
                }
                onClick={() =>
                  generate(month)
                }
              >

                {billExists(month)
                  ? 'Bill Already Generated'
                  : !month
                  ? 'Select Month'
                  : !eligibility.allowed
                  ? 'Reading Required'
                  : 'Generate Bill'}

              </button>

            </div>

          </div>


          {/* =================================================
              SELECTED MONTH STATUS
          ================================================= */}

          {month && (

            <div
              className={
                eligibility.allowed
                  ? 'bill-validation success'
                  : 'bill-validation error'
              }
            >

              {eligibility.allowed
                ? `✅ ${eligibility.message}`
                : `⚠️ ${eligibility.message}`}

            </div>

          )}

        </>

      )}


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        .meter-bill-page{
          animation:fadeBill .4s ease;
        }

        @keyframes fadeBill{
          from{
            opacity:0;
            transform:translateY(10px);
          }

          to{
            opacity:1;
            transform:translateY(0);
          }
        }


        .section-subtitle{
          display:block;
          margin-top:5px;
          color:#64748b;
          font-size:13px;
        }


        .household-select-box{
          padding:20px;
          margin:18px 0;
          border-radius:14px;
          background:linear-gradient(
            135deg,
            #f0fdfa,
            #f8fafc
          );
          border:1px solid #ccfbf1;
        }


        .household-select-box label,
        .reading-form label,
        .bill-filter label{
          display:block;
          margin-bottom:7px;
          font-size:13px;
          font-weight:700;
          color:#334155;
        }


        .household-select-box select,
        .reading-form input,
        .manual-controls input,
        .bill-filter select{
          width:100%;
          padding:11px 13px;
          border:1px solid #cbd5e1;
          border-radius:9px;
          background:#fff;
          font-size:14px;
          outline:none;
        }


        .reading-form-card{
          padding:20px;
          margin-bottom:20px;
          border-radius:15px;
          background:#fff;
          border:1px solid #e2e8f0;
          box-shadow:
            0 5px 20px
            rgba(15,76,92,.06);
        }


        .card-title{
          display:flex;
          gap:12px;
          align-items:center;
          margin-bottom:18px;
        }


        .card-title>span,
        .reading-icon,
        .bill-icon{
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:10px;
          background:#e0f2fe;
          font-size:20px;
        }


        .card-title>span{
          width:42px;
          height:42px;
        }


        .card-title h3,
        .card-title p{
          margin:0;
        }


        .card-title h3{
          color:#0f4c5c;
        }


        .card-title p{
          color:#64748b;
          font-size:12px;
          margin-top:3px;
        }


        .reading-form{
          display:grid;
          grid-template-columns:
            1fr 1fr auto;
          gap:14px;
          align-items:end;
        }


        .inner-section{
          margin-top:20px;
        }


        .count-badge{
          padding:7px 13px;
          border-radius:20px;
          background:#eef7f8;
          color:#0f4c5c;
          font-size:12px;
          font-weight:700;
        }


        .reading-list,
        .bill-list{
          display:flex;
          flex-direction:column;
          gap:10px;
        }


        .reading-row,
        .bill-row{
          display:flex;
          align-items:center;
          gap:14px;
          padding:14px;
          border-radius:12px;
          border:1px solid #e2e8f0;
          background:#fff;
          transition:.2s;
        }


        .reading-row:hover,
        .bill-row:hover{
          transform:translateX(3px);
          box-shadow:
            0 7px 18px
            rgba(15,76,92,.08);
        }


        .reading-icon,
        .bill-icon{
          width:42px;
          height:42px;
          min-width:42px;
        }


        .reading-info,
        .bill-info{
          flex:1;
        }


        .reading-info strong,
        .bill-info strong{
          display:block;
          color:#0f172a;
          font-size:15px;
        }


        .reading-info span,
        .bill-info span{
          display:block;
          margin-top:4px;
          color:#64748b;
          font-size:12px;
        }


        .generate-small{
          border:0;
          border-radius:8px;
          padding:9px 12px;
          background:#0f4c5c;
          color:#fff;
          cursor:pointer;
          font-size:12px;
          font-weight:700;
        }


        .generate-small:hover{
          background:#0b3d4a;
          transform:translateY(-1px);
        }


        .generated-badge{
          padding:7px 10px;
          border-radius:8px;
          background:#dcfce7;
          color:#15803d;
          font-size:11px;
          font-weight:800;
        }


        .reading-required-badge{
          padding:7px 10px;
          border-radius:8px;
          background:#fef3c7;
          color:#b45309;
          font-size:11px;
          font-weight:800;
        }


        .bill-amount{
          font-weight:800;
          color:#0f4c5c;
          min-width:90px;
        }


        .bill-status{
          padding:7px 10px;
          border-radius:8px;
          font-size:11px;
          font-weight:800;
        }


        .bill-status.paid{
          background:#dcfce7;
          color:#15803d;
        }


        .bill-status.pending{
          background:#fef3c7;
          color:#b45309;
        }


        .bill-status.overdue{
          background:#fee2e2;
          color:#b91c1c;
        }


        .bill-filter{
          width:220px;
          margin:15px 0;
          padding:12px;
          border-radius:10px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
        }


        .pagination{
          display:flex;
          justify-content:center;
          align-items:center;
          gap:8px;
          margin-top:16px;
        }


        .pagination button{
          border:1px solid #cbd5e1;
          background:#fff;
          color:#0f4c5c;
          border-radius:7px;
          padding:6px 11px;
          cursor:pointer;
          font-weight:700;
        }


        .pagination button.active{
          background:#0f4c5c;
          color:#fff;
        }


        .pagination button:disabled{
          opacity:.45;
          cursor:not-allowed;
        }


        .manual-bill{
          margin-top:20px;
          padding:18px;
          display:flex;
          justify-content:space-between;
          gap:20px;
          align-items:center;
          border-radius:14px;
          background:linear-gradient(
            135deg,
            #f8fafc,
            #eef7f8
          );
          border:1px solid #dbeafe;
        }


        .manual-bill h3,
        .manual-bill p{
          margin:0;
        }


        .manual-bill h3{
          color:#0f4c5c;
          font-size:15px;
        }


        .manual-bill p{
          color:#64748b;
          font-size:12px;
          margin-top:4px;
        }


        .manual-controls{
          display:flex;
          gap:10px;
          min-width:300px;
        }


        .manual-controls button:disabled{
          opacity:.5;
          cursor:not-allowed;
        }


        .bill-validation{
          margin-top:12px;
          padding:12px 15px;
          border-radius:10px;
          font-size:13px;
          font-weight:600;
        }


        .bill-validation.success{
          background:#dcfce7;
          color:#166534;
          border:1px solid #bbf7d0;
        }


        .bill-validation.error{
          background:#fef3c7;
          color:#92400e;
          border:1px solid #fde68a;
        }


        .empty-reading,
        .empty-small{
          text-align:center;
          padding:35px 20px;
          color:#64748b;
        }


        .empty-reading{
          border-radius:14px;
          background:#f8fafc;
          margin-top:20px;
        }


        .empty-reading h3{
          color:#334155;
          margin:10px 0 5px;
        }


        @media(max-width:800px){

          .reading-form{
            grid-template-columns:1fr;
          }

          .reading-row,
          .bill-row,
          .manual-bill{
            flex-wrap:wrap;
          }

          .manual-controls{
            min-width:100%;
          }

          .bill-filter{
            width:100%;
          }

        }

      `}</style>

    </div>
  );
}


// =========================================================
// PAGINATION COMPONENT
// =========================================================

function Pagination({
  page,
  pages,
  setPage
}) {

  if (pages <= 1) {
    return null;
  }

  return (

    <div className="pagination">

      <button
        disabled={page === 1}
        onClick={() =>
          setPage(page - 1)
        }
      >
        ‹
      </button>


      {Array.from(
        { length: pages },
        (_, i) => i + 1
      ).map(p => (

        <button
          key={p}
          className={
            page === p
              ? 'active'
              : ''
          }
          onClick={() =>
            setPage(p)
          }
        >
          {p}
        </button>

      ))}


      <button
        disabled={page === pages}
        onClick={() =>
          setPage(page + 1)
        }
      >
        ›
      </button>

    </div>

  );
}


export default GenerateBillTab;
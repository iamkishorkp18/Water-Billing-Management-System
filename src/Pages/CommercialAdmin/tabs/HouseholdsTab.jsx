import { useMemo, useState } from 'react';

import {
  createHousehold,
  deleteHousehold,
  getUsageForHousehold,
  getBillsForHousehold
} from "../../../Api/commercialApi";

import ConfirmModal from "../../../components/ConfirmModal";


function HouseholdsTab({
  apartmentId,
  households,
  setHouseholds
}) {

  // =========================================================
  // FORM
  // =========================================================

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    flatNumber: '',
    flatSize: '',
    occupancy: ''
  });


  // =========================================================
  // UI STATES
  // =========================================================

  const [msg, setMsg] = useState('');

  const [search, setSearch] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const [saving, setSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;


  // =========================================================
  // VIEW HOUSEHOLD
  // =========================================================

  const [viewHousehold, setViewHousehold] = useState(null);

  const [viewLoading, setViewLoading] = useState(false);

  const [usageHistory, setUsageHistory] = useState([]);

  const [billHistory, setBillHistory] = useState([]);

  const [viewError, setViewError] = useState('');


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredHouseholds = useMemo(() => {

    const value = search.trim().toLowerCase();

    if (!value) {
      return households;
    }

    return households.filter(h =>
      String(h.flatNumber || '')
        .toLowerCase()
        .includes(value)
    );

  }, [households, search]);


  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredHouseholds.length / itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedHouseholds =
    filteredHouseholds.slice(
      startIndex,
      endIndex
    );


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
  };


  // =========================================================
  // SEARCH CHANGE
  // =========================================================

  const handleSearch = e => {

    setSearch(e.target.value);

    setCurrentPage(1);

  };


  // =========================================================
  // CREATE HOUSEHOLD
  // =========================================================

  const handleCreate = async e => {

    e.preventDefault();

    setMsg('');

    setSaving(true);

    try {

      const res = await createHousehold({

        apartment: {
          id: apartmentId
        },

        flatNumber:
          form.flatNumber.trim(),

        flatSize:
          form.flatSize.trim(),

        occupancy:
          form.occupancy
            ? Number(form.occupancy)
            : 0

      });


      setHouseholds(prev => [
        ...prev,
        res.data
      ]);


      setForm({
        flatNumber: '',
        flatSize: '',
        occupancy: ''
      });


      setShowForm(false);

      setCurrentPage(1);

    } catch (err) {

      console.error(err);

      setMsg(
        err.response?.data?.message ||
        'Failed to create household.'
      );

    } finally {

      setSaving(false);

    }
  };


  // =========================================================
  // DELETE HOUSEHOLD
  // =========================================================

  const handleDelete = async () => {

    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    setMsg('');

    try {

      await deleteHousehold(
        deleteTarget.id
      );


      setHouseholds(prev =>
        prev.filter(
          h =>
            h.id !== deleteTarget.id
        )
      );


      setDeleteTarget(null);


      const newLength =
        filteredHouseholds.length - 1;

      const newTotalPages =
        Math.max(
          1,
          Math.ceil(
            newLength /
            itemsPerPage
          )
        );


      if (
        currentPage >
        newTotalPages
      ) {

        setCurrentPage(
          newTotalPages
        );

      }

    } catch (err) {

      console.error(err);

      setMsg(
        err.response?.data?.message ||
        'Failed to delete household.'
      );

    } finally {

      setDeleting(false);

    }
  };


  // =========================================================
  // VIEW HOUSEHOLD
  // =========================================================

  const handleView = async household => {

    console.log(
      "Opening household:",
      household
    );

    setViewHousehold(household);

    setViewLoading(true);

    setViewError('');

    setUsageHistory([]);

    setBillHistory([]);


    try {

      const [
        usageResponse,
        billResponse
      ] = await Promise.all([

        getUsageForHousehold(
          household.id
        ),

        getBillsForHousehold(
          household.id
        )

      ]);


      console.log(
        "Usage response:",
        usageResponse.data
      );

      console.log(
        "Bill response:",
        billResponse.data
      );


      setUsageHistory(
        Array.isArray(
          usageResponse.data
        )
          ? usageResponse.data
          : []
      );


      setBillHistory(
        Array.isArray(
          billResponse.data
        )
          ? billResponse.data
          : []
      );


    } catch (err) {

      console.error(
        "Failed to load household history:",
        err
      );


      setViewError(
        err.response?.data?.message ||
        'Unable to load usage and bill history.'
      );

    } finally {

      setViewLoading(false);

    }
  };


  // =========================================================
  // CLOSE VIEW
  // =========================================================

  const closeView = () => {

    setViewHousehold(null);

    setUsageHistory([]);

    setBillHistory([]);

    setViewError('');

  };


  // =========================================================
  // MONTHLY USAGE
  // =========================================================

  const monthlyUsage = useMemo(() => {

    const map = {};

    usageHistory.forEach(item => {

      const readingDate =
        item.readingDate ||
        item.date ||
        item.recordedAt ||
        item.createdAt ||
        item.timestamp;


      if (!readingDate) {
        return;
      }


      const dateString =
        String(readingDate);


      let month =
        dateString.substring(
          0,
          7
        );


      /*
       * Try to handle date formats
       * such as DD-MM-YYYY
       */

      if (
        /^\d{2}-\d{2}-\d{4}$/.test(
          dateString
        )
      ) {

        const parts =
          dateString.split('-');

        month =
          `${parts[2]}-${parts[1]}`;

      }


      if (!/^\d{4}-\d{2}$/.test(month)) {
        return;
      }


      if (!map[month]) {

        map[month] = {
          month,
          usage: 0
        };

      }


      let usage =
        Number(
          item.consumption ??
          item.consumedUnits ??
          item.waterConsumed ??
          item.usage ??
          item.unitsConsumed ??
          item.consumed ??
          0
        );


      /*
       * If backend stores
       * previous/current meter readings
       */

      if (
        usage === 0 &&
        item.currentReading != null &&
        item.previousReading != null
      ) {

        usage =
          Number(
            item.currentReading
          ) -
          Number(
            item.previousReading
          );

      }


      if (usage > 0) {

        map[month].usage += usage;

      }

    });


    return Object.values(map)
      .sort(
        (a, b) =>
          b.month.localeCompare(
            a.month
          )
      )
      .map(item => ({
        ...item,

        usage:
          Number(
            item.usage.toFixed(2)
          )
      }));

  }, [usageHistory]);


  // =========================================================
  // MONTHLY BILL HISTORY
  // =========================================================

  const monthlyBills = useMemo(() => {

    const map = {};


    billHistory.forEach(bill => {

      const billingMonth =
        bill.billingMonth ||
        bill.billMonth ||
        bill.month ||
        bill.billingDate ||
        bill.billDate ||
        bill.createdAt;


      if (!billingMonth) {
        return;
      }


      const value =
        String(billingMonth);


      let month =
        value.substring(
          0,
          7
        );


      /*
       * Already YYYY-MM
       */

      if (
        /^\d{4}-\d{2}$/.test(
          value
        )
      ) {

        month = value;

      }


      if (!/^\d{4}-\d{2}$/.test(month)) {
        return;
      }


      if (!map[month]) {

        map[month] = {

          month,

          totalAmount: 0,

          paidAmount: 0,

          status: ''

        };

      }


      const amount =
        Number(
          bill.totalAmount ??
          bill.amount ??
          bill.totalBill ??
          bill.billAmount ??
          bill.totalCost ??
          bill.total ??
          bill.waterCharge ??
          0
        );


      const paid =
        Number(
          bill.paidAmount ??
          bill.amountPaid ??
          bill.paid ??
          0
        );


      map[month].totalAmount +=
        amount;


      map[month].paidAmount +=
        paid;


      if (bill.status) {

        map[month].status =
          bill.status;

      }

    });


    return Object.values(map)
      .sort(
        (a, b) =>
          b.month.localeCompare(
            a.month
          )
      )
      .map(item => ({

        ...item,

        totalAmount:
          Number(
            item.totalAmount.toFixed(2)
          ),

        paidAmount:
          Number(
            item.paidAmount.toFixed(2)
          )

      }));

  }, [billHistory]);


  // =========================================================
  // TOTAL USAGE
  // =========================================================

  const totalUsage = useMemo(() => {

    return monthlyUsage.reduce(
      (total, item) =>
        total +
        Number(
          item.usage || 0
        ),
      0
    );

  }, [monthlyUsage]);


  // =========================================================
  // TOTAL BILL
  // =========================================================

  const totalBill = useMemo(() => {

    return monthlyBills.reduce(
      (total, item) =>
        total +
        Number(
          item.totalAmount || 0
        ),
      0
    );

  }, [monthlyBills]);


  // =========================================================
  // TOTAL PAID
  // =========================================================

  const totalPaid = useMemo(() => {

    return monthlyBills.reduce(
      (total, item) =>
        total +
        Number(
          item.paidAmount || 0
        ),
      0
    );

  }, [monthlyBills]);


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  const pageNumbers = Array.from(
    {
      length: totalPages
    },
    (_, index) =>
      index + 1
  );


  // =========================================================
  // FORMAT MONTH
  // =========================================================

  const formatMonth = month => {

    if (!month) {
      return '-';
    }

    const parts =
      month.split('-');

    if (parts.length !== 2) {
      return month;
    }

    const year =
      Number(parts[0]);

    const monthNumber =
      Number(parts[1]);

    if (
      !year ||
      !monthNumber
    ) {
      return month;
    }

    const date =
      new Date(
        year,
        monthNumber - 1,
        1
      );

    return date.toLocaleDateString(
      'en-US',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  };


  // =========================================================
  // VIEW
  // =========================================================

  return (

    <div className="dash-section">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="dash-section-head"
        style={{
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >

        <div>

          <h2>
            Households
          </h2>

          <div
            style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '4px'
            }}
          >
            Manage apartment flats and
            occupancy details
          </div>

        </div>


        <button
          type="button"
          className="btn btn-fill"
          onClick={() => {

            setShowForm(
              !showForm
            );

            setMsg('');

          }}
        >

          {showForm
            ? '✕ Cancel'
            : '+ Add Household'}

        </button>

      </div>


      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {msg && (

        <div
          className="banner banner-error"
          style={{
            marginBottom: '15px'
          }}
        >
          {msg}
        </div>

      )}


      {/* =====================================================
          ADD FORM
      ===================================================== */}

      {showForm && (

        <form
          onSubmit={handleCreate}
          className="inline-form"
          style={{
            marginBottom: '24px',
            padding: '20px',
            borderRadius: '14px',
            background:
              'linear-gradient(135deg, #f0f9ff, #ffffff)',
            border:
              '1px solid #dbeafe'
          }}
        >

          <h3
            style={{
              marginTop: 0,
              marginBottom: '16px',
              color: '#0f4c5c'
            }}
          >
            🏠 Add New Household
          </h3>


          <div className="form-row-3">

            <div>

              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Flat Number
              </label>

              <input
                placeholder="Example: A-101"
                value={form.flatNumber}
                onChange={e =>
                  setForm({
                    ...form,
                    flatNumber:
                      e.target.value
                  })
                }
                required
              />

            </div>


            <div>

              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Flat Size
              </label>

              <input
                placeholder="Example: 2BHK / 1200 sqft"
                value={form.flatSize}
                onChange={e =>
                  setForm({
                    ...form,
                    flatSize:
                      e.target.value
                  })
                }
              />

            </div>


            <div>

              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                Occupancy
              </label>

              <input
                type="number"
                min="0"
                placeholder="Number of people"
                value={form.occupancy}
                onChange={e =>
                  setForm({
                    ...form,
                    occupancy:
                      e.target.value
                  })
                }
              />

            </div>

          </div>


          <button
            type="submit"
            className="btn btn-fill"
            disabled={saving}
            style={{
              marginTop: '16px'
            }}
          >

            {saving
              ? 'Creating...'
              : '✓ Create Household'}

          </button>

        </form>

      )}


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}
      >

        <div className="stat-card">

          <div className="stat-card-icon">
            🏠
          </div>

          <div className="stat-card-val">
            {households.length}
          </div>

          <div className="stat-card-lbl">
            Total Households
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            👨‍👩‍👧
          </div>

          <div className="stat-card-val">

            {households.reduce(
              (total, h) =>
                total +
                Number(
                  h.occupancy || 0
                ),
              0
            )}

          </div>

          <div className="stat-card-lbl">
            Total Occupants
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-card-icon">
            🔎
          </div>

          <div className="stat-card-val">
            {filteredHouseholds.length}
          </div>

          <div className="stat-card-lbl">
            Matching Results
          </div>

        </div>

      </div>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          flexWrap: 'wrap'
        }}
      >

        <div
          style={{
            flex: 1,
            minWidth: '240px'
          }}
        >

          <input
            type="text"
            placeholder="🔎 Search by flat number..."
            value={search}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '12px 15px',
              borderRadius: '10px',
              border:
                '1px solid #dbe2ea',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

        </div>


        <div
          style={{
            fontSize: '13px',
            color: '#64748b',
            whiteSpace: 'nowrap'
          }}
        >

          Showing{' '}

          <strong>
            {paginatedHouseholds.length}
          </strong>{' '}

          of{' '}

          <strong>
            {filteredHouseholds.length}
          </strong>

        </div>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div
        style={{
          overflowX: 'auto',
          borderRadius: '12px'
        }}
      >

        <table className="data-table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Flat</th>

              <th>Size</th>

              <th>Occupancy</th>

              <th>Status</th>

              <th
                style={{
                  minWidth: '190px',
                  textAlign: 'center'
                }}
              >
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {paginatedHouseholds.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="empty-state"
                >

                  {search
                    ? '🔍 No households found for this search.'
                    : '🏠 No households added yet.'}

                </td>

              </tr>

            ) : (

              paginatedHouseholds.map(h => (

                <tr
                  key={h.id}
                >

                  {/* ID */}

                  <td>

                    <span
                      style={{
                        fontWeight: '600',
                        color: '#64748b'
                      }}
                    >
                      #{h.id}
                    </span>

                  </td>


                  {/* FLAT */}

                  <td>

                    <div
                      style={{
                        fontWeight: '700',
                        color: '#0f4c5c'
                      }}
                    >

                      🏠 {h.flatNumber}

                    </div>

                  </td>


                  {/* SIZE */}

                  <td>

                    {h.flatSize || (

                      <span
                        style={{
                          color: '#94a3b8'
                        }}
                      >
                        Not specified
                      </span>

                    )}

                  </td>


                  {/* OCCUPANCY */}

                  <td>

                    <span
                      style={{
                        display:
                          'inline-flex',
                        alignItems:
                          'center',
                        gap: '5px',
                        padding:
                          '5px 10px',
                        borderRadius:
                          '20px',
                        background:
                          '#eff6ff',
                        color:
                          '#2563eb',
                        fontWeight:
                          '600',
                        fontSize:
                          '13px'
                      }}
                    >

                      👥 {h.occupancy || 0}

                    </span>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      style={{
                        display:
                          'inline-flex',
                        alignItems:
                          'center',
                        gap: '5px',
                        padding:
                          '5px 10px',
                        borderRadius:
                          '20px',
                        background:
                          '#ecfdf5',
                        color:
                          '#16a34a',
                        fontWeight:
                          '600',
                        fontSize:
                          '12px'
                      }}
                    >

                      ● Active

                    </span>

                  </td>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <td
                    style={{
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >

                    {/* =================================================
                        VIEW BUTTON

                        IMPORTANT:
                        NO btn-approve CLASS HERE.
                        INLINE STYLE MAKES IT VISIBLE.
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() => handleView(h)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '8px 13px',
                        marginRight: '8px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#0ea5e9',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        visibility: 'visible',
                        opacity: 1,
                        minWidth: '78px',
                        boxShadow:
                          '0 3px 8px rgba(14,165,233,0.25)'
                      }}
                    >

                      👁 View

                    </button>


                    {/* DELETE BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(h)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        padding: '8px 13px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        visibility: 'visible',
                        opacity: 1,
                        minWidth: '78px'
                      }}
                    >

                      🗑 Delete

                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {filteredHouseholds.length >
        itemsPerPage && (

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '7px',
            marginTop: '22px',
            flexWrap: 'wrap'
          }}
        >

          <button
            type="button"
            className="btn-sm btn-outline"
            disabled={
              safePage === 1
            }
            onClick={() =>
              changePage(
                safePage - 1
              )
            }
          >
            ← Previous
          </button>


          {pageNumbers.map(page => (

            <button
              type="button"
              key={page}
              className={
                page === safePage
                  ? 'btn-sm btn-approve'
                  : 'btn-sm btn-outline'
              }
              onClick={() =>
                changePage(page)
              }
              style={{
                minWidth: '38px'
              }}
            >
              {page}
            </button>

          ))}


          <button
            type="button"
            className="btn-sm btn-outline"
            disabled={
              safePage === totalPages
            }
            onClick={() =>
              changePage(
                safePage + 1
              )
            }
          >
            Next →
          </button>

        </div>

      )}


      {/* =====================================================
          PAGE INFO
      ===================================================== */}

      {filteredHouseholds.length > 0 && (

        <div
          style={{
            textAlign: 'center',
            marginTop: '10px',
            fontSize: '12px',
            color: '#94a3b8'
          }}
        >

          Page {safePage} of {totalPages}

        </div>

      )}


      {/* =====================================================
          VIEW HOUSEHOLD MODAL
      ===================================================== */}

      {viewHousehold && (

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'rgba(15, 23, 42, 0.70)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={closeView}
        >

          <div
            style={{
              width: '100%',
              maxWidth: '1100px',
              maxHeight: '92vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.30)',
              padding: '28px',
              boxSizing: 'border-box',
              position: 'relative'
            }}
            onClick={e =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '22px'
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    color: '#0f4c5c',
                    fontSize: '26px'
                  }}
                >

                  🏠 Flat {viewHousehold.flatNumber}

                </h2>

                <p
                  style={{
                    margin:
                      '7px 0 0',
                    color:
                      '#64748b',
                    fontSize:
                      '14px'
                  }}
                >

                  Complete water usage
                  and monthly bill history

                </p>

              </div>


              <button
                type="button"
                onClick={closeView}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#334155'
                }}
              >
                ✕
              </button>

            </div>


            {/* =================================================
                HOUSEHOLD INFORMATION
            ================================================= */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}
            >

              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  border:
                    '1px solid #ccfbf1'
                }}
              >

                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  Flat Number
                </div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    color: '#0f4c5c',
                    fontSize: '18px'
                  }}
                >
                  🏠 {viewHousehold.flatNumber}
                </strong>

              </div>


              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#f8fafc'
                }}
              >

                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  Flat Size
                </div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '6px'
                  }}
                >
                  {viewHousehold.flatSize ||
                    'Not specified'}
                </strong>

              </div>


              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: '#eff6ff'
                }}
              >

                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}
                >
                  Occupancy
                </div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    color: '#2563eb',
                    fontSize: '18px'
                  }}
                >
                  👥 {viewHousehold.occupancy || 0}
                </strong>

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {viewError && (

              <div
                style={{
                  padding: '14px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border:
                    '1px solid #fecaca'
                }}
              >
                ⚠️ {viewError}
              </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {viewLoading ? (

              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#64748b'
                }}
              >

                <div
                  style={{
                    fontSize: '42px',
                    marginBottom: '12px'
                  }}
                >
                  💧
                </div>

                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  Loading household history...
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    marginTop: '5px'
                  }}
                >
                  Fetching water usage and bills
                </div>

              </div>

            ) : (

              <>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: '14px',
                    marginBottom: '30px'
                  }}
                >

                  {/* TOTAL USAGE */}

                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      background:
                        'linear-gradient(135deg, #ecfeff, #f0fdfa)',
                      border:
                        '1px solid #ccfbf1'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '28px'
                      }}
                    >
                      💧
                    </div>

                    <div
                      style={{
                        fontSize: '25px',
                        fontWeight: '800',
                        color: '#0f766e',
                        marginTop: '8px'
                      }}
                    >
                      {totalUsage.toFixed(2)}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px'
                      }}
                    >
                      Total Water Used
                    </div>

                  </div>


                  {/* BILLS */}

                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      background:
                        'linear-gradient(135deg, #eff6ff, #f8fafc)',
                      border:
                        '1px solid #dbeafe'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '28px'
                      }}
                    >
                      🧾
                    </div>

                    <div
                      style={{
                        fontSize: '25px',
                        fontWeight: '800',
                        color: '#2563eb',
                        marginTop: '8px'
                      }}
                    >
                      {monthlyBills.length}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      Total Bills
                    </div>

                  </div>


                  {/* TOTAL BILL */}

                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      background:
                        'linear-gradient(135deg, #fff7ed, #fffbeb)',
                      border:
                        '1px solid #fed7aa'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '28px'
                      }}
                    >
                      💰
                    </div>

                    <div
                      style={{
                        fontSize: '25px',
                        fontWeight: '800',
                        color: '#ea580c',
                        marginTop: '8px'
                      }}
                    >
                      ₹{totalBill.toFixed(2)}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      Total Billed
                    </div>

                  </div>


                  {/* TOTAL PAID */}

                  <div
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      background:
                        'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                      border:
                        '1px solid #bbf7d0'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '28px'
                      }}
                    >
                      ✅
                    </div>

                    <div
                      style={{
                        fontSize: '25px',
                        fontWeight: '800',
                        color: '#16a34a',
                        marginTop: '8px'
                      }}
                    >
                      ₹{totalPaid.toFixed(2)}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      Total Paid
                    </div>

                  </div>

                </div>


                {/* =================================================
                    MONTHLY WATER USAGE
                ================================================= */}

                <div
                  style={{
                    marginBottom: '30px'
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          color: '#0f4c5c',
                          margin:
                            '0 0 4px'
                        }}
                      >
                        💧 Monthly Water Usage
                      </h3>

                      <span
                        style={{
                          fontSize: '12px',
                          color: '#64748b'
                        }}
                      >
                        Water consumption month by month
                      </span>

                    </div>

                  </div>


                  <div
                    style={{
                      overflowX: 'auto',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  >

                    <table
                      className="data-table"
                      style={{
                        width: '100%'
                      }}
                    >

                      <thead>

                        <tr>

                          <th>Month</th>

                          <th>Water Used</th>

                        </tr>

                      </thead>


                      <tbody>

                        {monthlyUsage.length === 0 ? (

                          <tr>

                            <td
                              colSpan={2}
                              style={{
                                textAlign: 'center',
                                padding: '35px',
                                color: '#94a3b8'
                              }}
                            >

                              💧 No water usage history available.

                            </td>

                          </tr>

                        ) : (

                          monthlyUsage.map(item => (

                            <tr
                              key={item.month}
                            >

                              <td>

                                <strong>
                                  {formatMonth(
                                    item.month
                                  )}
                                </strong>

                              </td>


                              <td>

                                <span
                                  style={{
                                    display:
                                      'inline-flex',
                                    alignItems:
                                      'center',
                                    padding:
                                      '7px 13px',
                                    borderRadius:
                                      '20px',
                                    background:
                                      '#e0f2fe',
                                    color:
                                      '#0369a1',
                                    fontWeight:
                                      '700'
                                  }}
                                >

                                  💧{' '}
                                  {item.usage.toFixed(2)} units

                                </span>

                              </td>

                            </tr>

                          ))

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* =================================================
                    MONTHLY BILL HISTORY
                ================================================= */}

                <div>

                  <div
                    style={{
                      marginBottom: '12px'
                    }}
                  >

                    <h3
                      style={{
                        color: '#0f4c5c',
                        margin:
                          '0 0 4px'
                      }}
                    >
                      🧾 Monthly Bill History
                    </h3>

                    <span
                      style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}
                    >
                      Complete bill amount and payment status
                    </span>

                  </div>


                  <div
                    style={{
                      overflowX: 'auto',
                      border:
                        '1px solid #e2e8f0',
                      borderRadius: '12px'
                    }}
                  >

                    <table
                      className="data-table"
                      style={{
                        width: '100%'
                      }}
                    >

                      <thead>

                        <tr>

                          <th>Month</th>

                          <th>Bill Amount</th>

                          <th>Paid</th>

                          <th>Balance</th>

                          <th>Status</th>

                        </tr>

                      </thead>


                      <tbody>

                        {monthlyBills.length === 0 ? (

                          <tr>

                            <td
                              colSpan={5}
                              style={{
                                textAlign:
                                  'center',
                                padding:
                                  '35px',
                                color:
                                  '#94a3b8'
                              }}
                            >

                              🧾 No bill history available.

                            </td>

                          </tr>

                        ) : (

                          monthlyBills.map(item => {

                            const balance =
                              Math.max(
                                0,
                                item.totalAmount -
                                item.paidAmount
                              );


                            const status =
                              String(
                                item.status || ''
                              ).toUpperCase();


                            const isPaid =
                              status === 'PAID' ||
                              balance === 0;


                            return (

                              <tr
                                key={item.month}
                              >

                                <td>

                                  <strong>
                                    {formatMonth(
                                      item.month
                                    )}
                                  </strong>

                                </td>


                                <td>

                                  <strong
                                    style={{
                                      color:
                                        '#0f4c5c'
                                    }}
                                  >
                                    ₹
                                    {item.totalAmount.toFixed(
                                      2
                                    )}
                                  </strong>

                                </td>


                                <td>

                                  <span
                                    style={{
                                      color:
                                        '#16a34a',
                                      fontWeight:
                                        '600'
                                    }}
                                  >
                                    ₹
                                    {item.paidAmount.toFixed(
                                      2
                                    )}
                                  </span>

                                </td>


                                <td>

                                  <strong
                                    style={{
                                      color:
                                        balance > 0
                                          ? '#dc2626'
                                          : '#16a34a'
                                    }}
                                  >
                                    ₹
                                    {balance.toFixed(
                                      2
                                    )}
                                  </strong>

                                </td>


                                <td>

                                  <span
                                    style={{
                                      display:
                                        'inline-flex',
                                      alignItems:
                                        'center',
                                      padding:
                                        '6px 11px',
                                      borderRadius:
                                        '20px',
                                      fontSize:
                                        '12px',
                                      fontWeight:
                                        '700',
                                      background:
                                        isPaid
                                          ? '#dcfce7'
                                          : '#fee2e2',
                                      color:
                                        isPaid
                                          ? '#15803d'
                                          : '#dc2626'
                                    }}
                                  >

                                    {isPaid
                                      ? '✓ PAID'
                                      : '● UNPAID'}

                                  </span>

                                </td>

                              </tr>

                            );

                          })

                        )}

                      </tbody>

                    </table>

                  </div>

                </div>


                {/* =================================================
                    NO DATA INFORMATION
                ================================================= */}

                {!viewError &&
                  usageHistory.length === 0 &&
                  billHistory.length === 0 && (

                    <div
                      style={{
                        marginTop: '20px',
                        padding: '15px',
                        borderRadius: '10px',
                        background:
                          '#f8fafc',
                        color:
                          '#64748b',
                        fontSize:
                          '13px',
                        textAlign:
                          'center'
                      }}
                    >

                      ℹ️ This household does not have
                      usage or bill records yet.

                    </div>

                  )}

              </>

            )}


            {/* =================================================
                CLOSE
            ================================================= */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '25px'
              }}
            >

              <button
                type="button"
                onClick={closeView}
                style={{
                  padding:
                    '10px 22px',
                  border: 'none',
                  borderRadius:
                    '9px',
                  background:
                    '#0f4c5c',
                  color:
                    '#ffffff',
                  fontWeight:
                    '700',
                  cursor:
                    'pointer'
                }}
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      <ConfirmModal
        open={
          !!deleteTarget
        }
        title="Delete Household"
        message={
          `Delete flat "${deleteTarget?.flatNumber}"?`
        }
        onConfirm={
          handleDelete
        }
        onCancel={() =>
          setDeleteTarget(null)
        }
        loading={
          deleting
        }
      />

    </div>

  );

}


export default HouseholdsTab;
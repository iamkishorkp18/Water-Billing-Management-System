import { useMemo, useState } from 'react';

import DetailsModal, {
  DetailGrid,
  displayValue
} from '../../../components/app/DetailsModal';

function householdOf(bill) {
  return bill?.household || {};
}

function apartmentOf(bill) {
  const household = householdOf(bill);
  return (
    bill?.apartment ||
    household?.apartment ||
    {}
  );
}

/*
 * =========================================================
 * BILL YEAR / MONTH HELPERS
 * =========================================================
 */

function getBillYear(bill) {
  const value =
    bill?.billingYear ||
    bill?.year ||
    bill?.billingMonth ||
    bill?.billingDate ||
    bill?.createdDate ||
    bill?.dueDate;

  if (!value) return null;

  /*
   * Example:
   * 2026
   */
  if (
    typeof value === 'number' &&
    value >= 1900 &&
    value <= 2100
  ) {
    return value;
  }

  /*
   * Example:
   * "2026"
   */
  if (/^\d{4}$/.test(String(value))) {
    return Number(value);
  }

  /*
   * Example:
   * "2026-05"
   * "2026-05-01"
   */
  const match = String(value).match(
    /\b(19|20)\d{2}\b/
  );

  if (match) {
    return Number(match[0]);
  }

  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date.getFullYear();
  }

  return null;
}


function getBillMonth(bill) {
  const value =
    bill?.billingMonth ||
    bill?.billingDate ||
    bill?.createdDate ||
    bill?.dueDate;

  if (!value) return null;

  /*
   * Example:
   * "2026-05"
   */
  const stringValue = String(value);

  const yyyyMmMatch =
    stringValue.match(
      /^\d{4}-(\d{1,2})/
    );

  if (yyyyMmMatch) {
    return Number(
      yyyyMmMatch[1]
    );
  }

  /*
   * Normal date
   */
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date.getMonth() + 1;
  }

  /*
   * Month names
   */
  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];

  const lower =
    stringValue.toLowerCase();

  const found =
    monthNames.findIndex(
      month =>
        lower.includes(month)
    );

  return found >= 0
    ? found + 1
    : null;
}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function BillsTab({
  bills = [],
  onCurrentDownload,
  onPaidDownload,
  onAllCurrent,
  onAllPaid,
  tariff
}) {

  /*
   * =======================================================
   * FILTER STATE
   * =======================================================
   */

  const [year, setYear] =
    useState('');

  const [month, setMonth] =
    useState('');

  const [selected, setSelected] =
    useState(null);


  /*
   * =======================================================
   * PAGINATION STATE
   * =======================================================
   */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [paidPage, setPaidPage] =
    useState(1);

  const ITEMS_PER_PAGE = 5;


  /*
   * =======================================================
   * AVAILABLE YEARS
   * =======================================================
   */

  const years = useMemo(() => {

    const values = bills
      .map(getBillYear)
      .filter(
        value =>
          value !== null &&
          !isNaN(value)
      );

    return [
      ...new Set(values)
    ].sort(
      (a, b) => b - a
    );

  }, [bills]);


  /*
   * =======================================================
   * FILTER BILLS
   * =======================================================
   */

  const filteredBills = useMemo(() => {

    return bills.filter(bill => {

      const billYear =
        getBillYear(bill);

      const billMonth =
        getBillMonth(bill);


      /*
       * YEAR FILTER
       */

      if (
        year &&
        Number(year) !==
          Number(billYear)
      ) {
        return false;
      }


      /*
       * MONTH FILTER
       */

      if (
        month &&
        Number(month) !==
          Number(billMonth)
      ) {
        return false;
      }


      return true;
    });

  }, [bills, year, month]);


  /*
   * =======================================================
   * CURRENT / PENDING BILLS
   * =======================================================
   */

  const pending = filteredBills.filter(
    bill =>
      String(
        bill?.status || 'PENDING'
      ).toUpperCase() !== 'PAID'
  );


  /*
   * =======================================================
   * PAID BILLS
   * =======================================================
   */

  const paid = filteredBills.filter(
    bill =>
      String(
        bill?.status || ''
      ).toUpperCase() === 'PAID'
  );


  /*
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const currentTotalPages =
    Math.max(
      Math.ceil(
        pending.length /
          ITEMS_PER_PAGE
      ),
      1
    );

  const paidTotalPages =
    Math.max(
      Math.ceil(
        paid.length /
          ITEMS_PER_PAGE
      ),
      1
    );


  /*
   * Reset pages whenever filters change
   */

  const handleYearChange = e => {
    setYear(e.target.value);
    setCurrentPage(1);
    setPaidPage(1);
  };


  const handleMonthChange = e => {
    setMonth(e.target.value);
    setCurrentPage(1);
    setPaidPage(1);
  };


  /*
   * =======================================================
   * CURRENT PAGE DATA
   * =======================================================
   */

  const currentPageBills =
    pending.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,
      currentPage *
        ITEMS_PER_PAGE
    );


  /*
   * =======================================================
   * PAID PAGE DATA
   * =======================================================
   */

  const paidPageBills =
    paid.slice(
      (paidPage - 1) *
        ITEMS_PER_PAGE,
      paidPage *
        ITEMS_PER_PAGE
    );


  /*
   * =======================================================
   * SELECTED BILL DATA
   * =======================================================
   */

  const selectedHousehold =
    householdOf(selected);

  const selectedApartment =
    apartmentOf(selected);


  /*
   * =======================================================
   * BILL ROW
   * =======================================================
   */

  const billRows = (
    list,
    paidList
  ) =>
    list.map(bill => {

      const household =
        householdOf(bill);

      const apartment =
        apartmentOf(bill);

      return (
        <tr key={bill.id}>

          {/* PERIOD */}

          <td>

            <strong>
              {displayValue(
                bill.billingMonth
              )}
            </strong>

            <small
              style={{
                display: 'block',
                color:
                  '#64748b',
                marginTop: 4
              }}
            >
              {displayValue(
                apartment.name ||
                apartment.apartmentName
              )}
            </small>

          </td>


          {/* AMOUNT */}

          <td>

            <strong
              style={{
                color:
                  paidList
                    ? '#15803d'
                    : '#dc2626'
              }}
            >
              ₹
              {displayValue(
                bill.amount
              )}
            </strong>

          </td>


          {/* CONSUMPTION */}

          <td>

            <span
              style={{
                fontWeight: 600,
                color:
                  '#2563eb'
              }}
            >
              {displayValue(
                bill.consumption
              )}
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
                padding:
                  '6px 12px',
                borderRadius:
                  '20px',
                fontSize:
                  '12px',
                fontWeight: 700,
                background:
                  paidList
                    ? '#dcfce7'
                    : '#fee2e2',
                color:
                  paidList
                    ? '#15803d'
                    : '#dc2626'
              }}
            >
              {bill.status ||
                'PENDING'}
            </span>

          </td>


          {/* ACTIONS */}

          <td>

            <div
              style={{
                display:
                  'flex',
                gap: 8,
                flexWrap:
                  'wrap'
              }}
            >

              <button
                type="button"
                className="app-view-btn"
                onClick={() =>
                  setSelected(
                    bill
                  )
                }
              >
                View Bill
              </button>


              <button
                type="button"
                className="btn-sm btn-approve"
                onClick={() =>
                  paidList
                    ? onPaidDownload(
                        bill.id
                      )
                    : onCurrentDownload(
                        bill.id
                      )
                }
              >
                Download
              </button>

            </div>

          </td>

        </tr>
      );
    });


  /*
   * =======================================================
   * PAGINATION COMPONENT
   * =======================================================
   */

  const Pagination = ({
    page,
    totalPages,
    setPage,
    totalItems
  }) => {

    if (
      totalItems <=
      ITEMS_PER_PAGE
    ) {
      return null;
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginTop: 18,
          padding:
            '14px 16px',
          borderRadius: 12,
          background:
            '#f8fafc',
          border:
            '1px solid #e2e8f0'
        }}
      >

        <span
          style={{
            color:
              '#64748b',
            fontSize: 13,
            fontWeight: 600
          }}
        >
          Showing{' '}
          {Math.min(
            (page - 1) *
              ITEMS_PER_PAGE +
              1,
            totalItems
          )}
          {' - '}
          {Math.min(
            page *
              ITEMS_PER_PAGE,
            totalItems
          )}
          {' of '}
          {totalItems}
        </span>


        <div
          style={{
            display:
              'flex',
            gap: 8
          }}
        >

          <button
            type="button"
            disabled={
              page === 1
            }
            onClick={() =>
              setPage(
                page - 1
              )
            }
            style={{
              padding:
                '7px 14px',
              borderRadius:
                8,
              border:
                '1px solid #cbd5e1',
              background:
                page === 1
                  ? '#e2e8f0'
                  : '#ffffff',
              color:
                page === 1
                  ? '#94a3b8'
                  : '#2563eb',
              cursor:
                page === 1
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: 700
            }}
          >
            ← Previous
          </button>


          <span
            style={{
              minWidth: 80,
              textAlign:
                'center',
              padding:
                '7px 12px',
              borderRadius:
                8,
              background:
                '#2563eb',
              color:
                '#fff',
              fontWeight: 700
            }}
          >
            {page} /{' '}
            {totalPages}
          </span>


          <button
            type="button"
            disabled={
              page ===
              totalPages
            }
            onClick={() =>
              setPage(
                page + 1
              )
            }
            style={{
              padding:
                '7px 14px',
              borderRadius:
                8,
              border:
                '1px solid #cbd5e1',
              background:
                page ===
                totalPages
                  ? '#e2e8f0'
                  : '#ffffff',
              color:
                page ===
                totalPages
                  ? '#94a3b8'
                  : '#2563eb',
              cursor:
                page ===
                totalPages
                  ? 'not-allowed'
                  : 'pointer',
              fontWeight: 700
            }}
          >
            Next →
          </button>

        </div>

      </div>
    );
  };


  /*
   * =======================================================
   * RETURN UI
   * =======================================================
   */

  return (
    <>

      {/* =================================================
          CURRENT BILLS
      ================================================= */}

      <div className="dash-section">

        <div
          className="dash-section-head"
          style={{
            borderBottom:
              '3px solid #f97316',
            paddingBottom:
              14
          }}
        >

          <div>

            <h2
              style={{
                color:
                  '#ea580c'
              }}
            >
              Pending Bills
            </h2>

            <p>
              Pending and unpaid water bills
            </p>

          </div>

          <span
            className="alert-count"
            style={{
              background:
                '#fff7ed',
              color:
                '#ea580c',
              border:
                '1px solid #fed7aa'
            }}
          >
            {pending.length}{' '}
            Pending
          </span>

        </div>


        {/* FILTER BAR */}

        <div
          className="billing-filter-bar"
          style={{
            padding:
              '16px',
            borderRadius:
              14,
            background:
              'linear-gradient(135deg,#fff7ed,#fffbeb)',
            border:
              '1px solid #fed7aa',
            marginBottom:
              18
          }}
        >

          <select
            value={year}
            onChange={
              handleYearChange
            }
            aria-label="Filter by year"
          >

            <option value="">
              All years
            </option>

            {years.map(
              y => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              )
            )}

          </select>


          <select
            value={month}
            onChange={
              handleMonthChange
            }
            aria-label="Filter by month"
          >

            <option value="">
              All months
            </option>

            {Array.from(
              {
                length: 12
              },
              (_, i) => (
                <option
                  key={i + 1}
                  value={
                    i + 1
                  }
                >
                  {new Date(
                    2000,
                    i
                  ).toLocaleString(
                    'en',
                    {
                      month:
                        'long'
                    }
                  )}
                </option>
              )
            )}

          </select>


          <button
            type="button"
            className="btn btn-fill"
            onClick={() =>
              onAllCurrent(
                year,
                month
              )
            }
            style={{
              background:
                'linear-gradient(135deg,#f97316,#ef4444)',
              border: 'none'
            }}
          >
            Download All Current Bills
          </button>

        </div>


        {/* TABLE */}

        <div
          className="app-table-wrap"
          style={{
            borderRadius:
              14,
            overflow:
              'hidden',
            border:
              '1px solid #fed7aa'
          }}
        >

          <table className="data-table">

            <thead
              style={{
                background:
                  'linear-gradient(135deg,#fff7ed,#ffedd5)'
              }}
            >

              <tr>

                <th>
                  Period / Property
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Consumption
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {currentPageBills.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="empty-state"
                  >
                    No pending bills
                    found for the
                    selected filter.
                  </td>

                </tr>

              ) : (
                billRows(
                  currentPageBills,
                  false
                )
              )}

            </tbody>

          </table>

        </div>


        <Pagination
          page={
            currentPage
          }
          totalPages={
            currentTotalPages
          }
          setPage={
            setCurrentPage
          }
          totalItems={
            pending.length
          }
        />

      </div>


      {/* =================================================
          PAID BILLS
      ================================================= */}

      <div className="dash-section">

        <div
          className="dash-section-head"
          style={{
            borderBottom:
              '3px solid #16a34a',
            paddingBottom:
              14
          }}
        >

          <div>

            <h2
              style={{
                color:
                  '#15803d'
              }}
            >
              Billing History
            </h2>

            <p>
              Previously paid water bills
            </p>

          </div>

          <span
            className="alert-count"
            style={{
              background:
                '#f0fdf4',
              color:
                '#15803d',
              border:
                '1px solid #bbf7d0'
            }}
          >
            {paid.length}{' '}
            Paid
          </span>

        </div>


        {/* DOWNLOAD */}

        <div
          style={{
            marginBottom:
              18,
            padding:
              '16px',
            borderRadius:
              14,
            background:
              'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
            border:
              '1px solid #bbf7d0'
          }}
        >

          <button
            type="button"
            className="btn btn-fill"
            onClick={() =>
              onAllPaid(
                year,
                month
              )
            }
            style={{
              background:
                'linear-gradient(135deg,#16a34a,#22c55e)',
              border: 'none'
            }}
          >
            Download All Paid Bills
          </button>

        </div>


        {/* TABLE */}

        <div
          className="app-table-wrap"
          style={{
            borderRadius:
              14,
            overflow:
              'hidden',
            border:
              '1px solid #bbf7d0'
          }}
        >

          <table className="data-table">

            <thead
              style={{
                background:
                  'linear-gradient(135deg,#f0fdf4,#dcfce7)'
              }}
            >

              <tr>

                <th>
                  Period / Property
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Consumption
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {paidPageBills.length ===
              0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="empty-state"
                  >
                    No paid bills found
                    for the selected
                    filter.
                  </td>

                </tr>

              ) : (
                billRows(
                  paidPageBills,
                  true
                )
              )}

            </tbody>

          </table>

        </div>


        <Pagination
          page={
            paidPage
          }
          totalPages={
            paidTotalPages
          }
          setPage={
            setPaidPage
          }
          totalItems={
            paid.length
          }
        />

      </div>


      {/* =================================================
          TARIFF PLAN
      ================================================= */}

      <div className="dash-section">

        <div
          className="dash-section-head"
          style={{
            borderBottom:
              '3px solid #7c3aed',
            paddingBottom:
              14
          }}
        >

          <h2
            style={{
              color:
                '#7c3aed'
            }}
          >
            Tariff Plan
          </h2>

        </div>


        {!tariff ? (

          <p className="empty-state">
            Tariff information not
            available.
          </p>

        ) : (

          <div
            style={{
              display:
                'grid',
              gap:
                12
            }}
          >

            <div
              className="tariff-slab-row"
              style={{
                background:
                  '#eff6ff',
                borderLeft:
                  '5px solid #2563eb'
              }}
            >
              <span>
                Tier 1 — 0 to{' '}
                {tariff.tier1Limit}{' '}
                units
              </span>

              <strong
                style={{
                  color:
                    '#2563eb'
                }}
              >
                ₹
                {Number(
                  tariff.tier1Rate
                ).toFixed(2)}
              </strong>

            </div>


            <div
              className="tariff-slab-row"
              style={{
                background:
                  '#fefce8',
                borderLeft:
                  '5px solid #eab308'
              }}
            >
              <span>
                Tier 2 —{' '}
                {tariff.tier1Limit}{' '}
                to{' '}
                {tariff.tier2Limit}{' '}
                units
              </span>

              <strong
                style={{
                  color:
                    '#ca8a04'
                }}
              >
                ₹
                {Number(
                  tariff.tier2Rate
                ).toFixed(2)}
              </strong>

            </div>


            <div
              className="tariff-slab-row"
              style={{
                background:
                  '#faf5ff',
                borderLeft:
                  '5px solid #7c3aed'
              }}
            >

              <span>
                Tier 3 — Above{' '}
                {tariff.tier2Limit}{' '}
                units
              </span>

              <strong
                style={{
                  color:
                    '#7c3aed'
                }}
              >
                ₹
                {Number(
                  tariff.tier3Rate
                ).toFixed(2)}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          BILL DETAILS MODAL
      ================================================= */}

      <DetailsModal
        open={
          Boolean(
            selected
          )
        }
        title={`Bill ${displayValue(
          selected?.billNumber ||
            selected?.id
        )}`}
        subtitle={displayValue(
          selected?.billingMonth
        )}
        status={
          selected?.status
        }
        onClose={() =>
          setSelected(null)
        }
      >

        <h3 className="app-section-title">
          Property
        </h3>

        <DetailGrid
          items={[
            {
              label:
                'Community',
              value:
                displayValue(
                  selectedApartment.communityName ||
                    selectedApartment
                      .community
                      ?.name ||
                    selectedApartment.ward
                )
            },

            {
              label:
                'Apartment',
              value:
                displayValue(
                  selectedApartment.name ||
                    selectedApartment
                      .apartmentName
                )
            },

            {
              label:
                'Flat',
              value:
                displayValue(
                  selectedHousehold.flatNumber ||
                    selectedHousehold.flatNo
                )
            }
          ]}
        />


        <h3 className="app-section-title">
          Household
        </h3>

        <DetailGrid
          items={[
            {
              label:
                'Household',
              value:
                displayValue(
                  selectedHousehold.name ||
                    selectedHousehold
                      .householdName ||
                    selectedHousehold.id
                )
            },

            {
              label:
                'Resident',
              value:
                displayValue(
                  selectedHousehold
                    .residentName ||
                    selected?.residentName
                )
            }
          ]}
        />


        <h3 className="app-section-title">
          Consumption & Payment
        </h3>

        <DetailGrid
          items={[
            {
              label:
                'Billing month',
              value:
                displayValue(
                  selected?.billingMonth
                )
            },

            {
              label:
                'Consumption',
              value:
                displayValue(
                  selected?.consumption
                )
            },

            {
              label:
                'Amount',
              value:
                selected?.amount != null
                  ? `₹${selected.amount}`
                  : '—'
            },

            {
              label:
                'Due date',
              value:
                displayValue(
                  selected?.dueDate
                )
            },

            {
              label:
                'Generated',
              value:
                displayValue(
                  selected?.generatedDate ||
                    selected?.createdDate
                )
            },

            {
              label:
                'Status',
              value:
                displayValue(
                  selected?.status
                )
            }
          ]}
        />

      </DetailsModal>

    </>
  );
}
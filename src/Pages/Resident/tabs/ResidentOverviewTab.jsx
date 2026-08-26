import { useState } from 'react';

import DetailsModal, {
  DetailGrid,
  displayValue,
  StatusBadge
} from '../../../components/app/DetailsModal';

export default function ResidentOverviewTab({
  latestBill,
  currentConsumption,
  usageStatus,
  alerts = [],
  tips = [],
  bills = [],
  complaints = []
}) {
  const [selectedAlert, setSelectedAlert] = useState(null);

  /*
   * =========================================================
   * GET YEAR FROM ANY POSSIBLE BILL FIELD
   * =========================================================
   */

  const extractYear = value => {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    // Direct numeric year
    if (
      typeof value === 'number' &&
      value >= 1900 &&
      value <= 2100
    ) {
      return value;
    }

    const stringValue = String(value).trim();

    // Direct year like "2025"
    if (/^(19|20)\d{2}$/.test(stringValue)) {
      return Number(stringValue);
    }

    /*
     * Handles:
     * 2025-12
     * 2025-12-01
     * 12-2025
     * Dec-2025
     * December 2025
     * 2025/12
     */
    const yearMatch = stringValue.match(
      /\b(19|20)\d{2}\b/
    );

    if (yearMatch) {
      return Number(yearMatch[0]);
    }

    // Try JavaScript date parsing
    const date = new Date(stringValue);

    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();

      if (
        year >= 1900 &&
        year <= 2100
      ) {
        return year;
      }
    }

    return null;
  };

  /*
   * =========================================================
   * GET BILL YEAR
   * =========================================================
   */

  const getBillYear = bill => {
    if (!bill) {
      return null;
    }

    /*
     * Check all possible backend fields.
     * billingMonth is especially important.
     */

    const possibleValues = [
      bill.billingYear,
      bill.year,
      bill.billingMonth,
      bill.billingDate,
      bill.createdDate,
      bill.dueDate,
      bill.billDate,
      bill.invoiceDate,
      bill.generatedDate,
      bill.createdAt,
      bill.updatedAt
    ];

    for (const value of possibleValues) {
      const year = extractYear(value);

      if (year) {
        return year;
      }
    }

    return null;
  };

  /*
   * =========================================================
   * ALERT CHART DATA
   * =========================================================
   */

  const alertTypeCounts = {};

  alerts.forEach(alert => {
    const rawType =
      alert.alertType ||
      alert.type ||
      alert.notificationType ||
      'OTHER';

    const type =
      String(rawType).toUpperCase();

    let label = 'Other';

    if (
      type === 'HIGH_USAGE' ||
      type.includes('USAGE')
    ) {
      label = 'High Usage';
    } else if (
      type.includes('OVERDUE')
    ) {
      label = 'Bill Overdue';
    } else if (
      type.includes('DUE') ||
      type.includes('PAYMENT')
    ) {
      label = 'Bill Due';
    } else if (
      type.includes('BILL') ||
      type.includes('PENDING')
    ) {
      label = 'Bill Pending';
    }

    alertTypeCounts[label] =
      (alertTypeCounts[label] || 0) + 1;
  });

  const alertTypes =
    Object.entries(alertTypeCounts);

  const maxAlertCount =
    alertTypes.length
      ? Math.max(
          ...alertTypes.map(
            ([, count]) => count
          )
        )
      : 1;

  /*
   * =========================================================
   * AVAILABLE BILL YEARS
   * =========================================================
   */

  const detectedYears = bills
    .map(bill => getBillYear(bill))
    .filter(
      year =>
        year !== null &&
        year >= 1900 &&
        year <= 2100
    );

  /*
   * Remove duplicate years and sort newest -> oldest.
   */

  const availableYears = [
    ...new Set(detectedYears)
  ].sort((a, b) => b - a);

  /*
   * If no year was detected, use current year.
   */

  if (availableYears.length === 0) {
    availableYears.push(
      new Date().getFullYear()
    );
  }

  /*
   * Default selected year:
   * use newest year available, NOT always 2026.
   */

  const [selectedYear, setSelectedYear] =
    useState(
      availableYears[0]
    );

  /*
   * =========================================================
   * BILLS FOR SELECTED YEAR
   * =========================================================
   */

  const billsForYear =
    bills.filter(bill => {
      const year =
        getBillYear(bill);

      return (
        Number(year) ===
        Number(selectedYear)
      );
    });

  const paidBillsForYear =
    billsForYear.filter(
      bill =>
        String(
          bill.status || ''
        ).toUpperCase() ===
        'PAID'
    );

  const pendingBillsForYear =
    billsForYear.filter(
      bill =>
        String(
          bill.status ||
            'PENDING'
        ).toUpperCase() !==
        'PAID'
    );

  const billChartTotal =
    Math.max(
      paidBillsForYear.length +
        pendingBillsForYear.length,
      1
    );

  /*
   * =========================================================
   * COMPLAINT CHART DATA
   * =========================================================
   */

  const complaintTypeCounts = {};

  complaints.forEach(
    complaint => {
      const rawType =
        complaint.complaintType ||
        complaint.type ||
        complaint.category ||
        complaint.issueType ||
        'OTHER';

      const label =
        String(rawType)
          .replaceAll(
            '_',
            ' '
          )
          .toLowerCase()
          .replace(
            /\b\w/g,
            char =>
              char.toUpperCase()
          );

      complaintTypeCounts[label] =
        (complaintTypeCounts[label] || 0) + 1;
    }
  );

  const complaintTypes =
    Object.entries(
      complaintTypeCounts
    );

  const maxComplaintCount =
    complaintTypes.length
      ? Math.max(
          ...complaintTypes.map(
            ([, count]) => count
          )
        )
      : 1;

  /*
   * =========================================================
   * COMMON BAR STYLE
   * =========================================================
   */

  const chartBarBackground = {
    width: '100%',
    height: 14,
    background:
      'var(--border)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow:
      'inset 0 1px 3px rgba(0,0,0,0.12)'
  };

  /*
   * =========================================================
   * COLORS
   * =========================================================
   */

  const alertColors = [
    '#3b82f6',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#06b6d4'
  ];

  const complaintColors = [
    '#ec4899',
    '#f97316',
    '#14b8a6',
    '#6366f1',
    '#84cc16',
    '#eab308'
  ];

  return (
    <>
      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="stat-cards">

        <div className="stat-card">
          <div className="stat-card-val">
            {currentConsumption > 0
              ? currentConsumption.toFixed(0)
              : '—'}
          </div>

          <div className="stat-card-lbl">
            Units this month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            ₹
            {latestBill
              ? Number(
                  latestBill.amount || 0
                ).toFixed(2)
              : '0.00'}
          </div>

          <div className="stat-card-lbl">
            Current bill
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <StatusBadge
              status={
                latestBill?.status ||
                'No Bill'
              }
            />
          </div>

          <div className="stat-card-lbl">
            Payment status
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <StatusBadge
              status={
                usageStatus
              }
            />
          </div>

          <div className="stat-card-lbl">
            Usage status
          </div>
        </div>

      </div>

      {/* =====================================================
          ALERTS OVERVIEW
      ====================================================== */}

      <div
        className="dash-section"
        style={{
          borderTop:
            '4px solid #3b82f6'
        }}
      >

        <div className="dash-section-head">

          <div>
            <h2
              style={{
                color: '#2563eb'
              }}
            >
              Alerts Overview
            </h2>

            <p>
              Automated water usage and billing alerts.
            </p>
          </div>

          <span
            className="alert-count"
            style={{
              background:
                '#dbeafe',
              color:
                '#1d4ed8',
              fontWeight: 700
            }}
          >
            {alerts.length} alerts
          </span>

        </div>

        <div
          className="chart-grid"
          style={{
            gridTemplateColumns:
              'repeat(2, 1fr)',
            alignItems:
              'stretch'
          }}
        >

          <div
            className="stat-card"
            style={{
              background:
                'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border:
                '1px solid #93c5fd'
            }}
          >

            <div
              className="stat-card-val"
              style={{
                color:
                  '#2563eb'
              }}
            >
              {alerts.length}
            </div>

            <div className="stat-card-lbl">
              Total Alerts
            </div>

          </div>

          <div
            style={{
              padding:
                '10px 5px'
            }}
          >

            {alertTypes.length ===
            0 ? (
              <p className="empty-state">
                No automated alerts available.
              </p>
            ) : (
              alertTypes.map(
                ([type, count], index) => (
                  <div
                    key={type}
                    style={{
                      marginBottom:
                        18
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        marginBottom:
                          7,
                        fontWeight:
                          700
                      }}
                    >

                      <span>
                        {type}
                      </span>

                      <span
                        style={{
                          color:
                            alertColors[
                              index %
                                alertColors.length
                            ]
                        }}
                      >
                        {count}
                      </span>

                    </div>

                    <div
                      style={
                        chartBarBackground
                      }
                    >

                      <div
                        style={{
                          width: `${
                            (count /
                              maxAlertCount) *
                            100
                          }%`,
                          height:
                            '100%',
                          background:
                            alertColors[
                              index %
                                alertColors.length
                            ],
                          borderRadius:
                            20,
                          transition:
                            'width 0.4s ease'
                        }}
                      />

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          BILLS OVERVIEW
      ====================================================== */}

      <div
        className="dash-section"
        style={{
          borderTop:
            '4px solid #22c55e'
        }}
      >

        <div className="dash-section-head">

          <div>
            <h2
              style={{
                color:
                  '#16a34a'
              }}
            >
              Bills Overview
            </h2>

            <p>
              Paid and due bills for the selected year.
            </p>
          </div>

          {/* YEAR DROPDOWN */}

          <select
            value={selectedYear}
            onChange={e =>
              setSelectedYear(
                Number(
                  e.target.value
                )
              )
            }
            className="alert-filter"
            style={{
              minWidth: 130,
              border:
                '2px solid #22c55e',
              color:
                '#166534',
              fontWeight: 700,
              background:
                '#f0fdf4',
              padding:
                '8px 12px',
              borderRadius:
                8,
              cursor:
                'pointer'
            }}
          >

            {availableYears.map(
              year => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              )
            )}

          </select>

        </div>

        {/* SHOW AVAILABLE YEARS */}

        {availableYears.length > 0 && (
          <div
            style={{
              display:
                'flex',
              gap: 8,
              flexWrap:
                'wrap',
              marginBottom:
                20
            }}
          >

            {availableYears.map(
              year => (
                <button
                  key={year}
                  type="button"
                  onClick={() =>
                    setSelectedYear(
                      year
                    )
                  }
                  style={{
                    border:
                      selectedYear ===
                      year
                        ? '2px solid #16a34a'
                        : '1px solid #bbf7d0',
                    background:
                      selectedYear ===
                      year
                        ? '#16a34a'
                        : '#f0fdf4',
                    color:
                      selectedYear ===
                      year
                        ? '#ffffff'
                        : '#166534',
                    borderRadius:
                      20,
                    padding:
                      '6px 14px',
                    fontWeight:
                      700,
                    cursor:
                      'pointer'
                  }}
                >
                  {year}
                </button>
              )
            )}

          </div>
        )}

        <div
          className="chart-grid"
          style={{
            gridTemplateColumns:
              'repeat(2, 1fr)',
            alignItems:
              'stretch'
          }}
        >

          {/* TOTAL BILLS */}

          <div
            className="stat-card"
            style={{
              background:
                'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border:
                '1px solid #86efac'
            }}
          >

            <div
              className="stat-card-val"
              style={{
                color:
                  '#16a34a'
              }}
            >
              {
                billsForYear.length
              }
            </div>

            <div className="stat-card-lbl">
              Bills in {selectedYear}
            </div>

          </div>

          {/* BILL BARS */}

          <div
            style={{
              padding:
                '10px 5px'
            }}
          >

            {/* PAID */}

            <div
              style={{
                marginBottom:
                  22
              }}
            >

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  marginBottom:
                    7,
                  fontWeight:
                    700
                }}
              >

                <span
                  style={{
                    color:
                      '#15803d'
                  }}
                >
                  Paid Bills
                </span>

                <span
                  style={{
                    color:
                      '#16a34a',
                    fontWeight:
                      800
                  }}
                >
                  {
                    paidBillsForYear.length
                  }
                </span>

              </div>

              <div
                style={{
                  ...chartBarBackground,
                  height: 16
                }}
              >

                <div
                  style={{
                    width: `${
                      (paidBillsForYear.length /
                        billChartTotal) *
                      100
                    }%`,
                    height:
                      '100%',
                    background:
                      '#22c55e',
                    borderRadius:
                      20,
                    transition:
                      'width 0.4s ease'
                  }}
                />

              </div>

            </div>

            {/* PENDING */}

            <div>

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  marginBottom:
                    7,
                  fontWeight:
                    700
                }}
              >

                <span
                  style={{
                    color:
                      '#b91c1c'
                  }}
                >
                  Due / Pending Bills
                </span>

                <span
                  style={{
                    color:
                      '#dc2626',
                    fontWeight:
                      800
                  }}
                >
                  {
                    pendingBillsForYear.length
                  }
                </span>

              </div>

              <div
                style={{
                  ...chartBarBackground,
                  height: 16
                }}
              >

                <div
                  style={{
                    width: `${
                      (pendingBillsForYear.length /
                        billChartTotal) *
                      100
                    }%`,
                    height:
                      '100%',
                    background:
                      '#ef4444',
                    borderRadius:
                      20,
                    transition:
                      'width 0.4s ease'
                  }}
                />

              </div>

            </div>

          </div>

        </div>

        {/* NO BILLS MESSAGE */}

        {billsForYear.length === 0 && (
          <div
            style={{
              marginTop: 15,
              padding:
                '12px 16px',
              background:
                '#fff7ed',
              border:
                '1px solid #fed7aa',
              borderRadius:
                8,
              color:
                '#c2410c',
              fontWeight:
                600
            }}
          >
            No bills found for {selectedYear}.
          </div>
        )}

      </div>

      {/* =====================================================
          COMPLAINTS OVERVIEW
      ====================================================== */}

      <div
        className="dash-section"
        style={{
          borderTop:
            '4px solid #ec4899'
        }}
      >

        <div className="dash-section-head">

          <div>

            <h2
              style={{
                color:
                  '#db2777'
              }}
            >
              Complaints Overview
            </h2>

            <p>
              Your complaints grouped by complaint type.
            </p>

          </div>

          <span
            className="alert-count"
            style={{
              background:
                '#fce7f3',
              color:
                '#be185d',
              fontWeight:
                700
            }}
          >
            {complaints.length} complaints
          </span>

        </div>

        <div
          className="chart-grid"
          style={{
            gridTemplateColumns:
              'repeat(2, 1fr)',
            alignItems:
              'stretch'
          }}
        >

          {/* TOTAL COMPLAINTS */}

          <div
            className="stat-card"
            style={{
              background:
                'linear-gradient(135deg, #fdf2f8, #fce7f3)',
              border:
                '1px solid #f9a8d4'
            }}
          >

            <div
              className="stat-card-val"
              style={{
                color:
                  '#db2777'
              }}
            >
              {
                complaints.length
              }
            </div>

            <div className="stat-card-lbl">
              Total Complaints
            </div>

          </div>

          {/* COMPLAINT BARS */}

          <div
            style={{
              padding:
                '10px 5px'
            }}
          >

            {complaintTypes.length ===
            0 ? (
              <p className="empty-state">
                No complaints available.
              </p>
            ) : (
              complaintTypes.map(
                ([type, count], index) => (
                  <div
                    key={type}
                    style={{
                      marginBottom:
                        18
                    }}
                  >

                    <div
                      style={{
                        display:
                          'flex',
                        justifyContent:
                          'space-between',
                        marginBottom:
                          7,
                        fontWeight:
                          700
                      }}
                    >

                      <span>
                        {type}
                      </span>

                      <span
                        style={{
                          color:
                            complaintColors[
                              index %
                                complaintColors.length
                            ],
                          fontWeight:
                            800
                        }}
                      >
                        {count}
                      </span>

                    </div>

                    <div
                      style={
                        chartBarBackground
                      }
                    >

                      <div
                        style={{
                          width: `${
                            (count /
                              maxComplaintCount) *
                            100
                          }%`,
                          height:
                            '100%',
                          background:
                            complaintColors[
                              index %
                                complaintColors.length
                            ],
                          borderRadius:
                            20,
                          transition:
                            'width 0.4s ease'
                        }}
                      />

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          WATER SAVING NOTES
      ====================================================== */}

      <div
        className="dash-section"
        style={{
          borderTop:
            '4px solid #06b6d4'
        }}
      >

        <div className="dash-section-head">

          <h2
            style={{
              color:
                '#0891b2'
            }}
          >
            Water-saving notes
          </h2>

        </div>

        <div
          className="chart-grid"
          style={{
            gridTemplateColumns:
              'repeat(3, 1fr)'
          }}
        >

          {tips
            .slice(0, 3)
            .map(
              (tip, index) => (
                <div
                  key={index}
                  className="tip-card"
                  style={{
                    border:
                      '1px solid #67e8f9',
                    background:
                      index === 0
                        ? '#ecfeff'
                        : index === 1
                        ? '#cffafe'
                        : '#e0f2fe'
                  }}
                >

                  <p>
                    {tip.text}
                  </p>

                </div>
              )
            )}

        </div>

      </div>

      {/* =====================================================
          ALERT DETAILS MODAL
      ====================================================== */}

      <DetailsModal
        open={
          Boolean(
            selectedAlert
          )
        }

        title={displayValue(
          selectedAlert?.title ||
            selectedAlert?.alertType ||
            'Alert'
        )}

        subtitle={displayValue(
          selectedAlert?.createdDate ||
            selectedAlert?.date
        )}

        status={
          selectedAlert?.priority ||
          selectedAlert?.status
        }

        onClose={() =>
          setSelectedAlert(
            null
          )
        }
      >

        <DetailGrid
          items={[
            {
              label: 'Type',

              value:
                displayValue(
                  selectedAlert?.alertType ||
                    selectedAlert?.type
                )
            },

            {
              label:
                'Severity',

              value:
                displayValue(
                  selectedAlert?.priority ||
                    selectedAlert?.severity
                )
            },

            {
              label:
                'Message',

              value:
                displayValue(
                  selectedAlert?.message
                )
            },

            {
              label:
                'Household',

              value:
                displayValue(
                  selectedAlert
                    ?.household
                    ?.flatNumber ||
                    selectedAlert?.householdId
                )
            }
          ]}
        />

      </DetailsModal>

    </>
  );
}
import { useState } from 'react';

import DetailsModal, {
  DetailGrid,
  displayValue
} from '../../../components/app/DetailsModal';

/* =========================================================
   ALERT TYPES
========================================================= */

function getAlertType(alert) {
  const text = `
    ${alert?.type || ''}
    ${alert?.alertType || ''}
    ${alert?.title || ''}
    ${alert?.alertTitle || ''}
    ${alert?.message || ''}
    ${alert?.description || ''}
  `.toUpperCase();

  if (
    text.includes('HIGH_USAGE') ||
    text.includes('HIGH USAGE') ||
    text.includes('USAGE')
  ) {
    return 'HIGH_USAGE';
  }

  if (text.includes('OVERDUE')) {
    return 'OVERDUE';
  }

  if (
    text.includes('DUE') ||
    text.includes('PAYMENT')
  ) {
    return 'DUE_PAYMENT';
  }

  if (
    text.includes('BILL') ||
    text.includes('GENERATED') ||
    text.includes('PENDING')
  ) {
    return 'BILL';
  }

  return 'GENERAL';
}

/* =========================================================
   ALERT INFORMATION
========================================================= */

function getAlertTypeInfo(alert) {
  const type = getAlertType(alert);

  switch (type) {
    case 'HIGH_USAGE':
      return {
        label: 'High Usage',
        icon: '💧',
        className: 'alert-high-usage',
        color: '#2563eb',
        background: '#eff6ff',
        description:
          'Water consumption is higher than expected.'
      };

    case 'OVERDUE':
      return {
        label: 'Payment Overdue',
        icon: '⏰',
        className: 'alert-overdue',
        color: '#dc2626',
        background: '#fef2f2',
        description:
          'A water bill requires immediate attention.'
      };

    case 'DUE_PAYMENT':
      return {
        label: 'Payment Due',
        icon: '💳',
        className: 'alert-payment',
        color: '#d97706',
        background: '#fffbeb',
        description:
          'A water bill is approaching its due date.'
      };

    case 'BILL':
      return {
        label: 'Billing',
        icon: '🧾',
        className: 'alert-bill',
        color: '#7c3aed',
        background: '#f5f3ff',
        description:
          'There is an update related to your water bill.'
      };

    default:
      return {
        label: 'General Notice',
        icon: '🔔',
        className: 'alert-general',
        color: '#059669',
        background: '#ecfdf5',
        description:
          'General water management notification.'
      };
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AlertsTab({
  alerts = []
}) {
  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [alertFilter, setAlertFilter] =
    useState('ALL');

  /* =========================================================
     HELPERS
  ========================================================= */

  const getTitle = alert =>
    alert?.title ||
    alert?.alertTitle ||
    alert?.message ||
    'Water management alert';

  const getMessage = alert =>
    alert?.message ||
    alert?.description ||
    alert?.alertMessage ||
    'Please check this alert carefully.';

  const getDate = alert =>
    alert?.date ||
    alert?.createdDate ||
    alert?.alertDate ||
    'Recent';

  const getPriorityInfo = alert => {
    const priority =
      String(
        alert?.priority || ''
      ).toUpperCase();

    if (priority === 'HIGH') {
      return {
        label: 'IMPORTANT',
        className: 'priority-important'
      };
    }

    if (priority === 'MEDIUM') {
      return {
        label: 'ATTENTION',
        className: 'priority-medium'
      };
    }

    return {
      label: 'NOTICE',
      className: 'priority-notice'
    };
  };

  /* =========================================================
     ALERT COUNTS
  ========================================================= */

  const high = alerts.filter(
    alert =>
      String(
        alert?.priority || ''
      ).toUpperCase() === 'HIGH'
  );

  const medium = alerts.filter(
    alert =>
      String(
        alert?.priority || ''
      ).toUpperCase() !== 'HIGH'
  );

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredAlerts =
    alerts.filter(alert => {
      if (alertFilter === 'ALL') {
        return true;
      }

      const type =
        getAlertType(alert);

      if (
        alertFilter ===
        'HIGH_USAGE'
      ) {
        return type === 'HIGH_USAGE';
      }

      if (
        alertFilter ===
        'BILL_GENERATED'
      ) {
        return type === 'BILL';
      }

      if (
        alertFilter ===
        'DUE_PAYMENT'
      ) {
        return (
          type === 'DUE_PAYMENT' ||
          type === 'OVERDUE'
        );
      }

      return true;
    });

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          PAGE
      ====================================================== */}

      <div className="alerts-page">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div className="dash-section alerts-header-section">

          <div className="alerts-page-header">

            <div className="alerts-title-row">

              <div className="alerts-title-icon">
                🔔
              </div>

              <div>
                <h2>
                  Water Alerts
                </h2>

                <p>
                  Usage, billing, and water
                  supply notifications for
                  your household.
                </p>
              </div>

            </div>

            <div className="alerts-total-badge">

              <strong>
                {alerts.length}
              </strong>

              <span>
                Total Alerts
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="stat-cards alerts-summary-cards">

          {/* IMPORTANT */}

          <div className="stat-card alert-summary-important">

            <div className="summary-icon">
              ⚠️
            </div>

            <div>
              <div className="stat-card-val">
                {high.length}
              </div>

              <div className="stat-card-lbl">
                Important
              </div>
            </div>

          </div>

          {/* GENERAL */}

          <div className="stat-card alert-summary-general">

            <div className="summary-icon">
              🔔
            </div>

            <div>
              <div className="stat-card-val">
                {medium.length}
              </div>

              <div className="stat-card-lbl">
                General
              </div>
            </div>

          </div>

          {/* TOTAL */}

          <div className="stat-card alert-summary-total">

            <div className="summary-icon">
              📢
            </div>

            <div>
              <div className="stat-card-val">
                {alerts.length}
              </div>

              <div className="stat-card-lbl">
                Total Alerts
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================
            ALERT LIST
        ==================================================== */}

        <div className="dash-section">

          <div className="dash-section-head alerts-list-header">

            <div>
              <h2>
                Recent Alerts
              </h2>

              <p>
                View important updates about
                your water usage and bills.
              </p>
            </div>

            <select
              value={alertFilter}
              onChange={e =>
                setAlertFilter(
                  e.target.value
                )
              }
              className="alert-filter"
            >
              <option value="ALL">
                All Alerts
              </option>

              <option value="HIGH_USAGE">
                High Usage
              </option>

              <option value="BILL_GENERATED">
                Billing
              </option>

              <option value="DUE_PAYMENT">
                Payment
              </option>
            </select>

          </div>

          {/* EMPTY */}

          {!filteredAlerts.length ? (

            <div className="alerts-empty-box">

              <div className="alerts-empty-icon">
                ✓
              </div>

              <h3>
                No alerts found
              </h3>

              <p>
                There are no alerts available
                for this category.
              </p>

            </div>

          ) : (

            <div className="alerts-list">

              {filteredAlerts.map(
                (alert, index) => {

                  const typeInfo =
                    getAlertTypeInfo(
                      alert
                    );

                  const priorityInfo =
                    getPriorityInfo(
                      alert
                    );

                  return (
                    <div
                      key={
                        alert?.id ||
                        `${getTitle(
                          alert
                        )}-${index}`
                      }
                      className={`resident-alert ${typeInfo.className}`}
                    >

                      {/* ICON */}

                      <div
                        className="resident-alert-icon"
                        style={{
                          background:
                            typeInfo.background,
                          color:
                            typeInfo.color
                        }}
                      >
                        {typeInfo.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="alert-content">

                        <div className="alert-top">

                          <div className="alert-main-title">

                            <div className="alert-type-label">
                              {typeInfo.label}
                            </div>

                            <h3>
                              {getTitle(
                                alert
                              )}
                            </h3>

                          </div>

                          <div className="alert-date">
                            {getDate(
                              alert
                            )}
                          </div>

                        </div>

                        <p className="alert-message">
                          {getMessage(
                            alert
                          )}
                        </p>

                        <div className="alert-bottom">

                          <span
                            className={`priority ${priorityInfo.className}`}
                          >
                            {priorityInfo.label}
                          </span>

                          <button
                            type="button"
                            className="alert-view-button"
                            onClick={() =>
                              setSelectedAlert(
                                alert
                              )
                            }
                          >
                            <span>
                              View Alert
                            </span>

                            <span className="view-arrow">
                              →
                            </span>
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

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

        title={
          selectedAlert
            ? getTitle(
                selectedAlert
              )
            : 'Alert'
        }

        subtitle={
          selectedAlert
            ? getDate(
                selectedAlert
              )
            : ''
        }

        status={
          selectedAlert?.priority
        }

        onClose={() =>
          setSelectedAlert(null)
        }
      >

        {selectedAlert && (

          <div className="alert-modal-content">

            {/* MODAL HERO */}

            <div
              className="alert-modal-hero"
              style={{
                background:
                  getAlertTypeInfo(
                    selectedAlert
                  ).background,

                borderColor:
                  getAlertTypeInfo(
                    selectedAlert
                  ).color
              }}
            >

              <div
                className="alert-modal-icon"
                style={{
                  color:
                    getAlertTypeInfo(
                      selectedAlert
                    ).color
                }}
              >
                {
                  getAlertTypeInfo(
                    selectedAlert
                  ).icon
                }
              </div>

              <div>

                <div
                  className="alert-modal-type"
                  style={{
                    color:
                      getAlertTypeInfo(
                        selectedAlert
                      ).color
                  }}
                >
                  {
                    getAlertTypeInfo(
                      selectedAlert
                    ).label
                  }
                </div>

                <h3>
                  {getTitle(
                    selectedAlert
                  )}
                </h3>

                <p>
                  {
                    getAlertTypeInfo(
                      selectedAlert
                    ).description
                  }
                </p>

              </div>

            </div>

            {/* STATUS */}

            <div className="alert-modal-status-row">

              <div className="alert-modal-status-item">

                <span>
                  Priority
                </span>

                <strong>
                  {
                    selectedAlert?.priority ||
                    'NORMAL'
                  }
                </strong>

              </div>

              <div className="alert-modal-status-item">

                <span>
                  Status
                </span>

                <strong>
                  {
                    selectedAlert?.status ||
                    'ACTIVE'
                  }
                </strong>

              </div>

              <div className="alert-modal-status-item">

                <span>
                  Date
                </span>

                <strong>
                  {getDate(
                    selectedAlert
                  )}
                </strong>

              </div>

            </div>

            {/* DETAILS */}

            <h3 className="app-section-title">
              Alert Details
            </h3>

            <DetailGrid
              items={[
                {
                  label:
                    'Alert Type',

                  value:
                    displayValue(
                      selectedAlert?.type ||
                      selectedAlert?.alertType
                    )
                },

                {
                  label:
                    'Priority',

                  value:
                    displayValue(
                      selectedAlert?.priority
                    )
                },

                {
                  label:
                    'Status',

                  value:
                    displayValue(
                      selectedAlert?.status
                    )
                },

                {
                  label:
                    'Date',

                  value:
                    displayValue(
                      getDate(
                        selectedAlert
                      )
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
                      selectedAlert
                        ?.householdId
                    )
                }
              ]}
            />

            {/* MESSAGE */}

            <h3 className="app-section-title">
              Alert Message
            </h3>

            <div className="alert-modal-message">

              <div className="message-icon">
                💬
              </div>

              <p>
                {getMessage(
                  selectedAlert
                )}
              </p>

            </div>

          </div>

        )}

      </DetailsModal>

      {/* =====================================================
          CSS
      ====================================================== */}

      <style>{`

        /* =====================================================
           ALERT PAGE
        ====================================================== */

        .alerts-page {
          width: 100%;
        }

        /* =====================================================
           HEADER
        ====================================================== */

        .alerts-header-section {
          overflow: hidden;
        }

        .alerts-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .alerts-title-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .alerts-title-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 25px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #06b6d4
            );

          box-shadow:
            0 8px 20px
            rgba(
              37,
              99,
              235,
              0.22
            );
        }

        .alerts-page-header h2 {
          margin: 0 0 5px;
        }

        .alerts-page-header p {
          margin: 0;
          color: var(--text-muted);
        }

        .alerts-total-badge {
          min-width: 120px;

          padding: 14px 18px;

          border-radius: 15px;

          display: flex;
          flex-direction: column;
          align-items: center;

          background:
            linear-gradient(
              135deg,
              #eff6ff,
              #ecfeff
            );

          border: 1px solid #bfdbfe;
        }

        .alerts-total-badge strong {
          font-size: 25px;
          color: #2563eb;
        }

        .alerts-total-badge span {
          font-size: 12px;
          color: #64748b;
        }

        /* =====================================================
           SUMMARY CARDS
        ====================================================== */

        .alerts-summary-cards {
          margin-top: 20px;
        }

        .alert-summary-important {
          border-top: 4px solid #ef4444;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #fef2f2
            );
        }

        .alert-summary-general {
          border-top: 4px solid #f59e0b;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #fffbeb
            );
        }

        .alert-summary-total {
          border-top: 4px solid #2563eb;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #eff6ff
            );
        }

        .summary-icon {
          width: 42px;
          height: 42px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;

          margin-bottom: 8px;
        }

        /* =====================================================
           FILTER
        ====================================================== */

        .alert-filter {
          min-width: 170px;

          padding: 10px 14px;

          border:
            1px solid var(--border);

          border-radius: 10px;

          background:
            var(--surface);

          color:
            var(--text);

          font-weight: 600;

          cursor: pointer;
        }

        .alert-filter:focus {
          outline: none;

          border-color:
            var(--primary);

          box-shadow:
            0 0 0 3px
            rgba(
              37,
              99,
              235,
              0.12
            );
        }

        /* =====================================================
           ALERT LIST
        ====================================================== */

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .resident-alert {
          position: relative;

          display: flex;

          gap: 16px;

          padding: 18px;

          border-radius: 16px;

          border:
            1px solid var(--border);

          background:
            var(--surface);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

          overflow: hidden;
        }

        .resident-alert:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 10px 28px
            rgba(
              0,
              0,
              0,
              0.08
            );
        }

        /* =====================================================
           COLOUR STRIP
        ====================================================== */

        .resident-alert::before {
          content: '';

          position: absolute;

          left: 0;
          top: 0;
          bottom: 0;

          width: 5px;
        }

        .alert-high-usage {
          background:
            linear-gradient(
              90deg,
              #eff6ff 0%,
              #ffffff 30%
            );

          border-color:
            #bfdbfe;
        }

        .alert-high-usage::before {
          background:
            #2563eb;
        }

        .alert-overdue {
          background:
            linear-gradient(
              90deg,
              #fef2f2 0%,
              #ffffff 30%
            );

          border-color:
            #fecaca;
        }

        .alert-overdue::before {
          background:
            #dc2626;
        }

        .alert-payment {
          background:
            linear-gradient(
              90deg,
              #fffbeb 0%,
              #ffffff 30%
            );

          border-color:
            #fde68a;
        }

        .alert-payment::before {
          background:
            #f59e0b;
        }

        .alert-bill {
          background:
            linear-gradient(
              90deg,
              #f5f3ff 0%,
              #ffffff 30%
            );

          border-color:
            #ddd6fe;
        }

        .alert-bill::before {
          background:
            #7c3aed;
        }

        .alert-general {
          background:
            linear-gradient(
              90deg,
              #ecfdf5 0%,
              #ffffff 30%
            );

          border-color:
            #a7f3d0;
        }

        .alert-general::before {
          background:
            #059669;
        }

        /* =====================================================
           ICON
        ====================================================== */

        .resident-alert-icon {
          flex:
            0 0 48px;

          width: 48px;
          height: 48px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 22px;
        }

        /* =====================================================
           CONTENT
        ====================================================== */

        .alert-content {
          flex: 1;
          min-width: 0;
        }

        .alert-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .alert-main-title {
          min-width: 0;
        }

        .alert-type-label {
          font-size: 11px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            0.7px;

          margin-bottom: 4px;

          color:
            var(--text-muted);
        }

        .alert-top h3 {
          margin: 0;

          font-size: 17px;

          color:
            var(--text);
        }

        .alert-date {
          white-space: nowrap;

          font-size: 12px;

          color:
            var(--text-muted);
        }

        .alert-message {
          margin:
            8px 0 13px;

          line-height:
            1.55;

          color:
            var(--text-muted);
        }

        /* =====================================================
           BOTTOM
        ====================================================== */

        .alert-bottom {
          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 15px;
        }

        /* =====================================================
           PRIORITY
        ====================================================== */

        .priority {
          display: inline-flex;

          align-items: center;

          padding:
            5px 10px;

          border-radius:
            999px;

          font-size:
            10px;

          font-weight:
            800;

          letter-spacing:
            0.5px;
        }

        .priority-important {
          color:
            #b91c1c;

          background:
            #fee2e2;
        }

        .priority-medium {
          color:
            #92400e;

          background:
            #fef3c7;
        }

        .priority-notice {
          color:
            #047857;

          background:
            #d1fae5;
        }

        /* =====================================================
           VIEW BUTTON
        ====================================================== */

        .alert-view-button {
          display: inline-flex;

          align-items: center;

          justify-content:
            center;

          gap: 8px;

          border: none;

          padding:
            9px 15px;

          border-radius:
            10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          color: white;

          font-weight: 700;

          font-size: 12px;

          cursor: pointer;

          box-shadow:
            0 5px 12px
            rgba(
              37,
              99,
              235,
              0.2
            );

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .alert-view-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 8px 18px
            rgba(
              37,
              99,
              235,
              0.28
            );
        }

        .view-arrow {
          font-size: 16px;

          transition:
            transform 0.2s ease;
        }

        .alert-view-button:hover
        .view-arrow {
          transform:
            translateX(3px);
        }

        /* =====================================================
           EMPTY STATE
        ====================================================== */

        .alerts-empty-box {
          text-align: center;

          padding:
            45px 20px;

          border-radius:
            15px;

          background:
            var(--surface);

          border:
            1px dashed
            var(--border);
        }

        .alerts-empty-icon {
          width: 55px;
          height: 55px;

          margin:
            0 auto 12px;

          border-radius:
            50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            #dcfce7;

          color:
            #16a34a;

          font-size: 25px;

          font-weight: bold;
        }

        .alerts-empty-box h3 {
          margin:
            0 0 5px;
        }

        .alerts-empty-box p {
          margin: 0;

          color:
            var(--text-muted);
        }

        /* =====================================================
           MODAL
        ====================================================== */

        .alert-modal-content {
          display: flex;

          flex-direction:
            column;

          gap: 18px;
        }

        /* MODAL HERO */

        .alert-modal-hero {
          display: flex;

          align-items: center;

          gap: 16px;

          padding: 18px;

          border-radius: 15px;

          border-left:
            5px solid;
        }

        .alert-modal-icon {
          width: 52px;
          height: 52px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 26px;

          border-radius: 14px;

          background:
            rgba(
              255,
              255,
              255,
              0.8
            );
        }

        .alert-modal-type {
          font-size: 11px;

          font-weight: 800;

          text-transform:
            uppercase;

          letter-spacing:
            0.7px;

          margin-bottom: 3px;
        }

        .alert-modal-hero h3 {
          margin:
            0 0 5px;

          font-size: 19px;
        }

        .alert-modal-hero p {
          margin: 0;

          color:
            var(--text-muted);

          font-size: 13px;
        }

        /* =====================================================
           MODAL STATUS
        ====================================================== */

        .alert-modal-status-row {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 10px;
        }

        .alert-modal-status-item {
          padding: 13px;

          border-radius: 12px;

          background:
            var(--background);

          border:
            1px solid
            var(--border);

          display: flex;

          flex-direction:
            column;

          gap: 4px;
        }

        .alert-modal-status-item span {
          font-size: 11px;

          color:
            var(--text-muted);
        }

        .alert-modal-status-item strong {
          font-size: 13px;

          color:
            var(--text);
        }

        /* =====================================================
           MESSAGE
        ====================================================== */

        .alert-modal-message {
          display: flex;

          gap: 12px;

          padding: 15px;

          border-radius: 12px;

          background:
            #f8fafc;

          border:
            1px solid
            #e2e8f0;
        }

        .message-icon {
          width: 35px;
          height: 35px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            #e0f2fe;
        }

        .alert-modal-message p {
          margin: 0;

          line-height: 1.6;

          color:
            var(--text);
        }

        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 768px) {

          .alerts-page-header {
            flex-direction:
              column;

            align-items:
              flex-start;
          }

          .alerts-total-badge {
            align-self:
              stretch;
          }

          .alerts-list-header {
            flex-direction:
              column;

            align-items:
              flex-start;
          }

          .alert-filter {
            width: 100%;
          }

          .resident-alert {
            padding: 15px;
          }

          .alert-top {
            flex-direction:
              column;

            gap: 5px;
          }

          .alert-date {
            white-space:
              normal;
          }

          .alert-bottom {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

          .alert-view-button {
            width: 100%;
          }

          .alert-modal-status-row {
            grid-template-columns:
              1fr;
          }

        }

      `}</style>
    </>
  );
}
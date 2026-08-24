import { useState } from 'react';

export default function AlertsTab({ alerts = [] }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertFilter, setAlertFilter] = useState('ALL');

  const high = alerts.filter(a => a.priority === 'HIGH');
  const medium = alerts.filter(a => a.priority !== 'HIGH');

  const getIcon = a => {
    if (a.icon) return a.icon;
    if (a.type?.includes('LEAK')) return '🚨';
    if (a.type?.includes('BILL')) return '🧾';
    if (a.type?.includes('SUPPLY')) return '💧';
    if (a.type?.includes('USAGE')) return '💧';
    if (a.type?.includes('PAYMENT')) return '💳';
    return '⚠️';
  };

  const getTitle = a =>
    a.title || a.alertTitle || a.message || 'Water Management Alert';

  const getMessage = a =>
    a.message || a.description || a.alertMessage ||
    'Please check this alert carefully.';

  const getDate = a =>
    a.date || a.createdDate || a.alertDate || 'Recent';

  /* FILTER ALERTS */
  const filteredAlerts = alerts.filter(a => {
    if (alertFilter === 'ALL') return true;

    const text = `${a.type || ''} ${a.title || ''} ${a.alertTitle || ''} ${a.message || ''} ${a.description || ''}`.toUpperCase();

    if (alertFilter === 'HIGH_USAGE')
      return text.includes('USAGE') || text.includes('HIGH USAGE');

    if (alertFilter === 'BILL_GENERATED')
      return text.includes('BILL') || text.includes('GENERATED');

    if (alertFilter === 'DUE_PAYMENT')
      return text.includes('DUE') || text.includes('PAYMENT');

    return true;
  });

  return (
    <div className="alerts-page">

      <div className="dash-section alert-head">
        <div className="dash-section-head">
          <div>
            <h2>🚨 Water Alerts</h2>
            <p>Important alerts about your water usage, bills and supply.</p>
          </div>
          <span className="alert-count">{alerts.length} Alerts</span>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card alert-card high">
          <b>🚨</b>
          <div className="stat-card-val">{high.length}</div>
          <div className="stat-card-lbl">Important Alerts</div>
        </div>

        <div className="stat-card alert-card medium">
          <b>⚠️</b>
          <div className="stat-card-val">{medium.length}</div>
          <div className="stat-card-lbl">General Alerts</div>
        </div>

        <div className="stat-card alert-card total">
          <b>🔔</b>
          <div className="stat-card-val">{alerts.length}</div>
          <div className="stat-card-lbl">Total Alerts</div>
        </div>
      </div>

      <div className="dash-section alerts-box">
        <div className="dash-section-head">
          <div>
            <h2>🔔 Recent Alerts</h2>
            <span className="chart-subtitle">
              Important notifications for your household
            </span>
          </div>

          {/* DROPDOWN ADDED */}
          <select
            value={alertFilter}
            onChange={e => setAlertFilter(e.target.value)}
            className="alert-filter"
          >
            <option value="ALL">All Alerts</option>
            <option value="HIGH_USAGE">💧 High Usage</option>
            <option value="BILL_GENERATED">🧾 Bill Generated</option>
            <option value="DUE_PAYMENT">💳 Due Payment</option>
          </select>
        </div>

        {!filteredAlerts.length ? (
          <div className="empty-alert">
            <div>🎉</div>
            <h3>No Alerts</h3>
            <p>No alerts found for this category.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map((a, i) => (
              <div
                className={`resident-alert ${
                  a.priority === 'HIGH' ? 'danger' : 'warning'
                }`}
                key={a.id || i}
              >
                <div className="red-light">
                  <span />
                </div>

                <div className="alert-icon">{getIcon(a)}</div>

                <div className="alert-content">
                  <div className="alert-top">
                    <div>
                      <h3>{getTitle(a)}</h3>

                      <span
                        className={`priority ${
                          a.priority === 'HIGH'
                            ? 'important'
                            : 'notice'
                        }`}
                      >
                        {a.priority === 'HIGH'
                          ? 'IMPORTANT'
                          : 'NOTICE'}
                      </span>
                    </div>

                    <small>{getDate(a)}</small>
                  </div>

                  <p>{getMessage(a)}</p>

                  <button
                    className="view-alert"
                    onClick={() => setSelectedAlert(a)}
                  >
                    📖 View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAlert && (
        <div
          className="alert-modal-overlay"
          onClick={() => setSelectedAlert(null)}
        >
          <div
            className="alert-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="alert-modal-head">
              <div>
                <div className="modal-icon">
                  {getIcon(selectedAlert)}
                </div>

                <h2>{getTitle(selectedAlert)}</h2>
                <span>{getDate(selectedAlert)}</span>
              </div>

              <button
                className="close-alert"
                onClick={() => setSelectedAlert(null)}
              >
                ✕
              </button>
            </div>

            <div className="alert-modal-body">
              <div className="modal-warning">
                🚨

                <div>
                  <strong>
                    {selectedAlert.priority === 'HIGH'
                      ? 'Important Alert'
                      : 'Water Management Notice'}
                  </strong>

                  <p>Please read this notification carefully.</p>
                </div>
              </div>

              <h3>Alert Details</h3>

              <div className="modal-message">
                {getMessage(selectedAlert)}
              </div>

              <div className="modal-info">
                <div>
                  <b>Type</b>
                  <span>
                    {selectedAlert.type || 'Water Alert'}
                  </span>
                </div>

                <div>
                  <b>Date</b>
                  <span>{getDate(selectedAlert)}</span>
                </div>

                <div>
                  <b>Priority</b>
                  <span>
                    {selectedAlert.priority || 'NOTICE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="alert-modal-footer">
              <button
                className="btn-sm"
                onClick={() => setSelectedAlert(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes alertIn {
          from {opacity:0;transform:translateY(12px)}
          to {opacity:1;transform:translateY(0)}
        }

        @keyframes redPulse {
          0%,100% {
            box-shadow:0 0 0 0 rgba(239,68,68,.4)
          }
          50% {
            box-shadow:0 0 0 7px rgba(239,68,68,0)
          }
        }

        .alerts-page {
          animation:alertIn .4s ease
        }

        .alert-head p {
          margin:6px 0 0;
          color:#64748b;
          font-size:14px
        }

        .alert-count {
          padding:7px 14px;
          border-radius:20px;
          background:#fff1f2;
          color:#dc2626;
          font-size:12px;
          font-weight:700
        }

        .alert-card {
          position:relative;
          overflow:hidden;
          transition:.25s
        }

        .alert-card:hover {
          transform:translateY(-4px);
          box-shadow:0 12px 28px rgba(15,76,92,.12)
        }

        .alert-card b {
          position:absolute;
          right:18px;
          top:15px;
          font-size:27px;
          opacity:.18
        }

        .alert-card.high {
          border-left:4px solid #ef4444;
          background:linear-gradient(135deg,#fff,#fff5f5)
        }

        .alert-card.medium {
          border-left:4px solid #f59e0b;
          background:linear-gradient(135deg,#fff,#fffbeb)
        }

        .alert-card.total {
          border-left:4px solid var(--primary);
          background:linear-gradient(135deg,#fff,#f3fafb)
        }

        .alerts-box {
          margin-top:20px
        }

        /* DROPDOWN */
        .alert-filter {
          min-width:190px;
          padding:10px 13px;
          border:1px solid #dbe4ea;
          border-radius:10px;
          background:#fff;
          color:#334155;
          font-size:13px;
          font-weight:600;
          cursor:pointer;
          outline:none;
          transition:.25s;
        }

        .alert-filter:hover {
          border-color:var(--primary);
          box-shadow:0 4px 12px rgba(15,76,92,.08);
        }

        .alert-filter:focus {
          border-color:var(--primary);
          box-shadow:0 0 0 3px rgba(15,76,92,.1);
        }

        .alerts-list {
          display:flex;
          flex-direction:column;
          gap:13px
        }

        .resident-alert {
          display:flex;
          gap:13px;
          padding:17px;
          border-radius:14px;
          background:#fff;
          border:1px solid #e2e8f0;
          animation:alertIn .4s ease;
          transition:.25s
        }

        .resident-alert:hover {
          transform:translateX(4px);
          box-shadow:0 10px 25px rgba(15,76,92,.1)
        }

        .resident-alert.danger {
          border-left:4px solid #ef4444;
          background:linear-gradient(90deg,#fff8f8,#fff)
        }

        .resident-alert.warning {
          border-left:4px solid #f59e0b;
          background:linear-gradient(90deg,#fffdf5,#fff)
        }

        .red-light {
          width:12px;
          padding-top:7px
        }

        .red-light span {
          display:block;
          width:10px;
          height:10px;
          background:#ef4444;
          border-radius:50%;
          animation:redPulse 1.6s infinite
        }

        .warning .red-light span {
          background:#f59e0b
        }

        .alert-icon {
          width:46px;
          height:46px;
          min-width:46px;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:12px;
          background:#fff1f2;
          font-size:22px
        }

        .warning .alert-icon {
          background:#fffbeb
        }

        .alert-content {
          flex:1;
          min-width:0
        }

        .alert-top {
          display:flex;
          justify-content:space-between;
          gap:15px
        }

        .alert-top h3 {
          margin:0 0 6px;
          color:#0f172a;
          font-size:15px
        }

        .alert-top small {
          color:#94a3b8;
          white-space:nowrap
        }

        .alert-content p {
          margin:8px 0;
          color:#64748b;
          font-size:13px;
          line-height:1.6
        }

        .priority {
          padding:4px 8px;
          border-radius:6px;
          font-size:10px;
          font-weight:800
        }

        .important {
          background:#fee2e2;
          color:#dc2626
        }

        .notice {
          background:#fef3c7;
          color:#d97706
        }

        .view-alert {
          border:0;
          background:none;
          color:var(--primary);
          font-weight:700;
          cursor:pointer;
          font-size:12px;
          padding:0
        }

        .view-alert:hover {
          text-decoration:underline
        }

        .empty-alert {
          text-align:center;
          padding:50px 20px;
          color:#64748b
        }

        .empty-alert div {
          font-size:42px
        }

        .empty-alert h3 {
          color:#334155;
          margin:10px 0 5px
        }

        .alert-modal-overlay {
          position:fixed;
          inset:0;
          z-index:9999;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          background:rgba(15,23,42,.6)
        }

        .alert-modal {
          width:100%;
          max-width:650px;
          max-height:90vh;
          overflow:auto;
          background:#fff;
          border-radius:16px;
          box-shadow:0 25px 60px rgba(0,0,0,.25);
          animation:alertIn .25s ease
        }

        .alert-modal-head {
          display:flex;
          justify-content:space-between;
          padding:20px;
          border-bottom:1px solid #e2e8f0
        }

        .modal-icon {
          font-size:30px
        }

        .alert-modal-head h2 {
          margin:3px 0;
          color:var(--primary)
        }

        .alert-modal-head span {
          color:#94a3b8;
          font-size:12px
        }

        .close-alert {
          border:0;
          background:#f1f5f9;
          width:36px;
          height:36px;
          border-radius:50%;
          cursor:pointer
        }

        .alert-modal-body {
          padding:24px
        }

        .modal-warning {
          display:flex;
          gap:12px;
          padding:14px;
          margin-bottom:20px;
          border-radius:10px;
          background:#fff1f2;
          border:1px solid #fecdd3;
          color:#be123c
        }

        .modal-warning p {
          margin:3px 0 0;
          font-size:12px
        }

        .modal-message {
          padding:17px;
          border-radius:10px;
          background:#f8fafc;
          border:1px solid #e2e8f0;
          color:#334155;
          line-height:1.7
        }

        .modal-info {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:12px;
          margin-top:18px
        }

        .modal-info div {
          padding:12px;
          border-radius:9px;
          background:#f8fafc
        }

        .modal-info b,
        .modal-info span {
          display:block
        }

        .modal-info b {
          color:#64748b;
          font-size:11px;
          margin-bottom:4px
        }

        .modal-info span {
          color:#334155;
          font-size:12px;
          font-weight:600
        }

        .alert-modal-footer {
          padding:15px 22px;
          border-top:1px solid #e2e8f0;
          text-align:right
        }

        @media(max-width:700px) {
          .alert-top {
            flex-direction:column
          }

          .modal-info {
            grid-template-columns:1fr
          }

          .alert-filter {
            min-width:150px
          }
        }
      `}</style>
    </div>
  );
}
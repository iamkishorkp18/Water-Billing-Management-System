export default function ResidentOverviewTab({
  latestBill,
  currentConsumption,
  usageStatus,
  alerts,
  tips
}) {
  const statusClass =
    usageStatus === 'High'
      ? 'status-high'
      : usageStatus === 'Low'
      ? 'status-low'
      : 'status-normal';

  return (
    <>
      <div className="stat-cards">

        <div className="stat-card">
          <div className="stat-card-val">
            {currentConsumption > 0
              ? currentConsumption.toFixed(0)
              : '—'}
          </div>
          <div className="stat-card-lbl">
            Units This Month
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            ₹
            {latestBill
              ? Number(latestBill.amount).toFixed(2)
              : '0.00'}
          </div>
          <div className="stat-card-lbl">
            Current Bill
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <span
              className={`status-pill ${
                latestBill?.status === 'PAID'
                  ? 'status-normal'
                  : 'status-high'
              }`}
            >
              {latestBill?.status || 'No Bill'}
            </span>
          </div>
          <div className="stat-card-lbl">
            Payment Status
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <span className={`status-pill ${statusClass}`}>
              {usageStatus}
            </span>
          </div>
          <div className="stat-card-lbl">
            Usage Status
          </div>
        </div>

      </div>

      {alerts.length > 0 && (
        <div
          className="dash-section"
          style={{
            borderLeft: '4px solid var(--danger)'
          }}
        >
          <div className="dash-section-head">
            <h2>⚠️ Leak Detection Alerts</h2>
          </div>

          {alerts.map(a => (
            <div
              key={a.id}
              className="banner banner-error"
              style={{ marginBottom: 10 }}
            >
              <strong>
                {a.alertType === 'HIGH_USAGE'
                  ? 'Possible Leak / High Usage'
                  : a.alertType}
              </strong>
              {' — '}
              {a.message}
            </div>
          ))}
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>💡 Water Saving Tips</h2>
        </div>

        <div
          className="chart-grid"
          style={{
            gridTemplateColumns:
              'repeat(3, 1fr)'
          }}
        >
          {tips.slice(0, 3).map((t, i) => (
            <div key={i} className="tip-card">
              <span className="tip-icon">
                {t.icon}
              </span>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
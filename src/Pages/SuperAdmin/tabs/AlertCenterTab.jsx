function AlertCenterTab({ alerts }) {
  return (
    <div className="dash-section">
      <div className="dash-section-head"><h2>Active Alerts (Platform-wide)</h2></div>

      {alerts.length === 0 ? (
        <p className="empty-state">No active alerts. All households look normal.</p>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="banner banner-error" style={{ marginBottom: 10 }}>
            <strong>{a.alertType}</strong> — {a.message}
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
              {a.household?.flatNumber
                ? `Household: ${a.household.flatNumber} · `
                : ''}
              {a.createdDate}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AlertCenterTab;
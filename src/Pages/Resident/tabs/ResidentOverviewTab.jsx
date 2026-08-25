import { useState } from 'react';
import DetailsModal, { DetailGrid, displayValue, StatusBadge } from '../../../components/app/DetailsModal';

export default function ResidentOverviewTab({
  latestBill,
  currentConsumption,
  usageStatus,
  alerts,
  tips
}) {
  const [selectedAlert, setSelectedAlert] = useState(null);

  return (
    <>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-val">
            {currentConsumption > 0 ? currentConsumption.toFixed(0) : '—'}
          </div>
          <div className="stat-card-lbl">Units this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            ₹{latestBill ? Number(latestBill.amount).toFixed(2) : '0.00'}
          </div>
          <div className="stat-card-lbl">Current bill</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <StatusBadge status={latestBill?.status || 'No Bill'} />
          </div>
          <div className="stat-card-lbl">Payment status</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            <StatusBadge status={usageStatus} />
          </div>
          <div className="stat-card-lbl">Usage status</div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Alerts</h2>
          </div>
          {alerts.map(a => (
            <div key={a.id} className="banner banner-error" style={{ marginBottom: 10 }}>
              <strong>{a.alertType === 'HIGH_USAGE' ? 'High usage' : a.alertType}</strong>
              {' — '}
              {a.message}
              <div>
                <button type="button" className="app-view-btn" style={{ marginTop: 8 }} onClick={() => setSelectedAlert(a)}>
                  View Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Water-saving notes</h2>
        </div>
        <div className="chart-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {tips.slice(0, 3).map((t, i) => (
            <div key={i} className="tip-card">
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      <DetailsModal
        open={Boolean(selectedAlert)}
        title={displayValue(selectedAlert?.title || selectedAlert?.alertType || 'Alert')}
        subtitle={displayValue(selectedAlert?.createdDate || selectedAlert?.date)}
        status={selectedAlert?.priority || selectedAlert?.status}
        onClose={() => setSelectedAlert(null)}
      >
        <DetailGrid items={[
          { label: 'Type', value: displayValue(selectedAlert?.alertType || selectedAlert?.type) },
          { label: 'Severity', value: displayValue(selectedAlert?.priority || selectedAlert?.severity) },
          { label: 'Message', value: displayValue(selectedAlert?.message) },
          { label: 'Household', value: displayValue(selectedAlert?.household?.flatNumber || selectedAlert?.householdId) },
        ]} />
      </DetailsModal>
    </>
  );
}

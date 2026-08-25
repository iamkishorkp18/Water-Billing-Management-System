import { useState } from 'react';
import DetailsModal, { DetailGrid, displayValue } from '../../../components/app/DetailsModal';

export default function AlertsTab({ alerts = [] }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertFilter, setAlertFilter] = useState('ALL');

  const high = alerts.filter(a => a.priority === 'HIGH');
  const medium = alerts.filter(a => a.priority !== 'HIGH');

  const getTitle = a =>
    a.title || a.alertTitle || a.message || 'Water management alert';

  const getMessage = a =>
    a.message || a.description || a.alertMessage ||
    'Please check this alert carefully.';

  const getDate = a =>
    a.date || a.createdDate || a.alertDate || 'Recent';

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
      <div className="dash-section">
        <div className="dash-section-head">
          <div>
            <h2>Water alerts</h2>
            <p>Usage, billing, and supply notices for your household.</p>
          </div>
          <span className="alert-count">{alerts.length} alerts</span>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-val">{high.length}</div>
          <div className="stat-card-lbl">Important</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{medium.length}</div>
          <div className="stat-card-lbl">General</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{alerts.length}</div>
          <div className="stat-card-lbl">Total</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Recent alerts</h2>
          <select
            value={alertFilter}
            onChange={e => setAlertFilter(e.target.value)}
            className="alert-filter"
            aria-label="Filter alerts"
          >
            <option value="ALL">All alerts</option>
            <option value="HIGH_USAGE">High usage</option>
            <option value="BILL_GENERATED">Bill generated</option>
            <option value="DUE_PAYMENT">Due payment</option>
          </select>
        </div>

        {!filteredAlerts.length ? (
          <p className="empty-state">No alerts found for this category.</p>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map((a, i) => (
              <div className="resident-alert" key={a.id || i}>
                <div className="alert-content">
                  <div className="alert-top">
                    <div>
                      <h3>{getTitle(a)}</h3>
                      <span className={`priority ${a.priority === 'HIGH' ? 'important' : 'notice'}`}>
                        {a.priority === 'HIGH' ? 'IMPORTANT' : 'NOTICE'}
                      </span>
                    </div>
                    <small>{getDate(a)}</small>
                  </div>
                  <p>{getMessage(a)}</p>
                  <button type="button" className="app-view-btn" onClick={() => setSelectedAlert(a)}>
                    View Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DetailsModal
        open={Boolean(selectedAlert)}
        title={selectedAlert ? getTitle(selectedAlert) : 'Alert'}
        subtitle={selectedAlert ? getDate(selectedAlert) : ''}
        status={selectedAlert?.priority}
        onClose={() => setSelectedAlert(null)}
      >
        <DetailGrid items={[
          { label: 'Type', value: displayValue(selectedAlert?.type || selectedAlert?.alertType) },
          { label: 'Date', value: displayValue(selectedAlert && getDate(selectedAlert)) },
          { label: 'Priority', value: displayValue(selectedAlert?.priority) },
          { label: 'Status', value: displayValue(selectedAlert?.status) },
          { label: 'Household', value: displayValue(selectedAlert?.household?.flatNumber) },
        ]} />
        <h3 className="app-section-title">Message</h3>
        <p>{selectedAlert ? getMessage(selectedAlert) : ''}</p>
      </DetailsModal>
    </div>
  );
}

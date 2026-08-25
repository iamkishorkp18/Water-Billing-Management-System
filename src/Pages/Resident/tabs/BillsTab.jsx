import { useState } from 'react';
import DetailsModal, { DetailGrid, displayValue } from '../../../components/app/DetailsModal';

function householdOf(bill) {
  return bill?.household || {};
}

function apartmentOf(bill) {
  const household = householdOf(bill);
  return bill?.apartment || household?.apartment || {};
}

export default function BillsTab({
  bills,
  onCurrentDownload,
  onPaidDownload,
  onAllCurrent,
  onAllPaid,
  tariff
}) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [selected, setSelected] = useState(null);

  const pending = bills.filter(
    b => b.status !== 'PAID'
  );

  const paid = bills.filter(
    b => b.status === 'PAID'
  );

  const years = [
    ...new Set(
      bills.map(b =>
        b.billingMonth?.split('-')[0]
      )
    )
  ].sort().reverse();

  const billRows = (list, paidList) =>
    list.map(b => {
      const household = householdOf(b);
      const apartment = apartmentOf(b);
      return (
        <tr key={b.id}>
          <td>
            <strong>{displayValue(b.billingMonth)}</strong>
            <small style={{ display: 'block', color: '#6a6258' }}>
              {displayValue(apartment.name || apartment.apartmentName)}
            </small>
          </td>
          <td>₹{displayValue(b.amount)}</td>
          <td>{displayValue(b.consumption)}</td>
          <td>
            <span className={`badge ${paidList ? 'badge-success' : 'badge-warning'}`}>
              {b.status || 'PENDING'}
            </span>
          </td>
          <td>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="app-view-btn" onClick={() => setSelected(b)}>
                View Bill
              </button>
              <button
                className="btn-sm btn-approve"
                onClick={() => paidList ? onPaidDownload(b.id) : onCurrentDownload(b.id)}
              >
                Download
              </button>
            </div>
          </td>
        </tr>
      );
    });

  const selectedHousehold = householdOf(selected);
  const selectedApartment = apartmentOf(selected);

  return (
    <>
      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Current bills</h2>
        </div>

        <div className="billing-filter-bar">
          <select value={year} onChange={e => setYear(e.target.value)} aria-label="Filter by year">
            <option value="">All years</option>
            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Filter by month">
            <option value="">All months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('en', { month: 'long' })}
              </option>
            ))}
          </select>

          <button className="btn btn-fill" onClick={() => onAllCurrent(year, month)}>
            Download all current bills
          </button>
        </div>

        <div className="app-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period / property</th>
                <th>Amount</th>
                <th>Consumption</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">No pending bills.</td>
                </tr>
              ) : billRows(pending, false)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Billing history</h2>
        </div>

        <div style={{ marginBottom: 15 }}>
          <button className="btn btn-fill" onClick={() => onAllPaid(year, month)}>
            Download all paid bills
          </button>
        </div>

        <div className="app-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Period / property</th>
                <th>Amount</th>
                <th>Consumption</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paid.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">No paid bills yet.</td>
                </tr>
              ) : billRows(paid, true)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Tariff plan</h2>
        </div>

        {!tariff ? (
          <p className="empty-state">Tariff information not available.</p>
        ) : (
          <>
            <div className="tariff-slab-row">
              <span>Tier 1 — 0 to {tariff.tier1Limit} units</span>
              <strong>₹{Number(tariff.tier1Rate).toFixed(2)}</strong>
            </div>
            <div className="tariff-slab-row">
              <span>Tier 2 — {tariff.tier1Limit} to {tariff.tier2Limit} units</span>
              <strong>₹{Number(tariff.tier2Rate).toFixed(2)}</strong>
            </div>
            <div className="tariff-slab-row">
              <span>Tier 3 — Above {tariff.tier2Limit} units</span>
              <strong>₹{Number(tariff.tier3Rate).toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>

      <DetailsModal
        open={Boolean(selected)}
        title={`Bill ${displayValue(selected?.billNumber || selected?.id)}`}
        subtitle={displayValue(selected?.billingMonth)}
        status={selected?.status}
        onClose={() => setSelected(null)}
      >
        <h3 className="app-section-title">Property</h3>
        <DetailGrid items={[
          { label: 'Community', value: displayValue(selectedApartment.communityName || selectedApartment.community?.name || selectedApartment.ward) },
          { label: 'Apartment', value: displayValue(selectedApartment.name || selectedApartment.apartmentName) },
          { label: 'Flat', value: displayValue(selectedHousehold.flatNumber || selectedHousehold.flatNo) },
        ]} />
        <h3 className="app-section-title">Household</h3>
        <DetailGrid items={[
          { label: 'Household', value: displayValue(selectedHousehold.name || selectedHousehold.householdName || selectedHousehold.id) },
          { label: 'Resident', value: displayValue(selectedHousehold.residentName || selected?.residentName) },
        ]} />
        <h3 className="app-section-title">Consumption & payment</h3>
        <DetailGrid items={[
          { label: 'Billing month', value: displayValue(selected?.billingMonth) },
          { label: 'Consumption', value: displayValue(selected?.consumption) },
          { label: 'Amount', value: selected?.amount != null ? `₹${selected.amount}` : '—' },
          { label: 'Due date', value: displayValue(selected?.dueDate) },
          { label: 'Generated', value: displayValue(selected?.generatedDate || selected?.createdDate) },
          { label: 'Status', value: displayValue(selected?.status) },
        ]} />
      </DetailsModal>
    </>
  );
}

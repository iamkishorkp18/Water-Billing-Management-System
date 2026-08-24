import { useState } from 'react';

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

  return (
    <>
      <div className="dash-section">

        <div className="dash-section-head">
          <h2>🟠 Current Bills</h2>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 15
          }}
        >
          <select
            value={year}
            onChange={e =>
              setYear(e.target.value)
            }
          >
            <option value="">
              All Years
            </option>

            {years.map(y => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <select
            value={month}
            onChange={e =>
              setMonth(e.target.value)
            }
          >
            <option value="">
              All Months
            </option>

            {Array.from(
              { length: 12 },
              (_, i) => (
                <option
                  key={i + 1}
                  value={i + 1}
                >
                  {new Date(
                    2000,
                    i
                  ).toLocaleString(
                    'en',
                    { month: 'long' }
                  )}
                </option>
              )
            )}
          </select>

          <button
            className="btn btn-fill"
            onClick={() =>
              onAllCurrent(year, month)
            }
          >
            📥 Download All Current Bills
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>

          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="empty-state"
                >
                  No pending bills.
                </td>
              </tr>
            ) : (
              pending.map(b => (
                <tr key={b.id}>
                  <td>{b.billingMonth}</td>
                  <td>₹{b.amount}</td>
                  <td>
                    {b.dueDate || '—'}
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {b.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() =>
                        onCurrentDownload(b.id)
                      }
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dash-section">

        <div className="dash-section-head">
          <h2>🟢 Bill History</h2>
        </div>

        <div style={{ marginBottom: 15 }}>
          <button
            className="btn btn-fill"
            onClick={() =>
              onAllPaid(year, month)
            }
          >
            📥 Download All Paid Bills
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>

          <tbody>
            {paid.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="empty-state"
                >
                  No paid bills yet.
                </td>
              </tr>
            ) : (
              paid.map(b => (
                <tr key={b.id}>
                  <td>{b.billingMonth}</td>
                  <td>₹{b.amount}</td>
                  <td>
                    {b.generatedDate}
                  </td>
                  <td>
                    <span className="badge badge-success">
                      PAID
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-sm btn-approve"
                      onClick={() => onPaidDownload(b.id)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="dash-section">

        <div className="dash-section-head">
          <h2>💧 Tariff Plan</h2>
        </div>

        {!tariff ? (
          <p className="empty-state">
            Tariff information not available.
          </p>
        ) : (
          <>
            <div className="tariff-slab-row">
              <span>
                Tier 1 — 0 to{' '}
                {tariff.tier1Limit} units
              </span>

              <strong>
                ₹{Number(
                  tariff.tier1Rate
                ).toFixed(2)}
              </strong>
            </div>

            <div className="tariff-slab-row">
              <span>
                Tier 2 —{' '}
                {tariff.tier1Limit} to{' '}
                {tariff.tier2Limit} units
              </span>

              <strong>
                ₹{Number(
                  tariff.tier2Rate
                ).toFixed(2)}
              </strong>
            </div>

            <div className="tariff-slab-row">
              <span>
                Tier 3 — Above{' '}
                {tariff.tier2Limit} units
              </span>

              <strong>
                ₹{Number(
                  tariff.tier3Rate
                ).toFixed(2)}
              </strong>
            </div>
          </>
        )}
      </div>
    </>
  );
}
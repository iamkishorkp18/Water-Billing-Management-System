import { useState } from 'react';

export default function UsageLogsTab({ apartments, usageByApt }) {
  const [selectedApartment, setSelectedApartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  const logs = selectedApartment
    ? usageByApt[selectedApartment] || []
    : [];

  const totalPages = Math.ceil(logs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + rowsPerPage);

  const selectedApt = apartments.find(
    (apt) => String(apt.id) === String(selectedApartment)
  );

  const handleApartmentChange = (e) => {
    setSelectedApartment(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="dash-section">

      <div className="dash-section-head">
        <h2>Water Usage Logs</h2>
      </div>

      {/* Apartment Selection */}
      <div style={{ marginBottom: 22 }}>
        <label
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 8,
            color: '#334155'
          }}
        >
          Select Apartment
        </label>

        <select
          value={selectedApartment}
          onChange={handleApartmentChange}
          style={{
            width: '100%',
            maxWidth: 450,
            padding: '12px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            fontSize: 14,
            background: 'white',
            color: '#0f4c5c',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">-- Select an Apartment --</option>

          {apartments.map((apt) => (
            <option key={apt.id} value={apt.id}>
              {apt.name}
            </option>
          ))}
        </select>
      </div>

      {/* No Apartment Selected */}
      {!selectedApartment && (
        <div className="empty-state" style={{ padding: 40 }}>
          💧 Select an apartment to view its water usage logs.
        </div>
      )}

      {/* Selected Apartment */}
      {selectedApartment && (
        <div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              padding: '12px 16px',
              background: '#f0fdfa',
              borderRadius: 10
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                color: 'var(--primary)'
              }}
            >
              💧 {selectedApt?.name || 'Apartment'}
            </h3>

            <span
              style={{
                fontSize: 13,
                color: '#64748b'
              }}
            >
              {logs.length} records
            </span>
          </div>

          {/* Usage Table */}
          <table className="data-table">

            <thead>
              <tr>
                <th>Household</th>
                <th>Reading Date</th>
                <th>Meter Reading</th>
              </tr>
            </thead>

            <tbody>

              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-state">
                    No usage logs recorded for this apartment.
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      {log.household?.flatNumber || '-'}
                    </td>

                    <td>
                      {log.readingDate || '-'}
                    </td>

                    <td>
                      {log.meterReading ?? '-'}
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

          {/* Pagination */}
          {logs.length > rowsPerPage && (
            <>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 18,
                  flexWrap: 'wrap'
                }}
              >

                <button
                  className="btn-sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => p - 1)
                  }
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    className="btn-sm"
                    onClick={() => setCurrentPage(page)}
                    style={{
                      background:
                        currentPage === page
                          ? 'var(--primary)'
                          : 'white',
                      color:
                        currentPage === page
                          ? 'white'
                          : 'var(--primary)',
                      border: '1px solid var(--primary)'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                >
                  Next
                </button>

              </div>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                  fontSize: 12,
                  color: '#64748b'
                }}
              >
                Showing {startIndex + 1}–
                {Math.min(
                  startIndex + rowsPerPage,
                  logs.length
                )}{' '}
                of {logs.length} records
              </div>

            </>
          )}

        </div>
      )}

    </div>
  );
}
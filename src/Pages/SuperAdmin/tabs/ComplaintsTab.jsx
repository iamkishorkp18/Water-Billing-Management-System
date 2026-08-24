import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LabelList
} from 'recharts';


function ComplaintsTab({
  complaints = [],
  onDeleteComplaint
}) {
  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const open = complaints.filter(
    (c) => c.status === 'OPEN'
  );

  const resolved = complaints.filter(
    (c) => c.status === 'RESOLVED'
  );

  /* ===============================
     COMPLAINT TYPES
  =============================== */

  const typeMap = {};

  complaints.forEach((c) => {
    const type = c.complaintType || 'Other';

    typeMap[type] =
      (typeMap[type] || 0) + 1;
  });

  const typeData = Object.entries(typeMap).map(
    ([name, value]) => ({
      name,
      value
    })
  );

  /* ===============================
     STATUS DATA
  =============================== */

  const statusData = [
    {
      name: 'Open',
      value: open.length
    },
    {
      name: 'Resolved',
      value: resolved.length
    }
  ].filter((item) => item.value > 0);

  const total = complaints.length;

  /* ===============================
     DELETE
  =============================== */

  const handleDelete = async (complaint) => {
    if (
      !window.confirm(
        `Are you sure you want to delete complaint #${complaint.id}?`
      )
    ) {
      return;
    }

    if (onDeleteComplaint) {
      await onDeleteComplaint(complaint.id);
    }
  };

  /* ===============================
     OPEN MODAL
  =============================== */

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
  };

  /* ===============================
     TYPE COLOR
  =============================== */

  const getComplaintTypeClass = (type) => {
    const value = String(type || '')
      .toLowerCase()
      .replace(/\s+/g, '-');

    if (
      value.includes('leak') ||
      value.includes('water')
    ) {
      return 'type-water';
    }

    if (
      value.includes('bill') ||
      value.includes('payment')
    ) {
      return 'type-billing';
    }

    if (
      value.includes('maintenance') ||
      value.includes('repair')
    ) {
      return 'type-maintenance';
    }

    if (
      value.includes('meter')
    ) {
      return 'type-meter';
    }

    return 'type-general';
  };

  return (
    <div className="complaints-page">

      {/* =====================================================
          TOP SUMMARY
      ===================================================== */}

      <div className="complaint-hero">

        <div>
          <span className="complaint-eyebrow">
            SERVICE MANAGEMENT
          </span>

          <h1>
            Complaint Center
          </h1>

          <p>
            Monitor resident complaints, track
            resolution progress and manage service
            requests across all apartments.
          </p>
        </div>

        <div className="complaint-hero-icon">
          💬
        </div>

      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="complaint-stat-grid">

        {/* OPEN */}

        <div className="complaint-stat-card complaint-open-card">

          <div className="complaint-stat-top">
            <div className="complaint-stat-icon">
              ⚠️
            </div>

            <span className="complaint-live-dot">
              LIVE
            </span>
          </div>

          <div className="complaint-stat-value">
            {open.length}
          </div>

          <div className="complaint-stat-title">
            Open Complaints
          </div>

          <div className="complaint-stat-description">
            Complaints requiring attention
          </div>

          <div className="complaint-stat-line" />

        </div>

        {/* RESOLVED */}

        <div className="complaint-stat-card complaint-resolved-card">

          <div className="complaint-stat-top">
            <div className="complaint-stat-icon">
              ✓
            </div>

            <span className="complaint-status-text">
              COMPLETED
            </span>
          </div>

          <div className="complaint-stat-value">
            {resolved.length}
          </div>

          <div className="complaint-stat-title">
            Resolved Complaints
          </div>

          <div className="complaint-stat-description">
            Successfully completed requests
          </div>

          <div className="complaint-stat-line" />

        </div>

        {/* TOTAL */}

        <div className="complaint-stat-card complaint-total-card">

          <div className="complaint-stat-top">
            <div className="complaint-stat-icon">
              📋
            </div>

            <span className="complaint-status-text">
              ALL RECORDS
            </span>
          </div>

          <div className="complaint-stat-value">
            {total}
          </div>

          <div className="complaint-stat-title">
            Total Complaints
          </div>

          <div className="complaint-stat-description">
            Platform-wide complaint records
          </div>

          <div className="complaint-stat-line" />

        </div>

      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="complaint-chart-grid">

        {/* STATUS */}

        <div className="complaint-panel">

          <div className="complaint-panel-header">

            <div>
              <span className="panel-eyebrow">
                OVERVIEW
              </span>

              <h2>
                Complaint Status
              </h2>

              <p>
                Current resolution distribution
              </p>
            </div>

            <div className="panel-header-icon">
              📊
            </div>

          </div>

          <div className="complaint-chart-body">

            {statusData.length === 0 ? (
              <div className="complaint-empty-chart">
                <div>📭</div>
                <strong>
                  No complaints yet
                </strong>
                <span>
                  Status analytics will appear here.
                </span>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    labelLine={false}
                    label={({ name, value }) =>
                      `${name}: ${value}`
                    }
                    animationDuration={900}
                  >
                    {statusData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            entry.name === 'Open'
                              ? '#ef4444'
                              : '#22c55e'
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />

                </PieChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>

        {/* CATEGORY */}

        <div className="complaint-panel">

          <div className="complaint-panel-header">

            <div>
              <span className="panel-eyebrow">
                ANALYTICS
              </span>

              <h2>
                Complaints by Category
              </h2>

              <p>
                Distribution of complaint types
              </p>
            </div>

            <div className="panel-header-icon">
              📈
            </div>

          </div>

          <div className="complaint-chart-body">

            {typeData.length === 0 ? (
              <div className="complaint-empty-chart">
                <div>📭</div>
                <strong>
                  No category data
                </strong>
                <span>
                  Complaint categories will appear here.
                </span>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <BarChart
                  data={typeData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 10
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke="#e8eef3"
                  />

                  <XAxis
                    dataKey="name"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: 'rgba(20,184,166,.06)'
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#14b8a6"
                    maxBarSize={52}
                    radius={[
                      8,
                      8,
                      2,
                      2
                    ]}
                    animationDuration={1000}
                  >

                    <LabelList
                      dataKey="value"
                      position="top"
                      fill="#0f4c5c"
                      fontSize={12}
                      fontWeight={700}
                    />

                  </Bar>

                </BarChart>
              </ResponsiveContainer>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          COMPLAINT TABLE
      ===================================================== */}

      <div className="complaint-panel complaint-table-panel">

        <div className="complaint-panel-header">

          <div>

            <span className="panel-eyebrow">
              RECORDS
            </span>

            <h2>
              All Complaints
            </h2>

            <p>
              Platform-wide resident complaint records
            </p>

          </div>

          <div className="complaint-record-count">
            <span>{total}</span>
            Records
          </div>

        </div>

        <div className="complaint-table-wrapper">

          <table className="complaint-modern-table">

            <thead>

              <tr>
                <th>HOUSEHOLD</th>
                <th>APARTMENT</th>
                <th>TYPE</th>
                <th>DESCRIPTION</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>

            </thead>

            <tbody>

              {complaints.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="complaint-empty-row"
                  >

                    <div>
                      <span>📭</span>

                      <strong>
                        No complaints yet
                      </strong>

                      <small>
                        New complaints will appear here.
                      </small>
                    </div>

                  </td>

                </tr>

              ) : (

                complaints.map((complaint) => {

                  const isResolved =
                    complaint.status ===
                    'RESOLVED';

                  return (

                    <tr
                      key={complaint.id}
                      className="complaint-table-row"
                    >

                      {/* HOUSEHOLD */}

                      <td>

                        <div className="complaint-household">

                          <div className="complaint-avatar">
                            {(
                              complaint
                                .household
                                ?.flatNumber ||
                              'H'
                            ).charAt(0)}
                          </div>

                          <div>

                            <strong>
                              {complaint
                                .household
                                ?.flatNumber ||
                                '-'}
                            </strong>

                            <span>
                              Household
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* APARTMENT */}

                      <td>

                        <div className="complaint-apartment">

                          <span className="building-mini">
                            🏢
                          </span>

                          <span>
                            {complaint
                              .household
                              ?.apartment
                              ?.name ||
                              '-'}
                          </span>

                        </div>

                      </td>

                      {/* TYPE */}

                      <td>

                        <span
                          className={`complaint-type-badge ${getComplaintTypeClass(
                            complaint.complaintType
                          )}`}
                        >
                          {complaint.complaintType ||
                            'Other'}
                        </span>

                      </td>

                      {/* DESCRIPTION */}

                      <td>

                        <div className="complaint-description-preview">

                          <span>
                            {complaint.description ||
                              'No description provided.'}
                          </span>

                        </div>

                      </td>

                      {/* DATE */}

                      <td>

                        <div className="complaint-date">

                          <span>
                            📅
                          </span>

                          {complaint.createdDate ||
                            '-'}

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`complaint-status-badge ${
                            isResolved
                              ? 'resolved'
                              : 'open'
                          }`}
                        >

                          <i />

                          {isResolved
                            ? 'RESOLVED'
                            : 'OPEN'}

                        </span>

                      </td>

                      {/* ACTION */}

                      <td>

                        <div className="complaint-actions">

                          <button
                            type="button"
                            className="complaint-view-button"
                            onClick={() =>
                              openComplaint(
                                complaint
                              )
                            }
                          >

                            <span>
                              👁
                            </span>

                            View

                          </button>

                          <button
                            type="button"
                            className="complaint-delete-button"
                            onClick={() =>
                              handleDelete(
                                complaint
                              )
                            }
                            title="Delete complaint"
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          COMPLAINT DETAILS MODAL
      ===================================================== */}

      {selectedComplaint && (

        <div
          className="complaint-modal-overlay"
          onClick={closeComplaint}
        >

          <div
            className="complaint-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL TOP */}

            <div className="complaint-modal-top">

              <div className="modal-watermark">
                AQUALEDGER
              </div>

              <div className="modal-top-content">

                <div className="modal-document-icon">
                  💬
                </div>

                <div>

                  <span className="modal-document-label">
                    RESIDENT SERVICE REQUEST
                  </span>

                  <h2>
                    Complaint Details
                  </h2>

                  <p>
                    Complaint #
                    {selectedComplaint.id}
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="complaint-modal-close"
                onClick={closeComplaint}
              >
                ×
              </button>

            </div>

            {/* MODAL STATUS */}

            <div className="complaint-modal-status-row">

              <div>

                <span className="modal-status-label">
                  CURRENT STATUS
                </span>

                <span
                  className={`complaint-status-badge ${
                    selectedComplaint.status ===
                    'RESOLVED'
                      ? 'resolved'
                      : 'open'
                  }`}
                >

                  <i />

                  {selectedComplaint.status ===
                  'RESOLVED'
                    ? 'RESOLVED'
                    : 'OPEN'}

                </span>

              </div>

              <div className="modal-reference">
                REF #{selectedComplaint.id}
              </div>

            </div>

            {/* DETAILS */}

            <div className="complaint-modal-content">

              <div className="complaint-information-grid">

                <div className="complaint-information-card">

                  <span>
                    HOUSEHOLD
                  </span>

                  <strong>
                    {selectedComplaint
                      .household
                      ?.flatNumber ||
                      '-'}
                  </strong>

                  <small>
                    Residential Unit
                  </small>

                </div>

                <div className="complaint-information-card">

                  <span>
                    APARTMENT
                  </span>

                  <strong>
                    {selectedComplaint
                      .household
                      ?.apartment
                      ?.name ||
                      '-'}
                  </strong>

                  <small>
                    Property
                  </small>

                </div>

                <div className="complaint-information-card">

                  <span>
                    COMPLAINT TYPE
                  </span>

                  <strong>
                    {selectedComplaint
                      .complaintType ||
                      'Other'}
                  </strong>

                  <small>
                    Service category
                  </small>

                </div>

                <div className="complaint-information-card">

                  <span>
                    CREATED DATE
                  </span>

                  <strong>
                    {selectedComplaint
                      .createdDate ||
                      '-'}
                  </strong>

                  <small>
                    Request date
                  </small>

                </div>

              </div>

              {/* DESCRIPTION */}

              <div className="complaint-message-section">

                <div className="complaint-message-heading">

                  <div>
                    <span>
                      RESIDENT MESSAGE
                    </span>

                    <h3>
                      Complaint Description
                    </h3>
                  </div>

                  <div className="message-icon">
                    ✉
                  </div>

                </div>

                <div className="complaint-message-box">

                  <div className="quote-mark">
                    “
                  </div>

                  <p>
                    {selectedComplaint
                      .description ||
                      'No description provided.'}
                  </p>

                </div>

              </div>

              {/* TIMELINE */}

              <div className="complaint-timeline">

                <div className="timeline-item active">

                  <div className="timeline-dot">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Complaint Submitted
                    </strong>

                    <span>
                      Request recorded in the system
                    </span>

                  </div>

                </div>

                <div
                  className={`timeline-item ${
                    selectedComplaint.status ===
                    'RESOLVED'
                      ? 'active'
                      : ''
                  }`}
                >

                  <div className="timeline-dot">
                    {selectedComplaint.status ===
                    'RESOLVED'
                      ? '✓'
                      : '•'}
                  </div>

                  <div>

                    <strong>
                      Resolution Status
                    </strong>

                    <span>
                      {selectedComplaint.status ===
                      'RESOLVED'
                        ? 'Complaint has been resolved'
                        : 'Awaiting resolution'}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="complaint-modal-footer">

              <div className="modal-footer-note">
                <span>🔒</span>
                Complaint information is securely
                managed by AquaLedger.
              </div>

              <button
                type="button"
                className="complaint-modal-close-button"
                onClick={closeComplaint}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ComplaintsTab;


import { useEffect, useMemo, useState } from 'react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  updateComplaintStatus,
  deleteComplaint
} from '../../../Api/commercialApi';

const COMPLAINT_TYPES = [
  'Water Supply',
  'Meter Problem',
  'Billing Issue',
  'Leakage',
  'Maintenance',
  'Other'
];

const ITEMS_PER_PAGE = 5;

function ComplaintsTab({
  complaints = [],
  onResolve,
  onDeleteComplaint,
  onSubmitComplaint
}) {

  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* =====================================================
     COMPLAINT DATA
  ===================================================== */

  const open = useMemo(
    () =>
      complaints.filter(
        c => c.status === 'OPEN'
      ),
    [complaints]
  );

  const resolved = useMemo(
    () =>
      complaints.filter(
        c => c.status === 'RESOLVED'
      ),
    [complaints]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      complaints.length / ITEMS_PER_PAGE
    )
  );

  const paginatedComplaints = useMemo(() => {

    const startIndex =
      (currentPage - 1) * ITEMS_PER_PAGE;

    return complaints.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  }, [complaints, currentPage]);

  /* =====================================================
     RESET PAGE WHEN DATA CHANGES
  ===================================================== */

  useEffect(() => {

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

  }, [complaints.length, currentPage, totalPages]);


  /* =====================================================
     STATUS CHART
  ===================================================== */

  const statusData = [
    {
      name: 'Open',
      value: open.length
    },
    {
      name: 'Resolved',
      value: resolved.length
    }
  ].filter(
    d => d.value > 0
  );


  /* =====================================================
     RESOLUTION %
  ===================================================== */

  const resolutionPercentage =
    complaints.length
      ? Math.round(
          (resolved.length /
            complaints.length) *
            100
        )
      : 0;


  /* =====================================================
     ICON
  ===================================================== */

  const getComplaintIcon = type => {

    switch (type) {

      case 'Water Supply':
        return '💧';

      case 'Meter Problem':
        return '📟';

      case 'Billing Issue':
        return '🧾';

      case 'Leakage':
        return '🚰';

      case 'Maintenance':
        return '🔧';

      default:
        return '📌';
    }
  };


  /* =====================================================
     BADGE CLASS
  ===================================================== */

  const getComplaintClass = type => {

    switch (type) {

      case 'Water Supply':
        return 'water';

      case 'Meter Problem':
        return 'meter';

      case 'Billing Issue':
        return 'billing';

      case 'Leakage':
        return 'leakage';

      case 'Maintenance':
        return 'maintenance';

      default:
        return 'other';
    }
  };


  /* =====================================================
     SUBMIT COMPLAINT
  ===================================================== */

  const handleSubmit = async e => {

    e.preventDefault();

    if (
      !selectedType ||
      !description.trim()
    ) {

      alert(
        'Select complaint type and enter description.'
      );

      return;
    }

    try {

      await onSubmitComplaint({
        complaintType: selectedType,
        description: description.trim()
      });

      setSelectedType('');
      setDescription('');
      setSubmitted(true);

      setCurrentPage(1);

    } catch (err) {

      console.error(
        'Complaint submission failed:',
        err
      );

      alert(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to submit complaint.'
      );
    }
  };


  /* =====================================================
     RESOLVE COMPLAINT
  ===================================================== */

  const handleResolve = async id => {

    if (processingId) {
      return;
    }

    try {

      setProcessingId(id);

      if (onResolve) {

        await onResolve(id);

      } else {

        await updateComplaintStatus(
          id,
          'RESOLVED'
        );
      }

      if (
        selectedComplaint &&
        selectedComplaint.id === id
      ) {

        setSelectedComplaint(null);

      }

    } catch (err) {

      console.error(
        'Failed to resolve complaint:',
        err
      );

      alert(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to resolve complaint.'
      );

    } finally {

      setProcessingId(null);
    }
  };


  /* =====================================================
     DELETE COMPLAINT
  ===================================================== */

  const handleDelete = async id => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this complaint? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    if (deletingId) {
      return;
    }

    try {

      setDeletingId(id);

      if (onDeleteComplaint) {

        await onDeleteComplaint(id);

      } else {

        await deleteComplaint(id);
      }

      if (
        selectedComplaint &&
        selectedComplaint.id === id
      ) {

        setSelectedComplaint(null);
      }

      /*
       * If the last item on the current page
       * was deleted, move to previous page.
       */
      const remainingItems =
        complaints.length - 1;

      const newTotalPages = Math.max(
        1,
        Math.ceil(
          remainingItems /
            ITEMS_PER_PAGE
        )
      );

      if (
        currentPage >
        newTotalPages
      ) {

        setCurrentPage(
          newTotalPages
        );
      }

    } catch (err) {

      console.error(
        'Failed to delete complaint:',
        err
      );

      alert(
        err.response?.data?.message ||
        err.response?.data ||
        'Failed to delete complaint.'
      );

    } finally {

      setDeletingId(null);
    }
  };


  /* =====================================================
     PAGE CHANGE
  ===================================================== */

  const goToPage = page => {

    if (
      page < 1 ||
      page > totalPages
    ) {

      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };


  /* =====================================================
     PAGE NUMBERS
  ===================================================== */

  const pageNumbers = [];

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {

    pageNumbers.push(i);
  }


  return (

    <div className="complaints-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="complaint-hero">

        <div className="complaint-hero-icon">
          📮
        </div>

        <div className="complaint-hero-content">

          <h1>
            Complaint Management
          </h1>

          <p>
            Monitor resident issues, track resolution
            progress and manage water-service complaints.
          </p>

        </div>

        <div className="complaint-live-indicator">

          <span className="live-dot"></span>

          System Active

        </div>

      </div>


      {/* =====================================================
          REPORT ISSUE
      ===================================================== */}

      <div className="dash-section complaint-submit-section">

        <div className="section-title-row">

          <div>

            <div className="section-icon blue">
              📤
            </div>

            <div>

              <h2>
                Report Issue to Super Admin
              </h2>

              <p>
                Submit water supply, billing, meter or
                maintenance issues.
              </p>

            </div>

          </div>

        </div>


        {submitted && (

          <div className="success-animation">

            <div className="success-check">
              ✓
            </div>

            <div>

              <strong>
                Complaint submitted successfully
              </strong>

              <span>
                Your complaint has been forwarded to the
                Super Admin.
              </span>

            </div>

          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="complaint-form"
        >

          <div className="complaint-form-title">
            Select Complaint Type
          </div>


          <div className="complaint-types">

            {COMPLAINT_TYPES.map(type => (

              <button
                type="button"
                key={type}
                className={`complaint-type-card ${
                  selectedType === type
                    ? 'selected'
                    : ''
                }`}
                onClick={() => {

                  setSelectedType(type);
                  setSubmitted(false);

                }}
              >

                <span className="type-icon">
                  {getComplaintIcon(type)}
                </span>

                <span>
                  {type}
                </span>

                {selectedType === type && (

                  <span className="selected-check">
                    ✓
                  </span>

                )}

              </button>

            ))}

          </div>


          <div className="form-group">

            <label>
              Describe the Issue
            </label>

            <textarea
              placeholder="Describe the issue clearly..."
              value={description}
              onChange={e => {

                setDescription(
                  e.target.value
                );

                setSubmitted(false);

              }}
              required
              rows={5}
            />

            <div className="character-counter">
              {description.length} characters
            </div>

          </div>


          <button
            type="submit"
            className="submit-complaint-btn"
            disabled={
              !selectedType ||
              !description.trim()
            }
          >

            <span>📤</span>

            Submit to Super Admin

          </button>

        </form>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="complaint-summary-grid">

        <div className="complaint-stat-card open-card">

          <div className="stat-top">

            <div className="stat-icon">
              🚨
            </div>

            <span className="stat-status">
              Attention
            </span>

          </div>

          <div className="stat-number">
            {open.length}
          </div>

          <div className="stat-name">
            Open Complaints
          </div>

          <div className="stat-description">
            Issues waiting for resolution
          </div>

        </div>


        <div className="complaint-stat-card resolved-card">

          <div className="stat-top">

            <div className="stat-icon">
              ✅
            </div>

            <span className="stat-status">
              Completed
            </span>

          </div>

          <div className="stat-number">
            {resolved.length}
          </div>

          <div className="stat-name">
            Resolved Complaints
          </div>

          <div className="stat-description">
            Successfully completed issues
          </div>

        </div>


        <div className="complaint-stat-card total-card">

          <div className="stat-top">

            <div className="stat-icon">
              📋
            </div>

            <span className="stat-status">
              Overall
            </span>

          </div>

          <div className="stat-number">
            {complaints.length}
          </div>

          <div className="stat-name">
            Total Complaints
          </div>

          <div className="stat-description">
            All submitted complaints
          </div>

        </div>


        <div className="complaint-stat-card progress-card">

          <div className="stat-top">

            <div className="stat-icon">
              📈
            </div>

            <span className="stat-status">
              Progress
            </span>

          </div>

          <div className="stat-number">
            {resolutionPercentage}%
          </div>

          <div className="stat-name">
            Resolution Rate
          </div>

          <div className="mini-progress">

            <div
              style={{
                width:
                  `${resolutionPercentage}%`
              }}
            />

          </div>

        </div>

      </div>


      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <div className="chart-grid">

        <div className="dash-section analytics-card">

          <div className="dash-section-head">

            <div>

              <h2>
                📊 Complaint Status
              </h2>

              <p>
                Current complaint resolution overview
              </p>

            </div>

          </div>


          {statusData.length === 0 ? (

            <div className="analytics-empty">

              📭

              <span>
                No complaints yet
              </span>

            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <PieChart>

                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  innerRadius={55}
                  paddingAngle={5}
                  label
                  animationBegin={100}
                  animationDuration={1000}
                >

                  {statusData.map(
                    (entry, index) => (

                      <Cell
                        key={index}
                        fill={
                          entry.name ===
                          'Open'
                            ? '#ef4444'
                            : '#22c55e'
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>

            </ResponsiveContainer>

          )}

        </div>


        <div className="dash-section analytics-card">

          <div className="dash-section-head">

            <div>

              <h2>
                📈 Resolution Progress
              </h2>

              <p>
                Overall complaint completion rate
              </p>

            </div>

          </div>


          <div className="resolution-display">

            <div
              className="progress-circle"
              style={{
                '--progress':
                  `${resolutionPercentage * 3.6}deg`
              }}
            >

              <div className="progress-circle-inner">

                <strong>
                  {resolutionPercentage}%
                </strong>

                <span>
                  Resolved
                </span>

              </div>

            </div>


            <div className="resolution-info">

              <div>

                <span className="legend-dot open-dot"></span>

                Open

                <strong>
                  {open.length}
                </strong>

              </div>

              <div>

                <span className="legend-dot resolved-dot"></span>

                Resolved

                <strong>
                  {resolved.length}
                </strong>

              </div>

              <div>

                <span className="legend-dot total-dot"></span>

                Total

                <strong>
                  {complaints.length}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          RESIDENT COMPLAINTS
      ===================================================== */}

      <div className="dash-section complaints-table-section">

        <div className="dash-section-head">

          <div>

            <h2>
              📮 Resident Complaints
            </h2>

            <p>
              Review and resolve complaints submitted by residents.
            </p>

          </div>

          <div className="open-counter">

            <span className="live-dot"></span>

            {open.length} Open

          </div>

        </div>


        {/* =====================================================
            COMPLAINT LIST
        ===================================================== */}

        <div className="complaints-list">

          {complaints.length === 0 ? (

            <div className="complaints-empty">

              <div>
                📭
              </div>

              <h3>
                No complaints yet
              </h3>

              <p>
                Resident complaints will appear here.
              </p>

            </div>

          ) : (

            paginatedComplaints.map(
              (c, index) => (

                <div
                  className={`complaint-row ${
                    c.status === 'RESOLVED'
                      ? 'resolved-row'
                      : 'open-row'
                  }`}
                  key={c.id}
                >


                  {/* NUMBER */}

                  <div className="complaint-number">

                    #{String(c.id).padStart(3, '0')}

                  </div>


                  {/* USER */}

                  <div className="complaint-user">

                    <div className="user-avatar">

                      {(c.createdBy || 'R')
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {c.createdBy || 'Resident'}
                      </strong>

                      <span>
                        Resident
                      </span>

                    </div>

                  </div>


                  {/* TYPE */}

                  <div>

                    <span
                      className={`complaint-badge ${
                        getComplaintClass(
                          c.complaintType
                        )
                      }`}
                    >

                      {getComplaintIcon(
                        c.complaintType
                      )}

                      {c.complaintType ||
                        'Other'}

                    </span>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="complaint-preview">

                    {c.description ||
                      'No description provided.'}

                  </div>


                  {/* DATE */}

                  <div className="complaint-date">

                    <span>
                      📅
                    </span>

                    {c.createdDate || '-'}

                  </div>


                  {/* =================================================
                      STATUS
                      OPEN = RESOLVE BUTTON
                      RESOLVED = RESOLVED BADGE
                  ================================================= */}

                  <div className="complaint-status-action">

                    {c.status === 'RESOLVED' ? (

                      <span className="status-pill resolved-pill">

                        ✓ Resolved

                      </span>

                    ) : (

                      <button
                        className="resolve-btn status-resolve-btn"
                        disabled={
                          processingId === c.id
                        }
                        onClick={() =>
                          handleResolve(c.id)
                        }
                      >

                        {processingId === c.id
                          ? '⏳ Resolving...'
                          : '✓ Resolve'}

                      </button>

                    )}

                  </div>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="complaint-actions">

                    <button
                      className="open-complaint-btn"
                      onClick={() =>
                        setSelectedComplaint(c)
                      }
                    >

                      📖 View

                    </button>


                    <button
                      className="delete-complaint-btn"
                      disabled={
                        deletingId === c.id
                      }
                      onClick={() =>
                        handleDelete(c.id)
                      }
                    >

                      {deletingId === c.id
                        ? '⏳'
                        : '🗑️'}

                      {deletingId === c.id
                        ? 'Deleting...'
                        : 'Delete'}

                    </button>

                  </div>

                </div>

              )
            )

          )}

        </div>


        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {complaints.length > ITEMS_PER_PAGE && (

          <div className="complaints-pagination">

            <div className="pagination-info">

              Showing{' '}

              <strong>
                {
                  (currentPage - 1) *
                    ITEMS_PER_PAGE +
                  1
                }
              </strong>

              {' - '}

              <strong>
                {Math.min(
                  currentPage *
                    ITEMS_PER_PAGE,
                  complaints.length
                )}
              </strong>

              {' '}of{' '}

              <strong>
                {complaints.length}
              </strong>

              {' '}complaints

            </div>


            <div className="pagination-controls">

              <button
                className="pagination-btn previous"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  goToPage(
                    currentPage - 1
                  )
                }
              >

                ← Previous

              </button>


              <div className="page-number-list">

                {pageNumbers.map(page => (

                  <button
                    key={page}
                    className={`pagination-number ${
                      currentPage === page
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      goToPage(page)
                    }
                  >

                    {page}

                  </button>

                ))}

              </div>


              <button
                className="pagination-btn next"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  goToPage(
                    currentPage + 1
                  )
                }
              >

                Next →

              </button>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          COMPLAINT MODAL
      ===================================================== */}

      {selectedComplaint && (

        <div
          className="complaint-modal-overlay"
          onClick={() =>
            setSelectedComplaint(null)
          }
        >

          <div
            className="complaint-modal"
            onClick={e =>
              e.stopPropagation()
            }
          >

            <div className="modal-top-decoration"></div>


            <div className="complaint-modal-head">

              <div className="modal-title-area">

                <div className="modal-big-icon">
                  📮
                </div>

                <div>

                  <h2>
                    Complaint Details
                  </h2>

                  <span>

                    Complaint #

                    {String(
                      selectedComplaint.id
                    ).padStart(3, '0')}

                  </span>

                </div>

              </div>


              <button
                className="complaint-close"
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >

                ✕

              </button>

            </div>


            <div className="complaint-letter">


              {/* USER INFORMATION */}

              <div className="detail-section">

                <div className="detail-section-title">

                  👤 Resident Information

                </div>

                <div className="detail-grid">

                  <div className="detail-box">

                    <span>
                      Created By
                    </span>

                    <strong>
                      {selectedComplaint.createdBy ||
                        'Resident'}
                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Complaint ID
                    </span>

                    <strong>
                      #{selectedComplaint.id}
                    </strong>

                  </div>

                </div>

              </div>


              {/* COMPLAINT INFORMATION */}

              <div className="detail-section">

                <div className="detail-section-title">

                  📋 Complaint Information

                </div>

                <div className="detail-grid">

                  <div className="detail-box">

                    <span>
                      Complaint Type
                    </span>

                    <strong>

                      {getComplaintIcon(
                        selectedComplaint.complaintType
                      )}

                      {' '}

                      {selectedComplaint.complaintType ||
                        'Other'}

                    </strong>

                  </div>

                  <div className="detail-box">

                    <span>
                      Created Date
                    </span>

                    <strong>

                      {selectedComplaint.createdDate ||
                        '-'}

                    </strong>

                  </div>

                </div>

              </div>


              {/* STATUS */}

              <div className="detail-section">

                <div className="detail-section-title">

                  📌 Current Status

                </div>

                <div
                  className={`modal-status ${
                    selectedComplaint.status ===
                    'RESOLVED'
                      ? 'modal-resolved'
                      : 'modal-open'
                  }`}
                >

                  {selectedComplaint.status ===
                  'RESOLVED'
                    ? '✓ Complaint Resolved'
                    : '● Complaint Open'}

                </div>

              </div>


              {/* DESCRIPTION */}

              <div className="detail-section">

                <div className="detail-section-title">

                  📝 Complaint Description

                </div>

                <div className="complaint-description">

                  {selectedComplaint.description ||
                    'No description provided.'}

                </div>

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div className="complaint-modal-footer">

              {selectedComplaint.status !==
                'RESOLVED' && (

                <button
                  className="resolve-modal-btn"
                  disabled={
                    processingId ===
                    selectedComplaint.id
                  }
                  onClick={() =>
                    handleResolve(
                      selectedComplaint.id
                    )
                  }
                >

                  {processingId ===
                  selectedComplaint.id
                    ? '⏳ Resolving...'
                    : '✓ Mark as Resolved'}

                </button>

              )}


              <button
                className="delete-modal-btn"
                disabled={
                  deletingId ===
                  selectedComplaint.id
                }
                onClick={() =>
                  handleDelete(
                    selectedComplaint.id
                  )
                }
              >

                🗑️ Delete

              </button>


              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        .complaints-page {
          animation: pageAppear .45s ease;
        }

        @keyframes pageAppear {

          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        /* =====================================================
           HERO
        ===================================================== */

        .complaint-hero {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 25px;
          margin-bottom: 22px;
          border-radius: 20px;
          color: white;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #075985,
              #0f766e,
              #0891b2
            );

          box-shadow:
            0 18px 40px
            rgba(8,145,178,.22);
        }

        .complaint-hero::before {
          content: '';
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          right: -70px;
          top: -100px;
          background:
            rgba(255,255,255,.12);

          animation:
            floatCircle 5s infinite ease-in-out;
        }

        .complaint-hero::after {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          right: 180px;
          bottom: -80px;
          background:
            rgba(255,255,255,.08);
        }

        @keyframes floatCircle {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(15px);
          }

        }

        .complaint-hero-icon {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;

          background:
            rgba(255,255,255,.18);

          backdrop-filter:
            blur(10px);

          font-size: 31px;
          z-index: 1;

          animation:
            iconFloat 3s infinite ease-in-out;
        }

        @keyframes iconFloat {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }

        }

        .complaint-hero-content {
          z-index: 1;
          flex: 1;
        }

        .complaint-hero h1 {
          margin: 0 0 5px;
          font-size: 25px;
        }

        .complaint-hero p {
          margin: 0;
          opacity: .85;
          font-size: 14px;
        }

        .complaint-live-indicator {
          z-index: 1;
          padding: 8px 14px;
          border-radius: 30px;
          background:
            rgba(255,255,255,.15);

          backdrop-filter:
            blur(8px);

          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin-right: 7px;
          border-radius: 50%;
          background: #86efac;

          box-shadow:
            0 0 0 0
            rgba(134,239,172,.7);

          animation:
            livePulse 1.7s infinite;
        }

        @keyframes livePulse {

          70% {
            box-shadow:
              0 0 0 7px
              rgba(134,239,172,0);
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(134,239,172,0);
          }

        }


        /* =====================================================
           FORM
        ===================================================== */

        .section-title-row > div:first-child {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .section-icon {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .section-icon.blue {
          background: #e0f2fe;
        }

        .dash-section-head h2 {
          margin-bottom: 4px;
        }

        .dash-section-head p {
          margin: 0;
          color: #64748b;
          font-size: 13px;
        }

        .complaint-form {
          margin-top: 22px;
        }

        .complaint-form-title {
          font-weight: 800;
          color: #334155;
          margin-bottom: 12px;
        }

        .complaint-types {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);

          gap: 12px;
          margin-bottom: 22px;
        }

        .complaint-type-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: white;
          cursor: pointer;
          font-weight: 700;
          color: #334155;
          transition: all .25s ease;
          text-align: left;
        }

        .complaint-type-card:hover {
          transform: translateY(-3px);
          border-color: #38bdf8;

          box-shadow:
            0 9px 22px
            rgba(15,118,110,.12);
        }

        .complaint-type-card.selected {
          border-color: #0891b2;

          background:
            linear-gradient(
              135deg,
              #ecfeff,
              #eff6ff
            );

          box-shadow:
            0 8px 20px
            rgba(8,145,178,.14);

          transform:
            translateY(-2px);
        }

        .type-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #f1f5f9;
          font-size: 19px;
        }

        .selected-check {
          margin-left: auto;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0891b2;
          color: white;
          font-size: 12px;
        }

        .form-group {
          position: relative;
        }

        .form-group label {
          display: block;
          font-weight: 700;
          margin-bottom: 8px;
          color: #334155;
        }

        .form-group textarea {
          width: 100%;
          resize: vertical;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition: all .25s ease;
          box-sizing: border-box;
        }

        .form-group textarea:focus {
          border-color: #0891b2;

          box-shadow:
            0 0 0 4px
            rgba(8,145,178,.10);
        }

        .character-counter {
          position: absolute;
          right: 12px;
          bottom: 10px;
          font-size: 11px;
          color: #94a3b8;
        }

        .submit-complaint-btn {
          border: 0;
          padding: 13px 23px;
          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #0f766e,
              #0891b2
            );

          color: white;
          font-weight: 800;
          cursor: pointer;
          transition: all .25s ease;

          box-shadow:
            0 8px 18px
            rgba(8,145,178,.22);
        }

        .submit-complaint-btn:hover:not(:disabled) {
          transform: translateY(-2px);

          box-shadow:
            0 12px 25px
            rgba(8,145,178,.28);
        }

        .submit-complaint-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .submit-complaint-btn span {
          margin-right: 8px;
        }


        /* =====================================================
           SUCCESS
        ===================================================== */

        .success-animation {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
          padding: 14px 17px;
          border-radius: 13px;
          background: #ecfdf5;
          border: 1px solid #bbf7d0;
          color: #166534;

          animation:
            successIn .4s ease;
        }

        .success-animation strong,
        .success-animation span {
          display: block;
        }

        .success-animation span {
          margin-top: 3px;
          font-size: 12px;
          opacity: .8;
        }

        .success-check {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #22c55e;
          color: white;
          font-weight: 900;

          animation:
            checkPop .5s ease;
        }

        @keyframes successIn {

          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }

        @keyframes checkPop {

          0% {
            transform: scale(.5);
          }

          70% {
            transform: scale(1.15);
          }

          100% {
            transform: scale(1);
          }

        }


        /* =====================================================
           STAT CARDS
        ===================================================== */

        .complaint-summary-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);

          gap: 16px;
          margin-bottom: 22px;
        }

        .complaint-stat-card {
          position: relative;
          padding: 20px;
          border-radius: 17px;
          background: white;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all .25s ease;
        }

        .complaint-stat-card:hover {
          transform: translateY(-5px);

          box-shadow:
            0 15px 30px
            rgba(15,23,42,.10);
        }

        .complaint-stat-card::after {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          right: -35px;
          bottom: -45px;
          border-radius: 50%;
          opacity: .12;
        }

        .open-card {
          border-top: 4px solid #ef4444;
        }

        .open-card::after {
          background: #ef4444;
        }

        .resolved-card {
          border-top: 4px solid #22c55e;
        }

        .resolved-card::after {
          background: #22c55e;
        }

        .total-card {
          border-top: 4px solid #0ea5e9;
        }

        .total-card::after {
          background: #0ea5e9;
        }

        .progress-card {
          border-top: 4px solid #8b5cf6;
        }

        .progress-card::after {
          background: #8b5cf6;
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-status {
          font-size: 10px;
          padding: 5px 8px;
          border-radius: 20px;
          background: #f8fafc;
          color: #64748b;
          font-weight: 800;
        }

        .stat-number {
          margin-top: 14px;
          font-size: 30px;
          font-weight: 900;
          color: #0f172a;
        }

        .stat-name {
          margin-top: 2px;
          font-weight: 800;
          color: #334155;
        }

        .stat-description {
          margin-top: 4px;
          font-size: 11px;
          color: #94a3b8;
        }

        .mini-progress {
          height: 6px;
          margin-top: 13px;
          border-radius: 20px;
          background: #ede9fe;
          overflow: hidden;
        }

        .mini-progress div {
          height: 100%;
          border-radius: inherit;

          background:
            linear-gradient(
              90deg,
              #8b5cf6,
              #6366f1
            );

          transition:
            width .8s ease;
        }


        /* =====================================================
           ANALYTICS
        ===================================================== */

        .analytics-card {
          overflow: hidden;
        }

        .analytics-empty {
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 8px;
          color: #94a3b8;
          font-size: 30px;
        }

        .analytics-empty span {
          font-size: 13px;
        }

        .resolution-display {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 45px;
        }

        .progress-circle {
          width: 175px;
          height: 175px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          background:
            conic-gradient(
              #22c55e var(--progress),
              #e2e8f0 0deg
            );

          animation:
            circleAppear 1s ease;
        }

        .progress-circle-inner {
          width: 135px;
          height: 135px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;

          box-shadow:
            inset 0 0 15px
            rgba(15,23,42,.05);
        }

        .progress-circle-inner strong {
          font-size: 29px;
          color: #15803d;
        }

        .progress-circle-inner span {
          font-size: 12px;
          color: #64748b;
        }

        @keyframes circleAppear {

          from {
            transform:
              scale(.7)
              rotate(-60deg);

            opacity: 0;
          }

          to {
            transform:
              scale(1)
              rotate(0);

            opacity: 1;
          }

        }

        .resolution-info {
          display: flex;
          flex-direction: column;
          gap: 18px;
          color: #475569;
        }

        .resolution-info div {
          display: grid;
          grid-template-columns:
            12px 80px auto;

          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        .resolution-info strong {
          color: #0f172a;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .open-dot {
          background: #ef4444;
        }

        .resolved-dot {
          background: #22c55e;
        }

        .total-dot {
          background: #0ea5e9;
        }


        /* =====================================================
           COMPLAINT LIST
        ===================================================== */

        .open-counter {
          padding: 8px 13px;
          border-radius: 20px;
          background: #fff7ed;
          color: #c2410c;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .complaints-list {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .complaint-row {
          display: grid;

          grid-template-columns:
            60px
            1.1fr
            1.2fr
            2fr
            1fr
            1fr
            1.5fr;

          gap: 12px;
          align-items: center;
          padding: 13px 14px;

          border:
            1px solid #e2e8f0;

          border-radius: 13px;
          background: white;

          animation:
            rowAppear .45s ease both;

          transition:
            all .22s ease;
        }

        .complaint-row:hover {
          transform:
            translateX(4px);

          box-shadow:
            0 8px 20px
            rgba(15,23,42,.08);
        }

        .open-row {
          border-left:
            4px solid #ef4444;
        }

        .resolved-row {
          border-left:
            4px solid #22c55e;

          background:
            #fcfffd;
        }

        @keyframes rowAppear {

          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }

        .complaint-number {
          font-weight: 900;
          color: #64748b;
          font-size: 12px;
        }

        .complaint-user {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              135deg,
              #0f766e,
              #0891b2
            );

          color: white;
          font-weight: 900;
          flex-shrink: 0;
        }

        .complaint-user strong,
        .complaint-user span {
          display: block;
        }

        .complaint-user strong {
          font-size: 13px;
          color: #1e293b;
        }

        .complaint-user span {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .complaint-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .complaint-badge.water {
          background: #e0f2fe;
          color: #0369a1;
        }

        .complaint-badge.meter {
          background: #ede9fe;
          color: #6d28d9;
        }

        .complaint-badge.billing {
          background: #fef3c7;
          color: #92400e;
        }

        .complaint-badge.leakage {
          background: #fee2e2;
          color: #b91c1c;
        }

        .complaint-badge.maintenance {
          background: #dcfce7;
          color: #166534;
        }

        .complaint-badge.other {
          background: #f1f5f9;
          color: #475569;
        }

        .complaint-preview {
          color: #475569;
          font-size: 12px;
          line-height: 1.4;

          display:
            -webkit-box;

          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .complaint-date {
          display: flex;
          gap: 5px;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .complaint-status-action {
          display: flex;
          align-items: center;
        }

        .status-pill {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .resolved-pill {
          color: #15803d;
          background: #dcfce7;
        }

        .status-resolve-btn {
          min-width: 90px;
          color: #15803d;
          background: #dcfce7;
        }

        .status-resolve-btn:hover:not(:disabled) {
          background: #bbf7d0;
          transform: translateY(-1px);
        }

        .status-resolve-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        /* =====================================================
           ACTIONS
        ===================================================== */

        .complaint-actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .open-complaint-btn,
        .resolve-btn,
        .delete-complaint-btn {
          border: 0;
          border-radius: 7px;
          padding: 7px 9px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: all .2s ease;
        }

        .open-complaint-btn {
          background: #e0f2fe;
          color: #0369a1;
        }

        .open-complaint-btn:hover {
          background: #bae6fd;
          transform: translateY(-1px);
        }

        .delete-complaint-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .delete-complaint-btn:hover:not(:disabled) {
          background: #fecaca;
          transform: translateY(-1px);
        }

        .delete-complaint-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }


        /* =====================================================
           EMPTY
        ===================================================== */

        .complaints-empty {
          padding: 60px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .complaints-empty div {
          font-size: 45px;
          margin-bottom: 10px;
        }

        .complaints-empty h3 {
          margin: 0;
          color: #475569;
        }

        .complaints-empty p {
          font-size: 13px;
        }


        /* =====================================================
           PAGINATION
        ===================================================== */

        .complaints-pagination {
          margin-top: 20px;
          padding-top: 18px;

          border-top:
            1px solid #e2e8f0;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .pagination-info {
          font-size: 12px;
          color: #64748b;
        }

        .pagination-info strong {
          color: #0f172a;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .pagination-btn,
        .pagination-number {
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          cursor: pointer;
          font-weight: 700;
          transition: all .2s ease;
        }

        .pagination-btn {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 11px;
        }

        .pagination-number {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          font-size: 11px;
        }

        .pagination-btn:hover:not(:disabled),
        .pagination-number:hover {
          border-color: #0891b2;
          color: #0891b2;
          background: #ecfeff;
        }

        .pagination-number.active {
          color: white;
          border-color: #0891b2;

          background:
            linear-gradient(
              135deg,
              #0f766e,
              #0891b2
            );

          box-shadow:
            0 4px 10px
            rgba(8,145,178,.2);
        }

        .pagination-btn:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .page-number-list {
          display: flex;
          gap: 5px;
        }


        /* =====================================================
           MODAL
        ===================================================== */

        .complaint-modal-overlay {
          position: fixed;
          inset: 0;

          background:
            rgba(15,23,42,.65);

          backdrop-filter:
            blur(7px);

          display: flex;
          align-items: center;
          justify-content: center;

          z-index: 9999;
          padding: 20px;

          animation:
            overlayIn .25s ease;
        }

        @keyframes overlayIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }

        .complaint-modal {
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow: auto;
          background: white;
          border-radius: 20px;

          box-shadow:
            0 30px 80px
            rgba(0,0,0,.3);

          animation:
            modalIn .35s
            cubic-bezier(.2,.8,.2,1);

          overflow-x: hidden;
        }

        @keyframes modalIn {

          from {
            opacity: 0;
            transform:
              translateY(25px)
              scale(.96);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }

        .modal-top-decoration {
          height: 6px;

          background:
            linear-gradient(
              90deg,
              #0f766e,
              #06b6d4,
              #6366f1,
              #8b5cf6
            );

          background-size: 300% 100%;

          animation:
            gradientMove 4s linear infinite;
        }

        @keyframes gradientMove {

          0% {
            background-position: 0%;
          }

          100% {
            background-position: 300%;
          }

        }

        .complaint-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom:
            1px solid #e2e8f0;
        }

        .modal-title-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-big-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #e0f2fe;
          font-size: 24px;
        }

        .complaint-modal-head h2 {
          margin: 0;
          color: #0f4c5c;
        }

        .complaint-modal-head span {
          font-size: 11px;
          color: #94a3b8;
        }

        .complaint-close {
          border: 0;
          background: #f1f5f9;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          transition: all .2s ease;
        }

        .complaint-close:hover {
          background: #fee2e2;
          color: #dc2626;
          transform: rotate(90deg);
        }

        .complaint-letter {
          padding: 25px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .detail-section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .5px;
          font-weight: 900;
          color: #64748b;
          margin-bottom: 9px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .detail-box {
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #f8fafc;
        }

        .detail-box span,
        .detail-box strong {
          display: block;
        }

        .detail-box span {
          color: #94a3b8;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .detail-box strong {
          color: #334155;
          font-size: 13px;
        }

        .modal-status {
          padding: 12px 15px;
          border-radius: 10px;
          font-weight: 900;
          font-size: 13px;
        }

        .modal-open {
          background: #fff7ed;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .modal-resolved {
          background: #ecfdf5;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .complaint-description {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 17px;
          line-height: 1.7;
          white-space: pre-wrap;
          color: #334155;
          min-height: 110px;
          font-size: 13px;
        }

        .complaint-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 16px 24px;
          border-top:
            1px solid #e2e8f0;
        }

        .resolve-modal-btn,
        .delete-modal-btn,
        .modal-close-btn {
          border: 0;
          padding: 10px 16px;
          border-radius: 9px;
          font-weight: 800;
          cursor: pointer;
        }

        .resolve-modal-btn {
          background: #22c55e;
          color: white;

          box-shadow:
            0 7px 15px
            rgba(34,197,94,.2);
        }

        .delete-modal-btn {
          background: #fee2e2;
          color: #b91c1c;
        }

        .delete-modal-btn:hover {
          background: #fecaca;
        }

        .modal-close-btn {
          background: #f1f5f9;
          color: #475569;
        }


        /* =====================================================
           RESPONSIVE
        ===================================================== */

        @media (max-width: 1200px) {

          .complaint-row {
            grid-template-columns:
              50px
              1fr
              1fr
              1.5fr
              1fr
              1fr;
          }

          .complaint-actions {
            grid-column:
              span 2;
          }

        }


        @media (max-width: 1100px) {

          .complaint-summary-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

        }


        @media (max-width: 768px) {

          .complaint-hero {
            flex-wrap: wrap;
          }

          .complaint-live-indicator {
            width: 100%;
            text-align: center;
          }

          .complaint-types {
            grid-template-columns:
              1fr 1fr;
          }

          .complaint-summary-grid {
            grid-template-columns: 1fr;
          }

          .resolution-display {
            flex-direction: column;
            gap: 20px;
            padding: 20px 0;
          }

          .complaint-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }

          .complaint-preview {
            width: 100%;
          }

          .complaint-status-action {
            width: auto;
          }

          .complaint-actions {
            width: 100%;
            grid-column: auto;
          }

          .complaints-pagination {
            flex-direction: column;
            align-items: stretch;
          }

          .pagination-controls {
            justify-content: center;
            flex-wrap: wrap;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }

        }


        @media (max-width: 480px) {

          .complaint-types {
            grid-template-columns: 1fr;
          }

          .complaint-hero {
            padding: 18px;
          }

          .complaint-hero h1 {
            font-size: 21px;
          }

          .complaint-letter {
            padding: 18px;
          }

          .pagination-btn {
            padding: 7px 9px;
          }

          .page-number-list {
            gap: 3px;
          }

          .pagination-number {
            width: 29px;
            height: 29px;
          }

          .complaint-modal-footer {
            flex-wrap: wrap;
          }

        }

      `}</style>

    </div>
  );
}

export default ComplaintsTab;
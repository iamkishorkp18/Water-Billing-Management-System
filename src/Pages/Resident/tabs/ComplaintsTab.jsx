import { useEffect, useState } from 'react';

import { createComplaint } from '../../../Api/commercialApi';
import { getMyComplaints } from '../../../Api/residentApi';

import DetailsModal, {
  DetailGrid,
  displayValue,
  StatusBadge
} from '../../../components/app/DetailsModal';

const COMPLAINT_TYPES = [
  'Leakage',
  'Billing Issue',
  'Supply Problem',
  'Low Pressure'
];

export default function ComplaintsTab() {

  const householdId = localStorage.getItem('householdId');

  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');

  const [complaints, setComplaints] = useState([]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);


  // =========================================================
  // LOAD RESIDENT COMPLAINTS
  // =========================================================

  const loadComplaints = async () => {

    if (!householdId) {
      return;
    }

    try {

      setLoading(true);

      const response =
        await getMyComplaints(householdId);

      setComplaints(response.data || []);

    } catch (err) {

      console.error(
        'Failed to load complaints:',
        err
      );

      setComplaints([]);

    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOAD ON PAGE OPEN
  // =========================================================

  useEffect(() => {

    loadComplaints();

  }, [householdId]);


  // =========================================================
  // SUBMIT COMPLAINT
  // =========================================================

  const handleSubmit = async e => {

    e.preventDefault();

    if (!selectedType) {

      alert(
        'Please select complaint type.'
      );

      return;
    }

    if (!description.trim()) {

      alert(
        'Please enter description.'
      );

      return;
    }

    if (!householdId) {

      alert(
        'No household linked to this account.'
      );

      return;
    }


    try {

      await createComplaint({

        household: {
          id: Number(householdId)
        },

        complaintType:
          selectedType,

        description:
          description.trim(),

        createdBy:
          localStorage.getItem('email'),

        createdByRole:
          'RESIDENT'

      });


      setSubmitted(true);

      setSelectedType('');

      setDescription('');


      // Refresh complaints immediately
      await loadComplaints();


    } catch (err) {

      console.error(
        'Complaint submission failed:',
        err
      );

      alert(
        err.response?.data?.message ||
        'Failed to submit complaint.'
      );

    }

  };


  // =========================================================
  // STATUS
  // =========================================================

  const getComplaintStatus = complaint =>
    complaint?.status ||
    'PENDING';


  // =========================================================
  // DATE
  // =========================================================

  const getComplaintDate = complaint =>
    complaint?.createdDate ||
    complaint?.date ||
    '—';


  // =========================================================
  // TYPE
  // =========================================================

  const getComplaintType = complaint =>
    complaint?.complaintType ||
    complaint?.type ||
    'General';


  // =========================================================
  // DESCRIPTION
  // =========================================================

  const getComplaintDescription = complaint =>
    complaint?.description ||
    'No description provided.';


  return (
    <>
      {/* =====================================================
          REPORT ISSUE
      ===================================================== */}

      <div className="dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              Report an Issue
            </h2>

            <p>
              Submit a water, billing, or supply-related
              complaint to your apartment administration.
            </p>

          </div>

        </div>


        {submitted && (

          <div className="banner banner-success">

            Complaint submitted successfully.
            Our team will review it shortly.

          </div>

        )}


        <form onSubmit={handleSubmit}>


          {/* =================================================
              COMPLAINT TYPES
          ================================================= */}

          <div className="complaint-types">

            {COMPLAINT_TYPES.map(type => (

              <div
                key={type}

                className={`complaint-type-btn ${
                  selectedType === type
                    ? 'active'
                    : ''
                }`}

                onClick={() => {

                  setSelectedType(type);

                  setSubmitted(false);

                }}

              >

                {type}

              </div>

            ))}

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="form-group">

            <label>
              Description
            </label>

            <input
              placeholder="Describe the issue in detail..."
              value={description}

              onChange={e => {

                setDescription(
                  e.target.value
                );

                setSubmitted(false);

              }}

              required
            />

          </div>


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="btn btn-fill"
          >

            Submit Complaint

          </button>

        </form>

      </div>


      {/* =====================================================
          COMPLAINT STATUS
      ===================================================== */}

      <div className="dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              Complaint Status
            </h2>

            <p>
              Track the complaints raised from your household.
            </p>

          </div>

          <span className="alert-count">

            {complaints.length} complaints

          </span>

        </div>


        {loading ? (

          <p className="empty-state">
            Loading complaints...
          </p>

        ) : complaints.length === 0 ? (

          <div className="empty-state">

            <p>
              No complaints raised yet.
            </p>

          </div>

        ) : (

          <div style={{ overflowX: 'auto' }}>

            <table className="data-table">

              <thead>

                <tr>

                  <th>
                    Type
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {complaints.map(c => (

                  <tr key={c.id}>

                    <td>

                      {getComplaintType(c)}

                    </td>


                    <td>

                      {getComplaintDescription(c)}

                    </td>


                    <td>

                      {getComplaintDate(c)}

                    </td>


                    <td>

                      <StatusBadge
                        status={getComplaintStatus(c)}
                      />

                    </td>


                    <td>

                      <button
                        type="button"
                        className="app-view-btn"

                        onClick={() =>
                          setSelectedComplaint(c)
                        }

                      >

                        View Complaint

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          COMPLAINT DETAILS MODAL
      ===================================================== */}

      <DetailsModal

        open={
          Boolean(selectedComplaint)
        }

        title={
          selectedComplaint
            ? getComplaintType(
                selectedComplaint
              )
            : 'Complaint'
        }

        subtitle={
          selectedComplaint
            ? getComplaintDate(
                selectedComplaint
              )
            : ''
        }

        status={
          selectedComplaint
            ? getComplaintStatus(
                selectedComplaint
              )
            : ''
        }

        onClose={() =>
          setSelectedComplaint(null)
        }

      >

        <DetailGrid
          items={[

            {
              label: 'Complaint Type',

              value:
                displayValue(
                  selectedComplaint
                    ? getComplaintType(
                        selectedComplaint
                      )
                    : ''
                )
            },

            {
              label: 'Date',

              value:
                displayValue(
                  selectedComplaint
                    ? getComplaintDate(
                        selectedComplaint
                      )
                    : ''
                )
            },

            {
              label: 'Status',

              value:
                displayValue(
                  selectedComplaint
                    ? getComplaintStatus(
                        selectedComplaint
                      )
                    : ''
                )
            },

            {
              label: 'Created By',

              value:
                displayValue(
                  selectedComplaint?.createdBy
                )
            },

            {
              label: 'Role',

              value:
                displayValue(
                  selectedComplaint?.createdByRole
                )
            },

            {
              label: 'Household',

              value:
                displayValue(
                  selectedComplaint?.household
                    ?.flatNumber ||
                  selectedComplaint?.householdId
                )
            }

          ]}
        />


        <h3 className="app-section-title">

          Description

        </h3>


        <p>

          {selectedComplaint
            ? getComplaintDescription(
                selectedComplaint
              )
            : ''}

        </p>

      </DetailsModal>

    </>
  );
}
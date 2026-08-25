import { useState } from 'react';
import { createComplaint } from '../../../Api/commercialApi';

const COMPLAINT_TYPES = [
  'Leakage',
  'Billing Issue',
  'Supply Problem',
  'Low Pressure'
];

export default function ComplaintsTab() {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedType) {
      alert('Please select complaint type.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter description.');
      return;
    }

    try {
      await createComplaint({
        household: {
          id: Number(
            localStorage.getItem(
              'householdId'
            )
          )
        },

        complaintType: selectedType,
        description: description.trim(),
        createdBy: localStorage.getItem('email'),
        createdByRole: 'RESIDENT'
      });

      setSubmitted(true);
      setSelectedType('');
      setDescription('');

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

  return (
    <>
      <div className="dash-section">

        <div className="dash-section-head">
          <h2>Report an Issue</h2>
        </div>

        {submitted && (
          <div className="banner banner-success">
            Complaint submitted successfully.
            Our team will review it shortly.
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="complaint-types">
            {COMPLAINT_TYPES.map(type => (
              <div
                key={type}
                className={`complaint-type-btn ${
                  selectedType === type
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setSelectedType(type)
                }
              >
                {type}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Description</label>

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

          <button
            type="submit"
            className="btn btn-fill"
          >
            Submit Complaint
          </button>
        </form>
      </div>

      <div className="dash-section">

        <div className="dash-section-head">
          <h2>Complaint Status</h2>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="empty-state"
                >
                  No complaints raised yet.
                </td>
              </tr>
            ) : (
              complaints.map(c => (
                <tr key={c.id}>
                  <td>
                    {c.complaintType ||
                      c.type}
                  </td>

                  <td>
                    {c.description}
                  </td>

                  <td>
                    {c.createdDate ||
                      c.date}
                  </td>

                  <td>
                    <span className="badge badge-warning">
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="app-view-btn" onClick={() => setViewComplaint(c)}>
                      View Complaint
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
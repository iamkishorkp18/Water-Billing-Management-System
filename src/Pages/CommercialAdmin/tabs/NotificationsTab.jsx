import { useState } from 'react';

import {
  createNotification
} from "../../../Api/commercialApi";


function NotificationsTab({ apartmentId, households }) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    notificationType: 'ANNOUNCEMENT',
    target: 'all'
  });

  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');


  const send = async e => {
    e.preventDefault();

    setMsg('');
    setSuccess('');

    try {
      await createNotification({
        title: form.title,
        message: form.message,
        notificationType: form.notificationType,
        ...(form.target === 'all'
          ? { apartment: { id: apartmentId } }
          : { household: { id: Number(form.target) } })
      });

      setSuccess('Notification sent successfully.');

      setForm({
        title: '',
        message: '',
        notificationType: 'ANNOUNCEMENT',
        target: 'all'
      });

    } catch (err) {
      setMsg(
        err.response?.data?.message ||
        'Failed to send notification.'
      );
    }
  };


  const getTypeIcon = type => {
    switch (type) {
      case 'MAINTENANCE':
        return '🔧';

      case 'EMERGENCY':
        return '🚨';

      case 'BILLING':
        return '🧾';

      default:
        return '📢';
    }
  };


  const getTypeDescription = type => {
    switch (type) {
      case 'MAINTENANCE':
        return 'Inform residents about scheduled maintenance work.';

      case 'EMERGENCY':
        return 'Send an urgent alert that requires immediate attention.';

      case 'BILLING':
        return 'Notify residents about bills, payments or billing updates.';

      default:
        return 'Send a general announcement to residents.';
    }
  };


  return (
    <div className="notifications-page">


      {/* =============================================== */}
      {/* HEADER */}
      {/* =============================================== */}

      <div className="dash-section">

        <div
          className="dash-section-head"
          style={{
            alignItems: 'flex-start'
          }}
        >

          <div>

            <h2>
              🔔 Send Notification
            </h2>

            <p
              style={{
                margin: '6px 0 0',
                color: '#64748b',
                fontSize: 14
              }}
            >
              Communicate important updates and alerts
              to apartment residents.
            </p>

          </div>


          <div
            style={{
              fontSize: 38,
              opacity: 0.8
            }}
          >
            💬
          </div>

        </div>


        {/* ============================================= */}
        {/* STATUS MESSAGES */}
        {/* ============================================= */}

        {msg && (
          <div className="banner banner-error">
            ❌ {msg}
          </div>
        )}

        {success && (
          <div className="banner banner-success">
            ✅ {success}
          </div>
        )}


        {/* ============================================= */}
        {/* NOTIFICATION FORM */}
        {/* ============================================= */}

        <form
          onSubmit={send}
          className="inline-form notification-form"
        >


          {/* TARGET */}

          <div className="form-group">

            <label>
              👥 Send To
            </label>

            <select
              value={form.target}
              onChange={e =>
                setForm({
                  ...form,
                  target: e.target.value
                })
              }
            >

              <option value="all">
                🏢 All Residents
              </option>

              {households.map(h => (

                <option
                  key={h.id}
                  value={h.id}
                >
                  🏠 Only Flat {h.flatNumber}
                </option>

              ))}

            </select>

          </div>


          {/* TYPE */}

          <div className="form-group">

            <label>
              📌 Notification Type
            </label>

            <select
              value={form.notificationType}
              onChange={e =>
                setForm({
                  ...form,
                  notificationType: e.target.value
                })
              }
            >

              <option value="ANNOUNCEMENT">
                📢 Announcement
              </option>

              <option value="MAINTENANCE">
                🔧 Maintenance
              </option>

              <option value="EMERGENCY">
                🚨 Emergency
              </option>

              <option value="BILLING">
                🧾 Billing
              </option>

            </select>

          </div>


          {/* TITLE */}

          <div className="form-group">

            <label>
              ✏️ Notification Title
            </label>

            <input
              placeholder="Example: Water supply maintenance"
              value={form.title}
              onChange={e =>
                setForm({
                  ...form,
                  title: e.target.value
                })
              }
              required
            />

          </div>


          {/* MESSAGE */}

          <div className="form-group">

            <label>
              💬 Message
            </label>

            <textarea
              placeholder="Write your notification message..."
              value={form.message}
              onChange={e =>
                setForm({
                  ...form,
                  message: e.target.value
                })
              }
              required
              rows={6}
              style={{
                width: '100%',
                resize: 'vertical',
                padding: 14,
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                fontSize: 14
              }}
            />

          </div>


          {/* SEND BUTTON */}

          <button
            type="submit"
            className="btn btn-fill"
            style={{
              minWidth: 220,
              padding: '13px 24px',
              fontSize: 15
            }}
          >
            📤 Send Notification
          </button>

        </form>

      </div>


      {/* =============================================== */}
      {/* LIVE PREVIEW */}
      {/* =============================================== */}

      <div className="dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              👁️ Notification Preview
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: 13
              }}
            >
              Preview how the notification will appear
              before sending it.
            </p>

          </div>

        </div>


        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px 10px'
          }}
        >

          <div
            style={{
              width: '100%',
              maxWidth: 560,
              borderRadius: 18,
              overflow: 'hidden',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow:
                '0 15px 35px rgba(15, 76, 92, 0.12)'
            }}
          >

            {/* PREVIEW HEADER */}

            <div
              style={{
                padding: '18px 20px',
                background:
                  'linear-gradient(135deg, #0f4c5c, #168aad)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 14
              }}
            >

              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24
                }}
              >
                {getTypeIcon(form.notificationType)}
              </div>


              <div>

                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.85
                  }}
                >
                  AquaLedger
                </div>

                <strong
                  style={{
                    fontSize: 16
                  }}
                >
                  New Notification
                </strong>

              </div>

            </div>


            {/* PREVIEW BODY */}

            <div
              style={{
                padding: 22
              }}
            >

              <div
                style={{
                  display: 'inline-block',
                  padding: '5px 10px',
                  borderRadius: 20,
                  background: '#eff6ff',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 12
                }}
              >
                {getTypeIcon(form.notificationType)}{' '}
                {form.notificationType}
              </div>


              <h3
                style={{
                  margin: '0 0 10px',
                  color: '#0f172a',
                  fontSize: 20
                }}
              >
                {form.title || 'Notification Title'}
              </h3>


              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  lineHeight: 1.7,
                  minHeight: 50
                }}
              >
                {form.message ||
                  'Your notification message will appear here...'}
              </p>


              <div
                style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#64748b'
                }}
              >

                <span>
                  👥{' '}
                  {form.target === 'all'
                    ? 'All Residents'
                    : `Flat ${
                        households.find(
                          h =>
                            String(h.id) ===
                            String(form.target)
                        )?.flatNumber || '-'
                      }`}
                </span>

                <span>
                  Just now
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =============================================== */}
      {/* NOTIFICATION TYPES */}
      {/* =============================================== */}

      <div className="dash-section">

        <div className="dash-section-head">

          <div>

            <h2>
              📚 Notification Types
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: 13
              }}
            >
              Choose the appropriate category for your
              message.
            </p>

          </div>

        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}
        >

          {[
            {
              type: 'ANNOUNCEMENT',
              icon: '📢',
              title: 'Announcement'
            },
            {
              type: 'MAINTENANCE',
              icon: '🔧',
              title: 'Maintenance'
            },
            {
              type: 'EMERGENCY',
              icon: '🚨',
              title: 'Emergency'
            },
            {
              type: 'BILLING',
              icon: '🧾',
              title: 'Billing'
            }
          ].map(item => (

            <div
              key={item.type}
              onClick={() =>
                setForm({
                  ...form,
                  notificationType: item.type
                })
              }
              style={{
                cursor: 'pointer',
                padding: 20,
                borderRadius: 14,
                border:
                  form.notificationType === item.type
                    ? '2px solid #168aad'
                    : '1px solid #e2e8f0',
                background:
                  form.notificationType === item.type
                    ? '#f0f9ff'
                    : '#ffffff',
                transition:
                  'all 0.25s ease'
              }}
            >

              <div
                style={{
                  fontSize: 30,
                  marginBottom: 10
                }}
              >
                {item.icon}
              </div>

              <strong
                style={{
                  display: 'block',
                  marginBottom: 6
                }}
              >
                {item.title}
              </strong>

              <span
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  lineHeight: 1.5
                }}
              >
                {getTypeDescription(item.type)}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}


export default NotificationsTab;
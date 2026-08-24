import { useEffect, useState } from 'react';
import {
  getTariffForApartment,
  createTariffPlan,
  updateTariffPlan,
  deleteTariffPlan,
  updateThreshold
} from '../../../Api/analyticsApi';

function TariffPlansTab({ apartments }) {
  const [selectedApt, setSelectedApt] = useState(
    apartments[0]?.id || ''
  );

  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    tier1Limit: '',
    tier1Rate: '',
    tier2Limit: '',
    tier2Rate: '',
    tier3Rate: ''
  });

  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState('');

  const [threshold, setThreshold] = useState('1.5');
  const [thresholdMsg, setThresholdMsg] = useState('');

  // =========================================================
  // LOAD TARIFF
  // =========================================================

  useEffect(() => {
    if (selectedApt) {
      loadTariff(selectedApt);
    }
  }, [selectedApt]);

  const loadTariff = async (apartmentId) => {
    setLoading(true);
    setError('');
    setMsg('');
    setSuccess('');
    setTariff(null);

    try {
      const res = await getTariffForApartment(apartmentId);

      const data = res.data;

      setTariff(data);

      setForm({
        tier1Limit: data.tier1Limit ?? '',
        tier1Rate: data.tier1Rate ?? '',
        tier2Limit: data.tier2Limit ?? '',
        tier2Rate: data.tier2Rate ?? '',
        tier3Rate: data.tier3Rate ?? ''
      });

    } catch (err) {
      console.error('Load tariff error:', err);

      setError('No tariff plan set for this apartment yet.');

      setForm({
        tier1Limit: '',
        tier1Rate: '',
        tier2Limit: '',
        tier2Rate: '',
        tier3Rate: ''
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SAVE / UPDATE TARIFF
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    setMsg('');
    setSuccess('');

    const tier1Limit = Number(form.tier1Limit);
    const tier1Rate = Number(form.tier1Rate);
    const tier2Limit = Number(form.tier2Limit);
    const tier2Rate = Number(form.tier2Rate);
    const tier3Rate = Number(form.tier3Rate);

    // Validation
    if (
      !Number.isFinite(tier1Limit) ||
      !Number.isFinite(tier1Rate) ||
      !Number.isFinite(tier2Limit) ||
      !Number.isFinite(tier2Rate) ||
      !Number.isFinite(tier3Rate)
    ) {
      setMsg('Please enter all tariff values.');
      return;
    }

    if (tier1Limit <= 0) {
      setMsg('Tier 1 limit must be greater than 0.');
      return;
    }

    if (tier2Limit <= tier1Limit) {
      setMsg('Tier 2 limit must be greater than Tier 1 limit.');
      return;
    }

    if (tier1Rate < 0 || tier2Rate < 0 || tier3Rate < 0) {
      setMsg('Tariff rates cannot be negative.');
      return;
    }

    try {
      const payload = {
  apartment: {
    id: Number(selectedApt)
  },
  tier1Limit: Number(form.tier1Limit),
  tier1Rate: Number(form.tier1Rate),
  tier2Limit: Number(form.tier2Limit),
  tier2Rate: Number(form.tier2Rate),
  tier3Rate: Number(form.tier3Rate)
};

      let res;

      if (tariff) {
        res = await updateTariffPlan(
          tariff.id,
          payload
        );

        setSuccess('Tariff plan updated successfully.');
      } else {
        res = await createTariffPlan(payload);

        setSuccess('Tariff plan created successfully.');
      }

      const savedTariff = res.data;

      setTariff(savedTariff);

      setForm({
        tier1Limit: savedTariff.tier1Limit ?? tier1Limit,
        tier1Rate: savedTariff.tier1Rate ?? tier1Rate,
        tier2Limit: savedTariff.tier2Limit ?? tier2Limit,
        tier2Rate: savedTariff.tier2Rate ?? tier2Rate,
        tier3Rate: savedTariff.tier3Rate ?? tier3Rate
      });

    } catch (err) {
      console.error('Save tariff error:', err);

      setMsg(
        err.response?.data?.message ||
        'Failed to save tariff plan.'
      );
    }
  };

  // =========================================================
  // DELETE TARIFF
  // =========================================================

  const handleDelete = async () => {
    if (!tariff) return;

    if (
      !window.confirm(
        'Delete this tariff plan? Bills already generated will not be affected.'
      )
    ) {
      return;
    }

    try {
      await deleteTariffPlan(tariff.id);

      setTariff(null);

      setForm({
        tier1Limit: '',
        tier1Rate: '',
        tier2Limit: '',
        tier2Rate: '',
        tier3Rate: ''
      });

      setSuccess('Tariff plan deleted.');
      setMsg('');

    } catch (err) {
      console.error('Delete tariff error:', err);

      setMsg(
        err.response?.data?.message ||
        'Failed to delete tariff plan.'
      );
    }
  };

  // =========================================================
  // UPDATE THRESHOLD
  // =========================================================

  const handleUpdateThreshold = async (e) => {
    e.preventDefault();

    setThresholdMsg('');

    try {
      await updateThreshold(
        selectedApt,
        Number(threshold)
      );

      alert(
        'Usage spike threshold updated successfully.'
      );

    } catch (err) {
      console.error('Threshold update error:', err);

      setThresholdMsg(
        err.response?.data?.message ||
        'Failed to update threshold.'
      );
    }
  };

  // =========================================================
  // FORMAT VALUES
  // =========================================================

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '0';
    }

    return number.toLocaleString('en-IN');
  };

  const formatRate = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '0.00';
    }

    return number.toFixed(2);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="dash-section">

        <div className="dash-section-head">
          <h2>Tariff Plan Management</h2>
        </div>

        {/* SELECT APARTMENT */}

        <div
          className="form-group"
          style={{
            maxWidth: 320,
            marginBottom: 20
          }}
        >
          <label>Select Apartment</label>

          <select
            value={selectedApt}
            onChange={(e) =>
              setSelectedApt(Number(e.target.value))
            }
          >
            {apartments.map((a) => (
              <option
                key={a.id}
                value={a.id}
              >
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* ERROR */}

            {error && (
              <div
                className="banner banner-info"
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe'
                }}
              >
                {error} You can create one below.
              </div>
            )}

            {/* ERROR MESSAGE */}

            {msg && (
              <div className="banner banner-error">
                {msg}
              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="banner banner-success">
                {success}
              </div>
            )}

            {/* =================================================
                TARIFF FORM
            ================================================= */}

            <form
              onSubmit={handleSave}
              className="inline-form"
            >

              <div className="form-row-3">

                {/* TIER 1 */}

                <div
                  className="form-group"
                  style={{ marginBottom: 0 }}
                >
                  <label>
                    Tier 1 Limit (units)
                  </label>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={form.tier1Limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tier1Limit: e.target.value
                      })
                    }
                    placeholder="10000"
                    required
                  />

                  <label
                    style={{ marginTop: 10 }}
                  >
                    Tier 1 Rate (₹/unit)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tier1Rate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tier1Rate: e.target.value
                      })
                    }
                    placeholder="5"
                    required
                  />
                </div>

                {/* TIER 2 */}

                <div
                  className="form-group"
                  style={{ marginBottom: 0 }}
                >
                  <label>
                    Tier 2 Limit (units)
                  </label>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={form.tier2Limit}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tier2Limit: e.target.value
                      })
                    }
                    placeholder="20000"
                    required
                  />

                  <label
                    style={{ marginTop: 10 }}
                  >
                    Tier 2 Rate (₹/unit)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tier2Rate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tier2Rate: e.target.value
                      })
                    }
                    placeholder="8"
                    required
                  />
                </div>

                {/* TIER 3 */}

                <div
                  className="form-group"
                  style={{ marginBottom: 0 }}
                >
                  <label>
                    Tier 3 Rate (₹/unit)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tier3Rate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tier3Rate: e.target.value
                      })
                    }
                    placeholder="10"
                    required
                  />

                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 10
                    }}
                  >
                    Applies to usage above Tier 2 limit.
                  </p>
                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 14
                }}
              >

                <button
                  type="submit"
                  className="btn btn-fill"
                >
                  {tariff
                    ? 'Update Tariff Plan'
                    : 'Create Tariff Plan'}
                </button>

                {tariff && (
                  <button
                    type="button"
                    className="btn-sm btn-reject"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                )}

              </div>

            </form>

            {/* =================================================
                TARIFF INFORMATION
            ================================================= */}

            {tariff && (
              <div
                className="dash-section"
                style={{
                  marginTop: 20
                }}
              >

                <div className="dash-section-head">
                  <h2>Tariff Information</h2>
                </div>

                {/* TIER 1 */}

                <div className="tariff-slab-row">
                  <span>
                    0 – {formatNumber(tariff.tier1Limit)} L
                  </span>

                  <strong>
                    ₹{formatRate(tariff.tier1Rate)} / unit
                  </strong>
                </div>

                {/* TIER 2 */}

                <div className="tariff-slab-row">
                  <span>
                    {formatNumber(
                      Number(tariff.tier1Limit) + 1
                    )}{' '}
                    – {formatNumber(tariff.tier2Limit)} L
                  </span>

                  <strong>
                    ₹{formatRate(tariff.tier2Rate)} / unit
                  </strong>
                </div>

                {/* TIER 3 */}

                <div className="tariff-slab-row">
                  <span>
                    Above {formatNumber(tariff.tier2Limit)} L
                  </span>

                  <strong>
                    ₹{formatRate(tariff.tier3Rate)} / unit
                  </strong>
                </div>

                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginTop: 10
                  }}
                >
                  * Actual rates are applied based on this
                  apartment's configured tariff plan.
                </p>

              </div>
            )}

          </>
        )}

      </div>

      {/* =====================================================
          LEAK DETECTION
      ===================================================== */}

      <div className="dash-section">

        <div className="dash-section-head">
          <h2>Leak Detection Sensitivity</h2>
        </div>

        <p
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 16
          }}
        >
          A household is flagged when their latest usage
          exceeds this multiplier compared to their previous
          period. Lower = more sensitive.
        </p>

        {thresholdMsg && (
          <div className="banner banner-error">
            {thresholdMsg}
          </div>
        )}

        <form
          onSubmit={handleUpdateThreshold}
          style={{
            display: 'flex',
            gap: 10,
            maxWidth: 320
          }}
        >

          <input
            type="number"
            step="0.1"
            min="1.1"
            max="5"
            value={threshold}
            onChange={(e) =>
              setThreshold(e.target.value)
            }
          />

          <button
            type="submit"
            className="btn btn-fill"
          >
            Save
          </button>

        </form>

      </div>
    </>
  );

}

function tabIcon(tab) {
  const icons = {
    'Overview': '📊', 'Usage Logs': '💧', 'Billing Cycle': '🧾', 'Payments': '💳',
    'Alert Center': '🚨', 'Invoices': '📄', 'Complaints': '📮', 'Tariff Plans': '💲', 'Reports': '📈',
    'Commercial Admins': '👔', 'Residents': '🏠', 'Settings': '⚙️',
  };
  return icons[tab] || '•';
}

export default TariffPlansTab;
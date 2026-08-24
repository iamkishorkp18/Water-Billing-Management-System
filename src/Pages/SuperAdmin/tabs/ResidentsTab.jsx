import { useEffect, useState } from 'react';
import {
  getResidentsForApartment,
  getUsageForHousehold
} from '../../../Api/analyticsApi';

export default function ResidentsTab({ apartments }) {
  const [selectedApt, setSelectedApt] = useState(apartments[0]?.id || '');
  const [residents, setResidents] = useState([]);
  const [usageMap, setUsageMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedApt) loadResidents(selectedApt);
  }, [selectedApt]);

  const loadResidents = async (apartmentId) => {
    setLoading(true);

    try {
      const res = await getResidentsForApartment(apartmentId);
      setResidents(res.data);

      const usage = {};

      await Promise.all(
        res.data.map(async (r) => {
          if (r.household?.id) {
            const logs = await getUsageForHousehold(r.household.id)
              .catch(() => ({ data: [] }));

            usage[r.id] = logs.data[0]?.meterReading ?? null;
          }
        })
      );

      setUsageMap(usage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <h2>All Residents</h2>
      </div>

      <div className="form-group" style={{ maxWidth: 320, marginBottom: 20 }}>
        <label>Filter by Apartment</label>

        <select
          value={selectedApt}
          onChange={(e) => setSelectedApt(Number(e.target.value))}
        >
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading residents...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Flat</th>
              <th>Occupancy</th>
              <th>Latest Meter Reading</th>
            </tr>
          </thead>

          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  No residents in this apartment yet.
                </td>
              </tr>
            ) : (
              residents.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td>{r.household?.flatNumber || '-'}</td>
                  <td>{r.household?.occupancy ?? '-'}</td>
                  <td>
                    {usageMap[r.id] !== undefined && usageMap[r.id] !== null
                      ? `${usageMap[r.id]} units`
                      : 'No readings yet'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
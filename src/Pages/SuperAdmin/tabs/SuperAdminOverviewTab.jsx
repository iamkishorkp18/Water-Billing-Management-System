import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList, Legend
} from 'recharts';

const COLORS = ['#0f4c5c', '#14b8a6', '#5eead4', '#f59e0b', '#ef4444', '#8b5cf6'];

 function SuperAdminOverviewTab({
  apartments,
  pendingAdmins,
  alerts,
  totalPendingAmount,
  apartmentUsageChart,
  billStatusChart
}) {
  return (
    <>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-val">{apartments.length}</div>
          <div className="stat-card-lbl">Total Apartments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{pendingAdmins.length}</div>
          <div className="stat-card-lbl">Pending Approvals</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{alerts.length}</div>
          <div className="stat-card-lbl">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">₹{totalPendingAmount.toFixed(2)}</div>
          <div className="stat-card-lbl">Pending Payments</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Apartment-wise Usage</h2>
          </div>

          {apartmentUsageChart.length === 0 ? (
            <p className="empty-state">No usage data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={apartmentUsageChart}
                barCategoryGap="35%"
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={13}
                  axisLine={{ stroke: '#1e293b', strokeWidth: 1.5 }}
                  tickLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  axisLine={{ stroke: '#1e293b', strokeWidth: 1.5 }}
                  tick={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Usage']}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar dataKey="usage" fill="#0f4c5c" maxBarSize={70}>
                  <LabelList
                    dataKey="usage"
                    position="top"
                    formatter={(v) => (v > 0 ? `${v}` : '')}
                    fontSize={12}
                    fill="#0f4c5c"
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Bill Status Breakdown</h2>
          </div>

          {billStatusChart.length === 0 ? (
            <p className="empty-state">No bill data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={billStatusChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {billStatusChart.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  );
}

export default SuperAdminOverviewTab;
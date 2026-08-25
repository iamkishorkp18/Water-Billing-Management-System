import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList, Legend
} from 'recharts';

const COLORS = ['#211d19', '#9a3412', '#c2410c', '#6a6258', '#ddd4c6'];

 function SuperAdminOverviewTab({
  apartments,
  pendingAdmins,
  alerts,
  totalPendingAmount,
  apartmentUsageChart,
  billStatusChart,
  billsCount = 0,
  usageCount = 0,
  complaintsCount = 0
}) {
  return (
    <>
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-val">{apartments.length}</div>
          <div className="stat-card-lbl">Total apartments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{pendingAdmins.length}</div>
          <div className="stat-card-lbl">Pending community admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{billsCount}</div>
          <div className="stat-card-lbl">Bills on record</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">₹{Number(totalPendingAmount || 0).toFixed(2)}</div>
          <div className="stat-card-lbl">Outstanding amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{alerts.length}</div>
          <div className="stat-card-lbl">Active alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{complaintsCount}</div>
          <div className="stat-card-lbl">Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{usageCount}</div>
          <div className="stat-card-lbl">Usage readings</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val">{pendingAdmins.length + alerts.length}</div>
          <div className="stat-card-lbl">Pending actions</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Apartment-wise usage</h2>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd4c6" vertical={false} />
                <XAxis
                  dataKey="name"
                  fontSize={13}
                  axisLine={{ stroke: '#211d19', strokeWidth: 1.5 }}
                  tickLine={{ stroke: '#211d19' }}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  axisLine={{ stroke: '#211d19', strokeWidth: 1.5 }}
                  tick={false}
                  tickLine={false}
                  width={20}
                />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Usage']}
                  cursor={{ fill: 'rgba(33,29,25,0.04)' }}
                />
                <Bar dataKey="usage" fill="#211d19" maxBarSize={70}>
                  <LabelList
                    dataKey="usage"
                    position="top"
                    formatter={(v) => (v > 0 ? `${v}` : '')}
                    fontSize={12}
                    fill="#211d19"
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Bill status</h2>
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

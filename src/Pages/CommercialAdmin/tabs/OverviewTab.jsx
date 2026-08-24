import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';




function OverviewTab({
  households, residents, bills, pendingCount,
  pendingAmount, paidAmount, openComplaints, setActiveTab
}) {
  const billStatusData = [
    { name: 'Paid', value: bills.filter(b => b.status === 'PAID').length },
    { name: 'Pending', value: bills.filter(b => b.status !== 'PAID').length }
  ].filter(d => d.value > 0);

  const householdUsageData = households.map(h => ({
    name: h.flatNumber,
    consumption: Math.round(
      bills
        .filter(b => b.household?.id === h.id)
        .reduce((s, b) => s + Number(b.consumption || 0), 0)
    )
  }));

  const revenueTrend = {};

  bills.forEach(b => {
    if (!revenueTrend[b.billingMonth]) {
      revenueTrend[b.billingMonth] = {
        month: b.billingMonth,
        revenue: 0
      };
    }

    if (b.status === 'PAID') {
      revenueTrend[b.billingMonth].revenue += Number(b.amount || 0);
    }
  });

  const revenueChartData = Object.values(revenueTrend)
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <>
      <div className="quick-actions-row">
        <button className="quick-action-btn" onClick={() => setActiveTab('Residents')}>
          + Add Resident
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Households')}>
          + Add Household
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Generate Bill')}>
          💵 Generate Bills
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab('Notifications')}>
          🔔 Send Notification
        </button>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-val">{households.length}</div>
          <div className="stat-card-lbl">Total Households</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-val">{residents.length}</div>
          <div className="stat-card-lbl">Total Residents</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">🧾</div>
          <div className="stat-card-val">{pendingCount}</div>
          <div className="stat-card-lbl">Pending Bills</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-val">₹{pendingAmount.toFixed(0)}</div>
          <div className="stat-card-lbl">Outstanding Amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-val">₹{paidAmount.toFixed(0)}</div>
          <div className="stat-card-lbl">Revenue Collected</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📮</div>
          <div className="stat-card-val">{openComplaints}</div>
          <div className="stat-card-lbl">Pending Complaints</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="dash-section">
          <div className="dash-section-head"><h2>Revenue Collection Trend</h2></div>
          {revenueChartData.length === 0 ? (
            <p className="empty-state">No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={v => [`₹${Number(v).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-section">
          <div className="dash-section-head"><h2>Bill Status Split</h2></div>
          {billStatusData.length === 0 ? (
            <p className="empty-state">No bill data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={billStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label
                >
                  {billStatusData.map((e, i) => (
                    <Cell
                      key={i}
                      fill={e.name === 'Paid' ? '#22c55e' : '#f59e0b'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-head"><h2>Household-wise Consumption</h2></div>
        {householdUsageData.length === 0 ? (
          <p className="empty-state">No usage data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={householdUsageData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="consumption" fill="#0f4c5c">
                <LabelList dataKey="consumption" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default OverviewTab;
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0f4c5c', '#14b8a6', '#5eead4', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsTab({
  monthlyConsumptionChart,
  apartmentUsageChart,
  billStatusChart
}) {
  return (
    <div className="chart-grid">
      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Monthly Consumption</h2>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyConsumptionChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar
              dataKey="total"
              fill="#0f4c5c"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Apartment Usage Comparison</h2>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={apartmentUsageChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar
              dataKey="usage"
              fill="#14b8a6"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Bill Status Distribution</h2>
        </div>

        {billStatusChart.length === 0 ? (
          <p className="empty-state">No bill data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={billStatusChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
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
  );
}
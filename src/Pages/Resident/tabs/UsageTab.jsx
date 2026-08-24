import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

export default function UsageTab({
  dailyChartData,
  monthlyChartData,
  pieData,
  avgConsumption,
  highestDay,
  lowestDay,
  currentConsumption
}) {
  return (
    <>
      <div className="stat-cards">

        <div className="stat-card">
          <div className="stat-card-val">
            {avgConsumption.toFixed(1)}
          </div>
          <div className="stat-card-lbl">
            Avg Daily Consumption
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            {highestDay
              ? highestDay.consumption.toFixed(0)
              : '—'}
          </div>
          <div className="stat-card-lbl">
            Highest Usage Period
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            {lowestDay
              ? lowestDay.consumption.toFixed(0)
              : '—'}
          </div>
          <div className="stat-card-lbl">
            Lowest Usage Period
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-val">
            {(currentConsumption * 1.1).toFixed(0)}
          </div>
          <div className="stat-card-lbl">
            Est. Month-End Usage
          </div>
        </div>

      </div>

      <div className="dash-section">
        <div className="dash-section-head">
          <h2>Meter Readings Over Time</h2>
        </div>

        {dailyChartData.length === 0 ? (
          <p className="empty-state">
            No readings yet.
          </p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <LineChart
              data={dailyChartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 5
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="date"
                fontSize={12}
              />

              <YAxis
                tick={false}
                tickLine={false}
                width={20}
              />

              <Tooltip
                formatter={v => [
                  `${v} units`,
                  'Reading'
                ]}
              />

              <Line
                type="monotone"
                dataKey="reading"
                stroke="#0f4c5c"
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: '#14b8a6'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-grid">

        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Monthly Consumption</h2>
          </div>

          {monthlyChartData.length === 0 ? (
            <p className="empty-state">
              No billing data yet.
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={monthlyChartData}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  fontSize={12}
                />

                <YAxis
                  domain={[0, 'dataMax']}
                  tick={false}
                  tickLine={false}
                  width={20}
                />

                <Tooltip
                  formatter={v => [
                    `${v} units`,
                    'Consumption'
                  ]}
                />

                <Bar
                  dataKey="consumption"
                  fill="#14b8a6"
                  maxBarSize={60}
                >
                  <LabelList
                    dataKey="consumption"
                    position="top"
                    formatter={v =>
                      v > 0 ? v : ''
                    }
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-section">
          <div className="dash-section-head">
            <h2>Bill Status Distribution</h2>
          </div>

          {pieData.length === 0 ? (
            <p className="empty-state">
              No bill data yet.
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.name === 'Paid'
                          ? '#22c55e'
                          : '#f59e0b'
                      }
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
    </>
  );
}
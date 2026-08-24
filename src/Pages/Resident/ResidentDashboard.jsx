import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyUsageHistory,
  getMyBills,
  getMyAlerts,
  getMyPayments,
  downloadCurrentBill,
  downloadPaidBill,
  downloadAllCurrentBills,
  downloadAllPaidBills
} from '../../Api/residentApi';

import { getTariffForApartment } from '../../Api/analyticsApi';

import {
  ResidentOverviewTab,
  UsageTab,
  BillsTab,
  PaymentsTab,
  ComplaintsTab,
  NotificationsTab,
  AlertsTab
} from './tabs';

const TABS = [
  'Dashboard',
  'Water Usage',
  'Bills',
  'Payments',
  'Notifications',
  'Alerts',
  'Complaints',
  'Profile'
];

const ICONS = {
  Dashboard: '📊',
  'Water Usage': '💧',
  Bills: '🧾',
  Payments: '💳',
  Notifications: '🔔',
  Alerts: '🚨',
  Complaints: '📮',
  Profile: '👤'
};

const TIPS = [
  { icon:'🚿', text:'Turn off taps while brushing your teeth to save water.' },
  { icon:'🔧', text:'Repair leaking taps promptly to prevent water wastage.' },
  { icon:'🪣', text:'Use a bucket instead of a shower where possible.' },
  { icon:'🧺', text:'Run washing machines only with a full load.' },
  { icon:'🌧️', text:'Consider rainwater harvesting to reduce water usage.' }
];

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const householdId = localStorage.getItem('householdId');

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [usage, setUsage] = useState([]);
  const [bills, setBills] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tariff, setTariff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (householdId) loadData();
    else setError('No household linked to this account.');
  }, [householdId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [usageRes, billsRes, alertsRes, paymentsRes] =
        await Promise.all([
          getMyUsageHistory(householdId),
          getMyBills(householdId),
          getMyAlerts(householdId),
          getMyPayments(householdId).catch(() => ({ data: [] }))
        ]);

      const billData = billsRes.data || [];

      setUsage(usageRes.data || []);
      setBills(billData);
      setAlerts(alertsRes.data || []);
      setPayments(paymentsRes.data || []);

      const apartmentId =
        billData[0]?.household?.apartment?.id ||
        billData[0]?.household?.apartmentId ||
        localStorage.getItem('apartmentId');

      if (apartmentId) {
        try {
          const res = await getTariffForApartment(Number(apartmentId));
          setTariff(res.data);
          localStorage.setItem('apartmentId', apartmentId);
        } catch {
          setTariff(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePdf = (res, name) => {
    const url = URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCurrentDownload = async id => {
    try {
      savePdf(await downloadCurrentBill(id), `current_bill_${id}.pdf`);
    } catch {
      alert('Failed to download bill.');
    }
  };

  const handlePaidDownload = async id => {
    try {
      savePdf(await downloadPaidBill(id), `paid_bill_${id}.pdf`);
    } catch {
      alert('Failed to download paid bill.');
    }
  };

  const handleAllCurrent = async (year, month) => {
    try {
      savePdf(
        await downloadAllCurrentBills(
          householdId,
          year || null,
          month || null
        ),
        'all_current_bills.pdf'
      );
    } catch {
      alert('Failed to download current bills.');
    }
  };

  const handleAllPaid = async (year, month) => {
    try {
      savePdf(
        await downloadAllPaidBills(
          householdId,
          year || null,
          month || null
        ),
        'all_paid_bills.pdf'
      );
    } catch {
      alert('Failed to download paid bills.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const sortedUsage = [...usage].sort(
    (a, b) => new Date(a.readingDate) - new Date(b.readingDate)
  );

  const dailyChartData = sortedUsage.map(u => ({
    date: u.readingDate,
    reading: Number(u.meterReading)
  }));

  const consumptionPeriods = [];

  for (let i = 1; i < sortedUsage.length; i++) {
    consumptionPeriods.push({
      period: sortedUsage[i].readingDate,
      consumption:
        Number(sortedUsage[i].meterReading) -
        Number(sortedUsage[i - 1].meterReading)
    });
  }

  const currentConsumption = consumptionPeriods.length
    ? consumptionPeriods.at(-1).consumption
    : 0;

  const avgConsumption = consumptionPeriods.length
    ? consumptionPeriods.reduce((s, p) => s + p.consumption, 0) /
      consumptionPeriods.length
    : 0;

  const highestDay = consumptionPeriods.length
    ? consumptionPeriods.reduce((a, b) =>
        a.consumption > b.consumption ? a : b
      )
    : null;

  const lowestDay = consumptionPeriods.length
    ? consumptionPeriods.reduce((a, b) =>
        a.consumption < b.consumption ? a : b
      )
    : null;

  let usageStatus = 'Normal';

  if (avgConsumption && currentConsumption > avgConsumption * 1.5)
    usageStatus = 'High';
  else if (avgConsumption && currentConsumption < avgConsumption * 0.5)
    usageStatus = 'Low';

  const pendingBills = bills.filter(
    b => (b.status || 'PENDING') !== 'PAID'
  );

  const paidBills = bills.filter(b => b.status === 'PAID');

  const latestBill = pendingBills[0] || null;

  const pieData = [
    { name: 'Paid', value: paidBills.length },
    { name: 'Pending', value: pendingBills.length }
  ].filter(x => x.value);

  const monthlyChartData = bills
    .slice(0, 6)
    .reverse()
    .map(b => ({
      month: b.billingMonth,
      consumption: Number(b.consumption)
    }));

  const initials = email ? email.charAt(0).toUpperCase() : 'R';

  return (
    <div className="dash-shell">

      <aside className="dash-sidebar">
        <div className="nav-logo">💧 AquaLedger</div>

        <nav className="dash-nav">
          {TABS.map(tab => (
            <div
              key={tab}
              className={`dash-nav-item ${
                activeTab === tab ? 'active' : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span>{ICONS[tab]}</span> {tab}
            </div>
          ))}
        </nav>

        <button
          className="btn btn-outline"
          style={{ marginTop:'auto' }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>

      <main className="dash-main">

        <div className="res-header">
          <div>
            <h1
              style={{
                fontSize:24,
                fontWeight:800,
                color:'var(--primary)'
              }}
            >
              {activeTab}
            </h1>

            <p className="dash-sub">
              {new Date().toLocaleDateString('en-IN',{
                weekday:'long',
                year:'numeric',
                month:'long',
                day:'numeric'
              })}
            </p>
          </div>

          <input
            className="res-search"
            placeholder="Search bills, alerts, tips..."
          />

          <div className="res-header-right">
            <div className="res-bell">
              🔔<span className="dot" />
            </div>

            <div className="res-avatar">{initials}</div>
          </div>
        </div>

        {error && (
          <div className="banner banner-error">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {activeTab === 'Dashboard' && (
              <ResidentOverviewTab
                latestBill={latestBill}
                currentConsumption={currentConsumption}
                usageStatus={usageStatus}
                alerts={alerts}
                tips={TIPS}
              />
            )}

            {activeTab === 'Water Usage' && (
              <UsageTab
                dailyChartData={dailyChartData}
                monthlyChartData={monthlyChartData}
                pieData={pieData}
                avgConsumption={avgConsumption}
                highestDay={highestDay}
                lowestDay={lowestDay}
                currentConsumption={currentConsumption}
              />
            )}

            {activeTab === 'Bills' && (
              <BillsTab
                bills={bills}
                onCurrentDownload={handleCurrentDownload}
                onPaidDownload={handlePaidDownload}
                onAllCurrent={handleAllCurrent}
                onAllPaid={handleAllPaid}
                tariff={tariff}
              />
            )}

            {activeTab === 'Payments' && (
              <PaymentsTab
                bills={bills}
                payments={payments}
                onPaymentSuccess={loadData}
              />
            )}

            {activeTab === 'Notifications' && (
              <NotificationsTab householdId={householdId} />
            )}

            {activeTab === 'Alerts' && (
              <AlertsTab alerts={alerts} />
            )}

            {activeTab === 'Complaints' && (
              <ComplaintsTab />
            )}

            {activeTab === 'Profile' && (
              <ProfileTab email={email} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function ProfileTab({ email }) {
  const initials = email ? email.charAt(0).toUpperCase() : 'R';

  return (
    <div className="dash-section">
      <div className="profile-header">
        <div className="profile-avatar-lg">{initials}</div>
        <div>
          <h2 style={{ color:'var(--primary)' }}>{email}</h2>
          <p style={{ color:'var(--text-muted)' }}>
            Resident Account
          </p>
        </div>
      </div>

      <div
        className="resident-info-grid"
        style={{ gridTemplateColumns:'repeat(3,1fr)' }}
      >
        <div className="resident-info-item">
          <span className="lbl">Email</span>
          <span className="val">{email}</span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Phone Number</span>
          <span className="val">Not set</span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Occupancy Type</span>
          <span className="val">Family</span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Family Members</span>
          <span className="val">—</span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Account Type</span>
          <span className="val">Resident</span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">Member Since</span>
          <span className="val">—</span>
        </div>
      </div>
    </div>
  );
}
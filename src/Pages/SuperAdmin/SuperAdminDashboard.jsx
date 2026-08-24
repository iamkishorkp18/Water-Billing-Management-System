import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getApartments,
  getPendingAdmins,
  getUsageForApartment,
  getBillsForApartment,
  getUnresolvedAlerts,
  createApartment,
  approveAdmin,
  rejectAdmin,
  getCommercialAdmins,
  getAssignmentsForUser,
  getResidentsForApartment,
  getUsageForHousehold,
  markBillAsPaid,
  createAssignment,
  getPaymentsForApartment,
  getAllComplaints
} from '../../Api/analyticsApi';

import { deleteCommercialAdmin } from '../../Api/apiClient';
//import { TrashTab } from '../TrashTab';
import TrashTab from '../TrashTab';

import SuperAdminOverviewTab from './tabs/SuperAdminOverviewTab';
import UsageLogsTab from './tabs/UsageLogsTab';
import BillingTab from './tabs/BillsTab';
import PaymentsAnalyticsTab from './tabs/PaymentsAnalyticsTab';
import AlertCenterTab from './tabs/AlertCenterTab';
import InvoicesTab from './tabs/InvoicesTab';
import ComplaintsTab from './tabs/ComplaintsTab';
import TariffPlansTab from './tabs/Tariffplanstab';
import ReportsTab from './tabs/ReportsTab';
import CommercialAdminsTab from './tabs/CommercialAdminsTab';
import ResidentsTab from './tabs/ResidentsTab';
import SettingsTab from './tabs/SettingsTab';

const icons = {
  Overview: '📊',
  'Usage Logs': '💧',
  'Billing Cycle': '🧾',
  Payments: '💳',
  'Alert Center': '🚨',
  Invoices: '📄',
  Complaints: '📢',
  'Tariff Plans': '💰',
  Reports: '📈',
  'Commercial Admins': '👨‍💼',
  Residents: '👥',
  Settings: '⚙️',
  Trash: '🗑️'
};

const tabIcon = (tab) => icons[tab] || '📌';

const TABS = [
  'Overview',
  'Usage Logs',
  'Billing Cycle',
  'Payments',
  'Alert Center',
  'Invoices',
  'Complaints',
  'Tariff Plans',
  'Reports',
  'Commercial Admins',
  'Residents',
  'Settings',
  'Trash'
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const [activeTab, setActiveTab] = useState('Overview');

  const [apartments, setApartments] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [usageByApt, setUsageByApt] = useState({});
  const [billsByApt, setBillsByApt] = useState({});
  const [paymentsByApt, setPaymentsByApt] = useState({});
  const [allComplaints, setAllComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAptForm, setShowAptForm] = useState(false);
  const [newApt, setNewApt] = useState({
    name: '',
    address: '',
    ward: ''
  });
  const [formMsg, setFormMsg] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);

    try {
      const [
        aptRes,
        pendingRes,
        alertsRes,
        complaintsRes
      ] = await Promise.all([
        getApartments(),
        getPendingAdmins(),
        getUnresolvedAlerts(),
        getAllComplaints().catch(() => ({ data: [] }))
      ]);

      setApartments(aptRes.data);
      setPendingAdmins(pendingRes.data);
      setAlerts(alertsRes.data);
      setAllComplaints(complaintsRes.data);

      const usageMap = {};
      const billsMap = {};
      const paymentsMap = {};

      await Promise.all(
        aptRes.data.map(async (apt) => {
          const [u, b, p] = await Promise.all([
            getUsageForApartment(apt.id).catch(() => ({ data: [] })),
            getBillsForApartment(apt.id).catch(() => ({ data: [] })),
            getPaymentsForApartment(apt.id).catch(() => ({ data: [] }))
          ]);

          usageMap[apt.id] = u.data;
          billsMap[apt.id] = b.data;
          paymentsMap[apt.id] = p.data;
        })
      );

      setUsageByApt(usageMap);
      setBillsByApt(billsMap);
      setPaymentsByApt(paymentsMap);
    } catch (err) {
      console.error(err);
      setError(
        'Failed to load dashboard data. Your session may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAdmin(id);

      setPendingAdmins((prev) =>
        prev.filter((u) => u.id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to approve.'
      );
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAdmin(id);

      setPendingAdmins((prev) =>
        prev.filter((u) => u.id !== id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to reject.'
      );
    }
  };

  const handleMarkPaid = async (billId, apartmentId) => {
    try {
      await markBillAsPaid(billId);

      setBillsByApt((prev) => ({
        ...prev,
        [apartmentId]: (prev[apartmentId] || []).map((b) =>
          b.id === billId
            ? { ...b, status: 'PAID' }
            : b
        )
      }));
    } catch (err) {
      alert(
        err.response?.data?.message ||
        'Failed to mark bill as paid.'
      );
    }
  };

  const handleCreateApartment = async (e) => {
    e.preventDefault();
    setFormMsg('');

    try {
      const res = await createApartment({
        name: newApt.name,
        address: newApt.address,
        ward: newApt.ward
      });

      setApartments((prev) => [
        ...prev,
        res.data
      ]);

      setNewApt({
        name: '',
        address: '',
        ward: ''
      });

      setShowAptForm(false);
    } catch (err) {
      console.error(err);

      setFormMsg(
        err.response?.data?.message ||
        'Failed to create apartment.'
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const allBills = Object.values(billsByApt).flat();
  const allUsage = Object.values(usageByApt).flat();

  const totalPendingAmount = allBills
    .filter((b) => b.status !== 'PAID')
    .reduce(
      (sum, b) => sum + Number(b.amount || 0),
      0
    );

  const apartmentUsageChart = apartments.map((apt) => {
    const logs = usageByApt[apt.id] || [];

    const total = logs.reduce(
      (sum, l) =>
        sum + Number(l.meterReading || 0),
      0
    );

    return {
      name: apt.name,
      usage: Math.round(total)
    };
  });

  const monthlyConsumptionMap = {};

  allUsage.forEach((log) => {
    const month = log.readingDate
      ? log.readingDate.slice(0, 7)
      : 'Unknown';

    monthlyConsumptionMap[month] =
      (monthlyConsumptionMap[month] || 0) +
      Number(log.meterReading || 0);
  });

  const monthlyConsumptionChart = Object.entries(
    monthlyConsumptionMap
  )
    .sort(([a], [b]) =>
      a.localeCompare(b)
    )
    .map(([month, total]) => ({
      month,
      total: Math.round(total)
    }));

  const billStatusMap = {
    PAID: 0,
    PENDING: 0,
    UNPAID: 0
  };

  allBills.forEach((b) => {
    const status = b.status || 'PENDING';

    billStatusMap[status] =
      (billStatusMap[status] || 0) + 1;
  });

  const billStatusChart = Object.entries(
    billStatusMap
  )
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count
    }));

  return (
    <div className="dash-shell">

      <aside className="dash-sidebar">

        <div
          className="nav-logo"
          style={{
            color: 'white',
            padding: '0 0 24px'
          }}
        >
          💧 AquaLedger
        </div>

        <nav className="dash-nav">

          {TABS.map((tab) => (
            <div
              key={tab}
              className={`dash-nav-item ${
                activeTab === tab
                  ? 'active'
                  : ''
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tabIcon(tab)} {tab}
            </div>
          ))}

        </nav>

        <button
          className="btn btn-outline"
          style={{ marginTop: 'auto' }}
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      <main className="dash-main">

        <div className="dash-topbar">
          <h1>{activeTab}</h1>

          <p className="dash-sub">
            Welcome back, {email}
          </p>
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

            {/* OVERVIEW */}
            {activeTab === 'Overview' && (
              <SuperAdminOverviewTab
                apartments={apartments}
                pendingAdmins={pendingAdmins}
                alerts={alerts}
                totalPendingAmount={totalPendingAmount}
                apartmentUsageChart={apartmentUsageChart}
                billStatusChart={billStatusChart}
              />
            )}

            {/* USAGE LOGS */}
            {activeTab === 'Usage Logs' && (
              <UsageLogsTab
                apartments={apartments}
                usageByApt={usageByApt}
              />
            )}

            {/* BILLING */}
            {activeTab === 'Billing Cycle' && (
              <BillingTab
                apartments={apartments}
                billsByApt={billsByApt}
                monthlyConsumptionChart={
                  monthlyConsumptionChart
                }
                onMarkPaid={handleMarkPaid}
              />
            )}

            {/* PAYMENTS */}
            {activeTab === 'Payments' && (
              <PaymentsAnalyticsTab
                paymentsByApt={paymentsByApt}
                apartments={apartments}
              />
            )}

            {/* ALERT CENTER */}
            {activeTab === 'Alert Center' && (
              <AlertCenterTab
                alerts={alerts}
              />
            )}

            {/* INVOICES */}
            {activeTab === 'Invoices' && (
              <InvoicesTab
                allBills={allBills}
                apartments={apartments}
                onMarkPaid={handleMarkPaid}
              />
            )}

            {/* COMPLAINTS */}
            {activeTab === 'Complaints' && (
              <ComplaintsTab
                complaints={allComplaints}
              />
            )}

            {/* TARIFF PLANS */}
            {activeTab === 'Tariff Plans' && (
              <TariffPlansTab
                apartments={apartments}
              />
            )}

            {/* REPORTS */}
            {activeTab === 'Reports' && (
              <ReportsTab
                monthlyConsumptionChart={
                  monthlyConsumptionChart
                }
                apartmentUsageChart={
                  apartmentUsageChart
                }
                billStatusChart={
                  billStatusChart
                }
              />
            )}

            {/* COMMERCIAL ADMINS */}
            {activeTab === 'Commercial Admins' && (
              <CommercialAdminsTab
                apartments={apartments}
              />
            )}

            {/* RESIDENTS */}
            {activeTab === 'Residents' && (
              <ResidentsTab
                apartments={apartments}
              />
            )}

            {/* SETTINGS */}
            {activeTab === 'Settings' && (
              <SettingsTab
                apartments={apartments}
                setApartments={setApartments}
                pendingAdmins={pendingAdmins}
                handleApprove={handleApprove}
                handleReject={handleReject}
                showAptForm={showAptForm}
                setShowAptForm={setShowAptForm}
                newApt={newApt}
                setNewApt={setNewApt}
                handleCreateApartment={
                  handleCreateApartment
                }
                formMsg={formMsg}
              />
            )}

            {/* TRASH */}
           {activeTab === 'Trash' && <TrashTab />}

          </>
        )}

      </main>
    </div>
  );
}
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
  getPaymentsForApartment,
  getAllComplaints,
} from '../../Api/analyticsApi';

import {
  getProfilePhoto,
} from '../../Api/profileApi';
import ProfileTab from '../../components/ProfileTab';
import TrashTab from '../TrashTab';
import AppShell from '../../components/app/AppShell';

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
  'Trash',
  'Profile',
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

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  const [showAptForm, setShowAptForm] = useState(false);

  const [newApt, setNewApt] = useState({
    name: '',
    address: '',
    ward: '',
  });

  const [formMsg, setFormMsg] = useState('');

  /* =========================================================
     PROFILE PHOTO
  ========================================================= */

  const loadProfilePhoto = async () => {
    try {
      const response = await getProfilePhoto();

      if (!response?.data) {
        setProfilePhotoUrl(null);
        return;
      }

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]);

      if (blob.size === 0) {
        setProfilePhotoUrl(null);
        return;
      }

      const newUrl = URL.createObjectURL(blob);

      setProfilePhotoUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return newUrl;
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setProfilePhotoUrl(null);
        return;
      }

      console.error('Profile photo load failed:', err);
    }
  };

  useEffect(() => {
    loadProfilePhoto();

    return () => {
      setProfilePhotoUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return null;
      });
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'Profile') {
      loadProfilePhoto();
    }
  }, [activeTab]);

  const handleProfileClick = () => {
    setActiveTab('Profile');
  };

  const handleProfilePhotoUpdated = () => {
    loadProfilePhoto();
  };

  /* =========================================================
     LOAD ALL DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        aptRes,
        pendingRes,
        alertsRes,
        complaintsRes,
      ] = await Promise.all([
        getApartments().catch(() => ({ data: [] })),
        getPendingAdmins().catch(() => ({ data: [] })),
        getUnresolvedAlerts().catch(() => ({ data: [] })),
        getAllComplaints().catch(() => ({ data: [] })),
      ]);

      const apartmentData = Array.isArray(aptRes?.data)
        ? aptRes.data
        : [];

      const pendingData = Array.isArray(pendingRes?.data)
        ? pendingRes.data
        : [];

      const alertData = Array.isArray(alertsRes?.data)
        ? alertsRes.data
        : [];

      const complaintData = Array.isArray(
        complaintsRes?.data
      )
        ? complaintsRes.data
        : [];

      setApartments(apartmentData);
      setPendingAdmins(pendingData);
      setAlerts(alertData);
      setAllComplaints(complaintData);

      const usageMap = {};
      const billsMap = {};
      const paymentsMap = {};

      await Promise.all(
        apartmentData.map(async (apt) => {
          const [
            usageResponse,
            billsResponse,
            paymentsResponse,
          ] = await Promise.all([
            getUsageForApartment(apt.id).catch(() => ({
              data: [],
            })),

            getBillsForApartment(apt.id).catch(() => ({
              data: [],
            })),

            getPaymentsForApartment(apt.id).catch(() => ({
              data: [],
            })),
          ]);

          usageMap[apt.id] = Array.isArray(
            usageResponse?.data
          )
            ? usageResponse.data
            : [];

          billsMap[apt.id] = Array.isArray(
            billsResponse?.data
          )
            ? billsResponse.data
            : [];

          paymentsMap[apt.id] = Array.isArray(
            paymentsResponse?.data
          )
            ? paymentsResponse.data
            : [];
        })
      );

      setUsageByApt(usageMap);
      setBillsByApt(billsMap);
      setPaymentsByApt(paymentsMap);
    } catch (err) {
      console.error(
        'Super Admin dashboard loading error:',
        err
      );

      setError(
        'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     APPROVE ADMIN
  ========================================================= */

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

  /* =========================================================
     REJECT ADMIN
  ========================================================= */

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

  /* =========================================================
     MARK BILL PAID
  ========================================================= */

  const handleMarkPaid = async (
    billId,
    apartmentId
  ) => {
    try {
      await markBillAsPaid(billId);

      setBillsByApt((prev) => ({
        ...prev,

        [apartmentId]: (
          prev[apartmentId] || []
        ).map((bill) =>
          bill.id === billId
            ? {
                ...bill,
                status: 'PAID',
              }
            : bill
        ),
      }));
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to mark bill as paid.'
      );
    }
  };

  /* =========================================================
     CREATE APARTMENT
  ========================================================= */

  const handleCreateApartment = async (e) => {
    e.preventDefault();

    setFormMsg('');

    try {
      const response = await createApartment({
        name: newApt.name,
        address: newApt.address,
        ward: newApt.ward,
      });

      setApartments((prev) => [
        ...prev,
        response.data,
      ]);

      setNewApt({
        name: '',
        address: '',
        ward: '',
      });

      setShowAptForm(false);
    } catch (err) {
      console.error(
        'Apartment creation failed:',
        err
      );

      setFormMsg(
        err.response?.data?.message ||
          'Failed to create apartment.'
      );
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (profilePhotoUrl) {
      URL.revokeObjectURL(profilePhotoUrl);
    }

    localStorage.clear();

    navigate('/login');
  };

  /* =========================================================
     SAFE DATA
  ========================================================= */

  const allBills = Object.values(
    billsByApt
  ).flat();

  const allUsage = Object.values(
    usageByApt
  ).flat();

  const totalPendingAmount = allBills
    .filter(
      (bill) =>
        String(
          bill.status || 'PENDING'
        ).toUpperCase() !== 'PAID'
    )
    .reduce(
      (sum, bill) =>
        sum + Number(bill.amount || 0),
      0
    );

  /* =========================================================
     APARTMENT USAGE CHART
  ========================================================= */

  const apartmentUsageChart =
    apartments.map((apt) => {
      const logs =
        usageByApt[apt.id] || [];

      const total = logs.reduce(
        (sum, log) =>
          sum +
          Number(
            log.meterReading || 0
          ),
        0
      );

      return {
        name: apt.name,
        usage: Math.round(total),
      };
    });

  /* =========================================================
     MONTHLY CONSUMPTION
  ========================================================= */

  const monthlyConsumptionMap = {};

  allUsage.forEach((log) => {
    const month = log.readingDate
      ? log.readingDate.slice(0, 7)
      : 'Unknown';

    monthlyConsumptionMap[month] =
      (monthlyConsumptionMap[month] || 0) +
      Number(log.meterReading || 0);
  });

  const monthlyConsumptionChart =
    Object.entries(
      monthlyConsumptionMap
    )
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([month, total]) => ({
        month,
        total: Math.round(total),
      }));

  /* =========================================================
     BILL STATUS
  ========================================================= */

  const billStatusMap = {
    PAID: 0,
    PENDING: 0,
    UNPAID: 0,
  };

  allBills.forEach((bill) => {
    const status = String(
      bill.status || 'PENDING'
    ).toUpperCase();

    billStatusMap[status] =
      (billStatusMap[status] || 0) + 1;
  });

  const billStatusChart =
    Object.entries(billStatusMap)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
      }));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AppShell
      roleLabel="Super Admin"
      email={email}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      error={error}
      loading={loading}
      profilePhotoUrl={profilePhotoUrl}
      onProfileClick={handleProfileClick}
    >
      {/* OVERVIEW */}

      {activeTab === 'Overview' && (
        <SuperAdminOverviewTab
          apartments={apartments}
          pendingAdmins={pendingAdmins}
          alerts={alerts}
          totalPendingAmount={
            totalPendingAmount
          }
          apartmentUsageChart={
            apartmentUsageChart
          }
          billStatusChart={
            billStatusChart
          }
          billsCount={allBills.length}
          usageCount={allUsage.length}
          complaintsCount={
            allComplaints.length
          }
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

      {activeTab === 'Trash' && (
        <TrashTab />
      )}

      {/* PROFILE */}

      {activeTab === 'Profile' && (
        <ProfileTab
          roleLabel="Super Admin"
          onPhotoUpdated={
            handleProfilePhotoUpdated
          }
        />
      )}
    </AppShell>
  );
}
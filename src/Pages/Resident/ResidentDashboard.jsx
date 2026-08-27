import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyUsageHistory,
  getMyBills,
  getMyAlerts,
  getMyNotifications,
  getMyComplaints,
  getMyPayments,
  downloadCurrentBill,
  downloadPaidBill,
  downloadAllCurrentBills,
  downloadAllPaidBills,
} from '../../Api/residentApi';

import ProfileTab from '../../components/ProfileTab';

import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  getProfilePhoto,
} from '../../Api/profileApi';

import { getTariffForApartment } from '../../Api/analyticsApi';

import {
  ResidentOverviewTab,
  UsageTab,
  BillsTab,
  PaymentsTab,
  ComplaintsTab,
  NotificationsTab,
  AlertsTab,
} from './tabs';

import AppShell from '../../components/app/AppShell';

const TABS = [
  'Dashboard',
  'Water Usage',
  'Bills',
  'Payments',
  'Notifications',
  'Alerts',
  'Complaints',
  'Profile',
];

const TIPS = [
  {
    text: 'Turn off taps while brushing your teeth to save water.',
  },
  {
    text: 'Repair leaking taps promptly to prevent water wastage.',
  },
  {
    text: 'Use a bucket instead of a shower where possible.',
  },
  {
    text: 'Run washing machines only with a full load.',
  },
  {
    text: 'Consider rainwater harvesting to reduce water usage.',
  },
];

export default function ResidentDashboard() {
  const navigate = useNavigate();

  const email = localStorage.getItem('email');
  const householdId = localStorage.getItem('householdId');

  const [activeTab, setActiveTab] = useState('Dashboard');

  const [usage, setUsage] = useState([]);
  const [bills, setBills] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tariff, setTariff] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  /* =========================================================
     LOAD PROFILE PHOTO
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

      console.error('Photo load failed:', err);
    }
  };

  /* =========================================================
     LOAD PROFILE PHOTO WHEN DASHBOARD OPENS
  ========================================================= */

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

  /* =========================================================
     REFRESH PROFILE PHOTO WHEN PROFILE TAB OPENS
  ========================================================= */

  useEffect(() => {
    if (activeTab === 'Profile') {
      loadProfilePhoto();
    }
  }, [activeTab]);

  /* =========================================================
     LOAD DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    if (householdId) {
      loadData();
    } else {
      setError('No household linked to this account.');
    }
  }, [householdId]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        usageRes,
        billsRes,
        alertsRes,
        notificationsRes,
        complaintsRes,
        paymentsRes,
      ] = await Promise.all([
        getMyUsageHistory(householdId),

        getMyBills(householdId),

        getMyAlerts(householdId),

        getMyNotifications(householdId).catch(() => ({
          data: [],
        })),

        getMyComplaints(householdId).catch(() => ({
          data: [],
        })),

        getMyPayments(householdId).catch(() => ({
          data: [],
        })),
      ]);

      const usageData = Array.isArray(usageRes?.data)
        ? usageRes.data
        : [];

      const billData = Array.isArray(billsRes?.data)
        ? billsRes.data
        : [];

      const alertData = Array.isArray(alertsRes?.data)
        ? alertsRes.data
        : [];

      const notificationData = Array.isArray(
        notificationsRes?.data
      )
        ? notificationsRes.data
        : [];

      const complaintData = Array.isArray(
        complaintsRes?.data
      )
        ? complaintsRes.data
        : [];

      const paymentData = Array.isArray(
        paymentsRes?.data
      )
        ? paymentsRes.data
        : [];

      setUsage(usageData);
      setBills(billData);
      setPayments(paymentData);
      setComplaints(complaintData);

      setAlerts([
        ...alertData,
        ...notificationData,
      ]);

      const apartmentId =
        billData[0]?.household?.apartment?.id ||
        billData[0]?.household?.apartmentId ||
        localStorage.getItem('apartmentId');

      if (apartmentId) {
        try {
          const res = await getTariffForApartment(
            Number(apartmentId)
          );

          setTariff(res.data);

          localStorage.setItem(
            'apartmentId',
            String(apartmentId)
          );
        } catch (err) {
          console.error(
            'Tariff loading failed:',
            err
          );

          setTariff(null);
        }
      }
    } catch (err) {
      console.error(
        'Resident dashboard loading error:',
        err
      );

      setError(
        'Failed to load your data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     PROFILE CLICK
  ========================================================= */

  const handleProfileClick = () => {
    setActiveTab('Profile');
  };

  /* =========================================================
     PROFILE PHOTO UPDATED
  ========================================================= */

  const handleProfilePhotoUpdated = () => {
    loadProfilePhoto();
  };

  /* =========================================================
     SAVE PDF
  ========================================================= */

  const savePdf = (response, filename) => {
    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf',
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /* =========================================================
     CURRENT BILL
  ========================================================= */

  const handleCurrentDownload = async (id) => {
    try {
      const response =
        await downloadCurrentBill(id);

      savePdf(
        response,
        `current_bill_${id}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert('Failed to download bill.');
    }
  };

  /* =========================================================
     PAID BILL
  ========================================================= */

  const handlePaidDownload = async (id) => {
    try {
      const response =
        await downloadPaidBill(id);

      savePdf(
        response,
        `paid_bill_${id}.pdf`
      );
    } catch (err) {
      console.error(err);
      alert('Failed to download paid bill.');
    }
  };

  /* =========================================================
     ALL CURRENT BILLS
  ========================================================= */

  const handleAllCurrent = async (
    year,
    month
  ) => {
    try {
      const response =
        await downloadAllCurrentBills(
          householdId,
          year || null,
          month || null
        );

      savePdf(
        response,
        'all_current_bills.pdf'
      );
    } catch (err) {
      console.error(err);
      alert(
        'Failed to download current bills.'
      );
    }
  };

  /* =========================================================
     ALL PAID BILLS
  ========================================================= */

  const handleAllPaid = async (
    year,
    month
  ) => {
    try {
      const response =
        await downloadAllPaidBills(
          householdId,
          year || null,
          month || null
        );

      savePdf(
        response,
        'all_paid_bills.pdf'
      );
    } catch (err) {
      console.error(err);
      alert(
        'Failed to download paid bills.'
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
     USAGE
  ========================================================= */

  const sortedUsage = [...usage].sort(
    (a, b) =>
      new Date(a.readingDate) -
      new Date(b.readingDate)
  );

  const dailyChartData =
    sortedUsage.map((item) => ({
      date: item.readingDate,
      reading: Number(
        item.meterReading || 0
      ),
    }));

  const consumptionPeriods = [];

  for (
    let i = 1;
    i < sortedUsage.length;
    i++
  ) {
    const currentReading = Number(
      sortedUsage[i].meterReading || 0
    );

    const previousReading = Number(
      sortedUsage[i - 1].meterReading || 0
    );

    const consumption =
      currentReading - previousReading;

    consumptionPeriods.push({
      period:
        sortedUsage[i].readingDate,

      consumption:
        consumption >= 0
          ? consumption
          : 0,
    });
  }

  const currentConsumption =
    consumptionPeriods.length
      ? consumptionPeriods[
          consumptionPeriods.length - 1
        ].consumption
      : 0;

  const avgConsumption =
    consumptionPeriods.length
      ? consumptionPeriods.reduce(
          (sum, period) =>
            sum + period.consumption,
          0
        ) / consumptionPeriods.length
      : 0;

  const highestDay =
    consumptionPeriods.length
      ? consumptionPeriods.reduce(
          (a, b) =>
            a.consumption >
            b.consumption
              ? a
              : b
        )
      : null;

  const lowestDay =
    consumptionPeriods.length
      ? consumptionPeriods.reduce(
          (a, b) =>
            a.consumption <
            b.consumption
              ? a
              : b
        )
      : null;

  let usageStatus = 'Normal';

  if (
    avgConsumption &&
    currentConsumption >
      avgConsumption * 1.5
  ) {
    usageStatus = 'High';
  } else if (
    avgConsumption &&
    currentConsumption <
      avgConsumption * 0.5
  ) {
    usageStatus = 'Low';
  }

  /* =========================================================
     BILLS
  ========================================================= */

  const pendingBills = bills.filter(
    (bill) =>
      String(
        bill.status || 'PENDING'
      ).toUpperCase() !== 'PAID'
  );

  const paidBills = bills.filter(
    (bill) =>
      String(
        bill.status || ''
      ).toUpperCase() === 'PAID'
  );

  const latestBill =
    pendingBills[0] ||
    bills[0] ||
    null;

  const pieData = [
    {
      name: 'Paid',
      value: paidBills.length,
    },
    {
      name: 'Pending',
      value: pendingBills.length,
    },
  ].filter(
    (item) => item.value > 0
  );

  const monthlyChartData =
    [...bills]
      .slice(0, 6)
      .reverse()
      .map((bill) => ({
        month:
          bill.billingMonth ||
          bill.month ||
          bill.billingDate ||
          'N/A',

        consumption:
          Number(
            bill.consumption || 0
          ),
      }));

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AppShell
      roleLabel="Resident"
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
      {activeTab === 'Dashboard' && (
        <ResidentOverviewTab
          latestBill={latestBill}
          currentConsumption={
            currentConsumption
          }
          usageStatus={usageStatus}
          alerts={alerts}
          tips={TIPS}
          bills={bills}
          complaints={complaints}
        />
      )}

      {activeTab === 'Water Usage' && (
        <UsageTab
          dailyChartData={
            dailyChartData
          }
          monthlyChartData={
            monthlyChartData
          }
          pieData={pieData}
          avgConsumption={
            avgConsumption
          }
          highestDay={highestDay}
          lowestDay={lowestDay}
          currentConsumption={
            currentConsumption
          }
        />
      )}

      {activeTab === 'Bills' && (
        <BillsTab
          bills={bills}
          onCurrentDownload={
            handleCurrentDownload
          }
          onPaidDownload={
            handlePaidDownload
          }
          onAllCurrent={
            handleAllCurrent
          }
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
        <NotificationsTab
          householdId={householdId}
        />
      )}

      {activeTab === 'Alerts' && (
        <AlertsTab alerts={alerts} />
      )}

      {activeTab === 'Complaints' && (
        <ComplaintsTab
          complaints={complaints}
          householdId={householdId}
          onComplaintCreated={loadData}
        />
      )}

      {activeTab === 'Profile' && (
        <ProfileTab
          roleLabel="Resident"
          onPhotoUpdated={
            handleProfilePhotoUpdated
          }
        />
      )}
    </AppShell>
  );
}
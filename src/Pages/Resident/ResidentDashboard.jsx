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

import AppShell from '../../components/app/AppShell';

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

const TIPS = [
  {
    text: 'Turn off taps while brushing your teeth to save water.'
  },
  {
    text: 'Repair leaking taps promptly to prevent water wastage.'
  },
  {
    text: 'Use a bucket instead of a shower where possible.'
  },
  {
    text: 'Run washing machines only with a full load.'
  },
  {
    text: 'Consider rainwater harvesting to reduce water usage.'
  }
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

  useEffect(() => {
    if (householdId) {
      loadData();
    } else {
      setError(
        'No household linked to this account.'
      );
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
        paymentsRes
      ] = await Promise.all([
        getMyUsageHistory(householdId),

        getMyBills(householdId),

        getMyAlerts(householdId),

        getMyNotifications(
          householdId
        ).catch(() => ({
          data: []
        })),

        getMyComplaints(
          householdId
        ).catch(() => ({
          data: []
        })),

        getMyPayments(
          householdId
        ).catch(() => ({
          data: []
        }))
      ]);

      const usageData =
        Array.isArray(usageRes.data)
          ? usageRes.data
          : [];

      const billData =
        Array.isArray(billsRes.data)
          ? billsRes.data
          : [];

      const alertData =
        Array.isArray(alertsRes.data)
          ? alertsRes.data
          : [];

      const notificationData =
        Array.isArray(
          notificationsRes.data
        )
          ? notificationsRes.data
          : [];

      const complaintData =
        Array.isArray(
          complaintsRes.data
        )
          ? complaintsRes.data
          : [];

      const paymentData =
        Array.isArray(
          paymentsRes.data
        )
          ? paymentsRes.data
          : [];

      /*
       * =====================================================
       * SET DATA
       * =====================================================
       */

      setUsage(usageData);

      setBills(billData);

      setPayments(paymentData);

      setComplaints(
        complaintData
      );

      /*
       * =====================================================
       * COMBINE ALERTS + NOTIFICATIONS
       * =====================================================
       */

      const combinedAlerts = [
        ...alertData,
        ...notificationData
      ];

      setAlerts(
        combinedAlerts
      );

      /*
       * =====================================================
       * APARTMENT / TARIFF
       * =====================================================
       */

      const apartmentId =
        billData[0]?.household
          ?.apartment?.id ||
        billData[0]?.household
          ?.apartmentId ||
        localStorage.getItem(
          'apartmentId'
        );

      if (apartmentId) {
        try {
          const res =
            await getTariffForApartment(
              Number(apartmentId)
            );

          setTariff(
            res.data
          );

          localStorage.setItem(
            'apartmentId',
            apartmentId
          );
        } catch {
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

  /*
   * =====================================================
   * PDF DOWNLOAD
   * =====================================================
   */

  const savePdf = (
    res,
    name
  ) => {
    const url =
      URL.createObjectURL(
        new Blob([
          res.data
        ])
      );

    const link =
      document.createElement(
        'a'
      );

    link.href = url;
    link.download = name;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  const handleCurrentDownload =
    async id => {
      try {
        savePdf(
          await downloadCurrentBill(
            id
          ),
          `current_bill_${id}.pdf`
        );
      } catch {
        alert(
          'Failed to download bill.'
        );
      }
    };

  const handlePaidDownload =
    async id => {
      try {
        savePdf(
          await downloadPaidBill(
            id
          ),
          `paid_bill_${id}.pdf`
        );
      } catch {
        alert(
          'Failed to download paid bill.'
        );
      }
    };

  const handleAllCurrent =
    async (
      year,
      month
    ) => {
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
        alert(
          'Failed to download current bills.'
        );
      }
    };

  const handleAllPaid =
    async (
      year,
      month
    ) => {
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
        alert(
          'Failed to download paid bills.'
        );
      }
    };

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout =
    () => {
      localStorage.clear();
      navigate('/login');
    };

  /*
   * =====================================================
   * WATER USAGE
   * =====================================================
   */

  const sortedUsage =
    [...usage].sort(
      (a, b) =>
        new Date(
          a.readingDate
        ) -
        new Date(
          b.readingDate
        )
    );

  const dailyChartData =
    sortedUsage.map(u => ({
      date:
        u.readingDate,

      reading:
        Number(
          u.meterReading
        )
    }));

  const consumptionPeriods =
    [];

  for (
    let i = 1;
    i < sortedUsage.length;
    i++
  ) {
    const currentReading =
      Number(
        sortedUsage[i]
          .meterReading
      );

    const previousReading =
      Number(
        sortedUsage[i - 1]
          .meterReading
      );

    const consumption =
      currentReading -
      previousReading;

    consumptionPeriods.push({
      period:
        sortedUsage[i]
          .readingDate,

      consumption:
        consumption >= 0
          ? consumption
          : 0
    });
  }

  const currentConsumption =
    consumptionPeriods.length
      ? consumptionPeriods.at(-1)
          .consumption
      : 0;

  const avgConsumption =
    consumptionPeriods.length
      ? consumptionPeriods.reduce(
          (sum, period) =>
            sum +
            period.consumption,
          0
        ) /
        consumptionPeriods.length
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

  let usageStatus =
    'Normal';

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

  /*
   * =====================================================
   * BILLS
   * =====================================================
   */

  const pendingBills =
    bills.filter(
      b =>
        String(
          b.status ||
            'PENDING'
        ).toUpperCase() !==
        'PAID'
    );

  const paidBills =
    bills.filter(
      b =>
        String(
          b.status || ''
        ).toUpperCase() ===
        'PAID'
    );

  const latestBill =
    pendingBills[0] ||
    bills[0] ||
    null;

  const pieData = [
    {
      name: 'Paid',
      value:
        paidBills.length
    },
    {
      name: 'Pending',
      value:
        pendingBills.length
    }
  ].filter(
    item =>
      item.value > 0
  );

  const monthlyChartData =
    [...bills]
      .slice(0, 6)
      .reverse()
      .map(b => ({
        month:
          b.billingMonth ||
          b.month ||
          b.billingDate ||
          'N/A',

        consumption:
          Number(
            b.consumption || 0
          )
      }));

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <AppShell
      roleLabel="Resident"
      email={email}
      tabs={TABS}
      activeTab={
        activeTab
      }
      onTabChange={
        setActiveTab
      }
      onLogout={
        handleLogout
      }
      error={error}
      loading={loading}
    >

      {activeTab ===
        'Dashboard' && (
        <ResidentOverviewTab
          latestBill={
            latestBill
          }

          currentConsumption={
            currentConsumption
          }

          usageStatus={
            usageStatus
          }

          alerts={
            alerts
          }

          tips={
            TIPS
          }

          bills={
            bills
          }

          complaints={
            complaints
          }
        />
      )}

      {activeTab ===
        'Water Usage' && (
        <UsageTab
          dailyChartData={
            dailyChartData
          }

          monthlyChartData={
            monthlyChartData
          }

          pieData={
            pieData
          }

          avgConsumption={
            avgConsumption
          }

          highestDay={
            highestDay
          }

          lowestDay={
            lowestDay
          }

          currentConsumption={
            currentConsumption
          }
        />
      )}

      {activeTab ===
        'Bills' && (
        <BillsTab
          bills={
            bills
          }

          onCurrentDownload={
            handleCurrentDownload
          }

          onPaidDownload={
            handlePaidDownload
          }

          onAllCurrent={
            handleAllCurrent
          }

          onAllPaid={
            handleAllPaid
          }

          tariff={
            tariff
          }
        />
      )}

      {activeTab ===
        'Payments' && (
        <PaymentsTab
          bills={
            bills
          }

          payments={
            payments
          }

          onPaymentSuccess={
            loadData
          }
        />
      )}

      {activeTab ===
        'Notifications' && (
        <NotificationsTab
          householdId={
            householdId
          }
        />
      )}

      {activeTab ===
        'Alerts' && (
        <AlertsTab
          alerts={
            alerts
          }
        />
      )}

      {activeTab ===
        'Complaints' && (
        <ComplaintsTab
          complaints={
            complaints
          }

          householdId={
            householdId
          }

          onComplaintCreated={
            loadData
          }
        />
      )}

      {activeTab ===
        'Profile' && (
        <ProfileTab
          email={
            email
          }
        />
      )}

    </AppShell>
  );
}

/*
 * =============================================================
 * PROFILE TAB
 * =============================================================
 */

function ProfileTab({
  email
}) {
  const initials =
    email
      ? email
          .charAt(0)
          .toUpperCase()
      : 'R';

  return (
    <div className="dash-section">

      <div className="profile-header">

        <div className="profile-avatar-lg">
          {initials}
        </div>

        <div>

          <h2
            style={{
              color:
                'var(--primary)'
            }}
          >
            {email}
          </h2>

          <p
            style={{
              color:
                'var(--text-muted)'
            }}
          >
            Resident Account
          </p>

        </div>

      </div>

      <div
        className="resident-info-grid"
        style={{
          gridTemplateColumns:
            'repeat(3,1fr)'
        }}
      >

        <div className="resident-info-item">
          <span className="lbl">
            Email
          </span>

          <span className="val">
            {email}
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">
            Phone Number
          </span>

          <span className="val">
            Not set
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">
            Occupancy Type
          </span>

          <span className="val">
            Family
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">
            Family Members
          </span>

          <span className="val">
            —
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">
            Account Type
          </span>

          <span className="val">
            Resident
          </span>
        </div>

        <div className="resident-info-item">
          <span className="lbl">
            Member Since
          </span>

          <span className="val">
            —
          </span>
        </div>

      </div>

    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyApartments,
  getHouseholdsByApartment,
  getResidentsForApartment,
  getBillsForApartment,
  getComplaintsForApartment,
  createComplaint,
  updateComplaintStatus,
  markBillAsPaid,
} from '../../Api/commercialApi';

import ProfileTab from '../../components/ProfileTab';
import {
  getProfilePhoto,
} from '../../Api/profileApi';

import OverviewTab from './tabs/OverviewTab';
import HouseholdsTab from './tabs/HouseholdsTab';
import ResidentsTab from './tabs/ResidentsTab';
import BillingCycleTab from './tabs/BillingCycleTab';
import GenerateBillTab from './tabs/GenerateBillTab';
import ComplaintsTab from './tabs/ComplaintsTab';
import NotificationsTab from './tabs/NotificationsTab';

import BulkPurchasesTab from '../../components/BulkPurchasesTab';
import AppShell from '../../components/app/AppShell';

const TABS = [
  'Overview',
  'Households',
  'Residents',
  'Billing Cycle',
  'Generate Bill',
  'Bulk Purchases',
  'Complaints',
  'Notifications',
  'Profile',
];

export default function CommercialAdminDashboard() {
  const navigate = useNavigate();

  const email = localStorage.getItem('email');

  const [activeTab, setActiveTab] =
    useState('Overview');

  const [apartments, setApartments] =
    useState([]);

  const [selectedApt, setSelectedApt] =
    useState(null);

  const [households, setHouseholds] =
    useState([]);

  const [residents, setResidents] =
    useState([]);

  const [bills, setBills] =
    useState([]);

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [profilePhotoUrl, setProfilePhotoUrl] =
    useState(null);

  /* =========================================================
     PROFILE PHOTO
  ========================================================= */

  const loadProfilePhoto = async () => {
    try {
      const response =
        await getProfilePhoto();

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

      const newUrl =
        URL.createObjectURL(blob);

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

      console.error(
        'Profile photo load failed:',
        err
      );
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
     LOAD APARTMENTS
  ========================================================= */

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    setLoading(true);
    setError('');

    try {
      const response =
        await getMyApartments();

      const apartmentData =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setApartments(apartmentData);

      if (apartmentData.length > 0) {
        setSelectedApt(
          apartmentData[0].id
        );
      } else {
        setSelectedApt(null);
        setLoading(false);
      }
    } catch (err) {
      console.error(
        'Failed to load apartments:',
        err
      );

      setApartments([]);
      setSelectedApt(null);

      setError(
        err.response?.data?.message ||
          'Failed to load apartments. Your session may have expired.'
      );

      setLoading(false);
    }
  };

  /* =========================================================
     LOAD SELECTED APARTMENT DATA
  ========================================================= */

  useEffect(() => {
    if (selectedApt !== null) {
      loadApartmentData(selectedApt);
    }
  }, [selectedApt]);

  const loadApartmentData = async (id) => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [
        householdsResponse,
        residentsResponse,
        billsResponse,
        complaintsResponse,
      ] = await Promise.all([
        getHouseholdsByApartment(id).catch(
          () => ({ data: [] })
        ),

        getResidentsForApartment(id).catch(
          () => ({ data: [] })
        ),

        getBillsForApartment(id).catch(
          () => ({ data: [] })
        ),

        getComplaintsForApartment(id).catch(
          () => ({ data: [] })
        ),
      ]);

      setHouseholds(
        Array.isArray(
          householdsResponse?.data
        )
          ? householdsResponse.data
          : []
      );

      setResidents(
        Array.isArray(
          residentsResponse?.data
        )
          ? residentsResponse.data
          : []
      );

      setBills(
        Array.isArray(
          billsResponse?.data
        )
          ? billsResponse.data
          : []
      );

      setComplaints(
        Array.isArray(
          complaintsResponse?.data
        )
          ? complaintsResponse.data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load apartment data:',
        err
      );

      setHouseholds([]);
      setResidents([]);
      setBills([]);
      setComplaints([]);

      setError(
        'Failed to load apartment data.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SUBMIT COMPLAINT
  ========================================================= */

  const handleSubmitComplaint =
    async (data) => {
      try {
        const complaintData = {
          createdBy:
            localStorage.getItem('email'),

          createdByRole:
            'COMMERCIAL_ADMIN',

          complaintType:
            data.complaintType,

          description:
            data.description,
        };

        await createComplaint(
          complaintData
        );

        return true;
      } catch (err) {
        console.error(
          'Complaint submission failed:',
          err
        );

        console.error(
          'Backend response:',
          err.response?.data
        );

        throw err;
      }
    };

  /* =========================================================
     RESOLVE COMPLAINT
  ========================================================= */

  const handleResolveComplaint =
    async (id) => {
      try {
        await updateComplaintStatus(
          id,
          'RESOLVED'
        );

        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.id === id
              ? {
                  ...complaint,
                  status: 'RESOLVED',
                }
              : complaint
          )
        );
      } catch (err) {
        alert(
          err.response?.data?.message ||
            'Failed to update complaint.'
        );
      }
    };

  /* =========================================================
     MARK BILL PAID
  ========================================================= */

  const handleMarkPaid = async (id) => {
    try {
      await markBillAsPaid(id);

      setBills((prev) =>
        prev.map((bill) =>
          bill.id === id
            ? {
                ...bill,
                status: 'PAID',
              }
            : bill
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to mark bill as paid.'
      );
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    if (profilePhotoUrl) {
      URL.revokeObjectURL(
        profilePhotoUrl
      );
    }

    localStorage.clear();

    navigate('/login');
  };

  /* =========================================================
     CURRENT APARTMENT
  ========================================================= */

  const currentApt =
    apartments.find(
      (apt) =>
        apt.id === selectedApt
    );

  /* =========================================================
     BILL CALCULATIONS
  ========================================================= */

  const pendingCount =
    bills.filter(
      (bill) =>
        String(
          bill.status || 'PENDING'
        ).toUpperCase() !== 'PAID'
    ).length;

  const pendingAmount =
    bills
      .filter(
        (bill) =>
          String(
            bill.status || 'PENDING'
          ).toUpperCase() !== 'PAID'
      )
      .reduce(
        (sum, bill) =>
          sum +
          Number(
            bill.amount || 0
          ),
        0
      );

  const paidAmount =
  bills
    .filter(
      (bill) =>
        String(bill.status || '').toUpperCase() === 'PAID'
    )
    .reduce(
      (sum, bill) => sum + Number(bill.amount || 0),
      0
    );


  /* =========================================================
     COMPLAINT CALCULATION
  ========================================================= */

  const openComplaints =
    complaints.filter(
      (complaint) =>
        String(
          complaint.status || ''
        ).toUpperCase() === 'OPEN'
    ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AppShell
      roleLabel="Community Admin"
      email={email}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      error={error}
      loading={loading}
      profilePhotoUrl={profilePhotoUrl}
      onProfileClick={handleProfileClick}
      headerExtra={
        apartments.length > 0 ? (
          <select
            aria-label="Select apartment"
            value={selectedApt || ''}
            onChange={(event) =>
              setSelectedApt(
                Number(
                  event.target.value
                )
              )
            }
          >
            {apartments.map(
              (apartment) => (
                <option
                  key={apartment.id}
                  value={apartment.id}
                >
                  {apartment.name}
                </option>
              )
            )}
          </select>
        ) : null
      }
    >
      {apartments.length === 0 &&
      !loading ? (
        <p className="empty-state">
          No apartments assigned to you
          yet. Contact the Super Admin.
        </p>
      ) : !loading ? (
        <>
          {/* OVERVIEW */}

          {activeTab === 'Overview' && (
            <OverviewTab
              households={households}
              residents={residents}
              bills={bills}
              complaints={complaints}
              pendingCount={pendingCount}
              pendingAmount={pendingAmount}
              paidAmount={paidAmount}
              openComplaints={
                openComplaints
              }
              setActiveTab={
                setActiveTab
              }
            />
          )}

          {/* HOUSEHOLDS */}

          {activeTab === 'Households' && (
            <HouseholdsTab
              apartmentId={selectedApt}
              households={households}
              setHouseholds={
                setHouseholds
              }
            />
          )}

          {/* RESIDENTS */}

          {activeTab === 'Residents' && (
            <ResidentsTab
              apartmentName={
                currentApt?.name
              }
              households={households}
              residents={residents}
              setResidents={
                setResidents
              }
            />
          )}

          {/* BILLING */}

          {activeTab ===
            'Billing Cycle' && (
            <BillingCycleTab
              bills={bills}
              onMarkPaid={
                handleMarkPaid
              }
              apartmentId={
                selectedApt
              }
              setBills={setBills}
            />
          )}

          {/* GENERATE BILL */}

          {activeTab ===
            'Generate Bill' && (
            <GenerateBillTab
              households={
                households
              }
              onBillGenerated={() =>
                loadApartmentData(
                  selectedApt
                )
              }
            />
          )}

          {/* BULK PURCHASES */}

          {activeTab ===
            'Bulk Purchases' && (
            <BulkPurchasesTab
              apartmentId={
                selectedApt
              }
            />
          )}

          {/* COMPLAINTS */}

          {activeTab ===
            'Complaints' && (
            <ComplaintsTab
              complaints={
                complaints
              }
              onResolve={
                handleResolveComplaint
              }
              onSubmitComplaint={
                handleSubmitComplaint
              }
            />
          )}

          {/* NOTIFICATIONS */}

          {activeTab ===
            'Notifications' && (
            <NotificationsTab
              apartmentId={
                selectedApt
              }
              households={
                households
              }
            />
          )}
        </>
      ) : null}

      {/* PROFILE */}

      {activeTab === 'Profile' && (
        <ProfileTab
          roleLabel="Community Admin"
          onPhotoUpdated={
            handleProfilePhotoUpdated
          }
        />
      )}
    </AppShell>
  );
}
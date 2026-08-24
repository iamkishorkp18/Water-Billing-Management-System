import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getMyApartments,
  getHouseholdsByApartment,
  getResidentsForApartment,
  getBillsForApartment,
  getComplaintsForApartment,
  createComplaint,
  updateComplaintStatus
} from "../../Api/commercialApi";

import OverviewTab from "./tabs/OverviewTab";
import HouseholdsTab from "./tabs/HouseholdsTab";
import ResidentsTab from "./tabs/ResidentsTab";
import BillingCycleTab from "./tabs/BillingCycleTab";
import GenerateBillTab from "./tabs/GenerateBillTab";
import ComplaintsTab from "./tabs/ComplaintsTab";
import NotificationsTab from "./tabs/NotificationsTab";


// ================= EXISTING BULK PURCHASE COMPONENT =================
import BulkPurchasesTab from "../../components/BulkPurchasesTab";


// ================= TABS =================

const TABS = [
  'Overview',
  'Households',
  'Residents',
  'Billing Cycle',
  'Generate Bill',
  'Bulk Purchases',
  'Complaints',
  'Notifications'
];


// ================= MAIN DASHBOARD =================

export default function CommercialAdminDashboard() {
  const navigate = useNavigate();

  const email = localStorage.getItem('email');


  // ================= STATE =================

  const [activeTab, setActiveTab] = useState('Overview');

  const [apartments, setApartments] = useState([]);

  const [selectedApt, setSelectedApt] = useState(null);

  const [households, setHouseholds] = useState([]);

  const [residents, setResidents] = useState([]);

  const [bills, setBills] = useState([]);

  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  // ================= LOAD APARTMENTS =================

  useEffect(() => {
    loadApartments();
  }, []);


  // ================= LOAD APARTMENT DATA =================

  useEffect(() => {
    if (selectedApt) {
      loadApartmentData(selectedApt);
    }
  }, [selectedApt]);


  // ================= GET APARTMENTS =================

  const loadApartments = async () => {
    setLoading(true);

    try {
      const res = await getMyApartments();

      setApartments(res.data);

      if (res.data.length) {
        setSelectedApt(res.data[0].id);
      } else {
        setLoading(false);
      }

    } catch (err) {
      console.error('Failed to load apartments:', err);

      setError(
        'Failed to load apartments. Your session may have expired.'
      );

      setLoading(false);
    }
  };


  // ================= LOAD SELECTED APARTMENT DATA =================

  const loadApartmentData = async id => {
    setLoading(true);
    setError('');

    try {
      const [
        householdsResponse,
        residentsResponse,
        billsResponse,
        complaintsResponse
      ] = await Promise.all([
        getHouseholdsByApartment(id),
        getResidentsForApartment(id),
        getBillsForApartment(id),
        getComplaintsForApartment(id).catch(() => ({
          data: []
        }))
      ]);


      setHouseholds(householdsResponse.data);

      setResidents(residentsResponse.data);

      setBills(billsResponse.data);

      setComplaints(complaintsResponse.data);

    } catch (err) {
      console.error('Failed to load apartment data:', err);

      setError('Failed to load apartment data.');

    } finally {
      setLoading(false);
    }
  };


  // ================= COMMERCIAL ADMIN -> SUPER ADMIN =================

  const handleSubmitComplaint = async data => {
    try {

      const complaintData = {
        createdBy: localStorage.getItem('email'),
        createdByRole: 'COMMERCIAL_ADMIN',
        complaintType: data.complaintType,
        description: data.description
      };


      console.log(
        'Commercial complaint:',
        complaintData
      );


      await createComplaint(complaintData);

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


  // ================= RESOLVE COMPLAINT =================

  const handleResolveComplaint = async id => {
    try {

      await updateComplaintStatus(
        id,
        'RESOLVED'
      );


      setComplaints(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: 'RESOLVED'
              }
            : c
        )
      );

    } catch (err) {

      alert(
        err.response?.data?.message ||
        'Failed to update complaint.'
      );
    }
  };


  // ================= MARK BILL PAID =================

  const handleMarkPaid = async id => {
    try {

      await markBillAsPaid(id);


      setBills(prev =>
        prev.map(b =>
          b.id === id
            ? {
                ...b,
                status: 'PAID'
              }
            : b
        )
      );

    } catch (err) {

      alert(
        err.response?.data?.message ||
        'Failed to mark bill as paid.'
      );
    }
  };


  // ================= LOGOUT =================

  const handleLogout = () => {

    localStorage.clear();

    navigate('/login');
  };


  // ================= CURRENT APARTMENT =================

  const currentApt = apartments.find(
    a => a.id === selectedApt
  );


  // ================= BILL CALCULATIONS =================

  const pendingCount = bills.filter(
    b => b.status !== 'PAID'
  ).length;


  const pendingAmount = bills
    .filter(b => b.status !== 'PAID')
    .reduce(
      (sum, b) =>
        sum + Number(b.amount || 0),
      0
    );


  const paidAmount = bills
    .filter(b => b.status === 'PAID')
    .reduce(
      (sum, b) =>
        sum + Number(b.amount || 0),
      0
    );


  // ================= COMPLAINT CALCULATION =================

  const openComplaints = complaints.filter(
    c => c.status === 'OPEN'
  ).length;


  // ================= RENDER =================

  return (
    <div className="dash-shell">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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

          {TABS.map(tab => (

            <div
              key={tab}
              className={`dash-nav-item ${
                activeTab === tab
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(tab)
              }
            >

              {tabIcon(tab)}

              {' '}

              {tab}

            </div>

          ))}

        </nav>


        <button
          className="btn btn-outline"
          style={{
            marginTop: 'auto'
          }}
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dash-main">


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="ca-header">

          <div className="ca-header-left">

            <h1>
              {currentApt?.name ||
                'Commercial Admin'}
            </h1>


            <p>

              {email}

              {' · '}

              {new Date().toLocaleDateString(
                'en-IN',
                {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                }
              )}

            </p>

          </div>


          <div className="ca-header-right">

            <select
              value={selectedApt || ''}
              onChange={e =>
                setSelectedApt(
                  Number(e.target.value)
                )
              }
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                border:
                  '1.5px solid #e2e8f0'
              }}
            >

              {apartments.map(a => (

                <option
                  key={a.id}
                  value={a.id}
                >
                  {a.name}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* =====================================================
            ERROR MESSAGE
        ===================================================== */}

        {error && (

          <div className="banner banner-error">

            {error}

          </div>

        )}


        {/* =====================================================
            NO APARTMENTS
        ===================================================== */}

        {apartments.length === 0 &&
        !loading ? (

          <p className="empty-state">

            No apartments assigned to you
            yet. Contact the Super Admin.

          </p>

        ) : loading ? (

          <p>Loading...</p>

        ) : (

          <>


            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab === 'Overview' && (

              <OverviewTab

                households={households}

                residents={residents}

                bills={bills}

                complaints={complaints}

                pendingCount={pendingCount}

                pendingAmount={pendingAmount}

                paidAmount={paidAmount}

                openComplaints={openComplaints}

                setActiveTab={setActiveTab}

              />

            )}


            {/* =================================================
                HOUSEHOLDS
            ================================================= */}

            {activeTab === 'Households' && (

              <HouseholdsTab

                apartmentId={selectedApt}

                households={households}

                setHouseholds={setHouseholds}

              />

            )}


            {/* =================================================
                RESIDENTS
            ================================================= */}

            {activeTab === 'Residents' && (

              <ResidentsTab

                apartmentName={
                  currentApt?.name
                }

                households={households}

                residents={residents}

                setResidents={setResidents}

              />

            )}


            {/* =================================================
                BILLING CYCLE
            ================================================= */}

            {activeTab === 'Billing Cycle' && (

              <BillingCycleTab

                bills={bills}

                onMarkPaid={
                  handleMarkPaid
                }

                apartmentId={
                  selectedApt
                }

                setBills={
                  setBills
                }

              />

            )}


            {/* =================================================
                GENERATE BILL
            ================================================= */}

            {activeTab === 'Generate Bill' && (

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


            {/* =================================================
                BULK PURCHASES
            ================================================= */}

            {activeTab === 'Bulk Purchases' && (

              <BulkPurchasesTab
                apartmentId={
                  selectedApt
                }
              />

            )}


            {/* =================================================
                COMPLAINTS
            ================================================= */}

            {activeTab === 'Complaints' && (

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


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {activeTab === 'Notifications' && (

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

        )}

      </main>

    </div>
  );
}


// =============================================================
// TAB ICONS
// =============================================================

function tabIcon(tab) {

  const icons = {

    Overview: '📊',

    Households: '🏢',

    Residents: '🏠',

    'Billing Cycle': '🧾',

    'Generate Bill': '💵',

    'Bulk Purchases': '🚛',

    Complaints: '📮',

    Notifications: '🔔'

  };


  return icons[tab] || '•';
}
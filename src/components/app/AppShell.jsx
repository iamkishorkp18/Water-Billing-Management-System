import { useEffect, useState } from 'react';

import {
  IconAlert,
  IconBell,
  IconBuilding,
  IconChart,
  IconClose,
  IconCredit,
  IconDroplet,
  IconFile,
  IconGauge,
  IconHome,
  IconInvoice,
  IconLogout,
  IconMenu,
  IconPlus,
  IconSettings,
  IconShield,
  IconTrash,
  IconUsers,
} from './icons';

const ICONS = {
  Overview: IconGauge,
  Dashboard: IconGauge,

  'Usage Logs': IconDroplet,
  'Water Usage': IconDroplet,

  'Billing Cycle': IconInvoice,
  Bills: IconInvoice,

  Payments: IconCredit,

  'Alert Center': IconAlert,
  Alerts: IconAlert,

  Invoices: IconFile,
  Complaints: IconBell,

  'Tariff Plans': IconChart,
  Reports: IconChart,

  'Commercial Admins': IconUsers,
  Residents: IconUsers,

  Households: IconHome,

  Settings: IconSettings,
  Trash: IconTrash,

  'Generate Bill': IconPlus,
  'Bulk Purchases': IconBuilding,

  Notifications: IconBell,

  Profile: IconShield,
};

function tabLabel(tab) {
  if (tab === 'Commercial Admins') {
    return 'Community Admins';
  }

  return tab;
}

export default function AppShell({
  roleLabel,
  email,
  tabs,
  activeTab,
  onTabChange,
  onLogout,
  children,
  headerExtra,
  error,
  loading,

  // PROFILE
  profilePhotoUrl,
  onProfileClick,
}) {
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // =========================================================
  // DEFAULT INITIAL
  // =========================================================

  const initials =
    email?.charAt(0)?.toUpperCase() || 'U';

  // =========================================================
  // RESET IMAGE ERROR WHEN PHOTO URL CHANGES
  // =========================================================

  useEffect(() => {
    setImageError(false);
  }, [profilePhotoUrl]);

  // =========================================================
  // SELECT TAB
  // =========================================================

  const selectTab = (tab) => {
    onTabChange(tab);
    setOpen(false);
  };

  // =========================================================
  // PROFILE CLICK
  // =========================================================

  const handleAvatarClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      onTabChange('Profile');
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="app-root">

      {/* =====================================================
          MOBILE BACKDROP
      ===================================================== */}

      {open && (
        <button
          type="button"
          className="app-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`app-sidebar ${
          open ? 'is-open' : ''
        }`}
      >

        {/* BRAND */}

        <div className="app-brand">

          <span
            className="app-brand-mark"
            aria-hidden="true"
          >
            AL
          </span>

          <span>
            <strong>
              AquaLedger
            </strong>

            <em>
              Operations
            </em>
          </span>

          <button
            type="button"
            className="app-icon-btn app-sidebar-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <IconClose size={18} />
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="app-nav"
          aria-label="Workspace"
        >

          {tabs.map((tab) => {

            const Icon =
              ICONS[tab] || IconGauge;

            return (
              <button
                key={tab}
                type="button"
                className={`app-nav-item ${
                  activeTab === tab
                    ? 'is-active'
                    : ''
                }`}
                onClick={() => selectTab(tab)}
              >

                <Icon size={18} />

                <span>
                  {tabLabel(tab)}
                </span>

              </button>
            );

          })}

        </nav>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <button
          type="button"
          className="app-logout"
          onClick={onLogout}
        >
          <IconLogout />
          Log out
        </button>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="app-main">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="app-header">

          <div className="app-header-left">

            {/* MOBILE MENU */}

            <button
              type="button"
              className="app-icon-btn app-menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <IconMenu />
            </button>

            <div>

              <p className="app-kicker">
                {roleLabel}
              </p>

              <h1>
                {tabLabel(activeTab)}
              </h1>

            </div>

          </div>

          {/* =================================================
              HEADER RIGHT
          ================================================= */}

          <div className="app-header-right">

            {headerExtra}

            {email && (
              <span className="app-email">
                {email}
              </span>
            )}

            <span className="app-role-chip">
              {roleLabel}
            </span>

            {/* =================================================
                PROFILE AVATAR
            ================================================= */}

            <button
              type="button"
              className="app-avatar-button"
              onClick={handleAvatarClick}
              aria-label="Open profile"
              title="Profile"
            >

              {profilePhotoUrl && !imageError ? (

                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="app-avatar-image"
                  onError={() => setImageError(true)}
                />

              ) : (

                // DEFAULT S / INITIAL
                <span className="app-avatar">
                  {initials}
                </span>

              )}

            </button>

          </div>

        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="app-content">

          {error && (
            <div
              className="app-alert app-alert-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p className="app-loading">
              Loading workspace…
            </p>
          ) : (
            children
          )}

        </section>

      </div>

    </div>
  );
}
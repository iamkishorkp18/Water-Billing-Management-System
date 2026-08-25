import { useState } from 'react';
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
  if (tab === 'Commercial Admins') return 'Community Admins';
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
}) {
  const [open, setOpen] = useState(false);
  const initials = email ? email.charAt(0).toUpperCase() : 'U';

  const selectTab = (tab) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <div className="app-root">
      {open ? (
        <button type="button" className="app-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} />
      ) : null}

      <aside className={`app-sidebar ${open ? 'is-open' : ''}`}>
        <div className="app-brand">
          <span className="app-brand-mark" aria-hidden="true">AL</span>
          <span>
            <strong>AquaLedger</strong>
            <em>Operations</em>
          </span>
          <button type="button" className="app-icon-btn app-sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <IconClose size={18} />
          </button>
        </div>

        <nav className="app-nav" aria-label="Workspace">
          {tabs.map((tab) => {
            const Icon = ICONS[tab] || IconGauge;
            return (
              <button
                key={tab}
                type="button"
                className={`app-nav-item ${activeTab === tab ? 'is-active' : ''}`}
                onClick={() => selectTab(tab)}
              >
                <Icon size={18} />
                <span>{tabLabel(tab)}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" className="app-logout" onClick={onLogout}>
          <IconLogout />
          Log out
        </button>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="app-header-left">
            <button type="button" className="app-icon-btn app-menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
              <IconMenu />
            </button>
            <div>
              <p className="app-kicker">{roleLabel}</p>
              <h1>{tabLabel(activeTab)}</h1>
            </div>
          </div>

          <div className="app-header-right">
            {headerExtra}
            {email ? <span className="app-email">{email}</span> : null}
            <span className="app-role-chip">{roleLabel}</span>
            <span className="app-avatar" aria-hidden="true">{initials}</span>
          </div>
        </header>

        <section className="app-content">
          {error ? <div className="app-alert app-alert-error" role="alert">{error}</div> : null}
          {loading ? <p className="app-loading">Loading workspace…</p> : children}
        </section>
      </div>
    </div>
  );
}

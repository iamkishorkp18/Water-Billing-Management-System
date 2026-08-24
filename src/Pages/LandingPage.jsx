import { Link } from 'react-router-dom';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import {
  IconBell,
  IconBuilding,
  IconChart,
  IconGauge,
  IconHome,
  IconInvoice,
  IconShield,
  IconUsers,
} from '../components/public/icons';

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#roles', label: 'Roles' },
];

export default function LandingPage() {
  return (
    <div className="pub-root">
      <PublicNavbar links={NAV_LINKS} />

      <section className="pub-hero">
        <div>
          <p className="pub-kicker">Community water operations</p>
          <h1>Billing that follows the meter — not the other way around.</h1>
          <p className="pub-lead">
            AquaLedger is a role-based platform for residential communities.
            Record readings, apply tariffs, issue invoices, collect payments,
            and keep households informed from one ledger.
          </p>
          <div className="pub-cta-row">
            <Link to="/register" className="pub-btn pub-btn-primary">Request commercial access</Link>
            <Link to="/login" className="pub-btn pub-btn-secondary">Sign in to your workspace</Link>
          </div>
        </div>
        <aside className="pub-panel">
          <div className="pub-meter-head">
            <span>Property snapshot</span>
            <span>Read-only preview</span>
          </div>
          <div className="pub-meter-meta" style={{ marginTop: 16 }}>
            <div>
              <strong>3 roles</strong>
              <span>Admin, commercial, resident</span>
            </div>
            <div>
              <strong>Cycle bills</strong>
              <span>Generated from logged usage</span>
            </div>
            <div>
              <strong>PDF invoices</strong>
              <span>Current and paid copies</span>
            </div>
            <div>
              <strong>Alerts</strong>
              <span>Unusual consumption flags</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="pub-section" id="overview">
        <div className="pub-split">
          <div className="pub-section-head" style={{ marginBottom: 0 }}>
            <p className="pub-kicker">Overview</p>
            <h2>One ledger for properties, households, and payments.</h2>
            <p>
              Super admins govern the catalogue. Commercial admins operate assigned
              apartments. Residents see only their household — bills, usage, and notices.
            </p>
          </div>
          <div className="pub-card">
            <h3>Designed around real hand-offs</h3>
            <p>
              Access is requested, approved, and assigned. Residents never self-enroll.
              That keeps credentials inside the community operating model you already use.
            </p>
          </div>
        </div>
      </section>

      <section className="pub-section" id="features">
        <div className="pub-section-head">
          <p className="pub-kicker">Features</p>
          <h2>The operating tools, without the clutter.</h2>
        </div>
        <div className="pub-feature-grid">
          <article className="pub-card">
            <div className="pub-icon"><IconGauge /></div>
            <h3>Metering</h3>
            <p>Log household readings and keep a dated usage history for every cycle.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconInvoice /></div>
            <h3>Tariff billing</h3>
            <p>Apply slab rates and shared bulk costs when a billing period is closed.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconChart /></div>
            <h3>Insight</h3>
            <p>Review consumption patterns at apartment and household level before disputes start.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconBell /></div>
            <h3>Notices & alerts</h3>
            <p>Send announcements and surface usage exceptions to the people who must act.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconShield /></div>
            <h3>Role control</h3>
            <p>Workspaces are gated. Each login lands in the dashboard that role is allowed to use.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconUsers /></div>
            <h3>Household accounts</h3>
            <p>Commercial teams issue resident credentials against a specific household record.</p>
          </article>
        </div>
      </section>

      <section className="pub-section" id="how">
        <div className="pub-split">
          <div className="pub-section-head" style={{ marginBottom: 0 }}>
            <p className="pub-kicker">How it works</p>
            <h2>A short operating loop every cycle.</h2>
          </div>
          <div className="pub-steps">
            <div className="pub-step">
              <strong>01</strong>
              <div>
                <h3>Configure</h3>
                <p>Apartments, tariffs, households, and commercial assignments are set up first.</p>
              </div>
            </div>
            <div className="pub-step">
              <strong>02</strong>
              <div>
                <h3>Record</h3>
                <p>Meter readings and bulk purchases are captured against the live property.</p>
              </div>
            </div>
            <div className="pub-step">
              <strong>03</strong>
              <div>
                <h3>Bill</h3>
                <p>Period invoices are generated, shared as PDFs, and tracked to payment.</p>
              </div>
            </div>
            <div className="pub-step">
              <strong>04</strong>
              <div>
                <h3>Notify</h3>
                <p>Residents receive bills, alerts, and notices in their own workspace.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section" id="roles">
        <div className="pub-section-head">
          <p className="pub-kicker">Access model</p>
          <h2>Three roles. One platform.</h2>
          <p>Nothing here changes how accounts are created — it only explains who does what.</p>
        </div>
        <div className="pub-role-grid">
          <article className="pub-card">
            <div className="pub-icon"><IconShield /></div>
            <h3>Super Admin</h3>
            <p>Owns the platform catalogue: apartments, commercial approvals, tariffs, and oversight reports.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconBuilding /></div>
            <h3>Commercial Admin</h3>
            <p>Requests access, then manages assigned properties — households, readings, bills, and notices.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconHome /></div>
            <h3>Resident</h3>
            <p>Signs in with issued credentials to view usage, pay bills, and raise household complaints.</p>
          </article>
        </div>
      </section>

      <section className="pub-band">
        <h2>Start with the role you already have.</h2>
        <p>Commercial operators request access. Residents and super admins sign in directly.</p>
        <div className="pub-cta-row" style={{ justifyContent: 'center' }}>
          <Link to="/register" className="pub-btn pub-btn-primary">Request access</Link>
          <Link to="/login" className="pub-btn pub-btn-secondary" style={{ color: '#fffaf1', borderColor: 'rgba(255,250,241,.3)' }}>Sign in</Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

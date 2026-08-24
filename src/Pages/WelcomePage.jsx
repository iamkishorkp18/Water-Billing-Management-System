import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';
import { IconArrow, IconBell, IconChart, IconGauge, IconInvoice } from '../components/public/icons';

const BARS = [38, 52, 44, 71, 63, 80, 57, 90, 68, 76, 49, 84];

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="pub-root">
      <PublicNavbar />

      <section className="pub-welcome-hero">
        <p className="pub-kicker">Water consumption & billing</p>
        <h1>A precise operating system for community water accounts.</h1>
        <p className="pub-lead">
          AquaLedger brings metering, invoicing, usage insight, and exception alerts
          into one workspace. Built for housing communities that need fair bills
          and a clear audit trail.
        </p>
        <div className="pub-cta-row">
          <button className="pub-btn pub-btn-primary" onClick={() => navigate('/home')}>
            Enter platform <IconArrow />
          </button>
          <button className="pub-btn pub-btn-secondary" onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className="pub-btn pub-btn-ghost" onClick={() => navigate('/register')}>
            Request commercial access
          </button>
        </div>
      </section>

      <section className="pub-section" style={{ paddingTop: 12 }}>
        <div className="pub-split">
          <div>
            <p className="pub-kicker">Platform</p>
            <h2>From meter reading to settled invoice.</h2>
            <p className="pub-lead">
              Teams record consumption, generate period bills, collect payments,
              and notify households — without spreading the work across spreadsheets.
            </p>
          </div>
          <div className="pub-panel pub-meter">
            <div className="pub-meter-head">
              <span>Community draw</span>
              <span>Current cycle</span>
            </div>
            <div className="pub-meter-bars" aria-hidden="true">
              {BARS.map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="pub-meter-meta">
              <div>
                <strong>Fair split</strong>
                <span>Shared supply allocated by household</span>
              </div>
              <div>
                <strong>Tiered rates</strong>
                <span>Tariffs applied to actual usage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="pub-section-head">
          <p className="pub-kicker">Capabilities</p>
          <h2>What operators and residents actually use.</h2>
        </div>
        <div className="pub-benefit-grid">
          <article className="pub-card">
            <div className="pub-icon"><IconGauge /></div>
            <h3>Consumption monitoring</h3>
            <p>Household and property usage stays visible across billing cycles.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconInvoice /></div>
            <h3>Smart billing</h3>
            <p>Generate period invoices from readings and published tariff slabs.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconChart /></div>
            <h3>Usage insights</h3>
            <p>Compare trends so unusually high draw is easy to spot.</p>
          </article>
          <article className="pub-card">
            <div className="pub-icon"><IconBell /></div>
            <h3>Alerts</h3>
            <p>Notify the right role when usage spikes or a bill needs attention.</p>
          </article>
        </div>
      </section>

      <section className="pub-band">
        <h2>Ready to open the platform?</h2>
        <p>Continue to the product overview, or sign in if you already have a workspace role.</p>
        <div className="pub-cta-row" style={{ justifyContent: 'center' }}>
          <button className="pub-btn pub-btn-primary" onClick={() => navigate('/home')}>
            View product overview
          </button>
          <button className="pub-btn pub-btn-secondary" onClick={() => navigate('/login')} style={{ color: '#fffaf1', borderColor: 'rgba(255,250,241,.3)' }}>
            Sign in
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

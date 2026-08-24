import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <nav className="nav">
        <div className="nav-logo">💧 AquaLedger</div>
        <div className="nav-links">
          <Link to="/login" className="btn btn-outline" style={{ color: 'var(--primary)', border: '1.5px solid var(--primary)' }}>Login</Link>
          <Link to="/register" className="btn btn-fill">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-body">
          <div className="hero-copy">
            <h1>Thousands have lived without love, not one without water.</h1>
            <p>
              Track meter readings, split shared costs fairly, generate tiered
              invoices automatically, and catch leaks before they become a
              problem — all in one platform built for residential communities.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary">Create an Account</Link>
              <Link to="/login" className="btn btn-outline">Sign In</Link>
            </div>
          </div>

          <div className="gauge">
            <div className="gauge-face">
              <div className="num">62%</div>
              <div className="label">CYCLE USAGE</div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        <div className="stat-item"><div className="val">3</div><div className="lbl">Role Tiers</div></div>
        <div className="stat-item"><div className="val">100%</div><div className="lbl">Automated Billing</div></div>
        <div className="stat-item"><div className="val">24/7</div><div className="lbl">Leak Monitoring</div></div>
        <div className="stat-item"><div className="val">PDF</div><div className="lbl">Instant Invoices</div></div>
      </div>

      <section className="section">
        <div className="section-heading">
          <h2>Everything your community needs</h2>
          <p>Built for apartments, gated communities, and housing societies</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon">📊</div>
            <h3>Tiered Billing Engine</h3>
            <p>Automatic tier-based pricing calculates fair charges based on actual consumption, just like real utility providers.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🤝</div>
            <h3>Fair Cost Splitting</h3>
            <p>Shared expenses like garden watering or pool maintenance are split equally across every household automatically.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🚨</div>
            <h3>Leak Detection Alerts</h3>
            <p>Unusual usage spikes are automatically flagged so residents can catch leaks before bills get out of hand.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <h2>How access works</h2>
          <p>A simple three-role system built for real communities</p>
        </div>
        <div>
          <div className="flow-step">
            <div className="step-num">01</div>
            <div>
              <h4>Super Admin registers directly</h4>
              <p>Full platform control — creates apartments and reviews Commercial Admin requests.</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-num">02</div>
            <div>
              <h4>Commercial Admin requests access</h4>
              <p>Registers and waits for Super Admin approval before managing their assigned apartments.</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-num">03</div>
            <div>
              <h4>Residents log in directly</h4>
              <p>No registration needed — Commercial Admins issue login credentials to each household.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band">
        <h2>Ready to simplify your community's billing?</h2>
        <p>Set up your apartment in minutes and start tracking usage today.</p>
        <Link to="/register" className="btn btn-primary">Get Started Free</Link>
      </div>

      <footer className="footer">
        <div>💧 AquaLedger — Water Billing Platform</div>
        <div>Built for Infosys Internship Project</div>
      </footer>
    </div>
  );
}
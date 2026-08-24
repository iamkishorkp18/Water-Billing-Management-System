import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function AuthLayout({ kicker, title, children }) {
  return (
    <div className="pub-root pub-auth-root">
      <aside className="pub-auth-aside">
        <BrandMark to="/" inverted />
        <div className="pub-auth-aside-copy">
          <p className="pub-kicker">AquaLedger</p>
          <h1>Metered billing with operational clarity.</h1>
          <p>
            Signed-in workspaces stay role-specific. Residents view household usage,
            commercial teams run properties, and super admins govern the platform.
          </p>
        </div>
        <ul className="pub-auth-aside-list">
          <li>Role-gated workspaces</li>
          <li>Usage, invoices, and collections</li>
          <li>Alerts when consumption spikes</li>
        </ul>
      </aside>

      <main className="pub-auth-main">
        <div className="pub-auth-card">
          <p className="pub-kicker">{kicker}</p>
          <h2>{title}</h2>
          {children}
        </div>
        <p className="pub-auth-home">
          <Link to="/">Back to AquaLedger</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/home">Product overview</Link>
        </p>
      </main>
    </div>
  );
}

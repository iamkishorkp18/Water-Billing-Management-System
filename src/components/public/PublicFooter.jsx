import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="pub-footer-grid">
        <div>
          <BrandMark to="/" />
          <p>A community operations platform for metering, invoicing, and usage oversight.</p>
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/home">Product</Link>
          <Link to="/login">Sign in</Link>
          <Link to="/register">Commercial access</Link>
        </div>
        <div>
          <h4>Roles</h4>
          <p>Super Admin</p>
          <p>Commercial Admin</p>
          <p>Resident</p>
        </div>
      </div>
      <div className="pub-footer-bar">
        <span>AquaLedger</span>
        <span>Built for community water billing operations</span>
      </div>
    </footer>
  );
}

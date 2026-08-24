import { Link } from 'react-router-dom';

export default function BrandMark({ to = '/', inverted = false }) {
  return (
    <Link to={to} className={`pub-brand ${inverted ? 'is-inverted' : ''}`}>
      <span className="pub-brand-mark" aria-hidden="true">AL</span>
      <span className="pub-brand-text">
        <strong>AquaLedger</strong>
        <em>Operations</em>
      </span>
    </Link>
  );
}

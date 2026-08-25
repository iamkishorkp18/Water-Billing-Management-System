import { IconClose } from './icons';

export function displayRole(role) {
  if (!role) return '—';
  if (role === 'COMMERCIAL_ADMIN' || role === 'Commercial Admin') return 'Community Admin';
  if (role === 'SUPER_ADMIN') return 'Super Admin';
  if (role === 'RESIDENT') return 'Resident';
  return String(role).replaceAll('_', ' ');
}

export function displayValue(value) {
  if (value === 0) return '0';
  if (value === false) return 'No';
  if (value === true) return 'Yes';
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

export function StatusBadge({ status }) {
  const raw = String(status || 'UNKNOWN').toUpperCase();
  let tone = 'neutral';
  if (['PAID', 'RESOLVED', 'APPROVED', 'ACTIVE', 'SUCCESS'].includes(raw)) tone = 'ok';
  else if (['UNPAID', 'PENDING', 'OPEN', 'PARTIAL', 'PARTIALLY_PAID'].includes(raw)) tone = 'warn';
  else if (['OVERDUE', 'REJECTED', 'HIGH', 'FAILED', 'UNRESOLVED'].includes(raw)) tone = 'bad';
  return <span className={`app-badge app-badge-${tone}`}>{raw.replaceAll('_', ' ')}</span>;
}

export function DetailGrid({ items }) {
  const visible = items.filter((item) => item && (item.hideIfEmpty ? item.value : true));
  return (
    <div className="app-detail-grid">
      {visible.map((item) => (
        <div key={item.label} className="app-detail-item">
          <span>{item.label}</span>
          <strong>{item.value ?? '—'}</strong>
        </div>
      ))}
    </div>
  );
}

export default function DetailsModal({
  open,
  title,
  subtitle,
  status,
  onClose,
  children,
  footer,
}) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="app-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="app-modal-head">
          <div>
            <p className="app-kicker">Details</p>
            <h2 id="app-modal-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <div className="app-modal-head-actions">
            {status ? <StatusBadge status={status} /> : null}
            <button type="button" className="app-icon-btn is-light" onClick={onClose} aria-label="Close details">
              <IconClose />
            </button>
          </div>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer ? <footer className="app-modal-foot">{footer}</footer> : null}
      </div>
    </div>
  );
}

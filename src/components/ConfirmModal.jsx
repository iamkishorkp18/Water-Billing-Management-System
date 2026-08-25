import { IconClose } from './app/icons';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="app-modal-overlay" onClick={onCancel} role="presentation">
      <div className="app-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ width: 'min(420px, 100%)' }}>
        <header className="app-modal-head">
          <div>
            <p className="app-kicker">Confirm</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="app-icon-btn is-light" onClick={onCancel} aria-label="Close">
            <IconClose />
          </button>
        </header>
        <div className="app-modal-body">
          <p style={{ margin: 0, color: '#6a6258', lineHeight: 1.6 }}>{message}</p>
        </div>
        <footer className="app-modal-foot">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn-fill" onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : 'Confirm'}
          </button>
        </footer>
      </div>
    </div>
  );
}

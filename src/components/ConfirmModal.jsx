export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 28, maxWidth: 380, width: '90%' }}>
        <h3 style={{ fontSize: 17, color: 'var(--primary)', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" style={{ color: 'var(--primary)', border: '1.5px solid var(--primary)' }} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn-sm btn-reject" style={{ padding: '10px 20px' }} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
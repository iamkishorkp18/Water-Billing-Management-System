import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../Api/apiClient';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-panel" style={{ minHeight: '100vh' }}>
        <div className="auth-card">
          <div className="banner banner-error">This reset link is missing its token. Please request a new one.</div>
          <Link to="/forgot-password" className="btn btn-fill btn-block">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="nav-logo">💧 AquaLedger</div>
        <div className="brand-mid">
          <h2>Set a new password</h2>
          <p>Choose a strong password you haven't used before.</p>
        </div>
        <div />
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>New password</h1>
          <p className="sub">This link expires 30 minutes after it was requested.</p>

          {message && <div className="banner banner-success">{message}</div>}
          {error && <div className="banner banner-error">{error}</div>}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm new password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-fill btn-block" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}

          <div className="auth-foot-link">
            <Link to="/login">Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../Api/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="nav-logo">💧 AquaLedger</div>
        <div className="brand-mid">
          <h2>Forgot your password?</h2>
          <p>Enter the email on your account and we'll send you a link to reset it.</p>
        </div>
        <div />
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h1>Reset password</h1>
          <p className="sub">We'll email you a secure link, valid for 30 minutes.</p>

          {message && <div className="banner banner-success">{message}</div>}
          {error && <div className="banner banner-error">{error}</div>}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-fill btn-block" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
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
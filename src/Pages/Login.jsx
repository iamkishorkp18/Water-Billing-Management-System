import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../Api/apiClient';

const ROLES = [
  { key: 'SUPER_ADMIN', label: 'Super Admin' },
  { key: 'COMMERCIAL_ADMIN', label: 'Commercial' },
  { key: 'RESIDENT', label: 'Resident' },
];

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState('RESIDENT');

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await loginUser({
        email: form.email,
        password: form.password
      });

      if (res.data.role !== role) {
        setError(
          `This account is registered as ${res.data.role.replace('_', ' ')}, not ${role.replace('_', ' ')}. Please select the correct role.`
        );

        setLoading(false);
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('email', res.data.email);

      if (res.data.householdId) {
        localStorage.setItem(
          'householdId',
          res.data.householdId
        );
      }

      if (role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else if (role === 'COMMERCIAL_ADMIN') {
        navigate('/commercial/dashboard');
      } else {
        navigate('/resident/dashboard');
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Decorative animated background layers */}

      <div className="login-glow-drop">
        💧
      </div>

      <div className="water-bars">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="water-bar"
          ></div>
        ))}
      </div>

      <div className="welcome-bubbles">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={`bubble bubble-${i % 6}`}
          ></span>
        ))}
      </div>

      <div className="welcome-waves">

        <svg
          className="wave wave-back"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,100 C360,180 1080,20 1440,100 L1440,200 L0,200 Z" />
        </svg>

        <svg
          className="wave wave-mid"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,120 C400,40 1040,180 1440,80 L1440,200 L0,200 Z" />
        </svg>

        <svg
          className="wave wave-front"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,140 C480,60 960,160 1440,100 L1440,200 L0,200 Z" />
        </svg>

      </div>

      {/* Actual login card */}

      <div className="login-glass-card">

        <div className="login-logo-row">
          💧 AquaLedger
        </div>

        <h1>Welcome back</h1>

        <p className="sub">
          Select your role, then enter your credentials to continue.
        </p>

        <div className="role-select">

          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={role === r.key ? 'active' : ''}
              onClick={() => setRole(r.key)}
            >
              {r.label}
            </button>
          ))}

        </div>

        {error && (
          <div className="banner banner-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="btn btn-fill btn-block"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>

        </form>

        {/* Register link ONLY for Commercial Admin */}

        {role === 'COMMERCIAL_ADMIN' && (
          <div className="auth-foot-link">
            Don't have an account?{' '}
            <Link to="/register">
              Register here
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}
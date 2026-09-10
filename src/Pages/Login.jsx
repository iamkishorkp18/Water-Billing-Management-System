import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../Api/apiClient';
import AuthLayout from '../components/public/AuthLayout';
import FormField from '../components/public/FormField';
import { IconEye, IconEyeOff } from '../components/public/icons';

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
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
  'FRONTEND PASSWORD LENGTH:',
  form.password.length,
  'PASSWORD:',
  form.password
);
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
    <AuthLayout kicker="Sign in" title="Welcome back.">
      <p className="pub-auth-note" style={{ marginTop: 0, marginBottom: 18, textAlign: 'left' }}>
        Choose the workspace you use, then enter the same credentials as before.
      </p>

      <div className="pub-role-switch">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={role === r.key ? 'is-active' : ''}
            onClick={() => setRole(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="pub-alert pub-alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <FormField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          trailing={
            <button
              type="button"
              className="pub-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          }
        />

        <div className="pub-auth-note" style={{ textAlign: 'right', marginTop: -6, marginBottom: 18 }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button
          type="submit"
          className="pub-btn pub-btn-primary pub-btn-block"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      {role === 'COMMERCIAL_ADMIN' && (
        <div className="pub-auth-note">
          Don't have an account?{' '}
          <Link to="/register">
            Register here
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
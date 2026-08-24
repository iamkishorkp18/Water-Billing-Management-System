import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../Api/apiClient';
import AuthLayout from '../components/public/AuthLayout';
import FormField from '../components/public/FormField';
import { IconEye, IconEyeOff } from '../components/public/icons';

const ROLES = [
  { key: 'COMMERCIAL_ADMIN', label: 'Commercial' },
  { key: 'RESIDENT', label: 'Resident' },
];

const BRAND_COPY = {
  COMMERCIAL_ADMIN: {
    title: 'Commercial accounts are reviewed before they go live.',
    body: 'A Super Admin verifies every Commercial Admin request before login access unlocks.',
  },
  RESIDENT: {
    title: "Residents don't need to register.",
    body: 'Your Commercial Admin issues your login credentials directly — just head to the login page.',
  },
};

const INITIAL_FORM = {
  fullName: '', age: '', username: '', email: '', password: '', confirmPassword: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('COMMERCIAL_ADMIN');
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (form.password !== form.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  setLoading(true);

  try {
    const payload = {
      email: form.email,
      password: form.password,
      role: role,
      isDeleted: false,

      ...(role === 'COMMERCIAL_ADMIN' && {
        fullName: form.fullName,
        age: form.age ? Number(form.age) : null,
      }),
    };

    console.log("REGISTER PAYLOAD:", payload);

    await registerUser(payload);

    if (role === 'COMMERCIAL_ADMIN') {
      setSuccess(
        "Registered successfully. Your account is pending Super Admin approval — you'll be able to log in once approved."
      );
    } else {
      setSuccess('Account created successfully. Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1400);
    }

    setForm(INITIAL_FORM);

  } catch (err) {
    console.error("REGISTRATION ERROR:", err);
    console.error("SERVER RESPONSE:", err.response?.data);

    setError(
      err.response?.data?.message ||
      err.response?.data ||
      'Registration failed. Please try again.'
    );

  } finally {
    setLoading(false);
  }
};

  const copy = BRAND_COPY[role];

  return (
    <AuthLayout kicker="Access request" title="Create an account.">
      <p className="pub-auth-note" style={{ marginTop: 0, marginBottom: 18, textAlign: 'left' }}>
        {copy.title} {copy.body}
      </p>

      <div className="pub-role-switch is-two">
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

      {role === 'RESIDENT' ? (
        <>
          <div className="pub-alert pub-alert-info">
            Residents log in with credentials issued by their Commercial Admin — there's no self-registration for this role.
          </div>
          <Link to="/login" className="pub-btn pub-btn-primary pub-btn-block">Go to Login</Link>
        </>
      ) : (
        <>
          <div className="pub-alert pub-alert-info">
            Commercial Admin accounts require Super Admin approval before you can log in.
          </div>
          {error && <div className="pub-alert pub-alert-error" role="alert">{error}</div>}
          {success && <div className="pub-alert pub-alert-ok" role="status">{success}</div>}

          <form onSubmit={handleSubmit}>
            <p className="pub-section-label">Profile</p>
            <div className="pub-field-row">
              <FormField
                label="Full name"
                name="fullName"
                placeholder="Jane Rivera"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Age"
                name="age"
                type="number"
                placeholder="30"
                min="18"
                max="100"
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>

            <p className="pub-section-label">Account</p>
            <FormField
              label="Username"
              name="username"
              placeholder="jane.rivera"
              value={form.username}
              onChange={handleChange}
              required
            />
            <FormField
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <p className="pub-section-label">Security</p>
            <div className="pub-field-row">
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
              <FormField
                label="Confirm password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="pub-btn pub-btn-primary pub-btn-block" disabled={loading}>
              {loading ? 'Creating account…' : 'Submit for Approval'}
            </button>
          </form>
        </>
      )}

      <div className="pub-auth-note">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </AuthLayout>
  );
}

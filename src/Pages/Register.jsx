import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../Api/apiClient';

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
    <div className="register-page">
      <div className="register-hero-visual">
        <div className="register-drop-glow">💧</div>
        <div className="register-hands">🤲</div>
      </div>

      <div className="welcome-bubbles">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`bubble bubble-${i % 6}`}></span>
        ))}
      </div>

      <div className="welcome-waves">
        <svg className="wave wave-back" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,100 C360,180 1080,20 1440,100 L1440,200 L0,200 Z" />
        </svg>
        <svg className="wave wave-mid" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,120 C400,40 1040,180 1440,80 L1440,200 L0,200 Z" />
        </svg>
        <svg className="wave wave-front" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,140 C480,60 960,160 1440,100 L1440,200 L0,200 Z" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 150 }}>
        <p className="register-quote">
          "Every drop counts — protecting water today means securing tomorrow."
          <span>AQUALEDGER · WATER STEWARDSHIP</span>
        </p>

        <div className="register-glass-card">
          <div className="login-logo-row">💧 AquaLedger</div>
          <h1>Create an account</h1>
          <p className="sub">Choose the role that matches what you'll be doing here.</p>

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

          {role === 'RESIDENT' ? (
            <>
              <div className="banner banner-info">
                Residents log in with credentials issued by their Commercial Admin — there's no self-registration for this role.
              </div>
              <Link to="/login" className="btn btn-fill btn-block">Go to Login</Link>
            </>
          ) : (
            <>
              <div className="banner banner-info">
                Commercial Admin accounts require Super Admin approval before you can log in.
              </div>
              {error && <div className="banner banner-error">{error}</div>}
              {success && <div className="banner banner-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full name</label>
                    <input type="text" name="fullName" placeholder="Jane Rivera" value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" name="age" placeholder="30" min="18" max="100" value={form.age} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" placeholder="jane.rivera" value={form.username} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Email address</label>
                  <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Confirm password</label>
                    <input type="password" name="confirmPassword" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-fill btn-block" disabled={loading}>
                  {loading ? 'Creating account…' : 'Submit for Approval'}
                </button>
              </form>
            </>
          )}

          <div className="auth-foot-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
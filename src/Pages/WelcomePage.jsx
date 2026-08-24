import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-shell">
      <div className="welcome-bubbles">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`bubble bubble-${i % 6}`}></span>
        ))}
      </div>

      <div className="welcome-content">
        <div className="welcome-drop">💧</div>
        <h1 className="welcome-title">AquaLedger</h1>
        <p className="welcome-tagline">Smart Water Billing, Simplified.</p>
        <p className="welcome-sub">
          Track usage. Split costs fairly. Catch leaks early. All in one place.
        </p>
        <button className="btn btn-primary welcome-btn" onClick={() => navigate('/home')}>
          Enter Platform →
        </button>
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
    </div>
  );
}
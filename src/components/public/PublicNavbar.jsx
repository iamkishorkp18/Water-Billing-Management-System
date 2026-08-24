import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import BrandMark from './BrandMark';
import { IconClose, IconMenu } from './icons';

export default function PublicNavbar({ links = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="pub-nav">
      <div className="pub-nav-inner">
        <BrandMark to="/" />

        {links.length > 0 && (
          <nav className="pub-nav-links" aria-label="Page sections">
            {links.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>
        )}

        <div className="pub-nav-actions">
          <NavLink to="/login" className="pub-btn pub-btn-ghost">Sign in</NavLink>
          <NavLink to="/register" className="pub-btn pub-btn-primary">Request access</NavLink>
          <button
            type="button"
            className="pub-nav-toggle"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="pub-nav-drawer">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link to="/register" className="pub-btn pub-btn-primary" onClick={() => setOpen(false)}>Request access</Link>
        </div>
      )}
    </header>
  );
}

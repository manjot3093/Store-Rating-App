import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/admin/stores', label: 'Stores' },
    { to: '/admin/users', label: 'Users' },
  ],
  user: [
    { to: '/', label: 'Browse stores' },
    { to: '/account', label: 'Account' },
  ],
  store_owner: [
    { to: '/', label: 'Dashboard' },
    { to: '/account', label: 'Account' },
  ],
};

const ROLE_LABEL = {
  admin: 'System Administrator',
  user: 'Normal User',
  store_owner: 'Store Owner',
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-ink/10 bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-md bg-ink flex items-center justify-center">
              <svg viewBox="0 0 20 20" className="w-4 h-4 text-clay-400">
                <path
                  d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="font-display font-semibold text-lg tracking-tight">Storehouse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink hover:bg-ink/5'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-ink">{user?.name?.split(' ').slice(0, 2).join(' ')}</div>
              <div className="eyebrow">{ROLE_LABEL[user?.role]}</div>
            </div>
            <button onClick={handleLogout} className="btn-secondary !py-2">
              Log out
            </button>
          </div>

          <button className="md:hidden text-ink" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-ink/10 px-5 py-3 flex flex-col gap-1 bg-white">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-ink text-white' : 'text-ink/70'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="btn-secondary mt-2 w-full">
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8">{children}</main>

      <footer className="border-t border-ink/10 py-6 text-center eyebrow">
        Storehouse Ratings Registry — a coding assignment build
      </footer>
    </div>
  );
}

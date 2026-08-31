import React from 'react';
import { NavLink } from 'react-router-dom';
import type { UserSession } from '../types';

interface NavHeaderProps {
  session: UserSession;
  onSignIn: () => void;
  onSignOut: () => void;
}

const tabs = [
  { to: '/', label: 'Explore' },
  { to: '/map', label: 'Map' },
  { to: '/community', label: 'Community' },
];

export const NavHeader: React.FC<NavHeaderProps> = ({ session, onSignIn, onSignOut }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-han-cream bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <NavLink to="/" className="font-display text-2xl tracking-tight text-warm-taupe">
        Goun
      </NavLink>

      <nav className="flex items-center gap-1 rounded-full bg-han-cream/50 p-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                isActive ? 'bg-warm-taupe text-white' : 'text-warm-taupe/70 hover:text-warm-taupe'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      {session.isLoggedIn && session.user ? (
        <button onClick={onSignOut} className="flex items-center gap-2 text-xs font-semibold text-warm-taupe">
          <img
            src={session.user.avatar_url}
            alt={session.user.name}
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full object-cover ring-1 ring-han-cream"
          />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      ) : (
        <button
          onClick={onSignIn}
          className="rounded-full bg-goun-rose px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-goun-rose/30 sm:px-4 sm:text-sm"
        >
          Sign in
        </button>
      )}
    </header>
  );
};

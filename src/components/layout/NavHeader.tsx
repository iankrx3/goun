import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import type { UserSession } from '../../types';

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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-miyeon-neutral bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <NavLink to="/" className="flex items-center gap-1 font-display text-2xl tracking-tight text-miyeon-main">
        miyeon
        <motion.span
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
        >
          <Sparkles className="h-4 w-4 text-miyeon-sub1" />
        </motion.span>
      </NavLink>

      <nav className="hidden items-center gap-1 rounded-full bg-miyeon-neutral/50 p-1 sm:flex">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-miyeon-main"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-white' : 'text-miyeon-main/70 hover:text-miyeon-main'
                  }`}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {session.isLoggedIn && session.user ? (
        <div className="flex items-center gap-3">
          <NavLink
            to={session.creator ? `/curator/${session.creator.id}` : '/curator/signup'}
            className="hidden text-xs font-semibold text-miyeon-main/70 transition-colors hover:text-miyeon-main sm:inline"
          >
            {session.creator ? 'My Curator Page' : 'Become a Curator'}
          </NavLink>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignOut}
            className="flex items-center gap-2 text-xs font-semibold text-miyeon-main"
          >
            <img
              src={session.user.avatar_url}
              alt={session.user.name}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-miyeon-neutral"
            />
            <span className="hidden sm:inline">Sign out</span>
          </motion.button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSignIn}
          className="rounded-full bg-miyeon-sub1 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-miyeon-sub1/30 sm:px-4 sm:text-sm"
        >
          Sign in
        </motion.button>
      )}
    </header>
  );
};

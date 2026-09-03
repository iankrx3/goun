import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, MapPin, User, Users } from 'lucide-react';
import type { UserSession } from '../../types';

interface BottomNavProps {
  session: UserSession;
  onSignIn: () => void;
}

const tabs = [
  { to: '/', label: 'Explore', icon: Compass },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/community', label: 'Community', icon: Users },
];

const indicator = (
  <motion.span
    layoutId="bottom-nav-indicator"
    className="absolute top-0 h-0.5 w-8 rounded-full bg-miyeon-sub1"
    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
  />
);

// Mobile-only bottom tab bar — thumb-reachable primary navigation.
// NavHeader keeps the top nav for desktop (sm:flex / hidden below sm).
export const BottomNav: React.FC<BottomNavProps> = ({ session, onSignIn }) => {
  const profileTo = session.creator ? `/curator/${session.creator.id}` : '/curator/signup';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-stretch border-t border-miyeon-neutral bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold"
        >
          {({ isActive }) => (
            <>
              {isActive && indicator}
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-miyeon-sub1' : 'text-miyeon-main/60'}`} />
              </motion.span>
              <span className={isActive ? 'text-miyeon-sub1' : 'text-miyeon-main/60'}>{label}</span>
            </>
          )}
        </NavLink>
      ))}

      {session.isLoggedIn && session.user ? (
        <NavLink
          to={profileTo}
          className="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold"
        >
          {({ isActive }) => (
            <>
              {isActive && indicator}
              <motion.span
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <img
                  src={session.user!.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className={`h-6 w-6 rounded-full object-cover ${
                    isActive ? 'ring-2 ring-miyeon-sub1' : 'ring-1 ring-miyeon-neutral'
                  }`}
                />
              </motion.span>
              <span className={isActive ? 'text-miyeon-sub1' : 'text-miyeon-main/60'}>
                {session.creator ? 'Profile' : 'Curator'}
              </span>
            </>
          )}
        </NavLink>
      ) : (
        <button
          onClick={onSignIn}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold text-miyeon-main/60"
        >
          <User className="h-6 w-6" />
          Profile
        </button>
      )}
    </nav>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, MapPin, Users } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Explore', icon: Compass },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/community', label: 'Community', icon: Users },
];

// Mobile-only bottom tab bar — thumb-reachable primary navigation.
// NavHeader keeps the top nav for desktop (sm:flex / hidden below sm).
export const BottomNav: React.FC = () => (
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
            {isActive && (
              <motion.span
                layoutId="bottom-nav-indicator"
                className="absolute top-0 h-0.5 w-8 rounded-full bg-miyeon-sub1"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
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
  </nav>
);

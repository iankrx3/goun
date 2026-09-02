import React from 'react';
import { NavLink } from 'react-router-dom';
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
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-semibold ${
            isActive ? 'text-miyeon-sub1' : 'text-miyeon-main/60'
          }`
        }
      >
        <Icon className="h-6 w-6" />
        {label}
      </NavLink>
    ))}
  </nav>
);

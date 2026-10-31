import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Camera, History, User } from 'lucide-react';

export const MobileTabBar: React.FC = () => {
  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fields', label: 'Fields', icon: Layers },
    { to: '/scan/new', label: 'Scan', icon: Camera, primary: true },
    { to: '/scans', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-50/95 backdrop-blur-md border-t border-soil-600/15 z-40 px-2 py-1.5 flex items-center justify-around no-print shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-all ${
                tab.primary
                  ? 'bg-leaf-700 text-cream-50 px-4 py-1.5 -mt-3 shadow-md rounded-2xl'
                  : isActive
                  ? 'text-soil-950 font-bold'
                  : 'text-soil-600 hover:text-soil-900'
              }`
            }
          >
            <Icon className={tab.primary ? 'w-5 h-5' : 'w-4 h-4'} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

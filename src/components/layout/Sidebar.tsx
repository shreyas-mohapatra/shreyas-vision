import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Camera,
  History,
  User,
  LogOut,
  Sprout,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fields', label: 'Fields', icon: Layers },
    { to: '/scan/new', label: 'New Crop Scan', icon: Camera, primary: true },
    { to: '/scans', label: 'Scan History', icon: History },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-cream-100 border-r border-soil-600/15 h-screen sticky top-0 shrink-0 select-none no-print">
      {/* Brand Header */}
      <div className="p-5 border-b border-soil-600/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-leaf-700 text-cream-50 flex items-center justify-center warm-shadow-sm">
          <Sprout className="w-5 h-5 text-wheat-300" />
        </div>
        <div>
          <h2 className="font-serif text-base font-bold text-soil-900 leading-tight">AgriLens</h2>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-clay-400">
            Vision Crop Advisory
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-soil-950 text-cream-50 shadow-sm font-semibold'
                    : link.primary
                    ? 'bg-leaf-700 text-cream-50 hover:bg-leaf-800'
                    : 'text-soil-700 hover:text-soil-950 hover:bg-cream-200/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-soil-600/10 space-y-3 bg-cream-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-cream-200 text-soil-800 font-serif font-bold text-xs flex items-center justify-center border border-soil-600/15">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-soil-900 truncate font-serif">
              {user?.fullName || 'Farmer'}
            </p>
            <p className="text-[11px] text-soil-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-soil-600 hover:text-rust-700 hover:bg-rust-50 transition-colors cursor-pointer border border-soil-600/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogIn, LayoutDashboard, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="w-full bg-cream-50/90 backdrop-blur-md border-b border-soil-600/10 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-leaf-700 group-hover:bg-leaf-800 text-cream-50 flex items-center justify-center warm-shadow-sm transition-colors">
            <Sprout className="w-5 h-5 text-wheat-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-soil-900 group-hover:text-leaf-800 transition-colors">
              AgriLens
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-clay-400 -mt-1">
              Visual AI Crop Advisory
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-soil-700 hover:text-soil-950 hover:bg-cream-100 text-xs font-medium transition-colors"
              >
                <LogIn className="w-4 h-4 text-soil-600" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
              >
                <UserPlus className="w-4 h-4 text-wheat-300" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { MobileTabBar } from './MobileTabBar.js';
import { Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AppShell: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-cream-50 text-soil-950">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Mobile Top Brand Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-cream-100 border-b border-soil-600/10 sticky top-0 z-30">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-leaf-700 text-wheat-300 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <span className="font-serif text-base font-bold text-soil-900">AgriLens</span>
          </Link>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center p-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-soil-600/20 flex items-center justify-center text-leaf-700 warm-shadow-md">
        <Sprout className="w-8 h-8 text-wheat-500" />
      </div>

      <div className="space-y-1">
        <h1 className="font-serif text-5xl font-bold text-soil-950">404</h1>
        <h2 className="font-serif text-xl font-semibold text-soil-800">
          Field Plot Not Found
        </h2>
        <p className="text-xs text-soil-600 max-w-sm mx-auto">
          The requested page or crop pathology report does not exist or has been relocated.
        </p>
      </div>

      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-leaf-700 hover:bg-leaf-800 text-cream-50 text-xs font-semibold warm-shadow-sm btn-press transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

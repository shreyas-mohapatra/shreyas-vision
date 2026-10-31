import React from 'react';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-cream-100 border-t border-soil-600/10 py-10 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-leaf-700 text-wheat-300 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-base font-bold text-soil-900">
                AgriLens: AI Crop Advisory Assistant
              </span>
              <p className="text-xs text-soil-600">
                Theme: Computer Vision & Visual Intelligence · Powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-soil-600">
            <span>Server-side Computer Vision</span>
            <span>·</span>
            <span>Zero-Neon Organic Design</span>
            <span>·</span>
            <span>PostgreSQL Row-Level Security</span>
          </div>
        </div>

        <div className="pt-4 border-t border-soil-600/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-soil-500">
          <p>© 2026 AgriLens. Dedicated to sustainable smallholder crop health and food security.</p>
          <p className="flex items-center gap-1">
            <span>Always verify critical agricultural inputs with local extension officers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

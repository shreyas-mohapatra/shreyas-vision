import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-50 space-y-3">
        <div className="w-8 h-8 border-3 border-leaf-700 border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-xs font-medium text-soil-600">
          Loading AgriLens secure session…
        </span>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

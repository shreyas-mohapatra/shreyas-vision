import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { AppShell } from './components/layout/AppShell.js';

// Pages
import { Landing } from './pages/Landing.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { Fields } from './pages/Fields.js';
import { FieldDetail } from './pages/FieldDetail.js';
import { NewScan } from './pages/NewScan.js';
import { ScanResult } from './pages/ScanResult.js';
import { ScanHistory } from './pages/ScanHistory.js';
import { Compare } from './pages/Compare.js';
import { Profile } from './pages/Profile.js';
import { NotFound } from './pages/NotFound.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside AppShell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/fields/:fieldId" element={<FieldDetail />} />
            <Route path="/scan/new" element={<NewScan />} />
            <Route path="/scans/:scanId" element={<ScanResult />} />
            <Route path="/scans" element={<ScanHistory />} />
            <Route path="/compare/:fieldId" element={<Compare />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global Toast Notifications (Earthy styling, no neon) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FAF6EC',
              color: '#1E1A14',
              border: '1px solid rgba(107, 82, 56, 0.2)',
              borderRadius: '0.75rem',
              fontSize: '0.8125rem',
              boxShadow: '0 8px 24px rgba(59, 47, 34, 0.12)',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#4E8A57',
                secondary: '#FAF6EC',
              },
            },
            error: {
              iconTheme: {
                primary: '#B4532A',
                secondary: '#FAF6EC',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

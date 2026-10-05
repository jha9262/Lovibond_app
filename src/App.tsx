import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LiveStatusProvider } from './context/LiveStatusContext';
import { CheckCircle, AlertTriangle } from "lucide-react";
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy‑load the main layout component
const Main = lazy(() => import('./components/Main'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LiveStatusProvider>
          <Router>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading…</div>}>
              <Routes>
                <Route path="/Login" element={<LoginPage />} />
                <Route path="/*" element={<ProtectedRoute><Main /></ProtectedRoute>} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-center"
              toastOptions={{
                className: 'text-sm font-medium shadow-xl',
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                },
                success: { icon: <CheckCircle className="text-emerald-500 w-5 h-5" /> },
                error: { icon: <AlertTriangle className="text-red-500 w-5 h-5" /> },
              }}
            />
          </Router>
        </LiveStatusProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
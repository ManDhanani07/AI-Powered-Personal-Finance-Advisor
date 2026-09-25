import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';
import { showToast } from '../common/ToastProvider.jsx';

const ADMIN_EMAIL = "fintech0707@gmail.com";

export const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const hasAlerted = useRef(false);

  const isNonAdmin = Boolean(
    isAuthenticated &&
    user?.email &&
    user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  );

  useEffect(() => {
    if (isNonAdmin && !hasAlerted.current) {
      hasAlerted.current = true;
      showToast.error("Access denied: Admin privileges required.");
    }
  }, [isNonAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Verifying Admin Access...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // If user object has loaded and is not admin, deny access
  if (isNonAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

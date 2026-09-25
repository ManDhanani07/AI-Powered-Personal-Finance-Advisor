import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';

const ADMIN_EMAIL = 'fintech0707@gmail.com';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // If session is validating on initial load, show clean loading fallback
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  // Only redirect if genuinely authenticated with a verified user profile
  if (isAuthenticated && user && location.pathname !== ROUTES.AUTH.REGISTER && location.pathname !== '/register') {
    const rawFrom = location.state?.from?.pathname || ROUTES.DASHBOARD;
    const isAdmin = Boolean(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    const target = (!isAdmin && rawFrom.startsWith('/admin')) ? ROUTES.DASHBOARD : rawFrom;
    return <Navigate to={target} replace />;
  }

  return children;
};

export default GuestRoute;

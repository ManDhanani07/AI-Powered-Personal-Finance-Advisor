import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If already authenticated and not on registration, go straight to dashboard
  if (isAuthenticated && location.pathname !== ROUTES.AUTH.REGISTER && location.pathname !== '/register') {
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;

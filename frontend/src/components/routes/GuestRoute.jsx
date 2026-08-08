import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { LoadingScreen } from '../common/LoadingScreen.jsx';
import { ROUTES } from '../../constants/index.js';

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Checking authorization..." />;
  }

  // Allow users accessing registration to see the sign up form
  if (isAuthenticated && location.pathname !== ROUTES.AUTH.REGISTER) {
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;

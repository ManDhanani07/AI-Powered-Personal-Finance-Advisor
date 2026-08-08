import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { LoadingScreen } from '../common/LoadingScreen.jsx';
import { ROUTES } from '../../constants/index.js';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verifying session credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

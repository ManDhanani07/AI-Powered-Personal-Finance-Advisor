import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { LoadingScreen } from '../common/LoadingScreen.jsx';
import { ROUTES } from '../../constants/index.js';
import { showToast } from '../common/ToastProvider.jsx';

const ADMIN_EMAIL = "mandhanani536@gmail.com";

export const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verifying administrative credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  const isAdmin = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!isAdmin) {
    showToast.error("Access denied: Admin privileges required.");
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

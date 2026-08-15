import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { ROUTES } from '../../constants/index.js';
import { showToast } from '../common/ToastProvider.jsx';

const ADMIN_EMAIL = "fintech0707@gmail.com";

export const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />;
  }

  // If user object has loaded and is not admin, deny access
  if (user?.email && user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    showToast.error("Access denied: Admin privileges required.");
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

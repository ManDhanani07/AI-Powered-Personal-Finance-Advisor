import React from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout.jsx';
import useAuth from '../hooks/useAuth.js';

const ADMIN_EMAIL = 'fintech0707@gmail.com';

/**
 * Protected Layout Guard Component
 * Redirects admin account (fintech0707@gmail.com) directly to /admin/overview.
 * Standard users continue to user AppLayout.
 */
export const ProtectedLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (isAdmin) {
    return <Navigate to="/admin/overview" replace />;
  }

  return <AppLayout />;
};

export default ProtectedLayout;

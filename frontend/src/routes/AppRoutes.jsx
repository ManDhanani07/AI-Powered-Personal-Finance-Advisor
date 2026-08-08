import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/routes/ProtectedRoute.jsx';
import GuestRoute from '../components/routes/GuestRoute.jsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.jsx';
import { PageContainer } from '../components/layout/PageContainer.jsx';
import { NotFoundScreen } from '../components/common/NotFoundScreen.jsx';
import { ROUTES } from '../constants/index.js';

// Auth Pages
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';

// Profile & Settings Pages
import Profile from '../pages/profile/Profile.jsx';
import EditProfile from '../pages/profile/EditProfile.jsx';
import AccountSettings from '../pages/profile/AccountSettings.jsx';
import SecuritySettings from '../pages/profile/SecuritySettings.jsx';
import Preferences from '../pages/profile/Preferences.jsx';

// Core Feature Modules
import Dashboard from '../pages/dashboard/Dashboard.jsx';
import Transactions from '../pages/transactions/Transactions.jsx';
import Categories from '../pages/categories/Categories.jsx';
import Budgets from '../pages/budgets/Budgets.jsx';
import Goals from '../pages/goals/Goals.jsx';
import FinancialHealth from '../pages/financial-health/FinancialHealth.jsx';
import ForecastPage from '../pages/forecast/ForecastPage.jsx';
import ReportsPage from '../pages/reports/ReportsPage.jsx';
import AiAdvisorPage from '../pages/ai/AiAdvisorPage.jsx';
import NotificationsPage from '../pages/notifications/NotificationsPage.jsx';

// Landing Page
import LandingPage from '../pages/landing/LandingPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Marketing Landing Page */}
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      {/* Guest Authentication Routes */}
      <Route
        path={ROUTES.AUTH.LOGIN}
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.REGISTER}
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.FORGOT_PASSWORD}
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />
      <Route
        path={ROUTES.AUTH.RESET_PASSWORD}
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* Protected Main Routes */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.DASHBOARD}
          element={<Dashboard />}
        />
        
        {/* Transaction Ledger Route */}
        <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />

        {/* Category Management Route */}
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />

        {/* Budget Management Route */}
        <Route path={ROUTES.BUDGETS} element={<Budgets />} />

        {/* Savings Goals Route */}
        <Route path={ROUTES.GOALS} element={<Goals />} />

        {/* Financial Health Score Engine Route */}
        <Route path={ROUTES.FINANCIAL_HEALTH} element={<FinancialHealth />} />

        {/* Analytics & Executive Tax Planning Route */}
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        {/* Predictive Cash Flow & Scenario Engine Route */}
        <Route path={ROUTES.FORECAST} element={<ForecastPage />} />
        {/* AI Wealth Copilot Workspace Route */}
        <Route path={ROUTES.AI_ADVISOR} element={<AiAdvisorPage />} />
        {/* Smart Notifications & Alerts Route */}
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        
        {/* Profile & Account Routes */}
        <Route path={ROUTES.PROFILE} element={<Profile />} />
        <Route path={`${ROUTES.PROFILE}/edit`} element={<EditProfile />} />
        <Route path={`${ROUTES.PROFILE}/account`} element={<AccountSettings />} />
        <Route path={`${ROUTES.PROFILE}/security`} element={<SecuritySettings />} />
        <Route path={`${ROUTES.PROFILE}/preferences`} element={<Preferences />} />
        <Route path={ROUTES.SETTINGS} element={<Preferences />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
};

export default AppRoutes;

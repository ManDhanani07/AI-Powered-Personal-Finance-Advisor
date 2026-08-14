import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/routes/ProtectedRoute.jsx';
import AdminProtectedRoute from '../components/routes/AdminProtectedRoute.jsx';
import GuestRoute from '../components/routes/GuestRoute.jsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.jsx';
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

// Admin Portal Pages
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import AdminOverview from '../pages/admin/AdminOverview.jsx';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminTransactions from '../pages/admin/AdminTransactions.jsx';
import AdminFinancialActivity from '../pages/admin/AdminFinancialActivity.jsx';
import AdminAiUsage from '../pages/admin/AdminAiUsage.jsx';
import AdminBudgetsGoals from '../pages/admin/AdminBudgetsGoals.jsx';
import AdminSystemHealth from '../pages/admin/AdminSystemHealth.jsx';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs.jsx';
import AdminReports from '../pages/admin/AdminReports.jsx';
import AdminSettings from '../pages/admin/AdminSettings.jsx';

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

      {/* Admin Portal Protected Routes (Restricted strictly to mandhanani536@gmail.com) */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="financial-activity" element={<AdminFinancialActivity />} />
        <Route path="ai-usage" element={<AdminAiUsage />} />
        <Route path="budgets-goals" element={<AdminBudgetsGoals />} />
        <Route path="system-health" element={<AdminSystemHealth />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Protected Main Routes */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.TRANSACTIONS} element={<Transactions />} />
        <Route path={ROUTES.CATEGORIES} element={<Categories />} />
        <Route path={ROUTES.BUDGETS} element={<Budgets />} />
        <Route path={ROUTES.GOALS} element={<Goals />} />
        <Route path={ROUTES.FINANCIAL_HEALTH} element={<FinancialHealth />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route path={ROUTES.FORECAST} element={<ForecastPage />} />
        <Route path={ROUTES.AI_ADVISOR} element={<AiAdvisorPage />} />
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

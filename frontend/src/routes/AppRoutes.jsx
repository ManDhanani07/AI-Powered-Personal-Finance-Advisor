import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/routes/ProtectedRoute.jsx';
import AdminProtectedRoute from '../components/routes/AdminProtectedRoute.jsx';
import GuestRoute from '../components/routes/GuestRoute.jsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.jsx';
import { NotFoundScreen } from '../components/common/NotFoundScreen.jsx';
import { ROUTES } from '../constants/index.js';

// Ultra-fast, lightweight Suspense fallback
const RouteLoadingFallback = () => (
  <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center bg-transparent">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 font-mono">Loading</span>
    </div>
  </div>
);

// Dynamic Lazy-Loaded Auth Pages
const Login = lazy(() => import('../pages/auth/Login.jsx'));
const Register = lazy(() => import('../pages/auth/Register.jsx'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail.jsx'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword.jsx'));

// Dynamic Lazy-Loaded Profile & Settings Pages
const Profile = lazy(() => import('../pages/profile/Profile.jsx'));
const EditProfile = lazy(() => import('../pages/profile/EditProfile.jsx'));
const AccountSettings = lazy(() => import('../pages/profile/AccountSettings.jsx'));
const SecuritySettings = lazy(() => import('../pages/profile/SecuritySettings.jsx'));
const Preferences = lazy(() => import('../pages/profile/Preferences.jsx'));

// Dynamic Lazy-Loaded Core Feature Modules
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard.jsx'));
const Transactions = lazy(() => import('../pages/transactions/Transactions.jsx'));
const Categories = lazy(() => import('../pages/categories/Categories.jsx'));
const Budgets = lazy(() => import('../pages/budgets/Budgets.jsx'));
const Goals = lazy(() => import('../pages/goals/Goals.jsx'));
const FinancialHealth = lazy(() => import('../pages/financial-health/FinancialHealth.jsx'));
const ForecastPage = lazy(() => import('../pages/forecast/ForecastPage.jsx'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage.jsx'));
const AiAdvisorPage = lazy(() => import('../pages/ai/AiAdvisorPage.jsx'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage.jsx'));

// Dynamic Lazy-Loaded Admin Portal Pages
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('../pages/admin/AdminOverview.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers.jsx'));
const AdminTransactions = lazy(() => import('../pages/admin/AdminTransactions.jsx'));
const AdminFinancialActivity = lazy(() => import('../pages/admin/AdminFinancialActivity.jsx'));
const AdminAiUsage = lazy(() => import('../pages/admin/AdminAiUsage.jsx'));
const AdminBudgetsGoals = lazy(() => import('../pages/admin/AdminBudgetsGoals.jsx'));
const AdminSystemHealth = lazy(() => import('../pages/admin/AdminSystemHealth.jsx'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs.jsx'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports.jsx'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings.jsx'));

// Dynamic Lazy-Loaded Public Landing Page
const LandingPage = lazy(() => import('../pages/landing/LandingPage.jsx'));

export const AppRoutes = () => {
  // Preload critical core routes in idle time for zero-latency page transitions
  useEffect(() => {
    const preloadCore = () => {
      import('../pages/dashboard/Dashboard.jsx');
      import('../pages/transactions/Transactions.jsx');
      import('../pages/budgets/Budgets.jsx');
      import('../pages/goals/Goals.jsx');
      import('../pages/financial-health/FinancialHealth.jsx');
      import('../pages/ai/AiAdvisorPage.jsx');
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadCore);
    } else {
      setTimeout(preloadCore, 1200);
    }
  }, []);

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Marketing Landing Page */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />

        {/* Guest Authentication Routes (Supports both /login and /auth/login) */}
        <Route
          path={ROUTES.AUTH.LOGIN}
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/login"
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
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path={ROUTES.AUTH.VERIFY_EMAIL}
          element={
            <GuestRoute>
              <VerifyEmail />
            </GuestRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <GuestRoute>
              <VerifyEmail />
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
          path="/forgot-password"
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
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />

        {/* Admin Portal Protected Routes (Restricted strictly to fintech0707@gmail.com) */}
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
    </Suspense>
  );
};

export default AppRoutes;

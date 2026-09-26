import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from '../components/routes/ProtectedRoute.jsx';
import AdminProtectedRoute from '../components/routes/AdminProtectedRoute.jsx';
import GuestRoute from '../components/routes/GuestRoute.jsx';
import { ProtectedLayout } from '../layouts/ProtectedLayout.jsx';
import { AccountLayout } from '../layouts/AccountLayout.jsx';
import { NotFoundScreen } from '../components/common/NotFoundScreen.jsx';
import { ROUTES } from '../constants/index.js';

// Ultra-fast, lightweight Suspense fallback
const RouteLoadingFallback = () => (
  <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center bg-transparent">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
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
const SecuritySettings = lazy(() => import('../pages/profile/SecuritySettings.jsx'));

// Statically loaded core entry pages (Zero waterfall / instant cold render)
import LandingPage from '../pages/landing/LandingPage.jsx';
import Dashboard from '../pages/dashboard/Dashboard.jsx';

// Dynamic Lazy-Loaded Core Feature Modules
const Transactions = lazy(() => import('../pages/transactions/Transactions.jsx'));
const Categories = lazy(() => import('../pages/categories/Categories.jsx'));
const Budgets = lazy(() => import('../pages/budgets/Budgets.jsx'));
const Goals = lazy(() => import('../pages/goals/Goals.jsx'));
const FinancialHealth = lazy(() => import('../pages/financial-health/FinancialHealth.jsx'));
const ExpensePredictionPage = lazy(() => import('../pages/expense-prediction/ExpensePredictionPage.jsx'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage.jsx'));
const AiAdvisorPage = lazy(() => import('../pages/ai/AiAdvisorPage.jsx'));
const SupportPage = lazy(() => import('../pages/support/SupportPage.jsx'));

// Dynamic Lazy-Loaded Admin Portal Pages (Fintech + AI Operations Console)
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('../pages/admin/AdminOverview.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers.jsx'));
const AdminTransactions = lazy(() => import('../pages/admin/AdminTransactions.jsx'));
const AdminAiMlOps = lazy(() => import('../pages/admin/AdminAiMlOps.jsx'));
const AdminRiskSecurity = lazy(() => import('../pages/admin/AdminRiskSecurity.jsx'));
const AdminDataManagement = lazy(() => import('../pages/admin/AdminDataManagement.jsx'));
const AdminSupport = lazy(() => import('../pages/admin/AdminSupport.jsx'));
const AdminSystemConsole = lazy(() => import('../pages/admin/AdminSystemConsole.jsx'));

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Portal Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6 text-white font-sans">
          <div className="p-8 max-w-md w-full text-center space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <h3 className="text-base font-bold text-white font-outfit">Console View Recovered</h3>
            <p className="text-xs text-slate-400">
              An unexpected render issue was safely intercepted. Click below to reload.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
            >
              Reload Console
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Landing Page */}
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

        {/* Admin Portal Protected Routes (Fintech + AI Operations Console) */}
        <Route
          path="/admin"
          element={
            <GlobalErrorBoundary>
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            </GlobalErrorBoundary>
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="ai-ml" element={<AdminAiMlOps />} />
          <Route path="risk-security" element={<AdminRiskSecurity />} />
          <Route path="data-management" element={<AdminDataManagement />} />
          <Route path="notifications" element={<Navigate to="/admin/overview" replace />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="system" element={<AdminSystemConsole />} />
          <Route path="audit-logs" element={<Navigate to="/admin/overview" replace />} />

          {/* Backward Compatibility Alias Redirects */}
          <Route path="analytics" element={<Navigate to="/admin/overview" replace />} />
          <Route path="ai-usage" element={<Navigate to="/admin/ai-ml" replace />} />
          <Route path="financial-activity" element={<Navigate to="/admin/overview" replace />} />
          <Route path="budgets-goals" element={<Navigate to="/admin/overview" replace />} />
          <Route path="system-health" element={<Navigate to="/admin/system" replace />} />
          <Route path="settings" element={<Navigate to="/admin/system" replace />} />
          <Route path="reports" element={<Navigate to="/admin/overview" replace />} />
        </Route>

        {/* Protected User Dashboard Routes */}
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
          <Route path={ROUTES.EXPENSE_PREDICTION} element={<ExpensePredictionPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.AI_ADVISOR} element={<AiAdvisorPage />} />
          <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
          <Route path="/report-issue" element={<Navigate to={ROUTES.SUPPORT} replace />} />
          <Route path="/report-problem" element={<Navigate to={ROUTES.SUPPORT} replace />} />
        </Route>

        {/* Dedicated Account & Profile Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={`${ROUTES.PROFILE}/edit`} element={<EditProfile />} />
          <Route path={`${ROUTES.PROFILE}/security`} element={<SecuritySettings />} />
          <Route path={ROUTES.SECURITY} element={<SecuritySettings />} />
          <Route path={`${ROUTES.PROFILE}/account`} element={<Navigate to={ROUTES.PROFILE} replace />} />
          <Route path={`${ROUTES.PROFILE}/preferences`} element={<Navigate to={ROUTES.PROFILE} replace />} />
          <Route path="/settings" element={<Navigate to={ROUTES.PROFILE} replace />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

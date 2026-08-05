import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/guard/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Shared Error Pages
import { NotFoundPage } from './components/errors/NotFoundPage';
import { ForbiddenPage } from './components/errors/ForbiddenPage';

// Feature Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { FactoriesPage } from './features/factories/pages/FactoriesPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { GlobalLogsPage } from './features/global-logs/pages/GlobalLogsPage';
import { SiteConfigPage } from './features/site-config/pages/SiteConfigPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Error Pages */}
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* Protected Routes for ALL Authenticated Users (super-admin, admin, operator) */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin', 'admin', 'operator']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Route>

            {/* Protected Routes for Master Data Management (super-admin, admin) */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin', 'admin']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/factories" element={<FactoriesPage />} />
              </Route>
            </Route>

            {/* Protected Routes for Super-Admin ONLY */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/logs" element={<GlobalLogsPage />} />
                <Route path="/admin/site-config" element={<SiteConfigPage />} />
              </Route>
            </Route>

            {/* Default Authenticated Fallback Redirect */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

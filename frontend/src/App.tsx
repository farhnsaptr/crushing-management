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
import { SenderRequestsPage } from './features/crushing-requests/pages/SenderRequestsPage';
import { RequestApprovalPage } from './features/crushing-requests/pages/RequestApprovalPage';
import { NgInputPage } from './features/ng-input/pages/NgInputPage';
import { PartRunnerNgPage } from './features/part-runner-ng/pages/PartRunnerNgPage';
import { DepartmentsPage } from './features/departments/pages/DepartmentsPage';
import { FactoriesPage } from './features/factories/pages/FactoriesPage';
import { MachinesPage } from './features/machines/pages/MachinesPage';
import { MaterialsPage } from './features/materials/pages/MaterialsPage';
import { MasterPartsPage } from './features/master-parts/pages/MasterPartsPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { GlobalLogsPage } from './features/global-logs/pages/GlobalLogsPage';
import { SiteConfigPage } from './features/site-config/pages/SiteConfigPage';
import { SystemSignatureView } from './features/system/pages/SystemSignatureView';
import { VerificationPage } from './features/verification/pages/VerificationPage';
import { AnalyticsPage } from './features/analytics/pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/system-signature" element={<SystemSignatureView />} />

            {/* Error Pages */}
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* Protected Route for Dashboard & Analytics (Accessible by All Roles including Pengirim) */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin', 'admin', 'operator', 'pengirim']} />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Route>
            </Route>

            {/* Protected Route for Pengirim Ticket Submission */}
            <Route element={<ProtectedRoute allowedRoles={['pengirim']} />}>
              <Route element={<MainLayout />}>
                <Route path="/requests" element={<SenderRequestsPage />} />
              </Route>
            </Route>

            {/* Protected Routes for Crushing Operations (super-admin, admin, operator) */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin', 'admin', 'operator']} />}>
              <Route element={<MainLayout />}>
                <Route path="/approval-requests" element={<RequestApprovalPage />} />
                <Route path="/ng-input" element={<NgInputPage />} />
                <Route path="/part-runner-ng" element={<PartRunnerNgPage />} />
                <Route path="/verification" element={<VerificationPage />} />
              </Route>
            </Route>

            {/* Protected Routes for Master Data Management (super-admin, admin) */}
            <Route element={<ProtectedRoute allowedRoles={['super-admin', 'admin']} />}>
              <Route element={<MainLayout />}>
                <Route path="/admin/departments" element={<DepartmentsPage />} />
                <Route path="/admin/factories" element={<FactoriesPage />} />
                <Route path="/admin/machines" element={<MachinesPage />} />
                <Route path="/admin/materials" element={<MaterialsPage />} />
                <Route path="/admin/master-parts" element={<MasterPartsPage />} />
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

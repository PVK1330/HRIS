/* eslint-disable react-refresh/only-export-components -- router module exports router + default app */
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx'
import Login from '../pages/auth/Login.jsx'

import AdminDashboard from '../pages/admin/Dashboard.jsx'
import EmployeeDirectory from '../pages/admin/employees/EmployeeDirectory.jsx'
import EmployeeProfile from '../pages/admin/employees/EmployeeProfile.jsx'
import Attendance from '../pages/admin/hr/Attendance.jsx'
import LeaveAbsence from '../pages/admin/hr/LeaveAbsence.jsx'
import Documents from '../pages/admin/documents/Documents.jsx'
import VisaNationality from '../pages/admin/compliance/VisaNationality.jsx'
import Performance from '../pages/admin/hr/Performance.jsx'
import Policies from '../pages/admin/compliance/Policies.jsx'
import Expenses from '../pages/admin/finance/Expenses.jsx'
import Onboarding from '../pages/admin/hr/Onboarding.jsx'
import ExitManagement from '../pages/admin/hr/ExitManagement.jsx'
import LettersTemplates from '../pages/admin/documents/LettersTemplates.jsx'
import AdminSettings from '../pages/admin/settings/Settings.jsx'

import PlatformDashboard from '../pages/superadmin/platform/Dashboard.jsx'
import TenantManagement from '../pages/superadmin/tenants/TenantManagement.jsx'
import DomainsSSL from '../pages/superadmin/domains/DomainsSSL.jsx'
import SubscriptionsPlans from '../pages/superadmin/subscriptions/SubscriptionsPlans.jsx'
import Billing from '../pages/superadmin/billing/Billing.jsx'
import ModuleManagement from '../pages/superadmin/platform/ModuleManagement.jsx'
import Announcements from '../pages/superadmin/platform/Announcements.jsx'
import AuditLogs from '../pages/superadmin/system/AuditLogs.jsx'
import SupportTickets from '../pages/superadmin/support/SupportTickets.jsx'
import AdminUsers from '../pages/superadmin/AdminUsers.jsx'
import Permissions from '../pages/superadmin/Permissions.jsx'
import SuperSettings from '../pages/superadmin/Settings.jsx'

import EmployeeLayout from '../layouts/EmployeeLayout.jsx'
import EmployeeDashboard from '../pages/employee/Dashboard.jsx'
import HRLayout from '../layouts/HRLayout.jsx'
import HRDashboard from '../pages/hr/Dashboard.jsx'
import HRTeam from '../pages/hr/Team.jsx'
import HRLeaveApprovals from '../pages/hr/LeaveApprovals.jsx'
import HRAttendance from '../pages/hr/Attendance.jsx'
import HRExpenses from '../pages/hr/Expenses.jsx'
import HRPerformance from '../pages/hr/Performance.jsx'
import HRLetters from '../pages/hr/Letters.jsx'
import HRReports from '../pages/hr/Reports.jsx'

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'employee-directory', element: <EmployeeDirectory /> },
          { path: 'employee-profile', element: <EmployeeProfile /> },
          { path: 'attendance', element: <Attendance /> },
          { path: 'leave', element: <LeaveAbsence /> },
          { path: 'documents', element: <Documents /> },
          { path: 'visa', element: <VisaNationality /> },
          { path: 'performance', element: <Performance /> },
          { path: 'policies', element: <Policies /> },
          { path: 'expenses', element: <Expenses /> },
          { path: 'onboarding', element: <Onboarding /> },
          { path: 'exit-management', element: <ExitManagement /> },
          { path: 'letters', element: <LettersTemplates /> },
          { path: 'settings', element: <AdminSettings /> },
        ],
      },
      {
        path: 'employee',
        element: (
          <ProtectedRoute allowedRoles={['employee', 'admin', 'superadmin']}>
            <EmployeeLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <EmployeeDashboard /> },
          { path: 'profile', element: <EmployeeDashboard /> },
          { path: 'attendance', element: <EmployeeDashboard /> },
          { path: 'leave', element: <EmployeeDashboard /> },
          { path: 'timesheet', element: <EmployeeDashboard /> },
          { path: 'goals', element: <EmployeeDashboard /> },
          { path: 'reviews', element: <EmployeeDashboard /> },
          { path: 'payslips', element: <EmployeeDashboard /> },
          { path: 'expenses', element: <EmployeeDashboard /> },
          { path: 'messages', element: <EmployeeDashboard /> },
          { path: 'announcements', element: <EmployeeDashboard /> },
          { path: 'settings', element: <EmployeeDashboard /> },
        ],
      },
      {
        path: 'hr',
        element: (
          <ProtectedRoute allowedRoles={['hr', 'admin', 'superadmin']}>
            <HRLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <HRDashboard /> },
          { path: 'team', element: <HRTeam /> },
          { path: 'leave-approvals', element: <HRLeaveApprovals /> },
          { path: 'attendance', element: <HRAttendance /> },
          { path: 'expenses', element: <HRExpenses /> },
          { path: 'performance', element: <HRPerformance /> },
          { path: 'letters', element: <HRLetters /> },
          { path: 'reports', element: <HRReports /> },
          { path: 'employees', element: <HRTeam /> },
          { path: 'onboarding', element: <EmployeeDashboard /> },
          { path: 'exit', element: <EmployeeDashboard /> },
          { path: 'announcements', element: <EmployeeDashboard /> },
          { path: 'messages', element: <EmployeeDashboard /> },
          { path: 'settings', element: <EmployeeDashboard /> },
        ],
      },
      {
        path: 'superadmin',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <PlatformDashboard /> },
          { path: 'tenants', element: <TenantManagement /> },
          { path: 'domains', element: <DomainsSSL /> },
          { path: 'subscriptions', element: <SubscriptionsPlans /> },
          { path: 'billing', element: <Billing /> },
          { path: 'modules', element: <ModuleManagement /> },
          { path: 'announcements', element: <Announcements /> },
          { path: 'audit', element: <AuditLogs /> },
          { path: 'support', element: <SupportTickets /> },
          { path: 'admin-users', element: <AdminUsers /> },
          { path: 'permissions', element: <Permissions /> },
          { path: 'settings', element: <SuperSettings /> },
        ],
      },
      { path: '*', element: <Navigate to="/login" replace /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}

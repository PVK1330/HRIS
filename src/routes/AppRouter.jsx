/* eslint-disable react-refresh/only-export-components -- router module exports router + default app */
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AuthProvider, useAuth } from '../context/AuthContext.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import SuperAdminLayout from '../layouts/SuperAdminLayout.jsx'
import Login from '../pages/auth/Login.jsx'

import AdminDashboard from '../pages/admin/Dashboard.jsx'
import EmployeeDirectory from '../pages/admin/EmployeeDirectory.jsx'
import EmployeeProfile from '../pages/admin/EmployeeProfile.jsx'
import Attendance from '../pages/admin/Attendance.jsx'
import LeaveAbsence from '../pages/admin/LeaveAbsence.jsx'
import Documents from '../pages/admin/Documents.jsx'
import VisaNationality from '../pages/admin/VisaNationality.jsx'
import Performance from '../pages/admin/Performance.jsx'
import Policies from '../pages/admin/Policies.jsx'
import Expenses from '../pages/admin/Expenses.jsx'
import Onboarding from '../pages/admin/Onboarding.jsx'
import ExitManagement from '../pages/admin/ExitManagement.jsx'
import LettersTemplates from '../pages/admin/LettersTemplates.jsx'
import AdminSettings from '../pages/admin/Settings.jsx'

import SuperDashboard from '../pages/superadmin/Dashboard.jsx'
import AdminUsers from '../pages/superadmin/AdminUsers.jsx'
import CaseWorkers from '../pages/superadmin/CaseWorkers.jsx'
import ClientsCandidates from '../pages/superadmin/ClientsCandidates.jsx'
import SponsorsBusiness from '../pages/superadmin/SponsorsBusiness.jsx'
import Permissions from '../pages/superadmin/Permissions.jsx'
import AllCases from '../pages/superadmin/AllCases.jsx'
import CaseDetail from '../pages/superadmin/CaseDetail.jsx'
import Pipeline from '../pages/superadmin/Pipeline.jsx'
import AssignReassign from '../pages/superadmin/AssignReassign.jsx'
import Escalations from '../pages/superadmin/Escalations.jsx'
import SuperSettings from '../pages/superadmin/Settings.jsx'

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
          <ProtectedRoute allowedRoles={['admin']}>
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
        path: 'superadmin',
        element: (
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <SuperDashboard /> },
          { path: 'admin-users', element: <AdminUsers /> },
          { path: 'caseworkers', element: <CaseWorkers /> },
          { path: 'clients', element: <ClientsCandidates /> },
          { path: 'sponsors', element: <SponsorsBusiness /> },
          { path: 'permissions', element: <Permissions /> },
          { path: 'all-cases', element: <AllCases /> },
          { path: 'case-detail', element: <CaseDetail /> },
          { path: 'pipeline', element: <Pipeline /> },
          { path: 'assign-reassign', element: <AssignReassign /> },
          { path: 'escalations', element: <Escalations /> },
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

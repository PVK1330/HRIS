/* eslint-disable react-refresh/only-export-components -- router module exports router + default app */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";
import Login from "../pages/auth/Login.jsx";

import AdminDashboard from "../pages/admin/Dashboard.jsx";
import EmployeeDirectory from "../pages/admin/employees/EmployeeDirectory.jsx";
import EmployeeProfile from "../pages/admin/employees/EmployeeProfile.jsx";
import Attendance from "../pages/admin/hr/Attendance.jsx";
import LeaveAbsence from "../pages/admin/hr/LeaveAbsence.jsx";
import Documents from "../pages/admin/documents/Documents.jsx";
import VisaNationality from "../pages/admin/compliance/VisaNationality.jsx";
import Performance from "../pages/admin/hr/Performance.jsx";
import Policies from "../pages/admin/compliance/Policies.jsx";
import Expenses from "../pages/admin/finance/Expenses.jsx";
import Onboarding from "../pages/admin/hr/Onboarding.jsx";
import ExitManagement from "../pages/admin/hr/ExitManagement.jsx";
import LettersTemplates from "../pages/admin/documents/LettersTemplates.jsx";
import AdminSettings from "../pages/admin/settings/Settings.jsx";
import DepartmentManagement from "../pages/admin/settings/Departments.jsx";
import ProjectManagement from "../pages/admin/settings/Projects.jsx";
import TaskManagement from "../pages/admin/settings/Tasks.jsx";
import TemplateGenerator from "../pages/admin/documents/TemplateGenerator.jsx";
import AssetManagement from "../pages/admin/assets/AssetManagement.jsx";
import Reports from "../pages/admin/reports/Reports.jsx";
import AnnouncementsPage from "../pages/admin/Announcements.jsx";
import Payroll from "../pages/admin/finance/Payroll.jsx";

import PlatformDashboard from "../pages/superadmin/platform/Dashboard.jsx";
import TenantManagement from "../pages/superadmin/tenants/TenantManagement.jsx";
import SubscriptionsPlans from "../pages/superadmin/subscriptions/SubscriptionsPlans.jsx";
import Billing from "../pages/superadmin/billing/Billing.jsx";
import ModuleManagement from "../pages/superadmin/platform/ModuleManagement.jsx";
import Announcements from "../pages/superadmin/platform/Announcements.jsx";
import AuditLogs from "../pages/superadmin/system/AuditLogs.jsx";
import SupportTickets from "../pages/superadmin/support/SupportTickets.jsx";
import AdminUsers from "../pages/superadmin/AdminUsers.jsx";
import Permissions from "../pages/superadmin/Permissions.jsx";
import SuperProfile from "../pages/superadmin/Profile.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

import SettingsLayout from "../pages/superadmin/settings/SettingsLayout.jsx";
import GeneralSettings from "../pages/superadmin/settings/GeneralSettings.jsx";
import CompanyDetails from "../pages/superadmin/settings/CompanyDetails.jsx";
import LogoSettings from "../pages/superadmin/settings/LogoSettings.jsx";
import SystemInfo from "../pages/superadmin/settings/SystemInfo.jsx";
import EmailSettingsPage from "../pages/superadmin/settings/email/EmailSettings.jsx";
import EmailTemplatesPage from "../pages/superadmin/settings/email/EmailTemplates.jsx";
import EmailLogPage from "../pages/superadmin/settings/email/EmailLog.jsx";
import FreeTrialSettings from "../pages/superadmin/settings/FreeTrialSettings.jsx";
import PaymentGatewaySettings from "../pages/superadmin/settings/PaymentGatewaySettings.jsx";
import DomainSettings from "../pages/superadmin/settings/DomainSettings.jsx";
import AccountSettings from "../pages/superadmin/settings/AccountSettings.jsx";
import CurrencySettings from "../pages/superadmin/settings/CurrencySettings.jsx";
import RecaptchaSettings from "../pages/superadmin/settings/RecaptchaSettings.jsx";

// Legacy imports removed causing 404s

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
}

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const ADMIN_ROLES = [
  "admin",
  "hr_admin",
  "hr_executive",
  "manager",
  "employee",
];
const SUPER_ROLES = ["superadmin", "support_admin", "billing_admin"];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "employee-directory", element: <EmployeeDirectory /> },
          { path: "employee-profile", element: <EmployeeProfile /> },
          { path: "attendance", element: <Attendance /> },
          { path: "leave", element: <LeaveAbsence /> },
          { path: "documents", element: <Documents /> },
          { path: "visa", element: <VisaNationality /> },
          { path: "performance", element: <Performance /> },
          { path: "policies", element: <Policies /> },
          { path: "expenses", element: <Expenses /> },
          { path: "onboarding", element: <Onboarding /> },
          { path: "exit-management", element: <ExitManagement /> },
          { path: "letters", element: <LettersTemplates /> },
          { path: "settings", element: <AdminSettings /> },
          { path: "departments", element: <DepartmentManagement /> },
          { path: "projects", element: <ProjectManagement /> },
          { path: "tasks", element: <TaskManagement /> },
          { path: "templates", element: <TemplateGenerator /> },
          { path: "assets", element: <AssetManagement /> },
          { path: "reports", element: <Reports /> },
          { path: "announcements", element: <AnnouncementsPage /> },
          { path: "payroll", element: <Payroll /> },
        ],
      },
      {
        path: "superadmin",
        element: (
          <ProtectedRoute allowedRoles={SUPER_ROLES}>
            <SuperAdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <PlatformDashboard /> },
          { path: "tenants", element: <TenantManagement /> },
          { path: "subscriptions", element: <SubscriptionsPlans /> },
          { path: "billing", element: <Billing /> },
          { path: "modules", element: <ModuleManagement /> },
          { path: "announcements", element: <Announcements /> },
          { path: "audit", element: <AuditLogs /> },
          { path: "support", element: <SupportTickets /> },
          { path: "admin-users", element: <AdminUsers /> },
          { path: "permissions", element: <Permissions /> },
          { path: "profile", element: <SuperProfile /> },
          {
            path: "settings",
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="general" replace /> },
              { path: "general", element: <GeneralSettings /> },
              { path: "domain", element: <DomainSettings /> },
              { path: "account", element: <AccountSettings /> },
              { path: "company", element: <CompanyDetails /> },
              { path: "email", element: <Navigate to="settings" replace /> },
              { path: "email/settings", element: <EmailSettingsPage /> },
              { path: "email/templates", element: <EmailTemplatesPage /> },
              { path: "email/log", element: <EmailLogPage /> },
              { path: "currency", element: <CurrencySettings /> },
              { path: "logo", element: <LogoSettings /> },
              { path: "free-trial", element: <FreeTrialSettings /> },
              { path: "payments", element: <PaymentGatewaySettings /> },
              { path: "system", element: <SystemInfo /> },
              { path: "recaptcha", element: <RecaptchaSettings /> },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

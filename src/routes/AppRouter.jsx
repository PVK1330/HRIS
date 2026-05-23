/* eslint-disable react-refresh/only-export-components -- router module exports router + default app */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PermissionGate from "../components/PermissionGate.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import SuperAdminLayout from "../layouts/SuperAdminLayout.jsx";
import Login from "../pages/auth/Login.jsx";

import AdminDashboard from "../pages/admin/Dashboard.jsx";
import EmployeeDirectory from "../pages/admin/employees/EmployeeDirectory.jsx";
import EmployeeGrid from "../pages/admin/employees/EmployeeGrid.jsx";
import EmployeeProfile from "../pages/admin/employees/EmployeeProfile.jsx";
import Attendance from "../pages/admin/hr/Attendance.jsx";
import LeaveAbsence from "../pages/admin/hr/LeaveAbsence.jsx";
import Documents from "../pages/admin/documents/Documents.jsx";
import VisaNationality from "../pages/admin/compliance/VisaNationality.jsx";
import Performance from "../pages/admin/hr/Performance.jsx";
import Policies from "../pages/admin/compliance/Policies.jsx";
import MyPolicies from "../pages/admin/compliance/MyPolicies.jsx";
import Expenses from "../pages/admin/finance/Expenses.jsx";
import Onboarding from "../pages/admin/hr/Onboarding.jsx";
import ExitManagement from "../pages/admin/hr/ExitManagement.jsx";
import LettersTemplates from "../pages/admin/documents/LettersTemplates.jsx";
import TemplateGenerator from "../pages/admin/documents/TemplateGenerator.jsx";
import AdminSettings from "../pages/admin/settings/Settings.jsx";
import RolesPermissions from "../pages/admin/settings/RolesPermissions.jsx";
import DepartmentManagement from "../pages/admin/settings/Departments.jsx";
import DesignationsManagement from "../pages/admin/settings/Designations.jsx";
import ProjectManagement from "../pages/admin/settings/Projects.jsx";
import TaskManagement from "../pages/admin/settings/Tasks.jsx";
import Messages from "../pages/admin/communication/Messages.jsx";
import AssetManagement from "../pages/admin/assets/AssetManagement.jsx";
import Reports from "../pages/admin/reports/Reports.jsx";
import AnnouncementsPage from "../pages/admin/Announcements.jsx";
import Payroll from "../pages/admin/finance/Payroll.jsx";

import PlatformDashboard from "../pages/superadmin/platform/Dashboard.jsx";
import TenantManagement from "../pages/superadmin/tenants/TenantManagement.jsx";
import SubscriptionsPlans from "../pages/superadmin/subscriptions/SubscriptionsPlans.jsx";
import SubscriptionFeatures from "../pages/superadmin/subscriptions/SubscriptionFeatures.jsx";
import Billing from "../pages/superadmin/billing/Billing.jsx";
import Announcements from "../pages/superadmin/platform/Announcements.jsx";
import ModuleManagement from "../pages/superadmin/platform/ModuleManagement.jsx";
import AuditLogs from "../pages/superadmin/system/AuditLogs.jsx";
import SystemHealth from "../pages/superadmin/system/SystemHealth.jsx";
import SupportTickets from "../pages/superadmin/support/SupportTickets.jsx";
import AdminUsers from "../pages/superadmin/AdminUsers.jsx";
import Permissions from "../pages/superadmin/Permissions.jsx";
import SuperProfile from "../pages/superadmin/Profile.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import CandidateOffer from "../pages/public/onboarding/CandidateOffer.jsx";
import CandidateSign from "../pages/public/onboarding/CandidateSign.jsx";
import CandidateDocuments from "../pages/public/onboarding/CandidateDocuments.jsx";

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

function AdminModuleGate({ moduleKey, children }) {
  return (
    <PermissionGate
      moduleKey={moduleKey}
      fallback={<Navigate to="/admin/dashboard" replace />}
    >
      {children}
    </PermissionGate>
  );
}

function RootLayout() {
  return <Outlet />;
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
      { path: "onboarding/offer", element: <CandidateOffer /> },
      { path: "onboarding/sign", element: <CandidateSign /> },
      { path: "onboarding/documents", element: <CandidateDocuments /> },
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
          {
            path: "employee-directory",
            element: (
              <AdminModuleGate moduleKey="employee-directory">
                <EmployeeDirectory />
              </AdminModuleGate>
            ),
          },
          {
            path: "employee-grid",
            element: (
              <AdminModuleGate moduleKey="employee-directory">
                <EmployeeGrid />
              </AdminModuleGate>
            ),
          },
          {
            path: "employee-profile",
            element: (
              <AdminModuleGate moduleKey="employee-profiles">
                <EmployeeProfile />
              </AdminModuleGate>
            ),
          },
          {
            path: "attendance",
            element: (
              <AdminModuleGate
                moduleKey={[
                  "attendance",
                  "time-tracking",
                  "shift-management",
                  "overtime-management",
                ]}
              >
                <Attendance />
              </AdminModuleGate>
            ),
          },
          {
            path: "leave",
            element: (
              <AdminModuleGate moduleKey="leave-absence">
                <LeaveAbsence />
              </AdminModuleGate>
            ),
          },
          {
            path: "documents",
            element: (
              <AdminModuleGate moduleKey="documents-approval">
                <Documents />
              </AdminModuleGate>
            ),
          },
          {
            path: "visa",
            element: (
              <AdminModuleGate moduleKey="visa-nationality">
                <VisaNationality />
              </AdminModuleGate>
            ),
          },
          {
            path: "performance",
            element: (
              <AdminModuleGate
                moduleKey={["performance", "training-development"]}
              >
                <Performance />
              </AdminModuleGate>
            ),
          },
          {
            path: "my-policies",
            element: (
              <AdminModuleGate moduleKey="policies">
                <MyPolicies />
              </AdminModuleGate>
            ),
          },
          {
            path: "policies",
            element: (
              <AdminModuleGate moduleKey="policies">
                <Policies />
              </AdminModuleGate>
            ),
          },
          {
            path: "expenses",
            element: (
              <AdminModuleGate moduleKey="expenses">
                <Expenses />
              </AdminModuleGate>
            ),
          },
          {
            path: "onboarding",
            element: (
              <AdminModuleGate moduleKey="onboarding">
                <Onboarding />
              </AdminModuleGate>
            ),
          },
          {
            path: "exit-management",
            element: (
              <AdminModuleGate moduleKey="exit-management">
                <ExitManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "letters",
            element: (
              <AdminModuleGate moduleKey="letter-templates">
                <LettersTemplates />
              </AdminModuleGate>
            ),
          },
          {
            path: "templates",
            element: (
              <AdminModuleGate moduleKey="letter-templates">
                <TemplateGenerator />
              </AdminModuleGate>
            ),
          },
          {
            path: "messages",
            element: (
              <AdminModuleGate moduleKey="messages">
                <Messages />
              </AdminModuleGate>
            ),
          },
          {
            path: "settings",
            element: (
              <AdminModuleGate moduleKey="system-settings">
                <AdminSettings />
              </AdminModuleGate>
            ),
          },
          {
            path: "settings/roles-permissions",
            element: (
              <AdminModuleGate moduleKey="system-settings">
                <RolesPermissions />
              </AdminModuleGate>
            ),
          },
          {
            path: "departments",
            element: (
              <AdminModuleGate moduleKey="departments">
                <DepartmentManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "designations",
            element: (
              <AdminModuleGate moduleKey="departments">
                <DesignationsManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "projects",
            element: (
              <AdminModuleGate moduleKey="system-settings">
                <ProjectManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "tasks",
            element: (
              <AdminModuleGate moduleKey="system-settings">
                <TaskManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "assets",
            element: (
              <AdminModuleGate moduleKey="assets">
                <AssetManagement />
              </AdminModuleGate>
            ),
          },
          {
            path: "reports",
            element: (
              <AdminModuleGate moduleKey="reports-analytics">
                <Reports />
              </AdminModuleGate>
            ),
          },
          {
            path: "announcements",
            element: (
              <AdminModuleGate moduleKey="announcements">
                <AnnouncementsPage />
              </AdminModuleGate>
            ),
          },
          {
            path: "payroll",
            element: (
              <AdminModuleGate
                moduleKey={["billing-invoicing", "payroll-management"]}
              >
                <Payroll />
              </AdminModuleGate>
            ),
          },
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
          { path: "system-health", element: <SystemHealth /> },
          { path: "modules", element: <ModuleManagement /> },
          { path: "tenants", element: <TenantManagement /> },
          { path: "subscriptions", element: <SubscriptionsPlans /> },
          { path: "subscription-features", element: <SubscriptionFeatures /> },
          { path: "billing", element: <Billing /> },
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
              { path: "account", element: <Navigate to="account-settings" replace /> },
              { path: "account-settings", element: <AccountSettings /> },
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

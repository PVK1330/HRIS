/* eslint-disable react-refresh/only-export-components -- router module exports router + default app */
import { lazy, Suspense } from "react";
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
const Login = lazy(() => import("../pages/auth/Login.jsx"));

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
import AdminSettings from "../pages/admin/AdminSettings.jsx";
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
import ManagerPerformance from "../pages/admin/hr/ManagerPerformance.jsx";

const PlatformDashboard = lazy(() => import("../pages/superadmin/platform/Dashboard.jsx"));
const TenantManagement = lazy(() => import("../pages/superadmin/tenants/TenantManagement.jsx"));
const SubscriptionsPlans = lazy(() => import("../pages/superadmin/subscriptions/SubscriptionsPlans.jsx"));
const SubscriptionFeatures = lazy(() => import("../pages/superadmin/subscriptions/SubscriptionFeatures.jsx"));
const Billing = lazy(() => import("../pages/superadmin/billing/Billing.jsx"));
const Announcements = lazy(() => import("../pages/superadmin/platform/Announcements.jsx"));
const ModuleManagement = lazy(() => import("../pages/superadmin/platform/ModuleManagement.jsx"));
const AuditLogs = lazy(() => import("../pages/superadmin/system/AuditLogs.jsx"));
const SystemHealth = lazy(() => import("../pages/superadmin/system/SystemHealth.jsx"));
const SupportTickets = lazy(() => import("../pages/superadmin/support/SupportTickets.jsx"));
const AdminUsers = lazy(() => import("../pages/superadmin/AdminUsers.jsx"));
const Permissions = lazy(() => import("../pages/superadmin/Permissions.jsx"));
const SuperProfile = lazy(() => import("../pages/superadmin/Profile.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const CandidateOffer = lazy(() => import("../pages/public/onboarding/CandidateOffer.jsx"));
const CandidateSign = lazy(() => import("../pages/public/onboarding/CandidateSign.jsx"));
const CandidateDocuments = lazy(() => import("../pages/public/onboarding/CandidateDocuments.jsx"));

const SettingsLayout = lazy(() => import("../pages/superadmin/settings/SettingsLayout.jsx"));
const GeneralSettings = lazy(() => import("../pages/superadmin/settings/GeneralSettings.jsx"));
const CompanyDetails = lazy(() => import("../pages/superadmin/settings/CompanyDetails.jsx"));
const LogoSettings = lazy(() => import("../pages/superadmin/settings/LogoSettings.jsx"));
const SystemInfo = lazy(() => import("../pages/superadmin/settings/SystemInfo.jsx"));
const EmailSettingsPage = lazy(() => import("../pages/superadmin/settings/email/EmailSettings.jsx"));
const EmailTemplatesPage = lazy(() => import("../pages/superadmin/settings/email/EmailTemplates.jsx"));
const EmailLogPage = lazy(() => import("../pages/superadmin/settings/email/EmailLog.jsx"));
const FreeTrialSettings = lazy(() => import("../pages/superadmin/settings/FreeTrialSettings.jsx"));
const PaymentGatewaySettings = lazy(() => import("../pages/superadmin/settings/PaymentGatewaySettings.jsx"));
const DomainSettings = lazy(() => import("../pages/superadmin/settings/DomainSettings.jsx"));
const AccountSettings = lazy(() => import("../pages/superadmin/settings/AccountSettings.jsx"));
const CurrencySettings = lazy(() => import("../pages/superadmin/settings/CurrencySettings.jsx"));
const RecaptchaSettings = lazy(() => import("../pages/superadmin/settings/RecaptchaSettings.jsx"));

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
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
      <Outlet />
    </Suspense>
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
            path: "manager-performance",
            element: (
              <AdminModuleGate
                moduleKey={["performance", "training-development"]}
              >
                <ManagerPerformance />
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

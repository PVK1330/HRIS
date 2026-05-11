import { useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HiArrowRightOnRectangle,
  HiBars3,
  HiBuildingOffice,
  HiCalendar,
  HiChartBar,
  HiClipboardDocumentCheck,
  HiClock,
  HiCog6Tooth,
  HiCreditCard,
  HiCurrencyDollar,
  HiDocument,
  HiDocumentText,
  HiEnvelope,
  HiFlag,
  HiFolder,
  HiSquares2X2,
  HiUserPlus,
  HiUsers,
  HiBriefcase,
  HiMegaphone,
  HiChartPie,
  HiIdentification,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { Sidebar } from "../components/ui/Sidebar.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import NotificationDropdown from "../components/layout/NotificationDropdown.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useTenantLogo from "../hooks/useTenantLogo.js";

const adminNavGroups = [
  {
    groupLabel: "MANAGEMENT",
    items: [
      {
        label: "Dashboard",
        icon: HiSquares2X2,
        path: "/admin/dashboard",
        key: "dashboard",
        permission: "view_dashboard",
      },
      {
        label: "Attendance",
        icon: HiClock,
        path: "/admin/attendance",
        key: "attendance",
        permission: "view_attendance",
        featureCode: "attendance",
      },
      {
        label: "Leave & Absence",
        icon: HiCalendar,
        path: "/admin/leave",
        key: "leave-absence",
        permission: "view_leave",
        featureCode: "leave",
      },
      {
        label: "Documents & Approval",
        icon: HiDocument,
        path: "/admin/documents",
        key: "documents-approval",
        permission: "view_documents",
      },
      {
        label: "Visa & Nationality",
        icon: HiCreditCard,
        path: "/admin/visa",
        key: "visa-nationality",
        permission: "view_visa",
        featureCode: "visa",
      },
      {
        label: "Assets",
        icon: HiBriefcase,
        path: "/admin/assets",
        key: "assets",
        permission: "view_assets",
        featureCode: "asset_management",
      },
    ],
  },
  {
    groupLabel: "HR OPERATIONS",
    items: [
      {
        label: "Performance",
        icon: HiChartBar,
        path: "/admin/performance",
        key: "performance",
        permission: "view_performance",
        featureCode: "performance",
      },
      /*
            {
              label: "Training & Development",
              icon: HiChartBar,
              path: "/admin/performance",
              key: "training-development",
              permission: "view_performance",
              featureCode: "training_development",
            },
      */
      {
        label: "Policies",
        icon: HiClipboardDocumentCheck,
        path: "/admin/policies",
        key: "policies",
        permission: "view_policies",
      },
      {
        label: "Expenses",
        icon: HiCurrencyDollar,
        path: "/admin/expenses",
        key: "expenses",
        permission: "view_expenses",
        featureCode: "expenses",
      },
      /*
            {
              label: "Billing & Invoicing",
              icon: HiCurrencyDollar,
              path: "/admin/payroll",
              key: "billing-invoicing",
              permission: "view_payroll",
              featureCode: "billing_invoicing",
            },
      */
      {
        label: "Onboarding",
        icon: HiUserPlus,
        path: "/admin/onboarding",
        key: "onboarding",
        permission: "view_onboarding",
        featureCode: "onboarding_exit",
      },
      {
        label: "Exit Management",
        icon: HiArrowRightOnRectangle,
        path: "/admin/exit-management",
        key: "exit-management",
        permission: "view_exit",
        featureCode: "onboarding_exit",
      },
      {
        label: "Letter Templates",
        icon: HiEnvelope,
        path: "/admin/letters",
        key: "letter-templates",
        permission: "view_letters",
        featureCode: "template_generation",
      },
      /*
            {
              label: "Reports & Analytics",
              icon: HiChartPie,
              path: "/admin/reports",
              key: "reports-analytics",
              permission: "view_reports",
              featureCode: "reports_analytics",
            },
      */
      {
        label: "Announcements",
        icon: HiMegaphone,
        path: "/admin/announcements",
        key: "announcements",
        permission: "view_announcements",
      },
      {
        label: "Payroll Management",
        icon: HiCurrencyDollar,
        path: "/admin/payroll",
        key: "payroll-management",
        permission: "view_payroll",
        featureCode: "payroll",
      },
      /*
            {
              label: "Time Tracking",
              icon: HiClock,
              path: "/admin/attendance",
              key: "time-tracking",
              permission: "view_attendance",
              featureCode: "time_tracking",
            },
            {
              label: "Shift Management",
              icon: HiCalendar,
              path: "/admin/attendance",
              key: "shift-management",
              permission: "view_attendance",
              featureCode: "shift_management",
            },
            {
              label: "Overtime Management",
              icon: HiClock,
              path: "/admin/attendance",
              key: "overtime-management",
              permission: "view_attendance",
              featureCode: "overtime_management",
            },
      */
    ],
  },
  {
    groupLabel: "EMPLOYEES",
    items: [

      {
        label: "Employee Lists",
        icon: HiUsers,
        path: "/admin/employee-directory",
        key: "employee-directory",
        permission: "view_employees",
        featureCode: "employee_directory",
      },
      {
        label: "Employee Grid",
        icon: HiUsers,
        path: "/admin/employee-grid",
        key: "employee-grid",
        permission: "view_employees",
        featureCode: "employee_directory",
      },
      {
        label: "Employee Details",
        icon: HiIdentification,
        path: "/admin/employee-profile",
        key: "employee-profiles",
        permission: "view_employees",
        featureCode: "employee_directory",
      },
      {
        label: "Departments",
        icon: HiBuildingOffice,
        path: "/admin/departments",
        key: "departments",
        permission: "edit_settings",
        featureCode: "department",
      },
      {
        label: "Designations",
        icon: HiIdentification,
        path: "/admin/designations",
        key: "designations",
        permission: "edit_settings",
        featureCode: "designations",
      },
      {
        label: "Messages",
        icon: HiChatBubbleLeftRight,
        path: "/admin/messages",
        key: "messages",
        permission: "edit_settings",
        featureCode: "messages",
      },

      // { label: 'Projects', icon: HiFolder, path: '/admin/projects', permission: 'edit_settings', featureCode: 'projects' },
      // { label: 'Tasks', icon: HiFlag, path: '/admin/tasks', permission: 'edit_settings', featureCode: 'task_management' },
      // { label: 'Template Generator', icon: HiDocumentText, path: '/admin/templates', permission: 'edit_settings', featureCode: 'template_generation' },
    ],
  },
  {
    groupLabel: "ADMINISTRATION",
    items: [
      {
        label: "System Settings",
        icon: HiCog6Tooth,
        path: "/admin/settings",
        key: "system-settings",
        permission: "edit_settings",
        featureCode: "settings",
      },
    ],
  },
];

function titleCaseSegment(seg) {
  return seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ROLE_DISPLAY = {
  admin: "HR Admin",
  hr_admin: "HR Admin",
  hr_executive: "HR Executive",
  manager: "Manager",
  employee: "Employee",
};

const FEATURE_PATH_MAP = {
  employee_management: ["/admin/employee-directory", "/admin/employee-profile"],
  employee_directory: ["/admin/employee-directory", "/admin/employee-profile"],
  employee_grid: ["/admin/employee-grid"],
  attendance_tracking: ["/admin/attendance"],
  attendance: ["/admin/attendance"],
  leave_management: ["/admin/leave"],
  leave: ["/admin/leave"],
  document_management: ["/admin/documents"],
  documents: ["/admin/documents"],
  performance_management: ["/admin/performance"],
  performance_reviews: ["/admin/performance"],
  performance: ["/admin/performance"],
  payroll_management: ["/admin/payroll"],
  payroll: ["/admin/payroll"],
  expense_management: ["/admin/expenses"],
  expenses: ["/admin/expenses"],
  policies: ["/admin/policies"],
  announcements: ["/admin/announcements"],
  visa_management: ["/admin/visa"],
  visa: ["/admin/visa"],
  visa_nationality: ["/admin/visa"],
  "visa_&_nationality": ["/admin/visa"],
  asset_management: ["/admin/assets"],
  asset_inventory: ["/admin/assets"],
  onboarding_exit: ["/admin/onboarding", "/admin/exit-management"],
  onboarding: ["/admin/onboarding"],
  exit_management: ["/admin/exit-management"],
  department: ["/admin/departments"],
  departments: ["/admin/departments"],
  designation: ["/admin/designations"],
  designations: ["/admin/designations"],
  message_center: ["/admin/messages"],
  messages: ["/admin/messages"],
  reports_analytics: ["/admin/reports"],
  settings: ["/admin/settings"],
  system_settings: ["/admin/settings"],
  payroll_invoicing: ["/admin/payroll"],
  template_generation: ["/admin/templates"],
  task_management: ["/admin/tasks"],
  projects: ["/admin/projects"],
  time_tracking: ["/admin/attendance"],
  shift_management: ["/admin/attendance"],
  overtime_management: ["/admin/attendance"],
  training_development: ["/admin/performance"],
  billing_invoicing: ["/admin/payroll"],
};

function normalizeFeatureCode(code) {
  return String(code || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "_and_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function AdminLayout() {
  const { user, logout, hasPermission, hasFeatureAccess, switchRole } =
    useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const filteredNavGroups = useMemo(() => {
    const tenantFeatures = user?.tenant_features || [];
    const hasAssignedFeatures = tenantFeatures.length > 0;

    const enabledFeatureCodes = new Set(
      tenantFeatures.filter((f) => f.is_enabled).map((f) => f.feature_code),
    );
    const allowedFeaturePaths = new Set();
    enabledFeatureCodes.forEach((code) => {
      const rawCode = String(code || "").toLowerCase();
      const normalizedCode = normalizeFeatureCode(code);
      const paths = [
        ...(FEATURE_PATH_MAP[rawCode] || []),
        ...(FEATURE_PATH_MAP[normalizedCode] || []),
      ];
      paths.forEach((path) => allowedFeaturePaths.add(path));
    });

    return adminNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          // Real tenant admin (role === 'admin') from API login:
          // If the tenant has features assigned, filter by those features.
          // If no features are assigned yet (new tenant / not configured), show everything.
          if (user?.role === "admin") {
            /* Dashboard + system settings are core tenant shell; always visible even if missing from subscription feature rows */
            const alwaysShowPaths = ["/admin/dashboard", "/admin/settings"];
            if (
              hasAssignedFeatures &&
              !alwaysShowPaths.includes(item.path)
            ) {
              const normalizedItemFeature = normalizeFeatureCode(
                item.featureCode,
              );
              const itemFeatureEnabled =
                !!item.featureCode &&
                [...enabledFeatureCodes].some(
                  (code) =>
                    normalizeFeatureCode(code) === normalizedItemFeature,
                );

              if (!allowedFeaturePaths.has(item.path) && !itemFeatureEnabled) {
                return false;
              }
            }
            return true;
          }

          // Mock / non-tenant roles: apply featureCode + permission checks
          if (item.featureCode && !hasFeatureAccess(item.featureCode))
            return false;
          if (!item.permission) return true;
          if (item.path === "/admin/dashboard") return true;

          if (
            item.permission === "view_employees" &&
            (user.role === "hr_admin" ||
              user.role === "hr_executive" ||
              user.role === "manager")
          )
            return true;
          if (item.permission === "view_attendance") return true;
          if (item.permission === "view_leave") return true;
          if (
            item.permission === "view_documents" &&
            (user.role === "hr_admin" ||
              user.role === "hr_executive" ||
              user.role === "employee")
          )
            return true;
          if (
            item.permission === "view_visa" &&
            (user.role === "hr_admin" || user.role === "hr_executive")
          )
            return true;
          if (
            item.permission === "view_assets" &&
            (user.role === "hr_admin" ||
              user.role === "hr_executive" ||
              user.role === "employee")
          )
            return true;
          if (item.permission === "view_performance") return true;
          if (item.permission === "view_policies") return true;
          if (item.permission === "view_expenses") return true;
          if (
            item.permission === "view_onboarding" &&
            (user.role === "hr_admin" || user.role === "hr_executive")
          )
            return true;
          if (
            item.permission === "view_exit" &&
            (user.role === "hr_admin" || user.role === "hr_executive")
          )
            return true;
          if (item.permission === "view_letters" && user.role === "hr_admin")
            return true;
          if (item.permission === "view_announcements") return true;
          if (item.permission === "view_messages") return true;
          if (item.permission === "view_payroll" && user.role === "hr_admin")
            return true;
          if (item.permission === "edit_settings" && user.role === "hr_admin")
            return true;

          return hasPermission(item.permission);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [user, hasPermission, hasFeatureAccess]);

  const breadcrumb = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts[0] !== "admin") return ["Home", "Admin"];
    const crumbs = ["Home", "Admin"];
    if (parts[1]) crumbs.push(titleCaseSegment(parts[1]));
    return crumbs;
  }, [location.pathname]);

  const sidebarBrandLabel =
    user?.companyName ??
    user?.company_name ??
    user?.tenant_name ??
    user?.tenantName ??
    "HRIS";

  const { logoUrl, loading: logoLoading } = useTenantLogo();

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#F9FAFB]">
      {/* Dev Role Indicator Banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[#0E9F6E] shadow-[0_1px_10px_rgba(14,159,110,0.45)]" />

      <Sidebar
        navGroups={filteredNavGroups}
        role={user?.role}
        user={user}
        onLogout={logout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        logoUrl={logoUrl ?? undefined}
        logoLoading={logoLoading}
        logoFallbackLabel={sidebarBrandLabel}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:pl-64">
        <header className="z-30 flex h-12 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F9FAFB] md:hidden transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <HiBars3 className="h-6 w-6" />
            </button>
            <nav className="hidden min-w-0 max-w-[50vw] truncate text-xs sm:flex sm:items-center sm:gap-2">
              {breadcrumb.map((c, i) => (
                <span key={`${c}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#E5E7EB]">/</span>}
                  {i === 0 ? (
                    <Link
                      to="/admin/dashboard"
                      className="text-[#6B7280] hover:text-[#0E9F6E] transition-colors font-medium"
                    >
                      {c}
                    </Link>
                  ) : (
                    <span
                      className={
                        i === breadcrumb.length - 1
                          ? "font-semibold text-[#1C242E] bg-[#F9FAFB] px-2 py-0.5 rounded-md"
                          : "text-[#6B7280]"
                      }
                    >
                      {c}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dev Role Switcher — only for mock roles */}
            {user?.role !== "admin" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center gap-2 rounded-lg bg-[#F9FAFB] px-3 py-1.5 text-[11px] font-bold text-[#0E9F6E] transition-all hover:bg-[#E5E7EB] ring-1 ring-[#E5E7EB]"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#0E9F6E] animate-pulse" />
                  <span>{ROLE_DISPLAY[user?.role]}</span>
                  <span className="text-[10px] opacity-40">▼</span>
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-[#E5E7EB] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                      Select Access Level
                    </div>
                    {Object.entries(ROLE_DISPLAY)
                      .filter(([k]) => k !== "admin")
                      .map(([roleKey, label]) => (
                        <button
                          key={roleKey}
                          className={`w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-all ${user?.role === roleKey ? "bg-[#F9FAFB] text-[#0E9F6E] ring-1 ring-[#E5E7EB]" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}
                          onClick={() => {
                            switchRole(roleKey);
                            setShowRoleSwitcher(false);
                          }}
                        >
                          {label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
            {/* Role badge for real tenant admin */}
            {user?.role === "admin" && (
              <div className="flex items-center gap-2 rounded-lg bg-[#F9FAFB] px-3 py-1.5 text-[11px] font-bold text-[#0E9F6E] ring-1 ring-[#E5E7EB]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#0E9F6E]" />
                <span>HR Admin</span>
              </div>
            )}

            <NotificationDropdown />
            <Link
              to="/admin/employee-profile"
              className="hidden items-center gap-3 sm:flex group bg-[#F9FAFB] pl-3 pr-1 py-1 rounded-lg border border-[#E5E7EB] hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <div className="min-w-0 text-right">
                <div className="truncate text-sm font-bold text-[#1C242E] group-hover:text-[#0E9F6E] transition-colors leading-none">
                  {user?.name}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.1em] text-[#6B7280] mt-1">
                  SECURE ACCESS
                </div>
              </div>
              <Avatar
                name={user?.name}
                size="sm"
                className="ring-2 ring-white shadow-sm group-hover:ring-[#E5E7EB] transition-all"
              />
            </Link>
            <button
              onClick={logout}
              className="p-2 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <HiArrowRightOnRectangle className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#F9FAFB] p-4">
          <div className="mx-auto min-w-0 max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

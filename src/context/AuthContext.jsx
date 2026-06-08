/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import {
  hasModuleAccess,
  resolvePlanFeatureKey,
  expandModuleKeysForGate,
} from "../constants/permissions.js";

const STORAGE_KEY = "hris_auth_user";

function normalizeTenantFeatureCode(code) {
  return String(code || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "_and_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const TENANT_FEATURE_CODE_TO_MODULE_KEYS = {
  employee_management: ["employee-directory", "employee-profiles"],
  employee_directory: ["employee-directory", "employee-profiles"],
  attendance_tracking: [
    "attendance",
    "time-tracking",
    "shift-management",
    "overtime-management",
  ],
  attendance: ["attendance"],
  leave_management: ["leave-absence"],
  leave: ["leave-absence"],
  document_management: ["documents-approval"],
  documents: ["documents-approval"],
  performance_management: ["performance"],
  performance_reviews: ["performance"],
  performance: ["performance"],
  onboarding: ["onboarding"],
  exit_management: ["exit-management"],
  onboarding_exit: ["onboarding", "exit-management"],
  payroll: ["payroll-management"],
  payroll_management: ["payroll-management"],
  expense_management: ["expenses"],
  expenses: ["expenses"],
  billing_invoicing: ["billing-invoicing"],
  template_generation: ["letter-templates"],
  policies: ["policies"],
  reports_analytics: ["reports-analytics"],
  announcements: ["announcements"],
  asset_management: ["assets"],
  time_tracking: ["time-tracking"],
  shift_management: ["shift-management"],
  overtime_management: ["overtime-management"],
  training_development: ["training-development"],
  department: ["departments", "designations"],
  departments: ["departments", "designations"],
  designation: ["departments", "designations"],
  designations: ["departments", "designations"],
  projects: [],
  task_management: ["tasks"],
  messages: ["messages"],
  message_center: ["messages"],
  visa_management: ["visa-nationality"],
  visa: ["visa-nationality"],
  visa_nationality: ["visa-nationality"],
  visa_and_nationality: ["visa-nationality"],
  settings: ["system-settings"],
  system_settings: ["system-settings"],
};

function moduleKeysForTenantFeatureCodes(tenantFeatures) {
  const out = new Set();
  const list = Array.isArray(tenantFeatures) ? tenantFeatures : [];
  for (const f of list) {
    if (f?.is_enabled === false) continue;
    const raw = String(f?.feature_code || "");
    const norm = normalizeTenantFeatureCode(raw);
    const synonyms = [norm, raw.toLowerCase().trim()].filter(Boolean);
    for (const syn of synonyms) {
      let keys =
        TENANT_FEATURE_CODE_TO_MODULE_KEYS[syn] ||
        TENANT_FEATURE_CODE_TO_MODULE_KEYS[normalizeTenantFeatureCode(syn)];

      /* legacy / alternate codes */
      if (!keys && syn === "documents")
        keys = TENANT_FEATURE_CODE_TO_MODULE_KEYS.document_management;
      if (!keys && syn === "onboarding_exit")
        keys = TENANT_FEATURE_CODE_TO_MODULE_KEYS.onboarding_exit;

      for (const mk of keys || []) out.add(mk);
    }
  }
  return out;
}

function computePlanModuleKeysForTenantUser(userRole, tenantFeatures) {
  if (userRole !== "admin" && userRole !== "employee") return undefined;

  const list = tenantFeatures;
  if (!Array.isArray(list) || list.length === 0) return null;

  const enabledRows = list.filter((f) => f?.is_enabled !== false);
  if (enabledRows.length === 0) return new Set();

  const keys = moduleKeysForTenantFeatureCodes(list);
  if (userRole === "admin") {
    keys.add("system-settings");
  }
  return keys;
}

const PERMISSIONS = {
  admin: ["*"],
  hr_admin: ["*"], // ALL permissions
  hr_executive: [
    "view_employees",
    "view_attendance",
    "approve_leave",
    "view_documents",
    "approve_documents",
    "view_performance",
    "view_leave",
    "create_policies",
    "view_reports",
  ],
  manager: [
    "view_team_employees",
    "view_team_attendance",
    "approve_team_leave",
    "view_team_performance",
  ],
  employee: [
    "view_own_profile",
    "view_own_attendance",
    "view_own_leave",
    "view_own_documents",
    "view_own_payslips",
    "submit_expense",
    "view_expenses",
  ],
  superadmin: ["*"],
  support_admin: [
    "view_tenants",
    "view_audit_logs",
    "view_support_tickets",
    "view_system_health",
  ],
  billing_admin: ["view_billing", "manage_subscriptions", "view_tenants"],
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [allowedModules, setAllowedModules] = useState(() => {
    try {
      const stored = localStorage.getItem("allowedModules");
      return stored ? JSON.parse(stored) : ["dashboard"];
    } catch {
      return ["dashboard"];
    }
  });

  const planModuleKeys = useMemo(() => {
    const keys = computePlanModuleKeysForTenantUser(
      user?.role,
      user?.tenant_features,
    );
    if (keys instanceof Set) {
      const mods = expandModuleKeysForGate(allowedModules);
      if (mods.has("system-settings")) keys.add("system-settings");
    }
    return keys;
  }, [user?.role, user?.tenant_features, allowedModules]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);


  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      const userPermissions = user.permissions || PERMISSIONS[user.role] || [];
      if (userPermissions.includes("*")) return true;
      if (userPermissions.includes(permission)) return true;
      // Check for module wildcard (e.g. assets.* for assets.create)
      const parts = permission.split('.');
      if (parts.length > 1 && userPermissions.includes(`${parts[0]}.*`)) {
        return true;
      }
      return false;
    },
    [user],
  );

  const hasFeatureAccess = useCallback(
    (featureCode) => {
      if (!user) return false;
      if (!featureCode) return true;
      if (user.role !== "admin") return true;
      const features = user.tenant_features || [];
      return features.some(
        (f) => f.feature_code === featureCode && f.is_enabled !== false,
      );
    },
    [user],
  );

  const hasModule = useCallback(
    (key) => {
      /* Messages: always available to logged-in tenant users */
      if (key === "messages") return true;
      if (key === "dashboard") return true;

      if (!hasModuleAccess(allowedModules, key, user?.role)) {
        return false;
      }
      if (key === "system-settings" && user?.role === "admin") {
        return true;
      }
      if (user?.role === "admin" && planModuleKeys instanceof Set) {
        const planKey = resolvePlanFeatureKey(key);
        return planModuleKeys.has(planKey) || planModuleKeys.has(key);
      }
      return true;
    },
    [allowedModules, planModuleKeys, user?.role],
  );

  const login = useCallback(
    (
      userData,
      token,
      planDetails = [],
      planFeatures = [],
      tenantFeatures = [],
      allowedModulesFromResponse,
    ) => {
      const finalUser = {
        ...userData,
        panel: userData.role === "superadmin" ? "superadmin" : "admin",
        plan_details: planDetails,
        plan_features: planFeatures,
        tenant_features: tenantFeatures,
        permissions: userData.permissions || [],
      };
      const nextMods = Array.isArray(allowedModulesFromResponse)
        ? allowedModulesFromResponse
        : ["dashboard"];
      setAllowedModules(nextMods);
      localStorage.setItem("allowedModules", JSON.stringify(nextMods));
      setUser(finalUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalUser));
      localStorage.setItem("hris_token", token);
    },
    [],
  );

  const refreshAccessProfile = useCallback(async () => {
    const current = userRef.current;
    if (!current || !["admin", "employee"].includes(current.role)) return;
    try {
      const response = await api.get("/auth/access-profile");
      const data = response?.data?.data;
      if (!data) return;

      setUser((prev) => {
        if (!prev || !["admin", "employee"].includes(prev.role)) return prev;
        const next = {
          ...prev,
          plan_details: data.plan_details || [],
          tenant_features: data.tenant_features || [],
          permissions: data.permissions || prev.permissions || [],
          dataScope: data.dataScope ?? prev.dataScope ?? null,
          billing: data.billing ?? prev.billing ?? null,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      const apiMods = data?.allowedModules ?? data?.allowed_modules;
      if (Array.isArray(apiMods)) {
        setAllowedModules(apiMods);
        localStorage.setItem("allowedModules", JSON.stringify(apiMods));
      }
    } catch (error) {
      console.error("Failed to refresh access profile:", error);
    }
  }, []);

  const adminSessionKey =
    user?.role === "admin" || user?.role === "employee"
      ? `${user.email ?? ""}:${user.id ?? ""}:${user.role}`
      : null;

  useEffect(() => {
    if (!adminSessionKey) return;
    refreshAccessProfile();
    const id = window.setInterval(refreshAccessProfile, 180000);
    return () => window.clearInterval(id);
  }, [adminSessionKey, refreshAccessProfile]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore — cookie is cleared by the server on success; expired sessions
      // should still complete the local logout regardless.
    }
    setUser(null);
    setAllowedModules([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("allowedModules");
    localStorage.removeItem("hris_token");
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "";
    const target = `${base}/login`.replace(/\/+/g, "/") || "/login";
    window.location.replace(
      target.startsWith("http") ? target : `${window.location.origin}${target}`,
    );
  }, []);

  const billing = user?.billing ?? null;
  // Only tenant users (admin/employee) can be paywalled; superadmins never are.
  const paymentRequired =
    !!billing?.payment_required &&
    (user?.role === "admin" || user?.role === "employee");

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      hasPermission,
      hasFeatureAccess,
      refreshAccessProfile,
      allowedModules,
      hasModule,
      billing,
      paymentRequired,
    }),
    [
      user,
      login,
      logout,
      hasPermission,
      hasFeatureAccess,
      refreshAccessProfile,
      allowedModules,
      hasModule,
      billing,
      paymentRequired,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

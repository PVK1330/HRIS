/**
 * Mirrors HRIS_API permission aliases for sidebar / module gates.
 * Legacy keys match rbac_permissions.key in tenant DB.
 */

export const LEGACY_MODULE_KEYS = {
  EMPLOYEE_DIRECTORY: 'employee-directory',
  EMPLOYEE_PROFILES: 'employee-profiles',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave-absence',
  DOCUMENTS: 'documents-approval',
  VISA: 'visa-nationality',
  PERFORMANCE: 'performance',
  PAYROLL: 'payroll-management',
  DEPARTMENTS: 'departments',
  DESIGNATIONS: 'designations',
  POLICIES: 'policies',
  MESSAGES: 'messages',
  LETTERS: 'letter-templates',
  ASSETS: 'assets',
  TASKS: 'tasks',
}

/** If API returns action slugs in allowedModules, map to legacy sidebar keys */
const ACTION_TO_LEGACY = {
  'employee.view': [LEGACY_MODULE_KEYS.EMPLOYEE_DIRECTORY, LEGACY_MODULE_KEYS.EMPLOYEE_PROFILES],
  'employee.create': [LEGACY_MODULE_KEYS.EMPLOYEE_DIRECTORY],
  'employee.edit': [LEGACY_MODULE_KEYS.EMPLOYEE_PROFILES],
  'attendance.view': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.view.own': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.view.team': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.view.all': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.create': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.regularization.request': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.approve': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.reject': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.manage': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.settings.view': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'attendance.settings.manage': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'time-tracking': [LEGACY_MODULE_KEYS.ATTENDANCE],
  'leave.view': [LEGACY_MODULE_KEYS.LEAVE],
  'leave.approve': [LEGACY_MODULE_KEYS.LEAVE],
  'document.view': [LEGACY_MODULE_KEYS.DOCUMENTS],
  'document.upload': [LEGACY_MODULE_KEYS.DOCUMENTS],
  'payroll.view': [LEGACY_MODULE_KEYS.PAYROLL],
  'performance.view': [LEGACY_MODULE_KEYS.PERFORMANCE],
  'visa.view': [LEGACY_MODULE_KEYS.VISA],
  'visa.manage': [LEGACY_MODULE_KEYS.VISA],
  'departments.manage': [LEGACY_MODULE_KEYS.DEPARTMENTS, 'designations'],
  'policies.manage': [LEGACY_MODULE_KEYS.POLICIES],
  'policies.view': [LEGACY_MODULE_KEYS.POLICIES],
  'policies.acknowledge': [LEGACY_MODULE_KEYS.POLICIES],
  'messages.view': [LEGACY_MODULE_KEYS.MESSAGES],
  'assets.view': [LEGACY_MODULE_KEYS.ASSETS],
  'tasks': [LEGACY_MODULE_KEYS.TASKS],
}

/** Sidebar keys for org structure — one permission gates both */
export const ORG_STRUCTURE_MODULE_KEYS = [
  LEGACY_MODULE_KEYS.DEPARTMENTS,
  LEGACY_MODULE_KEYS.DESIGNATIONS,
]

/** Nav item keys that share access with another module key */
export const MODULE_KEY_ALIASES = {
  'employee-grid': LEGACY_MODULE_KEYS.EMPLOYEE_DIRECTORY,
  designations: LEGACY_MODULE_KEYS.DEPARTMENTS,
  departments: LEGACY_MODULE_KEYS.DEPARTMENTS,
}

/** True if role may access departments and/or designations */
export function hasOrgStructureAccess(allowedModules, userRole) {
  return ORG_STRUCTURE_MODULE_KEYS.some((key) =>
    hasModuleAccess(allowedModules, key, userRole),
  )
}

export function resolvePlanFeatureKey(key) {
  return MODULE_KEY_ALIASES[key] || key
}

export function expandModuleKeysForGate(allowedModules) {
  const set = new Set(allowedModules || [])
  for (const key of [...set]) {
    if (ACTION_TO_LEGACY[key]) {
      ACTION_TO_LEGACY[key].forEach((l) => set.add(l))
    }
  }
  for (const [alias, canonical] of Object.entries(MODULE_KEY_ALIASES)) {
    if (set.has(canonical)) set.add(alias)
  }
  return set
}

export function hasModuleAccess(allowedModules, key, userRole) {
  if (key === 'dashboard') return true
  if (!key) return true
  if (key === 'messages') return true

  const privileged = ['admin', 'hr_admin', 'hr_executive', 'manager'].includes(userRole)
  if (key === 'system-settings' && privileged) return true

  const expanded = expandModuleKeysForGate(allowedModules)
  if (expanded.has(key)) return true

  const canonical = MODULE_KEY_ALIASES[key]
  if (canonical && expanded.has(canonical)) return true

  return (allowedModules || []).includes(key)
}

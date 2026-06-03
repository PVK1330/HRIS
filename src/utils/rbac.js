/**
 * Strict RBAC helpers — only explicit permission slugs from login / access-profile.
 * Legacy sidebar keys (e.g. "attendance") must NOT imply attendance.create.
 */

function asSet(allowedModules) {
  return new Set(Array.isArray(allowedModules) ? allowedModules : [])
}

/** Exact slug match only (attendance.create, attendance.view.own, …). */
export function hasRbacSlug(allowedModules, slug) {
  if (!slug) return false
  return asSet(allowedModules).has(slug)
}

export function canPunchAttendance(allowedModules) {
  return hasRbacSlug(allowedModules, 'attendance.create')
}

export function canViewOwnAttendance(allowedModules) {
  return (
    hasRbacSlug(allowedModules, 'attendance.view.own')
    || hasRbacSlug(allowedModules, 'attendance.view.team')
    || hasRbacSlug(allowedModules, 'attendance.view.all')
    || hasRbacSlug(allowedModules, 'attendance.manage')
  )
}

export function canViewTeamAttendance(allowedModules) {
  return (
    hasRbacSlug(allowedModules, 'attendance.view.team')
    || hasRbacSlug(allowedModules, 'attendance.view.all')
    || hasRbacSlug(allowedModules, 'attendance.manage')
  )
}

export function canViewAllAttendance(allowedModules) {
  return (
    hasRbacSlug(allowedModules, 'attendance.view.all')
    || hasRbacSlug(allowedModules, 'attendance.manage')
  )
}

export function canManageAttendanceOverride(allowedModules) {
  return hasRbacSlug(allowedModules, 'attendance.manage')
}

export function canApproveRegularization(allowedModules) {
  return (
    hasRbacSlug(allowedModules, 'attendance.approve')
    || hasRbacSlug(allowedModules, 'attendance.reject')
    || hasRbacSlug(allowedModules, 'attendance.manage')
  )
}

export function canRequestRegularization(allowedModules) {
  return hasRbacSlug(allowedModules, 'attendance.regularization.request')
}

/** Sidebar / route gate: legacy module key OR any attendance.* slug */
export function canAccessAttendanceModule(allowedModules) {
  const mods = asSet(allowedModules)
  if (mods.has('attendance') || mods.has('time-tracking')) return true
  return [...mods].some((k) => String(k).startsWith('attendance.'))
}

import api from './api'

// Superadmin API endpoints used by frontend pages.
export const SUPERADMIN_ENDPOINTS = {
  ADMIN_USERS: '/superadmin/admin-users',
  ADMIN_USER_BY_ID: (id) => `/superadmin/admin-users/${id}`,
  PERMISSIONS: '/superadmin/permissions',
  PERMISSION_BY_ROLE_KEY: (roleKey) => `/superadmin/permissions/${roleKey}`,
  MODULES: '/superadmin/modules',
  MODULE_BY_KEY: (moduleKey) => `/superadmin/modules/${moduleKey}`,
  ANNOUNCEMENTS: '/superadmin/announcements',
  ANNOUNCEMENT_BY_ID: (id) => `/superadmin/announcements/${id}`,
  TENANTS: '/superadmin/tenants',
  TENANT_MODULES: (tenantId) => `/superadmin/tenants/${tenantId}/modules`,
  TENANT_MODULE_BY_KEY: (tenantId, moduleKey) => `/superadmin/tenants/${tenantId}/modules/${moduleKey}`,
}

export const superadminService = {
  // Admin Users
  getAdminUsers() {
    return api.get(SUPERADMIN_ENDPOINTS.ADMIN_USERS)
  },
  createAdminUser(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.ADMIN_USERS, payload)
  },
  updateAdminUser(id, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.ADMIN_USER_BY_ID(id), payload)
  },

  // Permissions / Roles
  getPermissions() {
    return api.get(SUPERADMIN_ENDPOINTS.PERMISSIONS)
  },
  createRole(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.PERMISSIONS, payload)
  },
  updateRole(roleKey, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.PERMISSION_BY_ROLE_KEY(roleKey), payload)
  },

  // Modules
  getModules() {
    return api.get(SUPERADMIN_ENDPOINTS.MODULES)
  },
  updateModule(moduleKey, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.MODULE_BY_KEY(moduleKey), payload)
  },
  getTenants() {
    return api.get(SUPERADMIN_ENDPOINTS.TENANTS)
  },
  getTenantModules(tenantId) {
    return api.get(SUPERADMIN_ENDPOINTS.TENANT_MODULES(tenantId))
  },
  updateTenantModule(tenantId, moduleKey, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.TENANT_MODULE_BY_KEY(tenantId, moduleKey), payload)
  },

  // Announcements
  getAnnouncements() {
    return api.get(SUPERADMIN_ENDPOINTS.ANNOUNCEMENTS)
  },
  createAnnouncement(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.ANNOUNCEMENTS, payload)
  },
  updateAnnouncement(id, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.ANNOUNCEMENT_BY_ID(id), payload)
  },
  deleteAnnouncement(id) {
    return api.delete(SUPERADMIN_ENDPOINTS.ANNOUNCEMENT_BY_ID(id))
  },
  getAnnouncementReport(id) {
    return api.get(`${SUPERADMIN_ENDPOINTS.ANNOUNCEMENT_BY_ID(id)}/report`)
  },
}

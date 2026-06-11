import api from './api'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const supportApi = axios.create({
  baseURL: `${API_URL}/api/v1/superadmin/support`,
})

supportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hris_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
  SUPPORT_TICKETS: '/tickets',
  SUPPORT_TICKET_BY_ID: (id) => `/tickets/${id}`,
  SUPPORT_TICKET_UPDATE: (id) => `/tickets/${id}`,
  SUPPORT_TICKET_STATUS: (id) => `/tickets/${id}/status`,
  SUPPORT_TICKET_REPLY: (id) => `/tickets/${id}/reply`,
  AUDIT_LOGS: '/superadmin/audit-logs',
  TENANTS: '/tenants',
  TENANT_MODULES: (tenantId) => `/tenants/${tenantId}/features`,
  TENANT_MODULE_BY_KEY: (tenantId, featureId) => `/tenants/${tenantId}/features/${featureId}`,
  FEATURES: '/superadmin/features',
  FEATURE_BY_ID: (id) => `/superadmin/features/${id}`,
  FEATURE_ACTIVATE: (id) => `/superadmin/features/${id}/activate`,
  FEATURE_DEACTIVATE: (id) => `/superadmin/features/${id}/deactivate`,
  PLANS: '/superadmin/plans',
  PLAN_BY_ID: (id) => `/superadmin/plans/${id}`,
  PLAN_FEATURES: (id) => `/superadmin/plans/${id}/features`,
  PAYMENTS: '/superadmin/payments',
  PAYMENT_STATS: '/superadmin/payments/stats',
  PAYMENT_MANUAL: '/superadmin/payments/manual',
  PAYMENT_STATUS: (id) => `/superadmin/payments/${id}/status`,
  PAYMENT_INVOICE_HTML: (id) => `/superadmin/payments/${id}/invoice-html`,
}

export const superadminService = {
  // Self-service 2FA (TOTP) for the logged-in superadmin / sub-admin
  async getMfaStatus() {
    const { data } = await api.get('/superadmin/mfa/status')
    return data.data
  },
  async setupMfa() {
    const { data } = await api.post('/superadmin/mfa/setup')
    return data.data
  },
  async enableMfa(code) {
    const { data } = await api.post('/superadmin/mfa/enable', { code })
    return data.data
  },
  async disableMfa(code) {
    const { data } = await api.post('/superadmin/mfa/disable', { code })
    return data.data
  },

  // Self-service profile for the logged-in superadmin / sub-admin
  async getProfile() {
    const { data } = await api.get('/superadmin/profile')
    return data.data?.profile ?? null
  },
  async updateProfile(payload) {
    const { data } = await api.put('/superadmin/profile', payload)
    return data.data?.profile ?? null
  },
  async changePassword({ currentPassword, newPassword }) {
    const { data } = await api.post('/auth/change-password', { currentPassword, newPassword })
    return data.data ?? null
  },

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
  deleteRole(roleKey) {
    return api.delete(SUPERADMIN_ENDPOINTS.PERMISSION_BY_ROLE_KEY(roleKey))
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
  updateTenantModule(tenantId, featureId, payload) {
    return api.patch(SUPERADMIN_ENDPOINTS.TENANT_MODULE_BY_KEY(tenantId, featureId), payload)
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
  getSupportTickets() {
    return supportApi.get(SUPERADMIN_ENDPOINTS.SUPPORT_TICKETS)
  },
  getSupportTicketById(id) {
    return supportApi.get(SUPERADMIN_ENDPOINTS.SUPPORT_TICKET_BY_ID(id))
  },
  updateSupportTicket(id, payload) {
    const body = {}
    if (payload.status != null) {
      body.status = payload.status
    }
    if (payload.message != null) {
      body.message = payload.message
    }
    if (payload.internalNotes != null) {
      body.internalNotes = payload.internalNotes
    }
    if (payload.assignedTo != null) {
      body.assignedTo = payload.assignedTo
    }
    return supportApi.patch(SUPERADMIN_ENDPOINTS.SUPPORT_TICKET_UPDATE(id), body)
  },
  deleteSupportTicket(id) {
    return supportApi.delete(SUPERADMIN_ENDPOINTS.SUPPORT_TICKET_UPDATE(id))
  },
  addSupportTicketMessage(id, payload) {
    const body = {
      message: payload.text || payload.message || '',
    }
    if (payload.internalNotes) {
      body.internalNotes = payload.internalNotes
    }
    return supportApi.post(SUPERADMIN_ENDPOINTS.SUPPORT_TICKET_REPLY(id), body)
  },
  getAuditLogs() {
    return api.get(SUPERADMIN_ENDPOINTS.AUDIT_LOGS)
  },

  // Features
  getFeatures(params) {
    return api.get(SUPERADMIN_ENDPOINTS.FEATURES, { params })
  },
  getActiveFeatures() {
    return api.get(`${SUPERADMIN_ENDPOINTS.FEATURES}/active`)
  },
  getFeatureById(id) {
    return api.get(SUPERADMIN_ENDPOINTS.FEATURE_BY_ID(id))
  },
  createFeature(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.FEATURES, payload)
  },
  updateFeature(id, payload) {
    return api.put(SUPERADMIN_ENDPOINTS.FEATURE_BY_ID(id), payload)
  },
  deleteFeature(id) {
    return api.delete(SUPERADMIN_ENDPOINTS.FEATURE_BY_ID(id))
  },
  activateFeature(id) {
    return api.post(SUPERADMIN_ENDPOINTS.FEATURE_ACTIVATE(id))
  },
  deactivateFeature(id) {
    return api.post(SUPERADMIN_ENDPOINTS.FEATURE_DEACTIVATE(id))
  },

  // Subscription plans
  getPlans(params) {
    return api.get(SUPERADMIN_ENDPOINTS.PLANS, { params })
  },
  getPlanById(id) {
    return api.get(SUPERADMIN_ENDPOINTS.PLAN_BY_ID(id))
  },
  createPlan(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.PLANS, payload)
  },
  updatePlan(id, payload) {
    return api.put(SUPERADMIN_ENDPOINTS.PLAN_BY_ID(id), payload)
  },
  deletePlan(id) {
    return api.delete(SUPERADMIN_ENDPOINTS.PLAN_BY_ID(id))
  },
  updatePlanFeatures(id, featureIds) {
    return api.put(SUPERADMIN_ENDPOINTS.PLAN_FEATURES(id), { featureIds })
  },

  // Payments / Billing
  getPayments(params) {
    return api.get(SUPERADMIN_ENDPOINTS.PAYMENTS, { params })
  },
  getPaymentStats() {
    return api.get(SUPERADMIN_ENDPOINTS.PAYMENT_STATS)
  },
  createManualInvoice(payload) {
    return api.post(SUPERADMIN_ENDPOINTS.PAYMENT_MANUAL, payload)
  },
  getInvoiceHtml(id) {
    return api.get(SUPERADMIN_ENDPOINTS.PAYMENT_INVOICE_HTML(id), { responseType: 'text' })
  },
  updatePaymentStatus(id, status) {
    return api.patch(SUPERADMIN_ENDPOINTS.PAYMENT_STATUS(id), { status })
  }
}

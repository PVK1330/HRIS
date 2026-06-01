import api from './api'

/**
 * Exit Management (workflow engine) API client.
 * No localStorage fallback — the backend is the single source of truth. Every visibility/
 * action decision comes from the server access envelope; the UI renders what it is given.
 */

const unwrap = (res) => res?.data?.data ?? res?.data ?? null

/* ----------------------------- Exit requests ----------------------------- */

export const listExitRequests = (params = {}) =>
  api.get('/exit-management', { params }).then(unwrap)

export const getExitRequest = (id) =>
  api.get(`/exit-management/${id}`).then(unwrap)

export const submitExitRequest = (payload) =>
  api.post('/exit-management', payload).then(unwrap)

export const approveStage = (id, comments) =>
  api.put(`/exit-management/${id}/approve`, { comments }).then(unwrap)

export const rejectStage = (id, rejection_reason) =>
  api.put(`/exit-management/${id}/reject`, { rejection_reason }).then(unwrap)

export const sendBackStage = (id, payload) =>
  api.put(`/exit-management/${id}/send-back`, payload).then(unwrap)

export const escalateStage = (id, comments) =>
  api.put(`/exit-management/${id}/escalate`, { comments }).then(unwrap)

export const reassignStage = (id, payload) =>
  api.put(`/exit-management/${id}/reassign`, payload).then(unwrap)

export const addStageComment = (id, comments) =>
  api.post(`/exit-management/${id}/comment`, { comments }).then(unwrap)

export const withdrawExitRequest = (id, withdrawal_reason) =>
  api.post(`/exit-management/${id}/withdraw`, { withdrawal_reason }).then(unwrap)

export const getAuditLog = (id) =>
  api.get(`/exit-management/${id}/audit-log`).then(unwrap)

export const getDashboardWidgets = () =>
  api.get('/exit-management/dashboard/widgets').then(unwrap)

export const getTerminationTypes = () =>
  api.get('/exit-management/termination-types').then(unwrap)

/* ----------------------- Stage-attached checklist ------------------------ */

export const listChecklist = (id, stageId) =>
  api.get(`/exit-management/${id}/stages/${stageId}/checklist`).then(unwrap)

export const updateChecklistItem = (id, stageId, itemId, payload) =>
  api.put(`/exit-management/${id}/stages/${stageId}/checklist/${itemId}`, payload).then(unwrap)

/* --------------------------- Workflow config ----------------------------- */

export const listWorkflows = () =>
  api.get('/admin/settings/exit-workflows').then(unwrap)

export const getWorkflow = (id) =>
  api.get(`/admin/settings/exit-workflows/${id}`).then(unwrap)

export const createWorkflow = (payload) =>
  api.post('/admin/settings/exit-workflows', payload).then(unwrap)

export const updateWorkflow = (id, payload) =>
  api.put(`/admin/settings/exit-workflows/${id}`, payload).then(unwrap)

export const activateWorkflow = (id) =>
  api.put(`/admin/settings/exit-workflows/${id}/activate`).then(unwrap)

export const deleteWorkflow = (id) =>
  api.delete(`/admin/settings/exit-workflows/${id}`).then(unwrap)

/* ------------------ Lookups for the workflow builder --------------------- */
// Single self-contained endpoint (gated by the same config permission) so the builder
// needs no departments.manage / rbac permissions.

export const getBuilderOptions = () =>
  api.get('/admin/settings/exit-workflows/options')
    .then((res) => res?.data?.data ?? { departments: [], roles: [], employees: [] })

export default {
  listExitRequests, getExitRequest, submitExitRequest,
  approveStage, rejectStage, sendBackStage, escalateStage, reassignStage,
  addStageComment, withdrawExitRequest, getAuditLog, getDashboardWidgets, getTerminationTypes,
  listChecklist, updateChecklistItem,
  listWorkflows, getWorkflow, createWorkflow, updateWorkflow, activateWorkflow, deleteWorkflow,
  getBuilderOptions,
}

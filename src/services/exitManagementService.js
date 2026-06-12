import api from './api'

const EXIT_STORAGE_KEY = 'hris_exit_management_records_v1'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('hris_auth_user') || '{}')
  } catch {
    return {}
  }
}

function getOrganisationId() {
  const user = getStoredUser()
  return String(user?.tenant_id || user?.tenantId || user?.organizationId || user?.email || 'default-org')
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(EXIT_STORAGE_KEY) || '{}')
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(EXIT_STORAGE_KEY, JSON.stringify(store))
}

function createScopeIfMissing(store, orgId) {
  if (!store[orgId]) {
    store[orgId] = {
      records: [],
      interviews: {},
      settlements: {},
      documents: {},
      auditLogs: {},
      assets: {},
      clearanceTasks: {},
      seq: 1,
    }
  }
  return store[orgId]
}

function nowIso() {
  return new Date().toISOString()
}

function createId(prefix, seq) {
  return `${prefix}-${Date.now()}-${seq}`
}

function asArray(v) {
  return Array.isArray(v) ? v : []
}

function normalizeStatus(status) {
  const safe = String(status || '').trim()
  return safe || 'Pending Approval'
}

function buildAudit(scope, exitId, action, details = {}) {
  const logs = asArray(scope.auditLogs[exitId])
  const user = getStoredUser()
  logs.unshift({
    id: createId('audit', logs.length + 1),
    action,
    details,
    performed_by_name: user?.name || 'System',
    created_at: nowIso(),
  })
  scope.auditLogs[exitId] = logs
}

function getEmployeeNameFromPayload(payload = {}) {
  return payload.employee_name || payload.full_name || payload.name || 'Employee'
}

async function buildWorkflowTasks() {
  return []
}

async function withFallback(apiCall, fallbackCall) {
  try {
    return await apiCall()
  } catch {
    return await fallbackCall()
  }
}

function getScope() {
  const store = readStore()
  const orgId = getOrganisationId()
  const scope = createScopeIfMissing(store, orgId)
  return { store, scope, orgId }
}

function sortRecords(records = []) {
  return [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// Exit Records
export const listExitRecords = async (params = {}) =>
  withFallback(
    async () => {
      const { data } = await api.get('/exit-management', { params })
      return data.data
    },
    async () => {
      const { scope } = getScope()
      const page = Number(params.page || 1)
      const limit = Number(params.limit || 10)
      const query = String(params.search || '').toLowerCase().trim()
      const wantedStatus = String(params.status || '').trim()
      const wantedType = String(params.exit_type || '').trim()
      const wantedEmployeeId = String(params.employee_id || '').trim()
      let records = sortRecords(scope.records)
      if (query) {
        records = records.filter((r) => String(r.employee_name || '').toLowerCase().includes(query))
      }
      if (wantedStatus) records = records.filter((r) => r.status === wantedStatus)
      if (wantedType) records = records.filter((r) => r.exit_type === wantedType)
      if (wantedEmployeeId) records = records.filter((r) => String(r.employee_id) === wantedEmployeeId)
      const total = records.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const start = (page - 1) * limit
      const paged = records.slice(start, start + limit)
      return {
        records: paged,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    },
  )

export const getExitRecordStats = async () =>
  withFallback(
    async () => {
      const { data } = await api.get('/exit-management/stats')
      return data.data
    },
    async () => {
      const { scope } = getScope()
      const records = asArray(scope.records)
      return {
        total: records.length,
        pendingApproval: records.filter((r) => r.status === 'Pending Approval').length,
        inClearance: records.filter((r) => r.status === 'clearance').length,
        inProgress: records.filter((r) => ['Approved', 'In Progress', 'clearance', 'interview', 'settlement'].includes(r.status)).length,
        completed: records.filter((r) => r.status === 'Completed').length,
        rejected: records.filter((r) => r.status === 'Rejected').length,
      }
    },
  )

export const getExitRecord = async (id) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${id}`)
      return data.data
    },
    async () => {
      const { scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      return {
        ...record,
        clearance_tasks: asArray(scope.clearanceTasks[id]),
        asset_returns: asArray(scope.assets[id]),
        exit_documents: asArray(scope.documents[id]),
        exit_interview: scope.interviews[id] || null,
        final_settlement: scope.settlements[id] || null,
      }
    },
  )

export const createResignation = async (payload) =>
  withFallback(
    async () => {
      const { data } = await api.post('/exit-management/resignation', payload)
      return data.data
    },
    async () => {
      const { store, scope, orgId } = getScope()
      const seq = scope.seq++
      const id = createId('exit', seq)
      const employeeId = payload.employee_id || getStoredUser()?.id || `emp-${seq}`
      const employeeName = getEmployeeNameFromPayload(payload) || `Employee ${employeeId}`
      const record = {
        id,
        organization_id: orgId,
        employee_id: employeeId,
        employee_name: employeeName,
        department: payload.department || getStoredUser()?.department || 'General',
        job_title: payload.job_title || '',
        exit_type: 'Resignation',
        is_voluntary: true,
        notice_date: payload.notice_date || nowIso().slice(0, 10),
        resignation_date: payload.resignation_date || nowIso().slice(0, 10),
        last_working_day: payload.last_working_day,
        notice_period_days: Number(payload.notice_period_days || 30),
        exit_reason: payload.exit_reason || '',
        reason_detail: payload.reason_detail || '',
        status: 'Pending Approval',
        rtw_status: 'Valid',
        created_at: nowIso(),
        updated_at: nowIso(),
        is_withdrawal_requested: false,
      }
      scope.records.push(record)
      buildAudit(scope, id, 'resignation_submitted')
      writeStore(store)
      return record
    },
  )

export const createTermination = async (payload) =>
  withFallback(
    async () => {
      const { data } = await api.post('/exit-management/termination', payload)
      return data.data
    },
    async () => {
      const { store, scope, orgId } = getScope()
      const seq = scope.seq++
      const id = createId('exit', seq)
      const employeeId = payload.employee_id || `emp-${seq}`
      const record = {
        id,
        organization_id: orgId,
        employee_id: employeeId,
        employee_name: getEmployeeNameFromPayload(payload),
        department: payload.department || 'General',
        job_title: payload.job_title || '',
        exit_type: 'Termination',
        is_voluntary: false,
        notice_date: payload.notice_date || nowIso().slice(0, 10),
        resignation_date: payload.resignation_date || nowIso().slice(0, 10),
        last_working_day: payload.last_working_day,
        notice_period_days: Number(payload.notice_period_days || 0),
        exit_reason: payload.exit_reason || '',
        status: 'Approved',
        rtw_status: 'Valid',
        created_at: nowIso(),
        updated_at: nowIso(),
      }
      scope.records.push(record)
      scope.clearanceTasks[id] = await buildWorkflowTasks(id)
      buildAudit(scope, id, 'termination_created')
      writeStore(store)
      return record
    },
  )

export const updateExitRecord = async (id, payload) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const idx = asArray(scope.records).findIndex((r) => String(r.id) === String(id))
      if (idx < 0) throw new Error('Exit record not found')
      scope.records[idx] = { ...scope.records[idx], ...payload, updated_at: nowIso() }
      buildAudit(scope, id, 'exit_updated')
      writeStore(store)
      return scope.records[idx]
    },
  )

export const approveResignation = async (id) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}/approve`)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      record.status = 'Approved'
      record.approved_at = nowIso()
      record.approved_by_name = getStoredUser()?.name || 'HR'
      record.updated_at = nowIso()
      scope.clearanceTasks[id] = await buildWorkflowTasks(id)
      buildAudit(scope, id, 'resignation_approved')
      writeStore(store)
      return record
    },
  )

export const rejectResignation = async (id, payload) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}/reject`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      record.status = 'Rejected'
      record.rejection_reason = payload?.rejection_reason || 'Rejected'
      record.updated_at = nowIso()
      buildAudit(scope, id, 'resignation_rejected', { reason: record.rejection_reason })
      writeStore(store)
      return record
    },
  )

export const updateExitStatus = async (id, payload) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}/status`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      record.status = normalizeStatus(payload?.status)
      record.updated_at = nowIso()
      buildAudit(scope, id, 'status_updated', { status: record.status })
      writeStore(store)
      return record
    },
  )

// Clearance Tasks
export const listClearanceTasks = async (exitId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitId}/clearance`)
      return data.data
    },
    async () => asArray(getScope().scope.clearanceTasks[exitId]),
  )

export const addClearanceTask = async (exitId, payload) =>
  withFallback(
    async () => {
      const { data } = await api.post(`/exit-management/${exitId}/clearance`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const tasks = asArray(scope.clearanceTasks[exitId])
      const task = {
        id: createId('task', tasks.length + 1),
        exit_request_id: exitId,
        task_name: payload?.task_name || `Task ${tasks.length + 1}`,
        department: payload?.department || 'General',
        assigned_to_role: payload?.assigned_to_role || payload?.assigned_role || 'hr',
        due_date: payload?.due_date || null,
        is_completed: false,
        is_escalated: false,
      }
      tasks.push(task)
      scope.clearanceTasks[exitId] = tasks
      buildAudit(scope, exitId, 'clearance_task_added', { task: task.task_name })
      writeStore(store)
      return task
    },
  )

export const updateClearanceTask = async (exitId, taskId, payload) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${exitId}/clearance/${taskId}`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const tasks = asArray(scope.clearanceTasks[exitId])
      const idx = tasks.findIndex((t) => String(t.id) === String(taskId))
      if (idx < 0) throw new Error('Task not found')
      const next = { ...tasks[idx], ...payload }
      if (payload?.is_completed === true) {
        next.completed_by_name = getStoredUser()?.name || 'User'
      }
      tasks[idx] = next
      scope.clearanceTasks[exitId] = tasks
      buildAudit(scope, exitId, 'clearance_task_updated', { taskId, payload })
      writeStore(store)
      return next
    },
  )

// Asset Returns
export const listAssetReturns = async (exitId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitId}/assets`)
      return data.data
    },
    async () => asArray(getScope().scope.assets[exitId]),
  )

export const addAssetReturn = async (exitId, payload) =>
  withFallback(
    async () => {
      const { data } = await api.post(`/exit-management/${exitId}/assets`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const assets = asArray(scope.assets[exitId])
      const asset = {
        id: createId('asset', assets.length + 1),
        status: 'Pending',
        ...payload,
      }
      assets.push(asset)
      scope.assets[exitId] = assets
      writeStore(store)
      return asset
    },
  )

export const updateAssetReturn = async (exitId, assetId, payload) =>
  withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${exitId}/assets/${assetId}`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const assets = asArray(scope.assets[exitId])
      const idx = assets.findIndex((a) => String(a.id) === String(assetId))
      if (idx < 0) throw new Error('Asset not found')
      assets[idx] = { ...assets[idx], ...payload }
      scope.assets[exitId] = assets
      writeStore(store)
      return assets[idx]
    },
  )

// Exit Documents
export const listExitDocuments = async (exitId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitId}/documents`)
      return data.data
    },
    async () => asArray(getScope().scope.documents[exitId]),
  )

export const generateExitDocument = async (exitId, payload) =>
  withFallback(
    async () => {
      const { data } = await api.post(`/exit-management/${exitId}/documents/generate`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const docs = asArray(scope.documents[exitId])
      const docType = payload?.document_type || 'Exit Document'
      const doc = {
        id: createId('doc', docs.length + 1),
        document_title: docType,
        document_type: docType,
        generated_at: nowIso(),
        file_url: '#',
      }
      docs.push(doc)
      scope.documents[exitId] = docs
      buildAudit(scope, exitId, 'document_generated', { documentType: docType })
      writeStore(store)
      return doc
    },
  )

// Exit Interviews
export const submitExitInterview = async (payload) =>
  withFallback(
    async () => {
      const { data } = await api.post('/exit-management/interviews', payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const exitId = payload?.exit_request_id
      const interview = {
        id: createId('interview', 1),
        ...payload,
        created_at: nowIso(),
      }
      scope.interviews[exitId] = interview
      buildAudit(scope, exitId, 'exit_interview_submitted')
      writeStore(store)
      return interview
    },
  )

export const getExitInterview = async (exitRequestId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitRequestId}/interview`)
      return data.data
    },
    async () => {
      const iv = getScope().scope.interviews[exitRequestId]
      if (!iv) throw new Error('Interview not found')
      return iv
    },
  )

// Final Settlements
export const processSettlement = async (payload) =>
  withFallback(
    async () => {
      const { data } = await api.post('/exit-management/settlements', payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const exitId = payload?.exit_request_id
      const settlement = {
        id: createId('settlement', 1),
        ...payload,
        payment_status: 'processed',
        processed_at: nowIso(),
        file_url: '#',
      }
      scope.settlements[exitId] = settlement
      buildAudit(scope, exitId, 'settlement_processed')
      writeStore(store)
      return settlement
    },
  )

export const getSettlement = async (exitRequestId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitRequestId}/settlement`)
      return data.data
    },
    async () => {
      const settlement = getScope().scope.settlements[exitRequestId]
      if (!settlement) throw new Error('Settlement not found')
      return settlement
    },
  )

// Audit Logs
export const getAuditLog = async (exitRequestId) =>
  withFallback(
    async () => {
      const { data } = await api.get(`/exit-management/${exitRequestId}/audit-log`)
      return data.data
    },
    async () => asArray(getScope().scope.auditLogs[exitRequestId]),
  )

// Termination Types (for dropdowns)
export const listTerminationTypesDropdown = async () =>
  withFallback(
    async () => {
      const { data } = await api.get('/exit-management/termination-types')
      return data.data
    },
    async () => [
      { id: 'voluntary', name: 'Voluntary' },
      { id: 'redundancy', name: 'Redundancy' },
      { id: 'performance', name: 'Performance' },
      { id: 'conduct', name: 'Conduct' },
      { id: 'contract_end', name: 'Contract End' },
    ],
  )

// Termination Types Settings CRUD
export const listTerminationTypes = async (params = {}) => {
  const { data } = await api.get('/admin/settings/termination-types', { params })
  return data.data
}

export const getTerminationType = async (id) => {
  const { data } = await api.get(`/admin/settings/termination-types/${id}`)
  return data.data
}

export const createTerminationType = async (payload) => {
  const { data } = await api.post('/admin/settings/termination-types', payload)
  return data.data
}

export const updateTerminationType = async (id, payload) => {
  const { data } = await api.put(`/admin/settings/termination-types/${id}`, payload)
  return data.data
}

export const deleteTerminationType = async (id) => {
  const { data } = await api.delete(`/admin/settings/termination-types/${id}`)
  return data.data
}

export const listClearanceTemplates = async (params = {}) => {
  const { data } = await api.get('/admin/settings/termination-types/clearance-templates/list', { params })
  return data.data
}

export const createClearanceTemplate = async (payload) => {
  const { data } = await api.post('/admin/settings/termination-types/clearance-templates', payload)
  return data.data
}

export const updateClearanceTemplate = async (id, payload) => {
  const { data } = await api.put(`/admin/settings/termination-types/clearance-templates/${id}`, payload)
  return data.data
}

export const deleteClearanceTemplate = async (id) => {
  const { data } = await api.delete(`/admin/settings/termination-types/clearance-templates/${id}`)
  return data.data
}

// Resignation Withdrawal Workflow
export const requestResignationWithdrawal = async (id, payload) => {
  return withFallback(
    async () => {
      const { data } = await api.post(`/exit-management/${id}/withdraw`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      record.is_withdrawal_requested = true
      record.withdrawal_reason = payload?.reason || payload?.withdrawal_reason || ''
      buildAudit(scope, id, 'withdrawal_requested')
      writeStore(store)
      return record
    },
  )
}

export const approveResignationWithdrawal = async (id) => {
  return withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}/withdraw/approve`)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const idx = asArray(scope.records).findIndex((r) => String(r.id) === String(id))
      if (idx < 0) throw new Error('Exit record not found')
      const record = scope.records[idx]
      record.status = 'Withdrawn'
      record.is_withdrawal_requested = false
      record.withdrawal_reason = ''
      buildAudit(scope, id, 'withdrawal_approved')
      scope.records.splice(idx, 1)
      delete scope.clearanceTasks[id]
      delete scope.assets[id]
      delete scope.interviews[id]
      delete scope.settlements[id]
      delete scope.documents[id]
      writeStore(store)
      return { success: true }
    },
  )
}

export const rejectResignationWithdrawal = async (id, payload) => {
  return withFallback(
    async () => {
      const { data } = await api.put(`/exit-management/${id}/withdraw/reject`, payload)
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const record = asArray(scope.records).find((r) => String(r.id) === String(id))
      if (!record) throw new Error('Exit record not found')
      record.is_withdrawal_requested = false
      record.withdrawal_rejection_reason = payload?.rejection_reason || ''
      buildAudit(scope, id, 'withdrawal_rejected')
      writeStore(store)
      return record
    },
  )
}

// Clearance Task Upload Proof
export const uploadClearanceProof = async (id, taskId, file) => {
  return withFallback(
    async () => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(`/exit-management/${id}/clearance/${taskId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data.data
    },
    async () => {
      const { store, scope } = getScope()
      const tasks = asArray(scope.clearanceTasks[id])
      const idx = tasks.findIndex((t) => String(t.id) === String(taskId))
      if (idx < 0) throw new Error('Task not found')
      tasks[idx] = {
        ...tasks[idx],
        document_name: file?.name || 'proof-file',
        document_url: '#',
      }
      scope.clearanceTasks[id] = tasks
      buildAudit(scope, id, 'clearance_proof_uploaded', { taskId, fileName: file?.name })
      writeStore(store)
      return tasks[idx]
    },
  )
}

// Department-based exit workflow
export const listExitDepartmentsWithHeads = async () => {
  const { data } = await api.get('/exit-management/departments/with-heads')
  return data.data || []
}

export const getExitDepartmentWorkflow = async (exitId) => {
  const { data } = await api.get(`/exit-management/${exitId}/workflow`)
  return data.data
}

export const assignExitDepartmentWorkflow = async (exitId, steps) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/assign`, { steps })
  return data.data
}

export const reorderExitDepartmentWorkflow = async (exitId, orderedStepIds) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/reorder`, { ordered_step_ids: orderedStepIds })
  return data.data
}

export const approveExitWorkflowStep = async (exitId, stepId, payload = {}) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/steps/${stepId}/approve`, payload)
  return data.data
}

export const rejectExitWorkflowStep = async (exitId, stepId, payload) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/steps/${stepId}/reject`, payload)
  return data.data
}

export const skipExitWorkflowStep = async (exitId, stepId) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/steps/${stepId}/skip`)
  return data.data
}

export const reassignExitWorkflowHead = async (exitId, stepId, departmentHeadId) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/steps/${stepId}/reassign`, {
    department_head_id: departmentHeadId,
  })
  return data.data
}

export const restartExitDepartmentWorkflow = async (exitId) => {
  const { data } = await api.put(`/exit-management/${exitId}/workflow/restart`)
  return data.data
}

export const getOrgDepartmentWorkflowTemplate = async () => {
  const { data } = await api.get('/admin/settings/termination-types/department-workflow-template')
  return data.data || { steps: [] }
}

export const saveOrgDepartmentWorkflowTemplate = async (steps) => {
  const { data } = await api.put('/admin/settings/termination-types/department-workflow-template', { steps })
  return data.data
}

export const getExitPipelineStages = async () => {
  const { data } = await api.get('/exit-management/pipeline-stages')
  return data.data?.stages || []
}

export const getExitWorkflowConfig = async () => {
  const { data } = await api.get('/admin/settings/termination-types/exit-workflow-config')
  return data.data
}

export const saveExitWorkflowConfig = async (payload) => {
  const { data } = await api.put('/admin/settings/termination-types/exit-workflow-config', payload)
  return data.data
}

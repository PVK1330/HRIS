const STORAGE_KEY = 'hris_exit_workflow_settings_v1'

const DEFAULT_WORKFLOW = [
  {
    id: 'step-manager-clearance',
    stepName: 'Manager Clearance',
    department: 'Manager',
    order: 1,
    isParallel: false,
  },
  {
    id: 'step-it-clearance',
    stepName: 'IT Clearance',
    department: 'IT',
    order: 2,
    isParallel: true,
  },
  {
    id: 'step-finance-clearance',
    stepName: 'Finance Clearance',
    department: 'Finance',
    order: 3,
    isParallel: true,
  },
]

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function ensureOrdered(steps = []) {
  return [...steps]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((step, idx) => ({ ...step, order: idx + 1 }))
}

function cloneDefaultWorkflow() {
  return DEFAULT_WORKFLOW.map((step, index) => ({
    ...step,
    id: step.id || `step-${index + 1}`,
    order: index + 1,
  }))
}

/**
 * Dummy API: list organizations that currently have workflow settings.
 * Useful for "each organization has separate flow" in HR admin UI.
 */
export async function listExitWorkflowOrganizations(params = {}) {
  const preferredOrganizationId = String(params.organizationId || 'default-org')
  const store = readStore()
  const keys = Object.keys(store)
  const organizations = Array.from(new Set([preferredOrganizationId, ...keys]))
  return {
    organizations,
    defaultOrganizationId: preferredOrganizationId,
  }
}

/**
 * Dummy API: fetch workflow settings for a specific organization.
 * @param {{ organizationId?: string }} params
 */
export async function getExitWorkflowSettings(params = {}) {
  const organizationId = String(params.organizationId || 'default-org')
  const store = readStore()
  if (!store[organizationId]) {
    store[organizationId] = cloneDefaultWorkflow()
    writeStore(store)
  }
  const steps = store[organizationId] || cloneDefaultWorkflow()

  return {
    organizationId,
    steps: ensureOrdered(steps),
  }
}

/**
 * Dummy API: update workflow settings for a specific organization.
 * @param {{ organizationId?: string, steps?: Array }} payload
 */
export async function updateExitWorkflowSettings(payload = {}) {
  const organizationId = String(payload.organizationId || 'default-org')
  const incoming = Array.isArray(payload.steps) ? payload.steps : []
  const normalized = ensureOrdered(
    incoming.map((step, idx) => ({
      id: step.id || `step-${Date.now()}-${idx}`,
      stepName: String(step.stepName || '').trim(),
      department: String(step.department || '').trim(),
      order: Number(step.order || idx + 1),
      isParallel: Boolean(step.isParallel),
    })),
  )

  const store = readStore()
  store[organizationId] = normalized
  writeStore(store)

  return {
    message: 'Exit workflow settings updated successfully',
    organizationId,
    steps: normalized,
  }
}

import {
  HiDocumentText,
  HiHandThumbUp,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
  HiBanknotes,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2'

export const STAGE_ICON_MAP = {
  submitted: HiDocumentText,
  approved: HiHandThumbUp,
  approval: HiHandThumbUp,
  clearance: HiClipboardDocumentCheck,
  interview: HiChatBubbleLeftRight,
  settlement: HiBanknotes,
  exited: HiArrowRightOnRectangle,
}

export const DEFAULT_PIPELINE_STAGES = [
  { stage_key: 'submitted', label: 'Submitted', step_order: 1 },
  { stage_key: 'approved', label: 'Approved', step_order: 2 },
  { stage_key: 'clearance', label: 'Clearance', step_order: 3 },
  { stage_key: 'interview', label: 'Interview', step_order: 4 },
  { stage_key: 'settlement', label: 'Settlement', step_order: 5 },
  { stage_key: 'exited', label: 'Exited', step_order: 6 },
]

/** Map exit record status / pipeline_stage to active stage index */
export function resolveStageIndex(record, stages = DEFAULT_PIPELINE_STAGES) {
  const list = [...stages].sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
  const keys = list.map((s) => s.stage_key)

  const stage = record?.pipeline_stage || record?.status_progress
  const status = record?.status

  const alias = {
    approval: 'approved',
    'Pending Approval': 'submitted',
    Approved: 'approved',
    'In Progress': 'approved',
    Rejected: 'submitted',
    clearance: 'clearance',
    interview: 'interview',
    settlement: 'settlement',
    Completed: 'exited',
    exited: 'exited',
  }

  const normalized = alias[stage] || alias[status] || stage || status || 'submitted'
  let idx = keys.indexOf(normalized)
  if (idx < 0 && status === 'Completed') idx = keys.indexOf('exited')
  if (idx < 0) idx = 0
  return idx
}

export function stagesToTabs(stages = DEFAULT_PIPELINE_STAGES) {
  return [...stages]
    .sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
    .map((s, rankIndex) => ({
      key: s.stage_key,
      label: s.label,
      icon: STAGE_ICON_MAP[s.stage_key] || HiDocumentText,
      rankIndex,
    }))
}

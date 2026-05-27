/** Shared onboarding workflow labels (HR + candidate portal). */
export const ONBOARDING_TOTAL_STEPS = 3

export const WORKFLOW_STATUS_LABELS = {
  draft: 'Draft',
  offer_sent: 'Offer Sent',
  rejected: 'Rejected',
  accepted_pending_upload: 'Accepted — Pending Document Upload',
  documents_pending: 'Documents Pending',
  onboarding_complete: 'Onboarding Complete',
}

export function workflowStepNumber(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'onboarding_complete') return 3
  if (s === 'documents_pending') return 3
  if (s === 'accepted_pending_upload') return 2
  if (s === 'offer_sent' || s === 'rejected') return 1
  return 1
}

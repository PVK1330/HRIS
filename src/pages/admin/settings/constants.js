/** Mirrors backend tenantSettings.service allowed option lists */

export const TIMEZONE_OPTIONS = [
  'UTC',
  'UTC+05:30 - India (IST)',
  'UTC+04:00 - UAE (GST)',
  'UTC-05:00 - Eastern (EST)',
  'UTC-06:00 - Central (CST)',
  'UTC-07:00 - Mountain (MST)',
  'UTC-08:00 - Pacific (PST)',
  'UTC+00:00 - London (GMT)',
  'UTC+01:00 - Paris (CET)',
  'UTC+08:00 - Singapore (SGT)',
  'UTC+09:00 - Tokyo (JST)',
  'UTC+03:00 - Riyadh (AST)',
  'UTC+03:00 - Kuwait',
  'UTC+05:00 - Pakistan (PKT)',
  'UTC+06:00 - Bangladesh (BST)',
]

export const FINANCIAL_YEAR_OPTIONS = ['January 1', 'April 1', 'July 1', 'October 1']

export const WORK_CALENDAR_OPTIONS = ['Standard 9-6', 'Flexible', '24x7', 'Custom']

export const PROBATION_OPTIONS = ['1 month', '2 months', '3 months', '6 months', '12 months']

export const NOTICE_OPTIONS = ['15 days', '30 days', '45 days', '60 days', '90 days']

/** Slot order Mon–Sun; Thu/Sun use distinct codes for API (T2 / S2). */
export const WORKING_DAY_SLOTS = [
  { code: 'M', label: 'M', title: 'Monday' },
  { code: 'T', label: 'T', title: 'Tuesday' },
  { code: 'W', label: 'W', title: 'Wednesday' },
  { code: 'T2', label: 'T', title: 'Thursday' },
  { code: 'F', label: 'F', title: 'Friday' },
  { code: 'S', label: 'S', title: 'Saturday' },
  { code: 'S2', label: 'S', title: 'Sunday' },
]

/** Map API array (possibly shorter / legacy T vs T2) to slot booleans */
export function workingDaysApiToSelection(apiDays) {
  const arr = Array.isArray(apiDays) ? apiDays : []
  return WORKING_DAY_SLOTS.map((slot, i) => {
    const raw = arr[i]
    if (raw === slot.code) return true
    if (slot.code === 'T2' && raw === 'T') return true
    if (slot.code === 'S2' && raw === 'S') return true
    return false
  })
}

export function selectionToWorkingDaysApi(selection) {
  return WORKING_DAY_SLOTS.filter((_, i) => selection[i]).map((s) => s.code)
}

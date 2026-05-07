/** Matches hrs_backend attendanceSettings.options.js */

export const EARLY_DEPARTURE_RULES = ['Mark half day', 'Mark absent', 'No penalty', 'Custom']

export const WHO_CAN_SUBMIT = ['All employees', 'Manager only', 'HR only']

export const APPROVERS = ['HR', 'Manager', 'Direct Manager', 'HR Manager']

export const OVERTIME_CALC_RULES = ['1.5x hourly', '2x hourly', 'Flat rate', 'Custom']

export const OVERTIME_APPROVAL = ['Manager → HR', 'HR only', 'Manager only', 'Auto-approve']

export const BREAK_DURATION_OPTIONS = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
]

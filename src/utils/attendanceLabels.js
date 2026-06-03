/** Human-readable labels for attendance API field keys */

const FIELD_LABELS = {
  id: 'ID',
  employee_id: 'Employee ID',
  employee_name: 'Employee',
  full_name: 'Employee',
  emp_id: 'Employee ID',
  department: 'Department',
  job_title: 'Designation',
  work_location: 'Location',
  date: 'Date',
  check_in_time: 'Check-in',
  check_out_time: 'Check-out',
  work_mode: 'Work mode',
  status: 'Status',
  total_hours: 'Total hours',
  worked_hours: 'Worked hours',
  overtime_hours: 'Overtime (hrs)',
  is_late: 'Late',
  late_minutes: 'Late (mins)',
  late_count: 'Late count',
  notes: 'Notes',
  regularization_status: 'Regularization',
  regularization_reason: 'Reason',
  regularization_remarks: 'Remarks',
  pending_approver_role: 'Current approver',
  pending_level: 'Approval level',
  current_approval_level: 'Approval level',
  present: 'Present',
  absent: 'Absent',
  on_leave: 'On leave',
  leave_days: 'Leave days',
  payable_days: 'Payable days',
  paid_days: 'Paid days',
  working_days: 'Working days',
  present_days: 'Present days',
  absent_days: 'Absent days',
  half_days: 'Half days',
  total_records: 'Total records',
  employees: 'Employees',
  reportType: 'Report type',
  total_days: 'Total days',
  absenteeism: 'Absent days',
}

export function labelForField(key) {
  if (!key) return ''
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function formatHours(value) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return `${n}h`
}

export function formatCellValue(key, value) {
  if (value == null || value === '') return '—'
  if (key === 'is_late') return value ? 'Yes' : 'No'
  if (key.includes('hours') || key === 'overtime_hours') return formatHours(value)
  return String(value)
}

export function buildReportColumns(row) {
  if (!row || typeof row !== 'object') return []
  return Object.keys(row).map((key) => ({
    key,
    label: labelForField(key),
    render: (_, r) => formatCellValue(key, r[key]),
  }))
}

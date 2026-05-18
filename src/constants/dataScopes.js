/** Data scope options — must match API role_data_scopes CHECK constraint */

export const DATA_SCOPES = [
  {
    value: 'SELF',
    label: 'Self only',
    shortLabel: 'Self',
    description: 'User can only view and act on their own employee record.',
    icon: 'user',
  },
  {
    value: 'TEAM',
    label: 'My team',
    shortLabel: 'Team',
    description: 'User can access employees who report to them (direct reports).',
    icon: 'team',
  },
  {
    value: 'DEPARTMENT',
    label: 'My department',
    shortLabel: 'Dept',
    description: 'User can access all employees in the same department.',
    icon: 'building',
  },
  {
    value: 'ALL',
    label: 'All employees',
    shortLabel: 'All',
    description: 'User can access every employee in the organization (within module permissions).',
    icon: 'globe',
  },
]

export function scopeLabel(value) {
  return DATA_SCOPES.find((s) => s.value === value)?.label || value || 'Self only'
}

export function scopeShortLabel(value) {
  return DATA_SCOPES.find((s) => s.value === value)?.shortLabel || value || 'Self'
}

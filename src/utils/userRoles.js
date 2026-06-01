/** True when the logged-in user is on the employee portal (not org admin). */
export function isEmployeeUser(user) {
  return user?.role === 'employee' || user?.userType === 'employee'
}

/** Resolve the current user's employee record id from auth user object. */
export function resolveEmployeeRecordId(user) {
  const id = user?.employeeId ?? user?.id
  return id != null ? Number(id) : null
}

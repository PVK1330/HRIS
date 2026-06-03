import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { canAccessAttendanceModule } from '../utils/rbac.js'

/**
 * Attendance area — requires at least one attendance.* permission (or legacy module from role).
 */
export default function AttendanceModuleGate({ children, fallback = <Navigate to="/admin/dashboard" replace /> }) {
  const { allowedModules } = useAuth()
  if (!canAccessAttendanceModule(allowedModules)) {
    return fallback
  }
  return children
}

import { useAuth } from '../context/AuthContext.jsx'

const PermissionGate = ({ moduleKey, children, fallback = null }) => {
  const { hasModule } = useAuth()
  const keys = Array.isArray(moduleKey) ? moduleKey : [moduleKey]
  if (!keys.length || !keys.some((k) => hasModule(k))) return fallback
  return children
}

export default PermissionGate

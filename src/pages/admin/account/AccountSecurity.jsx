import { HiShieldCheck } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import MfaCard from '../settings/MfaCard'

/**
 * Self-service security page available to EVERY org user (admins and employees alike).
 * Reachable at /admin/security without any module gate, so anyone can manage their
 * own two-factor authentication.
 */
export default function AccountSecurity() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
          <HiShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Security</h1>
          <p className="text-sm text-gray-500">
            Manage the security of your own account{user?.name ? `, ${user.name}` : ''}.
          </p>
        </div>
      </div>

      <MfaCard />
    </div>
  )
}

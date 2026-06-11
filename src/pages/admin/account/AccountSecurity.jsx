import { HiOutlineUserCircle, HiOutlineEnvelope, HiOutlineIdentification, HiOutlineBriefcase } from 'react-icons/hi2'
import { useAuth } from '../../../context/AuthContext.jsx'
import { SectionCard } from '../settings/components/ui'
import MfaCard from '../settings/MfaCard'
import ChangePasswordCard from '../settings/ChangePasswordCard'

const prettyRole = (r) =>
  String(r || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || '—'

/**
 * Self-service "My Account" page available to EVERY profile (admins, HR,
 * managers, employees). Reachable at /admin/security without a module gate so
 * anyone can manage their own profile, password and two-factor authentication.
 */
export default function AccountSecurity() {
  const { user } = useAuth()

  const fields = [
    { icon: HiOutlineUserCircle, label: 'Name', value: user?.name || user?.fullName || '—' },
    { icon: HiOutlineEnvelope, label: 'Email', value: user?.email || '—' },
    { icon: HiOutlineBriefcase, label: 'Role', value: prettyRole(user?.role) },
    { icon: HiOutlineIdentification, label: 'Organisation', value: user?.tenantName || user?.department || '—' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
          <HiOutlineUserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Account</h1>
          <p className="text-sm text-gray-500">
            Manage your profile, password and two-factor authentication{user?.name ? `, ${user.name}` : ''}.
          </p>
        </div>
      </div>

      {/* Profile summary */}
      <SectionCard>
        <h3 className="mb-4 text-sm font-semibold text-gray-900">Profile</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
              <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{f.label}</p>
                <p className="truncate text-sm font-semibold text-gray-900">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          To update profile details such as phone or address, open your Employee Profile.
        </p>
      </SectionCard>

      {/* Change password */}
      <ChangePasswordCard />

      {/* Two-factor authentication */}
      <MfaCard />
    </div>
  )
}

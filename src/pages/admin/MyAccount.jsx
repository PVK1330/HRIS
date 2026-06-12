import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  HiUser,
  HiEnvelope,
  HiShieldCheck,
  HiBuildingOffice2,
  HiPencilSquare,
  HiCheckCircle,
} from 'react-icons/hi2'
import { Avatar } from '../../components/ui/Avatar.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { getMyAccount, updateMyAccount } from '../../services/accountService.js'
import ChangePasswordCard from './settings/ChangePasswordCard.jsx'

const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb

function roleLabel(role) {
  return String(role || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '—'
}

function InfoRow({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900 break-words">{value || '—'}</p>
        {hint ? <p className="mt-1 text-[10px] font-medium text-slate-400">{hint}</p> : null}
      </div>
    </div>
  )
}

export default function MyAccount() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getMyAccount()
      if (data) {
        setProfile(data)
        setName(data.name || '')
      }
    } catch (err) {
      console.error('Failed to load account:', err)
      toast.error(errMsg(err, 'Failed to load your account'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }
    if (trimmed === (profile?.name || '')) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    try {
      const updated = await updateMyAccount({ name: trimmed })
      if (updated) {
        setProfile(updated)
        setName(updated.name || '')
        updateUser({ name: updated.name })
      }
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Failed to update account:', err)
      toast.error(errMsg(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setName(profile?.name || '')
    setIsEditing(false)
  }

  const displayName = profile?.name || user?.name || 'My Account'
  const displayEmail = profile?.email || user?.email || '—'
  const displayRole = roleLabel(profile?.role || user?.role)
  const isEmployee = (profile?.userType || user?.role) === 'employee'

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-500">
      {/* Title */}
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">My Account</h1>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span>Account</span>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-600">Profile &amp; security</span>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0F766E]" />
        </div>
      ) : (
        <>
          {/* Profile header card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <Avatar name={displayName} size="lg" />
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-md">
                  <HiCheckCircle className="h-4 w-4 text-[#0F766E]" />
                </div>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">{displayName}</h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-[#0F766E]">{displayRole}</p>
                <p className="mt-1 truncate text-sm font-medium text-slate-500">{displayEmail}</p>
              </div>
              <div className="sm:ml-auto">
                {!isEditing && (
                  <Button
                    label="Edit Profile"
                    icon={HiPencilSquare}
                    onClick={() => setIsEditing(true)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Identity details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Identity Details</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <Button label="Cancel" variant="ghost" size="sm" onClick={cancelEdit} disabled={saving} />
                  <Button
                    label={saving ? 'Saving…' : 'Save Changes'}
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Name — editable */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E]">
                  <HiUser className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</p>
                  {isEditing ? (
                    <input
                      className="mt-1 block w-full rounded-lg border-0 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#0F766E]"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={120}
                    />
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 break-words">{displayName}</p>
                  )}
                </div>
              </div>

              <InfoRow
                icon={HiEnvelope}
                label="Email Address"
                value={displayEmail}
                hint="Email is your login identity and can't be changed here."
              />
              <InfoRow icon={HiShieldCheck} label="Role" value={displayRole} />
              {isEmployee && profile?.department ? (
                <InfoRow icon={HiBuildingOffice2} label="Department" value={profile.department} />
              ) : null}
            </div>
          </div>

          {/* Change password (reuses the shared self-service card) */}
          <ChangePasswordCard />
        </>
      )}
    </div>
  )
}

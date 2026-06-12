import { useState, useEffect, useCallback } from 'react'
import {
  HiUser,
  HiShieldCheck,
  HiEnvelope,
  HiKey,
  HiClock,
  HiCheckBadge,
  HiPencilSquare,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { superadminService } from '../../services/superadminService.js'

const TABS = [
  { id: 'overview', label: 'My Profile' },
  { id: 'security', label: 'Security' },
]

function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10'

export default function SuperAdminProfile() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPw, setChangingPw] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    try {
      const data = await superadminService.getProfile()
      if (data) {
        setProfile(data)
        setName(data.name || '')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      toast.error(err?.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSaveProfile = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Name cannot be empty')
      return
    }
    if (trimmed === (profile?.name || '')) {
      setIsEditing(false)
      return
    }
    setSavingProfile(true)
    try {
      const updated = await superadminService.updateProfile({ name: trimmed })
      if (updated) {
        setProfile(updated)
        setName(updated.name || '')
        updateUser({ name: updated.name })
      }
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      console.error('Failed to update profile:', err)
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const cancelEdit = () => {
    setName(profile?.name || '')
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = pw
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match')
      return
    }
    if (newPassword === currentPassword) {
      toast.error('New password must be different from the current password')
      return
    }
    setChangingPw(true)
    try {
      await superadminService.changePassword({ currentPassword, newPassword })
      setPw({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully')
    } catch (err) {
      console.error('Failed to change password:', err)
      toast.error(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPw(false)
    }
  }

  const displayName = profile?.name || user?.name || 'Super Administrator'
  const displayEmail = profile?.email || user?.email || '—'
  const displayRole = (profile?.role || user?.role || 'superadmin').replace(/_/g, ' ')

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-indigo-100/50" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-indigo-100">
              {displayName.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-md">
              <HiCheckBadge className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-center md:text-left min-w-0">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight truncate">{displayName}</h2>
            <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest capitalize">{displayRole}</p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
              <Badge label={profile?.status === 'active' ? 'Active' : (profile?.status || 'Active')} color="green" variant="glass" />
              <Badge label={profile?.two_factor_enabled ? '2FA Enabled' : '2FA Off'} color={profile?.two_factor_enabled ? 'indigo' : 'gray'} variant="glass" />
            </div>
          </div>
          <div className="md:ml-auto flex gap-2">
            {isEditing ? (
              <>
                <Button label="Cancel" variant="ghost" size="sm" className="font-bold text-slate-400" onClick={cancelEdit} />
                <Button
                  label={savingProfile ? 'Saving…' : 'Save Changes'}
                  variant="primary"
                  size="sm"
                  className="bg-slate-900 border-none px-6"
                  disabled={savingProfile}
                  onClick={handleSaveProfile}
                />
              </>
            ) : (
              <Button
                label="Edit Profile"
                icon={HiPencilSquare}
                variant="primary"
                size="sm"
                className="bg-indigo-600 border-none px-6"
                onClick={() => setIsEditing(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Identity Details</h3>
          <div className="space-y-6">
            {/* Full Name (editable) */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <HiUser className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                {isEditing ? (
                  <input
                    className={`${fieldClass} mt-1`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={120}
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{displayName}</p>
                )}
              </div>
            </div>
            {/* Email (read-only) */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <HiEnvelope className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 break-all">{displayEmail}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">Email is your login identity and cannot be changed here.</p>
              </div>
            </div>
            {/* Role */}
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Role</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 capitalize">{displayRole}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Account Status</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <HiShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auth Status</p>
                <p className="text-sm font-bold text-emerald-600 capitalize">{profile?.status || 'Active'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <HiClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Login</p>
                <p className="text-sm font-bold text-slate-900">{formatDateTime(profile?.last_login_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <HiCheckBadge className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-slate-900">{formatDateTime(profile?.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-black tracking-tight mb-4">Security Center</h2>
          <p className="text-indigo-200/60 text-sm leading-relaxed">
            Your account is the master key to the HRIS platform. Keep your password strong and rotated regularly.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <HiKey className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Password</h3>
            <p className="text-xs text-slate-400 font-medium">Use at least 8 characters.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className={`${fieldClass} mt-1`}
              value={pw.currentPassword}
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className={`${fieldClass} mt-1`}
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
              <input
                type="password"
                autoComplete="new-password"
                className={`${fieldClass} mt-1`}
                value={pw.confirmPassword}
                onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              label={changingPw ? 'Updating…' : 'Update Password'}
              icon={HiKey}
              variant="primary"
              className="bg-slate-900 border-none px-6 font-bold"
              disabled={changingPw}
              onClick={handleChangePassword}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Center</h1>
          <p className="text-sm font-medium text-slate-400">Manage your administrator profile and credentials.</p>
        </div>
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
          </div>
        ) : activeTab === 'overview' ? (
          renderOverview()
        ) : (
          renderSecurity()
        )}
      </div>
    </div>
  )
}

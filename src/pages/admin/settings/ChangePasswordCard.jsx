import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineKey, HiEye, HiEyeSlash } from 'react-icons/hi2'
import { SectionCard } from './components/ui'
import { Button } from '../../../components/ui/Button.jsx'
import { changePassword } from '../../../services/accountService'

const errMsg = (e, fb) => e?.response?.data?.message || e?.message || fb

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={label === 'Current password' ? 'current-password' : 'new-password'}
          className="block w-full rounded-lg border-0 py-2 pl-3 pr-10 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

/** Self-service "change my password" — works for any logged-in profile. */
export default function ChangePasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [saving, setSaving] = useState(false)

  const canSubmit =
    current.length > 0 && next.length >= 8 && next === confirm && next !== current && !saving

  const submit = async (e) => {
    e.preventDefault()
    if (next.length < 8) return toast.error('New password must be at least 8 characters.')
    if (next !== confirm) return toast.error('New password and confirmation do not match.')
    if (next === current) return toast.error('New password must be different from the current one.')
    setSaving(true)
    try {
      await changePassword(current, next)
      toast.success('Password updated successfully.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      toast.error(errMsg(err, 'Could not update password.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SectionCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F766E]/10 text-[#0F766E]">
          <HiOutlineKey className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Change password</h3>
          <p className="text-xs text-gray-500">Use a strong password you don’t use anywhere else.</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <PasswordField
          label="Current password"
          value={current}
          onChange={setCurrent}
          show={show.current}
          onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          placeholder="Enter current password"
        />
        <PasswordField
          label="New password"
          value={next}
          onChange={setNext}
          show={show.next}
          onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChange={setConfirm}
          show={show.confirm}
          onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          placeholder="Re-enter new password"
        />
        {confirm.length > 0 && next !== confirm && (
          <p className="text-xs font-medium text-rose-600">Passwords do not match.</p>
        )}
        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={!canSubmit}>
            {saving ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}

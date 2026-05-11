import { useEffect, useMemo, useState } from 'react'
import { useLeaveSettings } from '../../../hooks/settings/useLeaveSettings'
import { Toggle } from './components/ui.jsx'

const PAID_UNPAID = ['Paid', 'Unpaid']
const ACCRUAL = ['Monthly', 'Yearly', 'None']
const LOP = ['No LOP', 'Full LOP', 'Half LOP']

const selectClass =
  'w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50'

const numberClass = selectClass

function daysBadgeText(lt) {
  if (lt.entitlementLabel) return lt.entitlementLabel
  if (lt.annualEntitlementDays > 0) return `${lt.annualEntitlementDays} days`
  return '— days'
}

function FormRow({ label, children }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0">
      <label className="w-2/5 text-sm text-gray-700">{label}</label>
      <div className="w-[55%]">{children}</div>
    </div>
  )
}

export default function LeaveSettings({ registerToolbar }) {
  const {
    leaveTypes,
    approverOptions,
    selectedId,
    formState,
    loading,
    saving,
    error,
    selectedType,
    selectLeaveType,
    updateField,
    addCustomLeaveType,
    deleteSelectedLeaveType,
  } = useLeaveSettings(registerToolbar)

  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')

  const approverSelectOpts = useMemo(() => {
    const out = [...approverOptions]
    if (formState.approver && !out.includes(formState.approver)) {
      out.unshift(formState.approver)
    }
    return out
  }, [approverOptions, formState.approver])

  useEffect(() => {
    if (!showCustomInput) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowCustomInput(false)
        setCustomName('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCustomInput])

  const submitCustom = async (e) => {
    e.preventDefault()
    const n = customName.trim()
    if (n.length < 2) return
    await addCustomLeaveType(n)
    setCustomName('')
    setShowCustomInput(false)
  }

  if (loading && leaveTypes.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
        Loading leave settings…
      </div>
    )
  }

  if (error && leaveTypes.length === 0) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-full space-y-6 bg-gray-50 pb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Leave Settings</h2>
        <p className="text-sm text-gray-500">Leave Types &amp; Rules</p>
      </div>

      <div className="flex gap-6">
        {/* Left panel */}
        <div className="w-72 shrink-0">
          <div className="flex h-full min-h-[420px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex-1 overflow-y-auto">
              {leaveTypes.map((lt) => {
                const selected = lt.id === selectedId
                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => selectLeaveType(lt)}
                    className={`mb-2 w-full rounded-lg p-4 text-left transition-colors ${
                      selected
                        ? 'border-2 border-gray-900 bg-white'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800">{lt.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          lt.paidOrUnpaid === 'Unpaid'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {lt.paidOrUnpaid === 'Unpaid' ? 'Unpaid' : 'Paid'}
                      </span>
                      <span className="text-xs text-gray-500">{daysBadgeText(lt)}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 border-t border-gray-100 pt-3">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full rounded-lg border border-dashed border-gray-300 py-3 text-center text-sm text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-50"
                >
                  + Custom Type
                </button>
              ) : (
                <form onSubmit={submitCustom} className="space-y-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Leave type name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className={selectClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || customName.trim().length < 2}
                      className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false)
                        setCustomName('')
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="min-w-0 flex-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {!selectedId ? (
              <div className="flex min-h-[320px] items-center justify-center text-sm text-gray-500">
                Select a leave type to configure
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-gray-900">
                    {formState.name} — Configuration
                  </h3>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-sm font-medium ${
                      formState.paidOrUnpaid === 'Unpaid'
                        ? 'text-orange-500'
                        : 'text-green-600'
                    }`}
                  >
                    {formState.paidOrUnpaid}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Leave Type Details
                  </p>

                  <FormRow label="Leave Type Name">
                    <input
                      type="text"
                      value={formState.name ?? ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      disabled={!selectedType?.isCustom}
                      className={`${selectClass} ${!selectedType?.isCustom ? 'cursor-not-allowed bg-gray-50' : ''}`}
                    />
                  </FormRow>

                  <FormRow label="Paid or Unpaid">
                    <select
                      value={formState.paidOrUnpaid ?? 'Paid'}
                      onChange={(e) => updateField('paidOrUnpaid', e.target.value)}
                      className={selectClass}
                    >
                      {PAID_UNPAID.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </FormRow>

                  <FormRow label="Annual Entitlement (days)">
                    {formState.entitlementLabel ? (
                      <p className="text-sm text-gray-800">{formState.entitlementLabel}</p>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={formState.annualEntitlementDays ?? 0}
                        onChange={(e) =>
                          updateField('annualEntitlementDays', Number(e.target.value))
                        }
                        className={numberClass}
                      />
                    )}
                  </FormRow>

                  <FormRow label="Accrual">
                    <select
                      value={formState.accrual ?? 'Monthly'}
                      onChange={(e) => updateField('accrual', e.target.value)}
                      className={selectClass}
                    >
                      {ACCRUAL.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </FormRow>

                  <FormRow label="Max Carry Forward (days)">
                    <input
                      type="number"
                      min={0}
                      value={formState.maxCarryForwardDays ?? 0}
                      onChange={(e) =>
                        updateField('maxCarryForwardDays', Number(e.target.value))
                      }
                      className={numberClass}
                    />
                  </FormRow>

                  <FormRow label="Loss of Pay Rule">
                    <select
                      value={formState.lossOfPayRule ?? 'No LOP'}
                      onChange={(e) => updateField('lossOfPayRule', e.target.value)}
                      className={selectClass}
                    >
                      {LOP.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </FormRow>

                  <FormRow label="Document Required">
                    <Toggle
                      checked={Boolean(formState.documentRequired)}
                      onChange={(v) => updateField('documentRequired', v)}
                    />
                  </FormRow>

                  <FormRow label="Auto-Approval">
                    <Toggle
                      checked={Boolean(formState.autoApproval)}
                      onChange={(v) => updateField('autoApproval', v)}
                    />
                  </FormRow>

                  <FormRow label="Approver">
                    <select
                      value={formState.approver ?? 'Manager'}
                      onChange={(e) => updateField('approver', e.target.value)}
                      className={selectClass}
                    >
                      {approverSelectOpts.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                </div>

                {selectedType?.isCustom ? (
                  <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Danger zone
                    </p>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deleteSelectedLeaveType()}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      Delete Leave Type
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

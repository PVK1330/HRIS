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
      <div className="rounded-none border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading leave settings…
      </div>
    )
  }

  if (error && leaveTypes.length === 0) {
    return (
      <div className="rounded-none border border-red-100 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-full space-y-6 bg-slate-50 pb-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Leave Configuration</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Leave Types & Rules</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: Leave Types List */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="flex h-full min-h-[420px] flex-col rounded-none border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Catalog</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {leaveTypes.map((lt) => {
                const selected = lt.id === selectedId
                return (
                  <button
                    key={lt.id}
                    type="button"
                    onClick={() => selectLeaveType(lt)}
                    className={`w-full rounded-none p-4 text-left transition-all border ${
                      selected
                        ? 'border-[#0F766E] bg-emerald-50/50 ring-1 ring-[#0F766E]'
                        : 'border-slate-100 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`text-sm font-bold ${selected ? 'text-[#0F766E]' : 'text-slate-800'}`}>{lt.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                          lt.paidOrUnpaid === 'Unpaid'
                            ? 'border-orange-200 bg-orange-50 text-orange-700'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {lt.paidOrUnpaid === 'Unpaid' ? 'Unpaid' : 'Paid'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{daysBadgeText(lt)}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full rounded-none border border-dashed border-slate-300 py-3 text-center text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-slate-400 hover:text-[#0F766E] hover:bg-slate-50"
                >
                  + Create Custom Type
                </button>
              ) : (
                <form onSubmit={submitCustom} className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <input
                    autoFocus
                    type="text"
                    placeholder="New type name..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving || customName.trim().length < 2}
                      className="flex-1 rounded-none bg-[#0F766E] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-40"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomInput(false)
                        setCustomName('')
                      }}
                      className="flex-1 rounded-none border border-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: Details */}
        <div className="min-w-0 flex-1">
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[500px]">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 bg-slate-50/30">
                <div className="h-12 w-12 rounded-none border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                  <span className="text-2xl">?</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Select a leave type to configure</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-1 bg-[#0F766E]" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {formState.name} Settings
                      </h3>
                   </div>
                   <span
                     className={`rounded-none border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                       formState.paidOrUnpaid === 'Unpaid'
                         ? 'border-orange-200 bg-orange-50 text-orange-600'
                         : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                     }`}
                   >
                     {formState.paidOrUnpaid}
                   </span>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid gap-x-12 gap-y-6 md:grid-cols-1">
                    <FormRow label="Module Identifier">
                      <input
                        type="text"
                        value={formState.name ?? ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        disabled={!selectedType?.isCustom}
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      />
                    </FormRow>

                    <FormRow label="Financial Classification">
                      <select
                        value={formState.paidOrUnpaid ?? 'Paid'}
                        onChange={(e) => updateField('paidOrUnpaid', e.target.value)}
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                      >
                        {PAID_UNPAID.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </FormRow>

                    <FormRow label="Annual Quota (Days)">
                      {formState.entitlementLabel ? (
                        <div className="w-full rounded-none border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 italic">
                          {formState.entitlementLabel}
                        </div>
                      ) : (
                        <input
                          type="number"
                          min={0}
                          value={formState.annualEntitlementDays ?? 0}
                          onChange={(e) =>
                            updateField('annualEntitlementDays', Number(e.target.value))
                          }
                          className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                        />
                      )}
                    </FormRow>

                    <FormRow label="Accrual Model">
                      <select
                        value={formState.accrual ?? 'Monthly'}
                        onChange={(e) => updateField('accrual', e.target.value)}
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                      >
                        {ACCRUAL.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </FormRow>

                    <FormRow label="Rollover Ceiling (Days)">
                      <input
                        type="number"
                        min={0}
                        value={formState.maxCarryForwardDays ?? 0}
                        onChange={(e) =>
                          updateField('maxCarryForwardDays', Number(e.target.value))
                        }
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </FormRow>

                    <FormRow label="Negative Balance (LOP)">
                      <select
                        value={formState.lossOfPayRule ?? 'No LOP'}
                        onChange={(e) => updateField('lossOfPayRule', e.target.value)}
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                      >
                        {LOP.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </FormRow>

                    <FormRow label="Evidence Required">
                      <div className="flex h-10 items-center">
                        <Toggle
                          checked={Boolean(formState.documentRequired)}
                          onChange={(v) => updateField('documentRequired', v)}
                        />
                      </div>
                    </FormRow>

                    <FormRow label="Autonomous Approval">
                      <div className="flex h-10 items-center">
                        <Toggle
                          checked={Boolean(formState.autoApproval)}
                          onChange={(v) => updateField('autoApproval', v)}
                        />
                      </div>
                    </FormRow>

                    <FormRow label="Default Approver Authority">
                      <select
                        value={formState.approver ?? 'Manager'}
                        onChange={(e) => updateField('approver', e.target.value)}
                        className="w-full rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 focus:border-[#0F766E] focus:outline-none focus:ring-1 focus:ring-[#0F766E] cursor-pointer"
                      >
                        {approverSelectOpts.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </FormRow>
                  </div>

                  {selectedType?.isCustom && (
                    <div className="mt-12 border-t border-slate-100 pt-8 pb-4">
                      <div className="rounded-none border border-red-100 bg-red-50/50 p-4">
                         <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Critical Action</h4>
                         <p className="text-xs text-red-600/80 mb-4 font-medium">Removing this leave type will archive it and prevent future applications.</p>
                         <button
                           type="button"
                           disabled={saving}
                           onClick={() => deleteSelectedLeaveType()}
                           className="rounded-none border border-red-300 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all disabled:opacity-40 shadow-xs"
                         >
                           Purge Leave Type
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FormRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 py-4 last:border-b-0">
      <label className="mb-2 sm:mb-0 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="w-full sm:w-[50%]">{children}</div>
    </div>
  )
}

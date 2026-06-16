/**
 * ApprovalChain — visual approval-level display + optional override select.
 *
 * Renders the 3-stage chain  Reporting Manager → Department Head → HR
 * as teal chips. If `onChange` is provided an admin can switch to an
 * alternate workflow via the small dropdown underneath.
 */

const APPROVAL_OPTIONS = [
  'Reporting Manager → Dept Head → HR',
  'Reporting Manager → HR',
  'HR Only',
  'Auto Approve',
]

const DEFAULT_FLOW = 'Reporting Manager → Dept Head → HR'

/** Split any "A → B → C" string into step labels. */
function parseSteps(value) {
  return String(value || DEFAULT_FLOW)
    .split('→')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ApprovalChain({ value, onChange }) {
  const current = value || DEFAULT_FLOW
  const steps   = parseSteps(current)

  return (
    <div className="space-y-3 min-w-0">
      {/* Visual chain */}
      <div className="flex flex-wrap items-center gap-1.5">
        {steps.map((step, idx) => (
          <span key={step} className="flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-none border border-[#0F766E]/20 bg-[#0F766E]/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#0F766E]">
              {step}
            </span>
            {idx < steps.length - 1 && (
              <span className="text-xs font-black text-slate-400">→</span>
            )}
          </span>
        ))}
      </div>

      {/* Override dropdown — only shown when a change handler is provided */}
      {onChange && (
        <select
          value={current}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-full max-w-[280px] cursor-pointer rounded-none border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 shadow-2xs outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
        >
          {APPROVAL_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
    </div>
  )
}

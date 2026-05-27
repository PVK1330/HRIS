import { HiCheck, HiArrowPath, HiXMark } from 'react-icons/hi2'

const STEPS = [
  { key: 'submitted', label: 'Submitted', description: 'Request initiated' },
  { key: 'approved', label: 'Approved', description: 'Manager reviewed' },
  { key: 'clearance', label: 'Clearance', description: 'Tasks & handover' },
  { key: 'interview', label: 'Interview', description: 'Exit feedback' },
  { key: 'settlement', label: 'Settlement', description: 'Final payment' },
  { key: 'exited', label: 'Exited', description: 'Process complete' },
]

const STATUS_TO_INDEX = {
  submitted: 0,
  pending_approval: 0,
  'Pending Approval': 0,
  rejected: -1,
  Rejected: -1,
  approved: 1,
  Approved: 1,
  clearance: 2,
  'In Progress': 2,
  interview: 3,
  settlement: 4,
  completed: 5,
  Completed: 5,
  exited: 5,
}

export default function ExitStatusStepper({ currentStatus, exitType }) {
  const normalised = currentStatus?.toLowerCase?.() ?? currentStatus
  const activeIndex = STATUS_TO_INDEX[currentStatus] ?? STATUS_TO_INDEX[normalised] ?? 0
  const isRejected = activeIndex === -1

  const steps = STEPS.map((step, i) => {
    if (i === 0 && exitType === 'termination') {
      return { ...step, label: 'Initiated', description: 'Termination started' }
    }
    return step
  })

  if (isRejected) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex items-start justify-between min-w-[580px] px-2">
          {steps.map((step, index) => {
            const isDone = index === 0
            const isLast = index === steps.length - 1
            const isRejectedStep = index === 1

            return (
              <div key={step.key} className="flex flex-1 items-start">
                <div className="flex flex-col items-center w-full">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                        isDone
                          ? 'bg-[#0F766E] text-white shadow-[0_0_0_4px_rgba(15,118,110,0.15)]'
                          : isRejectedStep
                            ? 'bg-red-500 text-white shadow-[0_0_0_4px_rgba(239,68,68,0.15)]'
                            : 'border-2 border-slate-200 text-slate-400 bg-white'
                      }`}
                    >
                      {isDone ? (
                        <HiCheck className="h-5 w-5" />
                      ) : isRejectedStep ? (
                        <HiXMark className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                  </div>
                  <span
                    className={`mt-2.5 text-xs font-bold text-center leading-tight ${
                      isDone ? 'text-[#0F766E]' : isRejectedStep ? 'text-red-500' : 'text-slate-400'
                    }`}
                  >
                    {isRejectedStep ? 'Rejected' : step.label}
                  </span>
                  <span
                    className={`text-[9px] text-center mt-0.5 ${
                      isDone ? 'text-teal-600/70' : isRejectedStep ? 'text-red-400' : 'text-slate-300'
                    }`}
                  >
                    {isRejectedStep ? 'Request declined' : step.description}
                  </span>
                </div>
                {!isLast && (
                  <div className="flex items-center pt-5 flex-1 min-w-[24px]">
                    <div className="relative w-full h-[3px]">
                      <div className="absolute inset-0 bg-slate-200 rounded-full" />
                      {isDone && (
                        <div
                          className="absolute inset-y-0 left-0 bg-red-400 rounded-full"
                          style={{ width: isRejectedStep ? '0%' : '100%' }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-start justify-between min-w-[580px] px-2">
        {steps.map((step, index) => {
          const isDone = index < activeIndex
          const isCurrent = index === activeIndex
          const isLast = index === steps.length - 1

          return (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex flex-col items-center w-full">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-[#0F766E] text-white shadow-[0_0_0_4px_rgba(15,118,110,0.15)]'
                        : isCurrent
                          ? 'border-[3px] border-[#0F766E] text-[#0F766E] bg-white shadow-[0_0_0_4px_rgba(15,118,110,0.1)]'
                          : 'border-2 border-slate-200 text-slate-400 bg-white'
                    }`}
                  >
                    {isDone ? (
                      <HiCheck className="h-5 w-5" />
                    ) : isCurrent ? (
                      <HiArrowPath className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F766E] opacity-40" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0F766E]" />
                    </span>
                  )}
                </div>
                <span
                  className={`mt-2.5 text-xs font-bold text-center leading-tight ${
                    isDone || isCurrent ? 'text-[#0F766E]' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-[9px] text-center mt-0.5 ${
                    isDone || isCurrent ? 'text-teal-600/70' : 'text-slate-300'
                  }`}
                >
                  {step.description}
                </span>
              </div>
              {!isLast && (
                <div className="flex items-center pt-5 flex-1 min-w-[24px]">
                  <div className="relative w-full h-[3px]">
                    <div className="absolute inset-0 bg-slate-200 rounded-full" />
                    <div
                      className="absolute inset-y-0 left-0 bg-[#0F766E] rounded-full transition-all duration-500"
                      style={{
                        width: isDone ? '100%' : isCurrent ? '50%' : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

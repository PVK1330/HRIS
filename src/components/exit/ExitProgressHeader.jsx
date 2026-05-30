import { HiCheck } from 'react-icons/hi2'
import { DEFAULT_PIPELINE_STAGES, resolveStageIndex } from '../../utils/exitPipelineStages.js'

export default function ExitProgressHeader({ record, stages = DEFAULT_PIPELINE_STAGES, sticky = true }) {
  const list = [...stages].sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
  const activeIndex = resolveStageIndex(record, list)

  return (
    <div
      className={`${sticky ? 'sticky top-0 z-20' : ''} border border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm`}
    >
      <div className="overflow-x-auto px-4 py-4">
        <div className="flex min-w-[640px] items-center justify-between gap-2">
          {list.map((stage, idx) => {
            const done = idx < activeIndex
            const active = idx === activeIndex
            return (
              <div key={stage.stage_key} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                      done
                        ? 'border-[#0F766E] bg-[#0F766E] text-white'
                        : active
                          ? 'border-[#0F766E] bg-white text-[#0F766E] ring-4 ring-[#0F766E]/15'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {done ? <HiCheck className="h-4 w-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide text-center ${
                      active ? 'text-[#0F766E]' : done ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {idx < list.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 rounded transition-colors duration-300 ${
                      idx < activeIndex ? 'bg-[#0F766E]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { resolveStageIndex }

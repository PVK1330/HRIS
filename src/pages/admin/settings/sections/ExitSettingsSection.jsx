import { useState } from 'react'
import { HiArrowRightOnRectangle, HiBuildingOffice2 } from 'react-icons/hi2'
import TerminationTypes from '../TerminationTypes.jsx'
import ExitWorkflowConfig from '../../../exit/ExitWorkflowConfig.jsx'

const EXIT_TABS = [
  { id: 'workflow', label: 'Department Workflow', Icon: HiBuildingOffice2 },
  { id: 'termination', label: 'Termination Types', Icon: HiArrowRightOnRectangle },
]

export default function ExitSettingsSection() {
  const [exitTab, setExitTab] = useState('workflow')
  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        {EXIT_TABS.map((t) => {
          const Icon = t.Icon
          const isActive = exitTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setExitTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all rounded-sm ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
      {exitTab === 'workflow' && <ExitWorkflowConfig />}
      {exitTab === 'termination' && <TerminationTypes embedded />}
    </div>
  )
}

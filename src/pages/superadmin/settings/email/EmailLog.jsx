import { HiCommandLine, HiServer, HiEnvelope } from 'react-icons/hi2'
import SettingsCard from '../../../../components/settings/SettingsCard.jsx'
import { Table } from '../../../../components/ui/Table.jsx'

const COLUMNS = [
  { key: 'sentAt', label: 'Sent At' },
  { key: 'to', label: 'Recipient' },
  { key: 'subject', label: 'Subject' },
  { key: 'status', label: 'Status' },
]

export default function EmailLog() {
  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transmission Logs</h1>
          <p className="mt-1 text-slate-500 text-xs font-medium">Audit trail of automated platform communications.</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg">
          <HiCommandLine className="h-5 w-5" />
        </div>
      </div>

      <div className="group relative rounded-[1.5rem] border border-slate-200 bg-white p-5 md:p-6 shadow-sm transition-all hover:shadow-md">
         <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                <HiServer className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Audit Trail</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Transmission History</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-100">
               <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Persistence</span>
            </div>
         </div>

         <div className="overflow-hidden rounded-2xl border border-slate-100">
            <Table
              columns={COLUMNS}
              data={[]}
              emptyMessage={
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-200">
                      <HiEnvelope className="h-8 w-8" />
                   </div>
                   <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">No Transmissions</h4>
                   <p className="mt-1 text-[10px] font-medium text-slate-400 max-w-[240px]">Communications will be logged once active.</p>
                </div>
              }
            />
         </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-[11px] font-medium text-blue-700 text-center border-dashed">
         <p className="tracking-tight">Logs are automatically purged every 90 days for performance and privacy compliance.</p>
      </div>
    </div>
  )
}

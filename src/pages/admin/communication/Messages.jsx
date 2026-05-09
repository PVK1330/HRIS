import { useMemo, useState } from 'react'
import { HiMagnifyingGlass, HiChatBubbleLeftRight } from 'react-icons/hi2'
import { Badge } from '../../../components/ui/Badge.jsx'

const MOCK_THREADS = [
  { id: 1, title: 'HR Policy Clarification', from: 'HR Team', status: 'Open', updatedAt: 'Today, 11:20 AM' },
  { id: 2, title: 'Payroll Inquiry - April', from: 'Finance', status: 'In Progress', updatedAt: 'Today, 09:45 AM' },
  { id: 3, title: 'Leave Balance Request', from: 'Employee', status: 'Resolved', updatedAt: 'Yesterday, 06:12 PM' },
]

export default function Messages() {
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return MOCK_THREADS
    return MOCK_THREADS.filter((t) =>
      `${t.title} ${t.from} ${t.status}`.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <HiChatBubbleLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Messages</h1>
            <p className="text-xs text-slate-500">Internal communication threads for HR operations.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:bg-white focus:border-slate-300"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span className="col-span-5">Thread</span>
          <span className="col-span-3">From</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Updated</span>
        </div>
        {rows.map((thread) => (
          <div key={thread.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0">
            <span className="col-span-5 text-sm font-semibold text-slate-900">{thread.title}</span>
            <span className="col-span-3 text-sm text-slate-600">{thread.from}</span>
            <span className="col-span-2">
              <Badge
                label={thread.status}
                color={thread.status === 'Resolved' ? 'green' : thread.status === 'In Progress' ? 'amber' : 'indigo'}
                variant="glass"
              />
            </span>
            <span className="col-span-2 text-xs text-slate-500">{thread.updatedAt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

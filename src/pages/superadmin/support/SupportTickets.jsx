import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import {
  HiPaperAirplane,
  HiUserPlus,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiUserCircle,
  HiArrowPath,
  HiQuestionMarkCircle,
  HiTicket,
  HiLifebuoy,
  HiShieldExclamation,
  HiHeart
} from 'react-icons/hi2'

export default function SupportTickets() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-0091', org: 'TalentCo FZCO', subject: 'SSL certificate not renewing automatically', priority: 'Critical', assignedTo: 'Raj Mehta', created: '09 Apr 2026', status: 'Open', description: 'Our custom domain SSL is expiring in 2 days and the auto-renew feature seems to be failing with a DNS verification error.', messages: [{ sender: 'Client', text: 'Our custom domain SSL is expiring in 2 days and the auto-renew feature seems to be failing with a DNS verification error.', time: '09 Apr, 10:00 AM' }] },
    { id: 'TKT-0089', org: 'HR Nexus', subject: 'Custom domain DNS not propagating', priority: 'High', assignedTo: 'Sara Patel', created: '08 Apr 2026', status: 'In Progress', description: 'We updated the CNAME records 48 hours ago but the site is still not reachable via our custom domain.', messages: [] },
    { id: 'TKT-0087', org: 'AlphaCorp HR', subject: 'Bulk import failing for 500+ employees', priority: 'Medium', assignedTo: 'Raj Mehta', created: '07 Apr 2026', status: 'In Progress', description: 'The CSV upload keeps timing out after processing about 200 rows.', messages: [] },
    { id: 'TKT-0085', org: 'Meridian HR', subject: 'Email notifications not sending', priority: 'High', assignedTo: 'Unassigned', created: '06 Apr 2026', status: 'Open', description: 'New employees are not receiving their welcome emails and password reset links.', messages: [] },
  ])

  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [assignee, setAssignee] = useState('')

  const handleReply = () => {
    if (!replyText.trim()) return
    const newMessage = {
      sender: 'Support',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, messages: [...(t.messages || []), newMessage], status: 'In Progress' } : t))
    setReplyText('')
  }

  const handleAssign = () => {
    if (!assignee) return
    setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, assignedTo: assignee, status: 'In Progress' } : t))
    setShowAssignModal(false)
  }

  const handleResolve = (ticketId) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    setShowReplyModal(false)
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <HiLifebuoy className="h-4.5 w-4.5" />
             </div>
             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Support</h1>
             <div className="group relative">
                <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-emerald-500 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                   <p className="font-bold text-emerald-400 mb-1 uppercase tracking-widest">Support Center</p>
                   Manage and resolve help requests from organization admins.
                   <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
             </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage and resolve help requests.</p>
        </div>
        <Button label="Refresh" variant="ghost" icon={HiArrowPath} size="sm" className="text-slate-500 font-bold" onClick={() => {}} />
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="PENDING" value={tickets.filter(t => t.status === 'Open').length.toString()} icon={HiShieldExclamation} trendColor="red" />
        <StatCard title="ACTIVE" value={tickets.filter(t => t.status === 'In Progress').length.toString()} icon={HiClock} trendColor="amber" />
        <StatCard title="RESOLVED" value="1,242" icon={HiCheckCircle} trendColor="green" />
        <StatCard title="SATISFACTION" value="98%" icon={HiHeart} trendColor="rose" />
      </div>

      {/* Ticket Table */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <Table
          columns={[
            { key: 'ticket', label: 'Ticket ID & Subject' },
            { key: 'org', label: 'Organization' },
            { key: 'priority', label: 'Priority' },
            { key: 'assignedTo', label: 'Administrator' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Control' },
          ]}
          data={tickets.map((ticket) => ({
            ticket: (
              <div className="flex flex-col py-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{ticket.id}</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight truncate max-w-[280px]">{ticket.subject}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ticket.created}</span>
              </div>
            ),
            org: <span className="text-xs font-black text-slate-700 uppercase tracking-wider">{ticket.org}</span>,
            priority: <Badge label={ticket.priority} color={ticket.priority === 'Critical' ? 'red' : ticket.priority === 'High' ? 'amber' : 'blue'} variant="glass" />,
            assignedTo: (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                  {ticket.assignedTo === 'Unassigned' ? '?' : ticket.assignedTo.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-slate-600">{ticket.assignedTo}</span>
              </div>
            ),
            status: <Badge label={ticket.status} color={ticket.status === 'Open' ? 'red' : ticket.status === 'In Progress' ? 'amber' : 'green'} />,
            actions: (
              <div className="flex gap-2">
                <Button label={ticket.status === 'Open' ? 'Resolve Now' : 'Inspect'} variant="ghost" size="sm" className="font-black uppercase text-[10px] tracking-widest" onClick={() => { setSelectedTicket(ticket); setShowReplyModal(true); }} />
                {ticket.assignedTo === 'Unassigned' && (
                  <Button variant="ghost" size="sm" icon={HiUserPlus} className="text-slate-400 hover:text-emerald-600" onClick={() => { setSelectedTicket(ticket); setShowAssignModal(true); }} />
                )}
              </div>
            ),
          }))}
        />
      </div>

      {/* Professional Support Interface */}
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        title={selectedTicket?.subject || ''}
        description={selectedTicket ? `ID: ${selectedTicket.id} · Origin: ${selectedTicket.org} · Reported ${selectedTicket.created}` : ''}
        icon={HiTicket}
        size="lg"
      >
        {selectedTicket && (
          <div className="flex flex-col h-[600px] p-2">
            <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
              <div className="flex items-center gap-4">
                 <Badge label={selectedTicket.status} color={selectedTicket.status === 'Open' ? 'red' : 'amber'} variant="glass" />
                 <div className="h-4 w-px bg-slate-100" />
                 <div className="flex items-center gap-2">
                    <HiClock className="h-4 w-4 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA: 2.5h Remaining</span>
                 </div>
              </div>
            </div>

            <div className="bg-slate-50/50 rounded-[1.5rem] p-6 mb-8 border border-slate-100 relative">
               <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Initial Incident Report</div>
               <p className="text-sm font-medium text-slate-700 leading-relaxed italic text-center">"{selectedTicket.description}"</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-4 mb-8 scrollbar-thin scrollbar-thumb-slate-200">
              {selectedTicket.messages?.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'Support' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-[1.5rem] px-5 py-3.5 text-sm font-medium shadow-sm leading-relaxed ${
                    msg.sender === 'Support' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none shadow-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-1">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{msg.time}</span>
                     <div className="h-1 w-1 rounded-full bg-slate-200" />
                     <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'Support' ? 'text-emerald-500' : 'text-slate-400'}`}>{msg.sender}</span>
                  </div>
                </div>
              ))}
              {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                <div className="text-center py-16">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                     <HiChatBubbleLeftRight className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No diagnostic data available</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex gap-4 items-end">
                <textarea
                  className="flex-1 rounded-[1.5rem] border border-slate-200 bg-slate-50/50 px-6 py-4 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all resize-none shadow-sm"
                  placeholder="Draft an administrative resolution..."
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <Button variant="primary" icon={HiPaperAirplane} className="h-[52px] w-[52px] flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 p-0 border-none rounded-[1.25rem]" onClick={handleReply} disabled={!replyText.trim()} />
              </div>
              
              <div className="mt-8 flex justify-between items-center bg-slate-900 p-4 rounded-[1.5rem] shadow-xl shadow-slate-200">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-white/50">
                      <HiUserCircle className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Active Resolver</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-wider">{selectedTicket.assignedTo}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                  <Button label="Transfer" variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white hover:bg-white/5 border-transparent" onClick={() => setShowAssignModal(true)} />
                  <Button label="Save" variant="secondary" size="sm" className="text-[10px] uppercase font-bold tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white border-none px-6 shadow-lg shadow-emerald-900/20" onClick={() => handleResolve(selectedTicket.id)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Transfer Ticket"
        description="Assign this ticket to another support agent."
        icon={HiUserPlus}
      >
        <div className="space-y-6 p-2">
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">Support Agent</label>
             <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all appearance-none shadow-sm cursor-pointer" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Select an agent...</option>
                <option>Raj Mehta (SSL/DNS)</option>
                <option>Sara Patel (Database)</option>
                <option>John Doe (Auth/API)</option>
                <option>Emily Chen (Billing)</option>
             </select>
          </div>
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <Button label="Cancel" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowAssignModal(false)} />
            <Button label="Save" variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-none" onClick={handleAssign} disabled={!assignee} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

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
  HiArrowPath
} from 'react-icons/hi2'

export default function SupportTickets() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-0091', tenant: 'TalentCo FZCO', subject: 'SSL certificate not renewing automatically', priority: 'Critical', assignedTo: 'Raj Mehta', created: '09 Apr 2026', status: 'Open', description: 'Our custom domain SSL is expiring in 2 days and the auto-renew feature seems to be failing with a DNS verification error.', messages: [{ sender: 'Client', text: 'Our custom domain SSL is expiring in 2 days and the auto-renew feature seems to be failing with a DNS verification error.', time: '09 Apr, 10:00 AM' }] },
    { id: 'TKT-0089', tenant: 'HR Nexus', subject: 'Custom domain DNS not propagating', priority: 'High', assignedTo: 'Sara Patel', created: '08 Apr 2026', status: 'In Progress', description: 'We updated the CNAME records 48 hours ago but the site is still not reachable via our custom domain.', messages: [] },
    { id: 'TKT-0087', tenant: 'AlphaCorp HR', subject: 'Bulk import failing for 500+ employees', priority: 'Medium', assignedTo: 'Raj Mehta', created: '07 Apr 2026', status: 'In Progress', description: 'The CSV upload keeps timing out after processing about 200 rows.', messages: [] },
    { id: 'TKT-0085', tenant: 'Meridian HR', subject: 'Email notifications not sending', priority: 'High', assignedTo: 'Unassigned', created: '06 Apr 2026', status: 'Open', description: 'New employees are not receiving their welcome emails and password reset links.', messages: [] },
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
    alert(`Ticket ${ticketId} marked as Resolved.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Desk</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and resolve tenant issues globally.</p>
        </div>
        <Button label="Refresh Desk" variant="ghost" icon={HiArrowPath} onClick={() => alert('Syncing latest tickets...')} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="PENDING" value={tickets.filter(t => t.status === 'Open').length.toString()} icon={HiExclamationCircle} trendColor="red" />
        <StatCard title="ACTIVE" value={tickets.filter(t => t.status === 'In Progress').length.toString()} icon={HiClock} trendColor="amber" />
        <StatCard title="SOLVED" value="142" icon={HiCheckCircle} trendColor="green" />
        <StatCard title="AVG RESPONSE" value="4.2h" icon={HiChatBubbleLeftRight} trendColor="blue" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table
          columns={[
            { key: 'ticket', label: 'Ticket ID & Subject' },
            { key: 'tenant', label: 'Tenant' },
            { key: 'priority', label: 'Priority' },
            { key: 'assignedTo', label: 'Assigned To' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tickets.map((ticket) => ({
            ticket: (
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-widest">{ticket.id}</span>
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[240px]">{ticket.subject}</span>
                <span className="text-[10px] text-gray-400">{ticket.created}</span>
              </div>
            ),
            tenant: <span className="text-xs font-bold text-gray-700">{ticket.tenant}</span>,
            priority: <Badge label={ticket.priority} color={ticket.priority === 'Critical' ? 'red' : ticket.priority === 'High' ? 'amber' : 'blue'} />,
            assignedTo: (
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {ticket.assignedTo === 'Unassigned' ? '?' : ticket.assignedTo.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600">{ticket.assignedTo}</span>
              </div>
            ),
            status: <Badge label={ticket.status} color={ticket.status === 'Open' ? 'red' : ticket.status === 'In Progress' ? 'amber' : 'green'} />,
            actions: (
              <div className="flex gap-1">
                <Button label={ticket.status === 'Open' ? 'Take Action' : 'View'} variant="ghost" size="sm" onClick={() => { setSelectedTicket(ticket); setShowReplyModal(true); }} />
                {ticket.assignedTo === 'Unassigned' && (
                  <Button variant="ghost" size="sm" icon={HiUserPlus} title="Assign Admin" onClick={() => { setSelectedTicket(ticket); setShowAssignModal(true); }} />
                )}
              </div>
            ),
          }))}
        />
      </div>

      {/* Professional Ticket Drawer/Modal */}
      <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} title={selectedTicket ? `Issue #${selectedTicket.id}` : ''} size="lg">
        {selectedTicket && (
          <div className="flex flex-col h-[550px]">
             <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div>
                   <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                   <p className="text-xs text-gray-500 mt-0.5">Reported by <span className="font-bold">{selectedTicket.tenant}</span> on {selectedTicket.created}</p>
                </div>
                <Badge label={selectedTicket.status} color={selectedTicket.status === 'Open' ? 'red' : 'amber'} />
             </div>

             <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Initial Problem Description</span>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{selectedTicket.description}"</p>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 scrollbar-thin scrollbar-thumb-gray-200">
                {selectedTicket.messages?.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.sender === 'Support' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      msg.sender === 'Support' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time} · {msg.sender}</span>
                  </div>
                ))}
                {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                   <div className="text-center py-12">
                      <HiChatBubbleLeftRight className="mx-auto h-12 w-12 text-gray-200 mb-2" />
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">No responses yet</p>
                   </div>
                )}
             </div>

             <div className="border-t border-gray-100 pt-6">
                <div className="flex gap-2">
                  <textarea 
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none"
                    placeholder="Provide a professional response..."
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="primary" icon={HiPaperAirplane} className="h-full px-5" onClick={handleReply} disabled={!replyText.trim()} />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                   <div className="flex items-center gap-2 px-2">
                      <HiUserCircle className="text-gray-400 h-5 w-5" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Assigned: {selectedTicket.assignedTo}</span>
                   </div>
                   <div className="flex gap-2">
                      <Button label="Transfer" variant="ghost" size="sm" className="text-[10px] uppercase font-bold" onClick={() => setShowAssignModal(true)} />
                      <Button label="Mark Resolved" variant="ghost" size="sm" className="text-[10px] uppercase font-bold text-green-600 hover:bg-green-50" onClick={() => handleResolve(selectedTicket.id)} />
                   </div>
                </div>
             </div>
          </div>
        )}
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Administrator">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Route this ticket to a specific support specialist.</p>
          <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 outline-none" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Select Agent...</option><option>Raj Mehta</option><option>Sara Patel</option><option>John Doe</option><option>Emily Chen</option>
          </select>
          <div className="flex gap-2 pt-4">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowAssignModal(false)} />
            <Button label="Confirm Assignment" variant="primary" className="flex-1" onClick={handleAssign} disabled={!assignee} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

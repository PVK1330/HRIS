import React from 'react'
import { HiCalendarDays, HiUser, HiBuilding, HiPaperClip } from 'react-icons/hi2'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Badge } from '../../../components/ui/Badge.jsx'

// Status badge color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'Open':
      return 'blue'
    case 'In Progress':
      return 'orange'
    case 'Resolved':
      return 'green'
    case 'Closed':
      return 'gray'
    default:
      return 'gray'
  }
}

// Priority badge color mapping
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Low':
      return 'gray'
    case 'Medium':
      return 'yellow'
    case 'High':
      return 'orange'
    case 'Urgent':
      return 'red'
    default:
      return 'gray'
  }
}

export function TicketDetailsModal({ isOpen, onClose, ticket }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showClose
      header={
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Ticket Details</h2>
            {ticket && (
              <Badge
                label={ticket.status}
                color={getStatusColor(ticket.status)}
              />
            )}
          </div>
          <p className="text-xs font-medium text-slate-500">View ticket information below.</p>
        </div>
      }
    >
      {ticket && (
        <div className="pt-2 space-y-4">
          {/* Ticket ID and Basic Info */}
          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Ticket ID</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">{ticket.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase text-right">Priority</p>
                <div className="mt-0.5 flex justify-end">
                  <Badge label={ticket.priority} color={getPriorityColor(ticket.priority)} />
                </div>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Subject</p>
            <p className="text-sm font-medium text-slate-800">{ticket.subject}</p>
          </div>

          {/* Category & Created Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Category</p>
              <p className="text-sm font-medium text-slate-800">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                <HiCalendarDays className="h-3 w-3" /> Created Date
              </p>
              <p className="text-sm font-medium text-slate-800">{ticket.createdDate}</p>
            </div>
          </div>

          {/* Admin & Tenant */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                <HiUser className="h-3 w-3" /> Admin Name
              </p>
              <p className="text-sm font-medium text-slate-800">{ticket.adminName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase mb-1 flex items-center gap-1">
                <HiBuilding className="h-3 w-3" /> Tenant
              </p>
              <p className="text-sm font-medium text-slate-800">{ticket.tenantName}</p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
          </div>

          {/* Superadmin responses */}
          {((ticket.messages && ticket.messages.length > 0) || (ticket.replies && ticket.replies.length > 0)) && (
            <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-4">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Superadmin Responses</p>
              {(ticket.messages || ticket.replies || []).map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-800 leading-relaxed">{message.text || message.message}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                    <span>{message.sender || 'Support'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Attachment */}
          {ticket.attachmentUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
              <HiPaperClip className="h-4 w-4 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase mb-0.5">Attachment</p>
                <a
                  href={ticket.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-800 truncate hover:text-[#0F766E]"
                >
                  {ticket.attachmentName || ticket.attachmentUrl.split('/').pop()}
                </a>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

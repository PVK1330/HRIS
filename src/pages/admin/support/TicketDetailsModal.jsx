import React, { useState, useRef, useEffect } from 'react'
import { HiCalendarDays, HiUser, HiBuildingOffice, HiPaperClip, HiTicket, HiShieldExclamation, HiLifebuoy, HiTag, HiFolderOpen, HiUserCircle } from 'react-icons/hi2'
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

export function TicketDetailsModal({ isOpen, onClose, ticket, onReply }) {
  const [replyText, setReplyText] = useState('')
  const conversationEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        conversationEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }, 100)
    }
  }, [isOpen, ticket?.messages?.length, ticket?.replies?.length, ticket?.conversation?.length])

  const handleSend = () => {
    if (replyText.trim() && onReply) {
      onReply(replyText)
      setReplyText('')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="custom"
      showClose
      bodyClassName="p-0 bg-slate-50 overflow-hidden"
      header={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ticket Details</h2>
            {ticket && (
              <Badge
                label={ticket.status}
                color={getStatusColor(ticket.status)}
              />
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">
            View ticket information, conversation history, and communicate directly regarding this support request.
          </p>
        </div>
      }
    >
      {ticket && (
        <div className="flex flex-col min-h-0 w-full max-w-[1200px] mx-auto">
          <div className="p-6 overflow-y-auto">
            {/* Information Card Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Ticket ID */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5"><HiTicket className="w-4 h-4" /> Ticket ID</p>
                  <p className="text-sm font-bold text-slate-900">{ticket.id || ticket.ticketId}</p>
                </div>
                {/* Priority */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5"><HiShieldExclamation className="w-4 h-4" /> Priority</p>
                  <div><Badge label={ticket.priority || 'Normal'} color={getPriorityColor(ticket.priority)} /></div>
                </div>
                {/* Status */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5"><HiLifebuoy className="w-4 h-4" /> Status</p>
                  <div><Badge label={ticket.status || 'Waiting'} color={getStatusColor(ticket.status || 'Waiting')} /></div>
                </div>
                {/* Created Date */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5"><HiCalendarDays className="w-4 h-4" /> Created Date</p>
                  <p className="text-sm font-bold text-slate-900">{ticket.createdDate || ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-GB') : '-'}</p>
                </div>
                {/* Subject */}
                <div className="col-span-2 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiTag className="w-4 h-4 text-slate-400" /> Subject</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{ticket.subject || '-'}</p>
                </div>
                {/* Category */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiFolderOpen className="w-4 h-4 text-slate-400" /> Category</p>
                  <p className="text-sm font-bold text-slate-900">{ticket.category || '-'}</p>
                </div>
                {/* Tenant Name */}
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiBuildingOffice className="w-4 h-4 text-slate-400" /> Tenant Name</p>
                  <p className="text-sm font-bold text-slate-900">{ticket.tenantName || '-'}</p>
                </div>
                {/* Admin Name */}
                <div className="col-span-2 md:col-span-4 flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><HiUser className="w-4 h-4 text-slate-400" /> Admin Name</p>
                  <p className="text-sm font-bold text-slate-900">{ticket.adminName || '-'}</p>
                </div>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side (70%) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                    <HiUserCircle className="w-5 h-5 text-[#0F766E]" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Conversation History</h3>
                  </div>
                  
                  <div className="h-[450px] overflow-y-auto p-5 space-y-4 custom-scrollbar flex flex-col">
                    <div className="space-y-4 flex-1">
                      {(ticket.messages || ticket.replies || ticket.conversation || []).length ? (
                        (ticket.messages || ticket.replies || ticket.conversation || []).map((msg, i, arr) => {
                          const isLast = i === arr.length - 1;
                          return (
                            <div
                              key={msg.id}
                              className={`rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${msg.senderRole === 'admin' ? 'border-sky-200 ml-4' : 'border-[#0F766E]/20 mr-4'} ${isLast ? 'ring-2 ring-[#0F766E]/20 ring-offset-2' : ''}`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${msg.senderRole === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-[#0F766E]/10 text-[#0F766E]'}`}>
                                  {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : (msg.senderRole === 'admin' ? 'A' : 'S')}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 truncate">{msg.senderName || msg.sender || (msg.senderRole === 'admin' ? 'Admin' : 'Super Admin')}</span>
                                    <span className={\`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider \${msg.senderRole === 'admin' ? 'bg-sky-50 text-sky-600' : 'bg-[#0F766E]/10 text-[#0F766E]'}\`}>
                                      {msg.senderRole === 'admin' ? 'Admin' : 'Super Admin'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-GB') : '-'}
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('en-GB') : ''}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap ml-13">{msg.text || msg.message}</p>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-sm text-slate-400 font-medium">No conversation history yet.</p>
                        </div>
                      )}
                      <div ref={conversationEndRef} />
                    </div>
                  </div>
                </div>

                {/* Send Response */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <HiPaperClip className="w-5 h-5 text-[#0F766E]" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Send Response</h3>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="w-full min-h-[120px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-4 focus:ring-[#0F766E]/10"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{replyText.length} characters</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyText('')}
                        className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-2 rounded-xl bg-[#0F766E] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0c6b64] hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <HiPaperClip className="w-4 h-4" />
                        Send Response
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side (30%) */}
              <div className="lg:col-span-4">
                <div className="sticky top-0 bg-gradient-to-b from-slate-50 to-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col gap-5">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">Ticket Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Ticket Number</span>
                      <span className="text-sm font-bold text-slate-900">{ticket.id || ticket.ticketId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Priority</span>
                      <Badge label={ticket.priority || 'Normal'} color={getPriorityColor(ticket.priority)} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Status</span>
                      <Badge label={ticket.status || 'Waiting'} color={getStatusColor(ticket.status || 'Waiting')} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Category</span>
                      <span className="text-sm font-bold text-slate-900">{ticket.category || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Tenant Name</span>
                      <span className="text-sm font-bold text-slate-900">{ticket.tenantName || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Created Date</span>
                      <span className="text-sm font-bold text-slate-900">{ticket.createdDate || ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>

                  {(ticket.attachmentUrl || ticket.attachment_url) && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Attachment</p>
                      <a
                        href={ticket.attachmentUrl || ticket.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-[#0F766E] hover:bg-slate-100 transition-colors"
                      >
                        <HiPaperClip className="w-4 h-4" />
                        <span className="truncate">{ticket.attachmentName || ticket.attachmentUrl?.split('/').pop() || 'Download'}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

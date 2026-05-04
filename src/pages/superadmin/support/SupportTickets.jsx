import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'

export default function SupportTickets() {
  const tickets = useMemo(() => [
    { id: 'TKT-0091', tenant: 'TalentCo FZCO', subject: 'SSL certificate not renewing automatically', priority: 'Critical', assignedTo: 'Raj Mehta', created: '09 Apr 2026', status: 'Open' },
    { id: 'TKT-0089', tenant: 'HR Nexus', subject: 'Custom domain DNS not propagating', priority: 'High', assignedTo: 'Sara Patel', created: '08 Apr 2026', status: 'In Progress' },
    { id: 'TKT-0087', tenant: 'AlphaCorp HR', subject: 'Bulk import failing for 500+ employees', priority: 'Medium', assignedTo: 'Raj Mehta', created: '07 Apr 2026', status: 'In Progress' },
    { id: 'TKT-0085', tenant: 'Meridian HR', subject: 'Email notifications not sending', priority: 'High', assignedTo: 'Unassigned', created: '06 Apr 2026', status: 'Open' },
  ], [])

  const priorityColor = (priority) => {
    const colors = {
      'Critical': 'red',
      'High': 'amber',
      'Medium': 'blue',
      'Low': 'gray',
    }
    return colors[priority] || 'gray'
  }

  const statusColor = (status) => {
    const colors = {
      'Open': 'red',
      'In Progress': 'amber',
      'Resolved': 'green',
    }
    return colors[status] || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-gray-600">Manage and track support requests from tenants</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="OPEN" value="5" valueColor="red" />
        <StatCard title="IN PROGRESS" value="8" valueColor="amber" />
        <StatCard title="RESOLVED" value="142" valueColor="green" />
        <StatCard title="AVG RESOLUTION" value="4.2h" valueColor="indigo" />
      </div>

      {/* Tickets Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <Table
          columns={[
            { key: 'ticketId', label: 'Ticket ID' },
            { key: 'tenant', label: 'Tenant' },
            { key: 'subject', label: 'Subject' },
            { key: 'priority', label: 'Priority' },
            { key: 'assignedTo', label: 'Assigned To' },
            { key: 'created', label: 'Created' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={tickets.map((ticket) => ({
            ticketId: <span className="font-mono text-xs text-indigo-500">#{ticket.id}</span>,
            tenant: <span className="text-sm font-semibold text-gray-900">{ticket.tenant}</span>,
            subject: <span className="text-sm text-gray-600">{ticket.subject}</span>,
            priority: <Badge variant={priorityColor(ticket.priority)}>{ticket.priority}</Badge>,
            assignedTo: <span className="text-sm text-gray-600">{ticket.assignedTo}</span>,
            created: <span className="text-xs text-gray-500">{ticket.created}</span>,
            status: <Badge variant={statusColor(ticket.status)}>{ticket.status}</Badge>,
            actions: (
              <div className="flex gap-1">
                <Button label="View" variant="ghost" size="sm" />
                {ticket.assignedTo === 'Unassigned' && <Button label="Assign" variant="primary" size="sm" />}
              </div>
            ),
          }))}
        />
      </div>
    </div>
  )
}

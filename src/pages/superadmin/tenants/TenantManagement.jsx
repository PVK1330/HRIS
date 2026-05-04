import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { HiCheck, HiClock, HiDocumentText, HiXMark } from 'react-icons/hi2'

export default function TenantManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showNewTenantModal, setShowNewTenantModal] = useState(false)
  const [showTenantDetailModal, setShowTenantDetailModal] = useState(false)

  const tenants = useMemo(() => [
    { id: 1, name: 'AlphaCorp HR', domain: 'alphacorp.hriscloud.io', adminEmail: 'admin@alphacorp.com', plan: 'Enterprise', users: 342, maxUsers: 500, storage: 29, maxStorage: 50, status: 'Active', created: '01 Jan 2026', initials: 'AL', color: 'indigo', domainType: 'Subdomain' },
    { id: 2, name: 'HR Nexus Pvt Ltd', domain: 'hrnexus.hriscloud.io', adminEmail: 'it@hrnexus.io', plan: 'Growth', users: 87, maxUsers: 200, storage: 6, maxStorage: 20, status: 'Trial', created: '01 Apr 2026', initials: 'HR', color: 'cyan', domainType: 'Subdomain' },
    { id: 3, name: 'TalentCo FZCO', domain: 'talentco.com', adminEmail: 'ops@talentco.com', plan: 'Pro', users: 156, maxUsers: 300, storage: 16.5, maxStorage: 30, status: 'SSL Issue', created: '15 Nov 2025', initials: 'TC', color: 'green', domainType: 'Custom Domain' },
    { id: 4, name: 'Zenith People Co', domain: 'zenith.hriscloud.io', adminEmail: 'hr@zenithpeople.ae', plan: 'Starter', users: 24, maxUsers: 50, storage: 1, maxStorage: 5, status: 'Suspended', created: '10 Aug 2025', initials: 'ZE', color: 'amber', domainType: 'Subdomain' },
  ], [])

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch = tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlan = planFilter === 'all' || tenant.plan === planFilter
      const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
      return matchesSearch && matchesPlan && matchesStatus
    })
  }, [tenants, searchQuery, planFilter, statusFilter])

  const statusColor = (status) => {
    const colors = {
      'Active': 'green',
      'Trial': 'amber',
      'SSL Issue': 'orange',
      'Suspended': 'gray',
    }
    return colors[status] || 'gray'
  }

  const planColor = (plan) => {
    const colors = {
      'Enterprise': 'amber',
      'Growth': 'cyan',
      'Pro': 'indigo',
      'Starter': 'gray',
    }
    return colors[plan] || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="mt-1 text-sm text-gray-600">48 tenants across all plans</p>
        </div>
        <div className="flex gap-2">
          <Button label="Export CSV" variant="ghost" size="sm" />
          <Button label="+ New Tenant" variant="primary" size="sm" onClick={() => setShowNewTenantModal(true)} />
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
            <Input placeholder="Name, domain, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Plan</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
              <option value="SSL Issue">SSL Issue</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Domain Type</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20"
            >
              <option>All</option>
              <option>Subdomain</option>
              <option>Custom Domain</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Created After</label>
            <Input type="date" />
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <Table
          columns={[
            { key: 'tenant', label: 'Tenant' },
            { key: 'domain', label: 'Domain / URL' },
            { key: 'plan', label: 'Plan' },
            { key: 'users', label: 'Users' },
            { key: 'storage', label: 'Storage' },
            { key: 'status', label: 'Status' },
            { key: 'created', label: 'Created' },
            { key: 'actions', label: 'Actions' },
          ]}
          data={filteredTenants.map((tenant) => ({
            tenant: (
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${tenant.color}-100 text-xs font-bold text-${tenant.color}-600`}>
                  {tenant.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{tenant.name}</div>
                  <div className="text-xs text-gray-500">{tenant.adminEmail}</div>
                </div>
              </div>
            ),
            domain: (
              <div>
                <div className="font-mono text-xs text-cyan-600">{tenant.domain}</div>
                <div className="text-xs text-gray-500">{tenant.domainType}</div>
              </div>
            ),
            plan: <Badge variant={planColor(tenant.plan)}>{tenant.plan}</Badge>,
            users: (
              <div>
                <span className="font-semibold text-gray-900">{tenant.users}</span>
                <span className="text-xs text-gray-500"> / {tenant.maxUsers}</span>
              </div>
            ),
            storage: (
              <div>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full bg-${tenant.color}-500`} style={{ width: `${(tenant.storage / tenant.maxStorage) * 100}%` }} />
                </div>
                <div className="mt-1 text-xs text-gray-500">{tenant.storage}GB / {tenant.maxStorage}GB</div>
              </div>
            ),
            status: <Badge variant={statusColor(tenant.status)}>{tenant.status}</Badge>,
            created: <span className="text-sm text-gray-500">{tenant.created}</span>,
            actions: (
              <div className="flex gap-1">
                <Button label="View" variant="ghost" size="sm" onClick={() => setShowTenantDetailModal(true)} />
                <Button label="Login As" variant="ghost" size="sm" />
              </div>
            ),
          }))}
        />
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-xs text-gray-500">Showing 1–{filteredTenants.length} of {tenants.length} tenants</span>
          <div className="flex gap-2">
            <Button label="← Prev" variant="ghost" size="sm" />
            <Button label="Next →" variant="primary" size="sm" />
          </div>
        </div>
      </div>

      {/* New Tenant Modal */}
      <Modal
        isOpen={showNewTenantModal}
        onClose={() => setShowNewTenantModal(false)}
        title="Create New Tenant"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Company Name *</label>
              <Input placeholder="e.g. AlphaCorp HR" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Admin Full Name *</label>
              <Input placeholder="First Last" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Admin Email *</label>
              <Input type="email" placeholder="admin@company.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Admin Phone</label>
              <Input type="tel" placeholder="+971 XX XXXX XXXX" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Subscription Plan *</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                <option>Starter</option>
                <option>Growth</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Billing Cycle *</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                <option>Monthly</option>
                <option>Annual (10% off)</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 text-xs font-bold tracking-wider text-gray-500">DOMAIN CONFIGURATION</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Subdomain *</label>
                <div className="flex">
                  <Input placeholder="company-name" className="rounded-r-none border-r-0" />
                  <div className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-200 px-3 py-2 text-xs text-gray-500">.hriscloud.io</div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Custom Domain (Optional)</label>
                <Input placeholder="yourdomain.com" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button label="Create Tenant" variant="primary" className="flex-1" onClick={() => setShowNewTenantModal(false)} />
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowNewTenantModal(false)} />
          </div>
        </div>
      </Modal>

      {/* Tenant Detail Modal */}
      <Modal
        isOpen={showTenantDetailModal}
        onClose={() => setShowTenantDetailModal(false)}
        title="AlphaCorp HR — Tenant Details"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">COMPANY</span>
              <strong className="text-gray-900">AlphaCorp HR</strong>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">PLAN</span>
              <Badge variant="amber">Enterprise</Badge>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">ADMIN EMAIL</span>
              <strong className="text-gray-900">admin@alphacorp.com</strong>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">USERS</span>
              <strong className="text-gray-900">342 / 500</strong>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">SUBDOMAIN</span>
              <span className="font-mono text-xs text-indigo-500">alphacorp.hriscloud.io</span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span className="block text-xs text-gray-500">CREATED</span>
              <strong className="text-gray-900">01 Jan 2026</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button label="Login As Admin" variant="primary" size="sm" />
            <Button label="Add Custom Domain" variant="ghost" size="sm" />
            <Button label="Reset Password" variant="ghost" size="sm" />
            <Button label="Extend Trial" variant="ghost" size="sm" />
            <Button label="Suspend Tenant" variant="danger" size="sm" />
          </div>
        </div>
      </Modal>
    </div>
  )
}

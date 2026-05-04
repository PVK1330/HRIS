import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { HiGlobeAlt, HiServer, HiShieldCheck, HiXMark } from 'react-icons/hi2'

export default function DomainsSSL() {
  const [activeTab, setActiveTab] = useState('subdomains')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDomainModal, setShowAddDomainModal] = useState(false)

  const subdomains = useMemo(() => [
    { id: 1, subdomain: 'alphacorp.hriscloud.io', tenant: 'AlphaCorp HR', ssl: 'Valid', sslExpiry: '12 Oct 2026', status: 'Active' },
    { id: 2, subdomain: 'hrnexus.hriscloud.io', tenant: 'HR Nexus', ssl: 'Valid', sslExpiry: '15 Sep 2026', status: 'Trial' },
    { id: 3, subdomain: 'zenith.hriscloud.io', tenant: 'Zenith People', ssl: 'Suspended', sslExpiry: '—', status: 'Suspended' },
  ], [])

  const customDomains = useMemo(() => [
    { id: 1, domain: 'talentco.com', tenant: 'TalentCo FZCO', dnsStatus: 'Propagated', ssl: 'Expiring (8d)', sslExpiry: '17 Apr 2026', verifiedOn: '15 Nov 2025' },
    { id: 2, domain: 'nexushr.ae', tenant: 'HR Nexus', dnsStatus: 'Propagated', ssl: 'Valid', sslExpiry: '20 Jan 2027', verifiedOn: '09 Apr 2026' },
    { id: 3, domain: 'myhrportal.co.uk', tenant: 'Meridian HR', dnsStatus: 'Pending DNS', ssl: 'Not Issued', sslExpiry: '—', verifiedOn: '—' },
  ], [])

  const statusColor = (status) => {
    const colors = {
      'Active': 'green',
      'Trial': 'amber',
      'Suspended': 'gray',
      'Propagated': 'green',
      'Pending DNS': 'orange',
    }
    return colors[status] || 'gray'
  }

  const sslColor = (ssl) => {
    const colors = {
      'Valid': 'green',
      'Expiring (8d)': 'red',
      'Suspended': 'gray',
      'Not Issued': 'gray',
    }
    return colors[ssl] || 'gray'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains & SSL Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage subdomains, custom domains, and SSL certificates</p>
        </div>
        <Button label="+ Add Domain" variant="primary" size="sm" onClick={() => setShowAddDomainModal(true)} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL DOMAINS" value="67" icon={HiGlobeAlt} />
        <StatCard title="CUSTOM DOMAINS" value="19" valueColor="cyan" icon={HiGlobeAlt} />
        <StatCard title="SSL ACTIVE" value="64" valueColor="green" icon={HiShieldCheck} />
        <StatCard title="SSL EXPIRING (30D)" value="3" valueColor="red" icon={HiServer} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        {[
          { id: 'subdomains', label: 'Subdomains (48)' },
          { id: 'custom', label: 'Custom Domains (19)' },
          { id: 'ssl', label: 'SSL Certificates' },
          { id: 'dns', label: 'DNS Config' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subdomains Tab */}
      {activeTab === 'subdomains' && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
                <Input placeholder="Subdomain name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                  <option>All</option>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <Table
              columns={[
                { key: 'subdomain', label: 'Subdomain' },
                { key: 'tenant', label: 'Tenant' },
                { key: 'ssl', label: 'SSL' },
                { key: 'sslExpiry', label: 'SSL Expiry' },
                { key: 'status', label: 'Status' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={subdomains.map((item) => ({
                subdomain: <span className="font-mono text-xs text-indigo-500">{item.subdomain}</span>,
                tenant: item.tenant,
                ssl: <Badge variant={sslColor(item.ssl)}>{item.ssl}</Badge>,
                sslExpiry: <span className="text-sm text-gray-500">{item.sslExpiry}</span>,
                status: <Badge variant={statusColor(item.status)}>{item.status}</Badge>,
                actions: (
                  <div className="flex gap-1">
                    <Button label="DNS Info" variant="ghost" size="sm" />
                    <Button label="Renew SSL" variant="ghost" size="sm" />
                  </div>
                ),
              }))}
            />
          </div>
        </>
      )}

      {/* Custom Domains Tab */}
      {activeTab === 'custom' && (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Add Custom Domain</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Tenant</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                  <option>AlphaCorp HR</option>
                  <option>TalentCo FZCO</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">Custom Domain</label>
                <Input placeholder="yourdomain.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-500">SSL Provider</label>
                <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
                  <option>Let's Encrypt (Auto)</option>
                  <option>Custom SSL Upload</option>
                </select>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-gray-900 p-4 font-mono text-xs">
              <span className="text-green-400">CNAME</span> Record: <span className="text-cyan-400">@ → hriscloud.io</span><br />
              <span className="text-green-400">TXT</span> Verify: <span className="text-amber-400">hris-verify=abc123xyz</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button label="Verify & Add Domain" variant="primary" size="sm" />
              <Button label="Copy DNS Instructions" variant="ghost" size="sm" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <Table
              columns={[
                { key: 'domain', label: 'Custom Domain' },
                { key: 'tenant', label: 'Tenant' },
                { key: 'dnsStatus', label: 'DNS Status' },
                { key: 'ssl', label: 'SSL' },
                { key: 'sslExpiry', label: 'SSL Expiry' },
                { key: 'verifiedOn', label: 'Verified On' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={customDomains.map((item) => ({
                domain: <span className={`font-mono text-xs ${item.ssl === 'Expiring (8d)' ? 'text-amber-500' : 'text-cyan-500'}`}>{item.domain}</span>,
                tenant: item.tenant,
                dnsStatus: <Badge variant={statusColor(item.dnsStatus)}>{item.dnsStatus}</Badge>,
                ssl: <Badge variant={sslColor(item.ssl)}>{item.ssl}</Badge>,
                sslExpiry: <span className={`text-sm ${item.ssl === 'Expiring (8d)' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>{item.sslExpiry}</span>,
                verifiedOn: <span className="text-sm text-gray-500">{item.verifiedOn}</span>,
                actions: (
                  <div className="flex gap-1">
                    {item.ssl === 'Expiring (8d)' ? <Button label="Renew SSL" variant="danger" size="sm" /> : <Button label="Details" variant="ghost" size="sm" />}
                    <Button label="Remove" variant="ghost" size="sm" />
                  </div>
                ),
              }))}
            />
          </div>
        </>
      )}

      {/* Add Domain Modal */}
      <Modal
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        title="Add Custom Domain"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Tenant *</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
              <option>Select tenant...</option>
              <option>AlphaCorp HR</option>
              <option>TalentCo FZCO</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Custom Domain *</label>
            <Input placeholder="yourdomain.com" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">SSL Certificate</label>
            <select className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#004CA5] focus:ring-2 focus:ring-[#004CA5]/20">
              <option>Auto (Let's Encrypt)</option>
              <option>Upload Custom SSL</option>
            </select>
          </div>
          <div className="rounded-lg bg-gray-900 p-4 font-mono text-xs">
            <span className="text-green-400">CNAME</span>  @  →  custom.hriscloud.io<br />
            <span className="text-green-400">TXT</span>    hris-verify=[unique-token-will-appear]
          </div>
          <div className="flex gap-2">
            <Button label="Verify & Add" variant="primary" onClick={() => setShowAddDomainModal(false)} />
            <Button label="Cancel" variant="ghost" onClick={() => setShowAddDomainModal(false)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { 
  HiGlobeAlt, 
  HiShieldCheck, 
  HiServer, 
  HiInformationCircle, 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiArrowPath, 
  HiArrowUpTray,
  HiSignal
} from 'react-icons/hi2'

export default function DomainsSSL() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data State
  const [subdomains, setSubdomains] = useState([
    { id: 1, subdomain: 'alphacorp.hriscloud.io', tenant: 'AlphaCorp HR', ssl: 'Valid', sslExpiry: '12 Oct 2026', status: 'Active' },
    { id: 2, subdomain: 'hrnexus.hriscloud.io', tenant: 'HR Nexus', ssl: 'Valid', sslExpiry: '15 Sep 2026', status: 'Trial' },
    { id: 3, subdomain: 'zenith.hriscloud.io', tenant: 'Zenith People', ssl: 'Suspended', sslExpiry: '—', status: 'Suspended' },
  ])

  const [customDomains, setCustomDomains] = useState([
    { id: 1, domain: 'talentco.com', tenant: 'TalentCo FZCO', dnsStatus: 'Propagated', ssl: 'Expiring (8d)', sslExpiry: '17 Apr 2026', verifiedOn: '15 Nov 2025' },
    { id: 2, domain: 'nexushr.ae', tenant: 'HR Nexus', dnsStatus: 'Propagated', ssl: 'Valid', sslExpiry: '20 Jan 2027', verifiedOn: '09 Apr 2026' },
    { id: 3, domain: 'myhrportal.co.uk', tenant: 'Meridian HR', dnsStatus: 'Pending DNS', ssl: 'Not Issued', sslExpiry: '—', verifiedOn: '—' },
  ])

  // Modal States
  const [showAddDomainModal, setShowAddDomainModal] = useState(false)
  const [showSSLUploadModal, setShowSSLUploadModal] = useState(false)
  const [showSubdomainEditModal, setShowSubdomainEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  
  const [subdomainForm, setSubdomainForm] = useState({ subdomain: '', status: 'Active' })
  const [sslForm, setSslForm] = useState({ cert: '', key: '', bundle: '' })

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

  const handleEditSubdomain = (item) => {
    setSelectedItem(item)
    setSubdomainForm({ subdomain: item.subdomain.split('.')[0], status: item.status })
    setShowSubdomainEditModal(true)
  }

  const handleSaveSubdomain = () => {
    setSubdomains(subdomains.map(s => s.id === selectedItem.id ? { 
      ...s, 
      subdomain: `${subdomainForm.subdomain}.hriscloud.io`,
      status: subdomainForm.status 
    } : s))
    setShowSubdomainEditModal(false)
  }

  const handleSSLUpload = (item) => {
    setSelectedItem(item)
    setSslForm({ cert: '', key: '', bundle: '' })
    setShowSSLUploadModal(true)
  }

  const handleSaveSSL = () => {
    if (activeTab === 'overview') {
       // logic for whichever domain is selected
       setSubdomains(subdomains.map(s => s.id === selectedItem?.id ? { ...s, ssl: 'Valid', sslExpiry: '04 May 2027' } : s))
       setCustomDomains(customDomains.map(d => d.id === selectedItem?.id ? { ...d, ssl: 'Valid', sslExpiry: '04 May 2027' } : d))
    }
    setShowSSLUploadModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains & Connectivity</h1>
          <p className="mt-1 text-sm text-gray-500">Manage tenant URLs, custom branding, and security certificates.</p>
        </div>
        <Button label="Add Domain" variant="primary" icon={HiPlus} onClick={() => setShowAddDomainModal(true)} />
      </div>

      {/* Why Domain Management Info Section */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <HiInformationCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-900">Why Domain Management?</h3>
            <p className="mt-1 text-sm text-blue-700 leading-relaxed">
              In our Multi-tenant HRMS, domain management ensures that each company has its own secure workspace. 
              <strong> Subdomains</strong> provide instant isolation, while <strong>Custom Domains</strong> allow enterprise clients to use their own brand. 
              <strong> SSL Certificates</strong> are mandatory to keep sensitive HR and Payroll data encrypted and safe.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="SUBDOMAINS" value={subdomains.length.toString()} icon={HiGlobeAlt} />
        <StatCard title="CUSTOM DOMAINS" value={customDomains.length.toString()} valueColor="blue" icon={HiGlobeAlt} />
        <StatCard title="SSL STATUS" value="98%" valueColor="green" icon={HiShieldCheck} />
        <StatCard title="DNS HEALTH" value="Healthy" valueColor="green" icon={HiSignal} />
      </div>

      {/* Simplified Tabs - Consistent with HRMS Settings */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Domain Overview', icon: HiGlobeAlt },
          { id: 'ssl', label: 'SSL Certificates', icon: HiShieldCheck },
          { id: 'dns', label: 'Global DNS Config', icon: HiServer },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-[#004CA5] text-[#004CA5]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Subdomains Section */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Default Subdomains</h2>
              <Badge label="Auto-Generated" color="blue" />
            </div>
            <Table
              columns={[
                { key: 'subdomain', label: 'Subdomain' },
                { key: 'tenant', label: 'Assigned Tenant' },
                { key: 'ssl', label: 'SSL Status' },
                { key: 'status', label: 'Status' },
                { 
                  key: 'actions', 
                  label: 'Actions',
                  render: (_, row) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" icon={HiPencil} onClick={() => handleEditSubdomain(row)} />
                      <Button variant="ghost" size="sm" icon={HiArrowPath} title="Rotate SSL" onClick={() => handleSSLUpload(row)} />
                    </div>
                  )
                },
              ]}
              data={subdomains.map(s => ({
                ...s,
                subdomain: <span className="font-mono text-xs text-[#004CA5]">{s.subdomain}</span>,
                ssl: <Badge label={s.ssl} color={sslColor(s.ssl)} />,
                status: <Badge label={s.status} color={statusColor(s.status)} />
              }))}
            />
          </div>

          {/* Custom Domains Section */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Custom Branding Domains</h2>
              <Badge label="Enterprise Only" color="purple" />
            </div>
            <Table
              columns={[
                { key: 'domain', label: 'Domain Name' },
                { key: 'tenant', label: 'Client' },
                { key: 'dns', label: 'DNS Health' },
                { key: 'ssl', label: 'SSL Status' },
                { 
                  key: 'actions', 
                  label: 'Actions',
                  render: (_, row) => (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" icon={HiArrowUpTray} label="Upload SSL" onClick={() => handleSSLUpload(row)} />
                      <Button variant="ghost" size="sm" icon={HiTrash} className="text-red-500" />
                    </div>
                  )
                },
              ]}
              data={customDomains.map(d => ({
                ...d,
                domain: <span className="font-mono text-xs text-gray-900">{d.domain}</span>,
                dns: <Badge label={d.dnsStatus} color={statusColor(d.dnsStatus)} />,
                ssl: <Badge label={d.ssl} color={sslColor(d.ssl)} />,
              }))}
            />
          </div>
        </div>
      )}

      {/* SSL Certificates Tab (Simplified) */}
      {activeTab === 'ssl' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
           <div className="max-w-md mx-auto text-center py-12">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                 <HiShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">SSL Automation Active</h3>
              <p className="mt-2 text-sm text-gray-500">
                Most domains are automatically secured via Let's Encrypt. Manual uploads are only required for specific enterprise requirements.
              </p>
              <div className="mt-8">
                 <Button label="View Certificate Logs" variant="outline" className="w-full" />
              </div>
           </div>
        </div>
      )}

      {/* DNS Tab (Simplified) */}
      {activeTab === 'dns' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4">Global DNS Pointers</h3>
           <p className="text-sm text-gray-500 mb-6">Point your custom domains to these values for automatic HRMS integration.</p>
           <div className="space-y-4">
              <div className="p-4 bg-gray-900 rounded-lg font-mono text-xs text-white">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400"># A RECORD</span>
                    <button className="text-blue-400 hover:underline">Copy</button>
                 </div>
                 @  →  35.242.12.10
              </div>
              <div className="p-4 bg-gray-900 rounded-lg font-mono text-xs text-white">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400"># CNAME RECORD</span>
                    <button className="text-blue-400 hover:underline">Copy</button>
                 </div>
                 *  →  lb.hriscloud.io
              </div>
           </div>
        </div>
      )}

      {/* Subdomain Edit Modal */}
      <Modal
        isOpen={showSubdomainEditModal}
        onClose={() => setShowSubdomainEditModal(false)}
        title="Edit Subdomain"
      >
        <div className="space-y-4">
           <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Subdomain Prefix *</label>
              <div className="flex">
                <Input 
                  value={subdomainForm.subdomain}
                  onChange={(e) => setSubdomainForm({ ...subdomainForm, subdomain: e.target.value })}
                  className="rounded-r-none border-r-0"
                />
                <div className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">.hriscloud.io</div>
              </div>
           </div>
           <div className="flex gap-2">
             <Button label="Update URL" variant="primary" className="flex-1" onClick={handleSaveSubdomain} />
             <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowSubdomainEditModal(false)} />
           </div>
        </div>
      </Modal>

      {/* SSL Upload Modal */}
      <Modal
        isOpen={showSSLUploadModal}
        onClose={() => setShowSSLUploadModal(false)}
        title="SSL Certificate Upload"
      >
        <div className="space-y-4">
           <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
              Manual certificates must be in X.509 format. Private keys are never stored in plain text.
           </div>
           <Input label="Certificate (CRT)" type="textarea" rows={3} value={sslForm.cert} onChange={(e) => setSslForm({...sslForm, cert: e.target.value})} placeholder="-----BEGIN CERTIFICATE-----" />
           <Input label="Private Key (KEY)" type="password" value={sslForm.key} onChange={(e) => setSslForm({...sslForm, key: e.target.value})} placeholder="••••••••••••" />
           <div className="flex gap-2">
             <Button label="Activate SSL" variant="primary" className="flex-1" onClick={handleSaveSSL} disabled={!sslForm.cert || !sslForm.key} />
             <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowSSLUploadModal(false)} />
           </div>
        </div>
      </Modal>

      {/* Add Domain Modal */}
      <Modal
        isOpen={showAddDomainModal}
        onClose={() => setShowAddDomainModal(false)}
        title="Register New Domain"
      >
        <div className="space-y-4">
          <Input label="Tenant / Company" type="select" options={subdomains.map(s => ({ value: s.tenant, label: s.tenant }))} />
          <Input label="Custom Domain Name" placeholder="hr.mycompany.com" />
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
             <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">DNS Verification</h4>
             <p className="text-[11px] text-gray-500 italic">Domain will be verified automatically after DNS propagation.</p>
          </div>
          <div className="flex gap-2">
            <Button label="Add & Verify" variant="primary" className="flex-1" onClick={() => setShowAddDomainModal(false)} />
            <Button label="Close" variant="ghost" className="flex-1" onClick={() => setShowAddDomainModal(false)} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

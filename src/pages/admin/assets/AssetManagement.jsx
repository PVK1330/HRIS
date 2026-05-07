import React, { useState, useMemo } from 'react';
import { 
  HiPlus, 
  HiMagnifyingGlass, 
  HiAdjustmentsHorizontal, 
  HiCheck, 
  HiXMark, 
  HiArrowPath,
  HiArchiveBox,
  HiUserGroup,
  HiClipboardDocumentList,
  HiClock,
  HiComputerDesktop,
  HiDevicePhoneMobile,
  HiIdentification,
  HiShoppingBag
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { employees } from '../../../data/mockData.js';

const MOCK_ASSETS = [
  { id: 'AST-001', type: 'Laptop', serial: 'SN123456', assignedTo: 'John Doe', department: 'Engineering', issueDate: '2026-01-10', condition: 'Good', status: 'Issued' },
  { id: 'AST-002', type: 'Mobile', serial: 'SN789012', assignedTo: 'Sarah Ahmed', department: 'HR', issueDate: '2026-02-15', condition: 'Good', status: 'Issued' },
  { id: 'AST-003', type: 'Access Card', serial: 'AC998877', assignedTo: 'Michael Chen', department: 'Product', issueDate: '2026-03-05', condition: 'Good', status: 'Issued' },
  { id: 'AST-004', type: 'Laptop', serial: 'SN654321', assignedTo: '-', department: '-', issueDate: '-', condition: 'Good', status: 'Available' },
  { id: 'AST-005', type: 'Uniform', serial: 'U-XL-01', assignedTo: 'Neha Jain', department: 'Sales', issueDate: '2026-04-01', condition: 'New', status: 'Issued' },
];

const MOCK_REQUESTS = [
  { id: 1, employee: 'David Smith', empId: 'EMP-105', type: 'Laptop', requestedOn: '2026-05-01', status: 'Pending' },
  { id: 2, employee: 'Lisa Wong', empId: 'EMP-108', type: 'Access Card', requestedOn: '2026-04-28', status: 'Approved' },
];

const MOCK_RETURNS = [
  { id: 1, employee: 'James Bond', asset: 'Laptop (SN-007)', returnDate: '2026-04-30', condition: 'Damaged', remarks: 'Screen crack' },
];

const typeIcons = {
  'Laptop': HiComputerDesktop,
  'Mobile': HiDevicePhoneMobile,
  'Access Card': HiIdentification,
  'Uniform': HiShoppingBag,
}

export default function AssetManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    serial: '',
    condition: 'Good',
    assignedTo: '',
    issueDate: '',
    notes: ''
  });

  const canAddAsset = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin';

  const stats = useMemo(() => ({
    total: MOCK_ASSETS.length,
    issued: MOCK_ASSETS.filter(a => a.status === 'Issued').length,
    pending: MOCK_REQUESTS.filter(r => r.status === 'Pending').length
  }), []);

  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter(asset => {
      const matchesSearch = search === '' || 
        asset.serial.toLowerCase().includes(search.toLowerCase()) ||
        asset.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        asset.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === '' || asset.type === typeFilter;
      const matchesStatus = statusFilter === '' || asset.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ type: '', serial: '', condition: 'Good', assignedTo: '', issueDate: '', notes: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New Asset Data:', formData);
    handleCloseModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Asset Management</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Track, assign, and manage company resources with precision. Monitor inventory health and streamline asset lifecycle workflows.
            </p>
          </div>
          {canAddAsset && (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <HiPlus className="h-5 w-5" /> Add New Asset
              </button>
            </div>
          )}
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-black/5" />
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard 
          title="Total Inventory" 
          value={stats.total} 
          subtitle="Registered company assets" 
          color="blue" 
          icon={HiArchiveBox}
        />
        <StatCard
          title="Active Assignments"
          value={stats.issued}
          subtitle={`${((stats.issued/stats.total)*100).toFixed(0)}% utilization rate`}
          color="emerald"
          icon={HiUserGroup}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pending}
          subtitle="Awaiting administrative review"
          color="orange"
          icon={HiClipboardDocumentList}
        />
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-8">
            {['inventory', 'requests', 'returns'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab
                    ? 'text-[#0F766E]'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab === 'inventory' ? 'Inventory' : tab === 'requests' ? 'Requests' : 'Returns'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#0F766E] animate-in slide-in-from-left-full duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'inventory' && (
          <div className="group relative rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <HiAdjustmentsHorizontal className="h-5 w-5 text-[#0F766E]" />
                <span className="text-sm font-bold uppercase tracking-widest">Inventory Filters</span>
              </div>
              {(search || typeFilter || statusFilter) && (
                <button 
                  onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <HiXMark className="h-4 w-4" /> Clear All
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="relative group">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Assets</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Serial, Owner, ID..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Type</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Laptop">Laptops</option>
                  <option value="Mobile">Mobile Devices</option>
                  <option value="Access Card">Security Cards</option>
                  <option value="Uniform">Work Uniforms</option>
                </select>
              </div>

              <div className="relative group">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Issued">Issued</option>
                  <option value="Available">Available</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">
              {activeTab === 'inventory' ? 'Asset Inventory' : activeTab === 'requests' ? 'Pending Requests' : 'Return Tracker'}
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Intelligence</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'inventory' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Asset Details</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Assignment</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Condition</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((asset) => {
                  const Icon = typeIcons[asset.type] || HiArchiveBox;
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-[#0F766E]/10 group-hover:text-[#0F766E] transition-all">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{asset.id}</div>
                            <div className="text-xs text-slate-400 font-mono">SN: {asset.serial}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                          {asset.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {asset.assignedTo !== '-' ? (
                          <div>
                            <div className="font-semibold text-slate-700">{asset.assignedTo}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black">{asset.department}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={asset.condition} color={asset.condition === 'New' || asset.condition === 'Good' ? 'green' : asset.condition === 'Fair' ? 'orange' : 'red'} />
                      </td>
                      <td className="px-6 py-4">
                        <Badge label={asset.status} color={asset.status === 'Available' ? 'green' : 'blue'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'requests' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Requested Item</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_REQUESTS.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.employee}</div>
                      <div className="text-xs text-slate-400">{req.empId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{req.type}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <HiClock className="h-4 w-4 text-slate-400" />
                        {req.requestedOn}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={req.status} color={req.status === 'Pending' ? 'orange' : 'green'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                          <HiCheck className="h-5 w-5" />
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <HiXMark className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'returns' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Asset Details</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Condition</th>
                  <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_RETURNS.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{ret.employee}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-600">{ret.asset}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Return: {ret.returnDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={ret.condition} color="red" />
                      <div className="mt-1 text-xs text-slate-400 italic">"{ret.remarks}"</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button label="Process Return" size="sm" variant="primary" icon={HiArrowPath} className="rounded-full px-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Asset" size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Asset Type"
              name="type"
              type="select"
              options={[
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'Access Card', label: 'Access Card' },
                { value: 'Uniform', label: 'Uniform' },
              ]}
              value={formData.type}
              onChange={handleInputChange}
              required
            />
            <Input label="Serial No" name="serial" value={formData.serial} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Condition"
              name="condition"
              type="select"
              options={[
                { value: 'New', label: 'New' },
                { value: 'Good', label: 'Good' },
                { value: 'Fair', label: 'Fair' },
                { value: 'Damaged', label: 'Damaged' },
              ]}
              value={formData.condition}
              onChange={handleInputChange}
              required
            />
            <Input label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} />
          </div>

          <Input
            label="Assign To"
            name="assignedTo"
            type="select"
            options={employees.map(e => ({ value: e.name, label: `${e.name} (${e.empId})` }))}
            value={formData.assignedTo}
            onChange={handleInputChange}
          />

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Notes</label>
            <textarea
              name="notes"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
              rows={3}
              placeholder="Record any specific details or compliance notes..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button label="Add Asset to Registry" variant="primary" type="submit" className="px-8" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

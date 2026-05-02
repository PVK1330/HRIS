import React, { useState } from 'react';
import { HiPlus, HiMagnifyingGlass, HiFunnel, HiCheck, HiXMark, HiArrowPath } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
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

export default function AssetManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    serial: '',
    condition: 'Good',
    assignedTo: '',
    issueDate: '',
    notes: ''
  });

  const canAddAsset = user?.role === 'hr_admin';

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Asset Management</h1>
          <p className="text-sm text-text-secondary">Track company assets, issuance, and returns</p>
        </div>
        {activeTab === 'inventory' && canAddAsset && (
          <Button label="Add Asset" icon={HiPlus} variant="primary" onClick={handleOpenModal} />
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-tertiary">
        {['inventory', 'requests', 'returns'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'inventory' ? 'Asset Inventory' : tab === 'requests' ? 'Asset Requests' : 'Return Tracker'}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab === 'inventory' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Search serial no, employee or ID..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button label="Filters" icon={HiFunnel} variant="outline" />
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-border-tertiary bg-background-primary overflow-hidden shadow-sm">
        {activeTab === 'inventory' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-background-secondary border-b border-border-tertiary">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-primary">Asset ID</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Asset Type</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Serial No.</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Assigned To</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Department</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Issue Date</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Condition</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tertiary">
              {MOCK_ASSETS.map((asset) => (
                <tr key={asset.id} className="hover:bg-background-tertiary/50">
                  <td className="px-6 py-4 font-medium text-text-primary">{asset.id}</td>
                  <td className="px-6 py-4 text-text-secondary">{asset.type}</td>
                  <td className="px-6 py-4 text-text-secondary">{asset.serial}</td>
                  <td className="px-6 py-4 text-text-primary font-medium">{asset.assignedTo}</td>
                  <td className="px-6 py-4 text-text-secondary">{asset.department}</td>
                  <td className="px-6 py-4 text-text-secondary">{asset.issueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      asset.condition === 'Good' ? 'bg-success-DEFAULT/10 text-success-DEFAULT' : 'bg-warning-DEFAULT/10 text-warning-DEFAULT'
                    }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      asset.status === 'Issued' ? 'bg-primary/10 text-primary' : 'bg-success-DEFAULT/10 text-success-DEFAULT'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'requests' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-background-secondary border-b border-border-tertiary">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-primary">Employee</th>
                <th className="px-6 py-4 font-semibold text-text-primary">ID</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Asset Type</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Requested On</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tertiary">
              {MOCK_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-background-tertiary/50">
                  <td className="px-6 py-4 font-medium text-text-primary">{req.employee}</td>
                  <td className="px-6 py-4 text-text-secondary">{req.empId}</td>
                  <td className="px-6 py-4 text-text-secondary">{req.type}</td>
                  <td className="px-6 py-4 text-text-secondary">{req.requestedOn}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      req.status === 'Pending' ? 'bg-warning-DEFAULT/10 text-warning-DEFAULT' : 'bg-success-DEFAULT/10 text-success-DEFAULT'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-1 text-success-DEFAULT hover:bg-success-DEFAULT/10" title="Approve"><HiCheck className="h-5 w-5" /></button>
                      <button className="rounded-lg p-1 text-danger-DEFAULT hover:bg-danger-DEFAULT/10" title="Reject"><HiXMark className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'returns' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-background-secondary border-b border-border-tertiary">
              <tr>
                <th className="px-6 py-4 font-semibold text-text-primary">Employee</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Asset</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Return Date</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Condition</th>
                <th className="px-6 py-4 font-semibold text-text-primary">Remarks</th>
                <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-tertiary">
              {MOCK_RETURNS.map((ret) => (
                <tr key={ret.id} className="hover:bg-background-tertiary/50">
                  <td className="px-6 py-4 font-medium text-text-primary">{ret.employee}</td>
                  <td className="px-6 py-4 text-text-secondary">{ret.asset}</td>
                  <td className="px-6 py-4 text-text-secondary">{ret.returnDate}</td>
                  <td className="px-6 py-4 text-text-secondary">{ret.condition}</td>
                  <td className="px-6 py-4 text-text-secondary">{ret.remarks}</td>
                  <td className="px-6 py-4 text-right">
                    <Button label="Mark Returned" size="sm" variant="outline" icon={HiArrowPath} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Add New Asset" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input 
            label="Assign To" 
            name="assignedTo" 
            type="select"
            options={employees.map(e => ({ value: e.name, label: `${e.name} (${e.empId})` }))}
            value={formData.assignedTo} 
            onChange={handleInputChange} 
          />
          <Input label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} />
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1">Notes</label>
            <textarea 
              name="notes"
              className="w-full rounded-lg border border-border-tertiary bg-background-primary px-4 py-2 text-sm outline-none focus:border-primary"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button label="Cancel" variant="ghost" onClick={handleCloseModal} />
            <Button label="Add Asset" variant="primary" type="submit" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
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
  HiIdentification,
  HiTrash,
  HiPencilSquare
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { StatCard } from '../../../components/ui/StatCard.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { SearchableSelect } from '../../../components/ui/SearchableSelect.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { assetService } from '../../../services/assetService.js';
import { fetchAssetCategories } from '../../../services/assetSettingsService.js';
import { listEmployees } from '../../../services/employeeService.js';
import { toast } from 'react-hot-toast';

const IconMap = {
  'laptop': HiArchiveBox,
  'smartphone': HiIdentification,
  'sim-card': HiClipboardDocumentList,
  'credit-card': HiIdentification,
  'shirt': HiArchiveBox,
  'tool': HiAdjustmentsHorizontal,
  'box': HiArchiveBox
};

const getCategoryIcon = (iconName) => {
  return IconMap[iconName] || HiArchiveBox;
};

export default function AssetManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: '',
    serialNumber: '',
    condition: 'Good',
    employeeId: '',
    issueDate: '',
    notes: '',
    status: 'Available'
  });

  const canManage = user?.role === 'hr_admin' || user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Fetching asset data...');
      const [assetData, categoryData, empData] = await Promise.all([
        assetService.getAssets(),
        fetchAssetCategories(),
        listEmployees({ limit: 1000 })
      ]);
      
      console.log('Assets:', assetData);
      console.log('Categories:', categoryData);
      console.log('Employees:', empData);

      setAssets(assetData || []);
      setCategories(categoryData?.data || []);
      setEmployeeList(empData?.employees || []);
    } catch (error) {
      console.error('Error loading asset data:', error);
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: assets.length,
    issued: assets.filter(a => a.status === 'Issued').length,
    available: assets.filter(a => a.status === 'Available').length
  }), [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = search === '' || 
        asset.serial?.toLowerCase().includes(search.toLowerCase()) ||
        asset.assignedTo?.toLowerCase().includes(search.toLowerCase()) ||
        asset.asset_id?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === '' || asset.category_id === typeFilter;
      const matchesStatus = statusFilter === '' || asset.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  const handleOpenModal = (asset = null) => {
    if (asset) {
      setEditMode(true);
      setSelectedAssetId(asset.id);
      setFormData({
        categoryId: asset.category_id || '',
        serialNumber: asset.serial_number || '',
        condition: asset.condition || 'Good',
        employeeId: asset.employee_id || '',
        issueDate: asset.issue_date ? asset.issue_date.split('T')[0] : '',
        notes: asset.notes || '',
        status: asset.status || 'Available'
      });
    } else {
      setEditMode(false);
      setFormData({
        categoryId: '',
        serialNumber: '',
        condition: 'Good',
        employeeId: '',
        issueDate: '',
        notes: '',
        status: 'Available'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setSelectedAssetId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await assetService.updateAsset(selectedAssetId, formData);
        toast.success('Asset updated successfully');
      } else {
        await assetService.createAsset(formData);
        toast.success('Asset registered successfully');
      }
      handleCloseModal();
      loadInitialData();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this asset?')) return;
    try {
      await assetService.deleteAsset(id);
      toast.success('Asset removed');
      loadInitialData();
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent" />
      </div>
    );
  }

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
          {canManage && (
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-[#0F766E] shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
              >
                <HiPlus className="h-5 w-5" /> Add New Asset
              </button>
            </div>
          )}
        </div>
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
          title="Issued Assets"
          value={stats.issued}
          subtitle="Actively in use"
          color="emerald"
          icon={HiUserGroup}
        />
        <StatCard
          title="Available"
          value={stats.available}
          subtitle="Ready for assignment"
          color="orange"
          icon={HiClipboardDocumentList}
        />
      </div>

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'inventory' ? 'text-[#0F766E]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Inventory
              {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#0F766E] animate-in slide-in-from-left-full duration-300" />}
            </button>
            {/* Requests/Returns can be added later as full modules */}
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
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm focus:border-[#0F766E] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none appearance-none transition-all"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
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
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
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
            <div className="text-sm font-bold text-slate-700">Asset Inventory</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Registry</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Asset Details</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Assignment</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Condition</th>
                <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest">Status</th>
                {canManage && <th className="px-6 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                        style={{ backgroundColor: `${asset.categoryColor}15`, color: asset.categoryColor }}
                      >
                        {React.createElement(getCategoryIcon(asset.categoryIcon), { className: "h-5 w-5" })}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{asset.asset_id}</div>
                        <div className="text-xs text-slate-400 font-mono">SN: {asset.serial_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {asset.categoryName || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {asset.assignedTo !== '-' ? (
                      <div className="font-semibold text-slate-700">{asset.assignedTo}</div>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={asset.condition} color={asset.condition === 'New' || asset.condition === 'Good' ? 'green' : asset.condition === 'Fair' ? 'orange' : 'red'} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={asset.status} color={asset.status === 'Available' ? 'green' : asset.status === 'Issued' ? 'blue' : 'red'} />
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(asset)}
                          className="p-1.5 text-slate-400 hover:text-[#0F766E] transition-colors"
                        >
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No assets found in registry</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editMode ? 'Edit Asset' : 'Add New Asset'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Category</label>
               <select
                 name="categoryId"
                 value={formData.categoryId}
                 onChange={handleInputChange}
                 required
                 className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
               >
                 <option value="">Select Category</option>
                 {categories.map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
               </select>
            </div>
            <Input label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required placeholder="e.g. SN-12345" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Condition</label>
               <select
                 name="condition"
                 value={formData.condition}
                 onChange={handleInputChange}
                 className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
               >
                 <option value="New">New</option>
                 <option value="Good">Good</option>
                 <option value="Fair">Fair</option>
                 <option value="Damaged">Damaged</option>
               </select>
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
               <select
                 name="status"
                 value={formData.status}
                 onChange={handleInputChange}
                 className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-[#0F766E] focus:outline-none transition-all"
               >
                 <option value="Available">Available</option>
                 <option value="Issued">Issued</option>
                 <option value="In Repair">In Repair</option>
                 <option value="Lost">Lost</option>
               </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Assign To Employee"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              placeholder="Search employee by name or ID..."
              options={[
                { value: '', label: 'Not Assigned' },
                ...employeeList.map(e => ({
                  value: e.id,
                  label: `${e.full_name} (${e.emp_id})`
                }))
              ]}
            />
            <Input label="Issue Date" name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} />
          </div>

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
            <Button label="Cancel" variant="ghost" onClick={handleCloseModal} type="button" />
            <Button label={editMode ? 'Update Registry' : 'Add Asset to Registry'} variant="primary" type="submit" className="px-8" />
          </div>
        </form>
      </Modal>
    </div>
  );
}

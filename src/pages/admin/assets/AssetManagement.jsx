import React, { useState, useMemo, useEffect } from 'react';
import {
  HiPlus, HiMagnifyingGlass, HiAdjustmentsHorizontal, HiCheck, HiXMark, HiArrowPath,
  HiArchiveBox, HiUserGroup, HiClipboardDocumentList, HiClock, HiIdentification,
  HiTrash, HiPencilSquare, HiEye, HiCheckBadge, HiUserCircle, HiChevronDown, HiArrowsUpDown
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { assetService } from '../../../services/assetService.js';
import { fetchAssetCategories } from '../../../services/assetSettingsService.js';
import { listEmployees } from '../../../services/employeeService.js';
import { toast } from 'react-hot-toast';

const basicFieldClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/25';

function colLabel(text) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      <HiArrowsUpDown className="h-3 w-3 shrink-0 opacity-45" aria-hidden />
    </span>
  )
}

function statusColor(status) {
  if (status === 'Available') return 'bg-green-100 text-green-700 ring-green-600/20';
  if (status === 'Issued') return 'bg-blue-100 text-blue-700 ring-blue-600/20';
  if (status === 'Damaged' || status === 'Lost') return 'bg-red-100 text-red-700 ring-red-600/20';
  if (status === 'In Repair') return 'bg-orange-100 text-orange-700 ring-orange-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

function conditionColor(condition) {
  if (condition === 'New') return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
  if (condition === 'Good') return 'bg-blue-100 text-blue-700 ring-blue-600/20';
  if (condition === 'Fair') return 'bg-orange-100 text-orange-700 ring-orange-600/20';
  if (condition === 'Damaged') return 'bg-red-100 text-red-700 ring-red-600/20';
  return 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

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
  const [submitting, setSubmitting] = useState(false);

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
      const [assetData, categoryData, empData] = await Promise.all([
        assetService.getAssets(),
        fetchAssetCategories(),
        listEmployees({ limit: 1000 })
      ]);
      setAssets(assetData || []);
      setCategories(categoryData?.data || []);
      setEmployeeList(empData?.employees || empData?.records || []);
    } catch (error) {
      console.error('Error loading asset data:', error);
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: assets.length,
      issued: assets.filter(a => a.status === 'Issued').length,
      available: assets.filter(a => a.status === 'Available').length,
      damaged: assets.filter(a => a.status === 'Damaged' || a.status === 'Lost' || a.status === 'In Repair').length
    }
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = search === '' ||
        asset.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
        asset.asset_id?.toLowerCase().includes(search.toLowerCase()) ||
        asset.assignedTo?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === '' || asset.category_id === typeFilter;
      const matchesStatus = statusFilter === '' || asset.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, search, typeFilter, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

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
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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

  const columns = [
    {
      key: 'asset_id',
      label: colLabel('Asset / Serial'),
      render: (_v, row) => {
        const Icon = getCategoryIcon(row.categoryIcon);
        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none shadow-sm border border-slate-200"
              style={{ backgroundColor: `${row.categoryColor}15`, color: row.categoryColor || '#0F766E' }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-slate-900">{row.asset_id}</div>
              <div className="truncate text-xs text-slate-500 font-mono">SN: {row.serial_number || 'N/A'}</div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'categoryName',
      label: colLabel('Category'),
      render: (_v, row) => (
        <span className="text-sm font-semibold text-slate-700">{row.categoryName || '—'}</span>
      )
    },
    {
      key: 'assignedTo',
      label: colLabel('Assignment'),
      render: (_v, row) => {
        if (!row.assignedTo || row.assignedTo === '-') {
          return <span className="text-sm text-slate-400 italic">Unassigned</span>;
        }
        return <span className="text-sm font-medium text-slate-900">{row.assignedTo}</span>;
      }
    },
    {
      key: 'condition',
      label: colLabel('Condition'),
      render: (v) => (
        <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${conditionColor(v)}`}>
          {v || '—'}
        </span>
      )
    },
    {
      key: 'status',
      label: colLabel('Status'),
      render: (v) => (
        <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor(v)}`}>
          {v || '—'}
        </span>
      )
    }
  ];

  if (canManage) {
    columns.push({
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => handleOpenModal(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-[#0F766E] text-white transition-colors hover:bg-[#0d5c56]" aria-label="Edit">
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDelete(row.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" aria-label="Delete">
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Asset Management</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Assets</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Inventory</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canManage && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" /> Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL ASSETS',
            count: stats.total,
            bgColor: 'bg-[#0F172A]',
            icon: HiArchiveBox,
            onClickFilter: () => setStatusFilter('')
          },
          {
            label: 'AVAILABLE',
            count: stats.available,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckBadge,
            onClickFilter: () => setStatusFilter('Available')
          },
          {
            label: 'ISSUED',
            count: stats.issued,
            bgColor: 'bg-[#3B82F6]',
            icon: HiUserGroup,
            onClickFilter: () => setStatusFilter('Issued')
          },
          {
            label: 'DAMAGED/REPAIR',
            count: stats.damaged,
            bgColor: 'bg-[#EF4444]',
            icon: HiAdjustmentsHorizontal,
            onClickFilter: () => setStatusFilter('Damaged')
          }
        ].map((card, idx) => {
          const isActiveFilter =
            (card.label === 'TOTAL ASSETS' && statusFilter === '') ||
            (card.label === 'AVAILABLE' && statusFilter === 'Available') ||
            (card.label === 'ISSUED' && statusFilter === 'Issued') ||
            (card.label === 'DAMAGED/REPAIR' && statusFilter === 'Damaged');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Full width Table */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Asset Inventory</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search serial, asset ID, owner..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer">
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
              <option value="In Repair">In Repair</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{filteredAssets.length} records shown</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setTypeFilter(''); setStatusFilter(''); }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredAssets}
          pageSize={8}
          square
          loading={loading}
          totalCount={filteredAssets.length}
          currentPage={currentPage - 1}
          onPageChange={(idx) => setCurrentPage(idx + 1)}
        />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Asset' : 'Add New Asset'}
            </h2>

          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Asset Category<span className="text-red-500"> *</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className={basicFieldClass}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Serial Number<span className="text-red-500"> *</span>
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="e.g. SN-12345"
                required
                className={basicFieldClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Current Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className={basicFieldClass}
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={basicFieldClass}
              >
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="In Repair">In Repair</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Assign To Employee
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                className={basicFieldClass}
              >
                <option value="">Not Assigned</option>
                {employeeList.map(e => (
                  <option key={e.id} value={e.id}>{e.full_name || e.name} ({e.emp_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className={basicFieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-800">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Record any specific details..."
                className={basicFieldClass}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (editMode ? 'Update Asset' : 'Add Asset')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

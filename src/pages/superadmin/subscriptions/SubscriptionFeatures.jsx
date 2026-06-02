import { useState, useEffect } from 'react'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { superadminService } from '../../../services/superadminService.js'
import { 
  HiCube, 
  HiExclamationTriangle,
  HiQuestionMarkCircle,
  HiLightBulb,
  HiChartBar,
  HiServerStack,
  HiCheckCircle,
  HiPlus,
  HiTrash,
  HiPencil,
  HiXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiMagnifyingGlass
} from 'react-icons/hi2'

export default function SubscriptionFeatures() {
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false)
  const [showEditFeatureModal, setShowEditFeatureModal] = useState(false)
  const [showDeleteFeatureModal, setShowDeleteFeatureModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const [newFeature, setNewFeature] = useState({
    feature_name: '',
    feature_code: '',
    feature_description: '',
    feature_sort_order: 0,
    feature_is_active: true
  })

  const [editForm, setEditForm] = useState({
    feature_name: '',
    feature_code: '',
    feature_description: '',
    feature_sort_order: 0,
    feature_is_active: true
  })

  // Fetch features from API
  const fetchFeatures = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const response = await superadminService.getFeatures({ 
        page, 
        limit: pagination.limit,
        search: searchQuery,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
      })
      
      // Handle the API response structure
      if (response.data?.success) {
        setFeatures(response.data.data)
        setPagination({
          page: response.data.meta.page,
          limit: response.data.meta.limit,
          total: response.data.meta.total,
          totalPages: response.data.meta.totalPages
        })
      } else {
        setFeatures([])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch features')
      console.error('Error fetching features:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeatures()
  }, [searchQuery, statusFilter])

  const handleCreateFeature = async () => {
    try {
      setFormError(null)
      const response = await superadminService.createFeature(newFeature)
      
      if (response.data?.success) {
        await fetchFeatures(pagination.page)
        setShowAddFeatureModal(false)
        setNewFeature({
          feature_name: '',
          feature_code: '',
          feature_description: '',
          feature_sort_order: 0,
          feature_is_active: true
        })
      }
    } catch (err) {
      // Handle duplicate feature code error
      if (err.response?.data?.message === 'Feature code already exists') {
        setFormError('Feature code already exists. Please use a different code.')
      } else {
        setFormError(err.response?.data?.message || 'Failed to create feature')
      }
      console.error('Error creating feature:', err)
    }
  }

  const handleUpdateFeature = async () => {
    try {
      setFormError(null)
      const response = await superadminService.updateFeature(selectedFeature.id, editForm)
      
      if (response.data?.success) {
        await fetchFeatures(pagination.page)
        setShowEditFeatureModal(false)
        setSelectedFeature(null)
        setEditForm({
          feature_name: '',
          feature_code: '',
          feature_description: '',
          feature_sort_order: 0,
          feature_is_active: true
        })
      }
    } catch (err) {
      if (err.response?.data?.message === 'Feature code already exists') {
        setFormError('Feature code already exists. Please use a different code.')
      } else {
        setFormError(err.response?.data?.message || 'Failed to update feature')
      }
      console.error('Error updating feature:', err)
    }
  }

  const handleDeleteFeature = async () => {
    try {
      const response = await superadminService.deleteFeature(selectedFeature.id)
      
      if (response.data?.success) {
        // If current page has only one item and it's not the first page, go to previous page
        if (features.length === 1 && pagination.page > 1) {
          await fetchFeatures(pagination.page - 1)
        } else {
          await fetchFeatures(pagination.page)
        }
        setShowDeleteFeatureModal(false)
        setSelectedFeature(null)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete feature')
      console.error('Error deleting feature:', err)
    }
  }

  const handleToggleStatus = async (feature, newStatus) => {
    try {
      if (newStatus) {
        await superadminService.activateFeature(feature.id)
      } else {
        await superadminService.deactivateFeature(feature.id)
      }
      await fetchFeatures(pagination.page)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feature status')
      console.error('Error updating status:', err)
    }
  }

  const handleViewClick = (feature) => {
    setSelectedFeature(feature)
    setShowDetailModal(true)
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Code', 'Description', 'Sort Order', 'Status']
    const csvData = features.map(f => [
      f.id,
      f.feature_name,
      f.feature_code,
      f.feature_description || '',
      f.feature_sort_order,
      f.feature_is_active ? 'Active' : 'Inactive'
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `features_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditClick = (feature) => {
    setSelectedFeature(feature)
    setEditForm({
      feature_name: feature.feature_name,
      feature_code: feature.feature_code,
      feature_description: feature.feature_description || '',
      feature_sort_order: feature.feature_sort_order || 0,
      feature_is_active: feature.feature_is_active
    })
    setFormError(null)
    setShowEditFeatureModal(true)
  }

  const handleDeleteClick = (feature) => {
    setSelectedFeature(feature)
    setShowDeleteFeatureModal(true)
  }

  // Calculate statistics from API data
  const activeFeaturesCount = features.filter(f => f.feature_is_active).length
  const totalFeatures = pagination.total
  const inactiveCount = totalFeatures - activeFeaturesCount

  // Table columns configuration (without pagination)
  const columns = [
    {
      key: 'feature',
      label: 'Feature',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <HiCube className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{row.feature_name}</div>
            <div className="text-[10px] text-slate-500">{row.feature_description || 'No description'}</div>
            <div className="text-[9px] text-slate-400 font-mono mt-0.5">Code: {row.feature_code}</div>
          </div>
        </div>
      )
    },
    {
      key: 'feature_sort_order',
      label: 'Sort Order',
      render: (value) => (
        <Badge label={value || 0} color="gray" variant="soft" size="sm" />
      )
    },
    {
      key: 'feature_is_active',
      label: 'Status',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Badge 
            label={value ? 'Active' : 'Inactive'} 
            color={value ? 'green' : 'gray'} 
            variant="soft" 
          />
          <button
            onClick={() => handleToggleStatus(row, !value)}
            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            {value ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => handleViewClick(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600" title="View Details"><HiChartBar className="h-4 w-4" /></button>
          <button type="button" onClick={() => handleEditClick(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-blue-500 text-white transition-colors hover:bg-blue-600" title="Edit Feature"><HiPencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => handleDeleteClick(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" title="Delete Feature"><HiTrash className="h-4 w-4" /></button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Subscription Features</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Subscriptions</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Feature Management</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiChartBar className="h-4 w-4" /> Export CSV
          </button>
          <button type="button" onClick={() => { setFormError(null); setShowAddFeatureModal(true); }} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiPlus className="h-4 w-4" /> Add Feature
          </button>
        </div>
      </div>

      {/* Stats Section - Dynamic from API */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
        {[
          { label: 'TOTAL FEATURES', count: totalFeatures, bgColor: 'bg-[#0F172A]', icon: HiCube },
          { label: 'ACTIVE FEATURES', count: activeFeaturesCount, bgColor: 'bg-[#10B981]', icon: HiCheckCircle },
          { label: 'INACTIVE FEATURES', count: inactiveCount, bgColor: 'bg-[#F59E0B]', icon: HiExclamationTriangle }
        ].map((card, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-3.5 rounded-none border border-slate-200 p-4 text-left transition-all hover:bg-slate-50/50 min-w-0 shadow-sm bg-white"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}><card.icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-wider truncate leading-none text-slate-400">{card.label}</div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </div>
        ))}
      </div>

      {/* Main Table Registry Area */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Feature Registry</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Name or code..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{totalFeatures} records</p>
            {searchQuery || statusFilter !== 'all' ? (
              <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50 whitespace-nowrap">Clear Filters</button>
            ) : null}
          </div>
        </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 flex items-center gap-3 border border-red-100">
          <HiXCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Features Table - disable any internal pagination */}
          <Table
            columns={columns}
            data={features}
            disablePagination={true} // Disable table's internal pagination if it exists
          />

          {/* Custom Pagination Component */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-200">
              <p className="text-[11px] font-medium text-slate-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} features
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchFeatures(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8 w-8 rounded-none border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <HiChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1
                    // Show only current page, first, last, and neighbors
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      Math.abs(pageNum - pagination.page) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchFeatures(pageNum)}
                          className={`min-w-[32px] h-8 px-2 rounded-none text-xs font-medium transition-all ${
                            pagination.page === pageNum
                              ? 'bg-[#0F766E] text-white shadow-sm'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (
                      (pageNum === 2 && pagination.page > 3) ||
                      (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                    ) {
                      return <span key={pageNum} className="px-1 text-slate-400">...</span>
                    }
                    return null
                  })}
                </div>
                <button
                  onClick={() => fetchFeatures(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-8 w-8 rounded-none border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <HiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Rest of the modals remain the same */}
      {/* Edit Feature Modal */}
      <Modal
        isOpen={showEditFeatureModal}
        onClose={() => {
          setShowEditFeatureModal(false)
          setFormError(null)
        }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">{selectedFeature ? `Edit Feature: ${selectedFeature.feature_name}` : 'Edit Feature'}</h2>
            <p className="text-sm text-slate-500">Modify feature details.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          {formError && (
            <div className="rounded-none bg-red-50 p-3 flex items-center gap-2 border border-red-200">
              <HiExclamationTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs font-medium text-red-700">{formError}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input 
              label="Feature Name *" 
              value={editForm.feature_name} 
              onChange={(e) => setEditForm({ ...editForm, feature_name: e.target.value })} 
            />
            <Input 
              label="Feature Code *" 
              value={editForm.feature_code}
              helper="Unique identifier (lowercase, underscores)"
              onChange={(e) => setEditForm({ ...editForm, feature_code: e.target.value.toLowerCase().replace(/\s/g, '_') })} 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea
              className="w-full rounded-none border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all outline-none resize-none"
              rows={3}
              value={editForm.feature_description}
              onChange={(e) => setEditForm({ ...editForm, feature_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input 
              label="Sort Order" 
              type="number"
              placeholder="0"
              helper="Determines display order (lower = higher priority)"
              value={editForm.feature_sort_order}
              onChange={(e) => setEditForm({ ...editForm, feature_sort_order: parseInt(e.target.value) || 0 })}
            />
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all outline-none"
                value={editForm.feature_is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditForm({ ...editForm, feature_is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowEditFeatureModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleUpdateFeature} disabled={!editForm.feature_name || !editForm.feature_code} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      {/* Delete Feature Confirmation Modal */}
      <Modal
        isOpen={showDeleteFeatureModal}
        onClose={() => setShowDeleteFeatureModal(false)}
        title={`Delete Feature: ${selectedFeature?.feature_name}`}
        description="This action cannot be undone. The feature will be removed from all plans."
        icon={HiExclamationTriangle}
      >
        <div className="space-y-6 p-2">
          <div className="rounded-2xl bg-amber-50 p-5 flex items-start gap-4 border border-amber-100">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <HiServerStack className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Warning</p>
              <p className="text-xs font-medium text-amber-800 leading-relaxed">
                Are you sure you want to delete this feature? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
            <Button 
              label="Cancel" 
              variant="ghost" 
              className="font-black uppercase text-[10px] tracking-widest text-slate-400" 
              onClick={() => setShowDeleteFeatureModal(false)} 
            />
            <Button 
              label="Delete" 
              variant="danger" 
              className="bg-red-600 border-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100"
              onClick={handleDeleteFeature}
            />
          </div>
        </div>
      </Modal>

      {/* Add Feature Modal */}
      <Modal
        isOpen={showAddFeatureModal}
        onClose={() => {
          setShowAddFeatureModal(false)
          setFormError(null)
        }}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Add New Feature</h2>
            <p className="text-sm text-slate-500">Create a new feature and configure its availability across plans.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
          {formError && (
            <div className="rounded-none bg-red-50 p-3 flex items-center gap-2 border border-red-200">
              <HiExclamationTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs font-medium text-red-700">{formError}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input 
              label="Feature Name *" 
              placeholder="e.g. Time Tracking"
              value={newFeature.feature_name}
              onChange={(e) => setNewFeature({ ...newFeature, feature_name: e.target.value })}
            />
            <Input 
              label="Feature Code *" 
              placeholder="e.g., time_tracking"
              helper="Unique identifier (lowercase, underscores)"
              value={newFeature.feature_code}
              onChange={(e) => setNewFeature({ ...newFeature, feature_code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
            <textarea
              className="w-full rounded-none border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all outline-none resize-none"
              rows={3}
              placeholder="Describe what this feature does..."
              value={newFeature.feature_description}
              onChange={(e) => setNewFeature({ ...newFeature, feature_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input 
              label="Sort Order" 
              type="number"
              placeholder="0"
              helper="Determines display order (lower = higher priority)"
              value={newFeature.feature_sort_order}
              onChange={(e) => setNewFeature({ ...newFeature, feature_sort_order: parseInt(e.target.value) || 0 })}
            />
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
              <select
                className="w-full rounded-none border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all outline-none"
                value={newFeature.feature_is_active ? 'active' : 'inactive'}
                onChange={(e) => setNewFeature({ ...newFeature, feature_is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => {
              setShowAddFeatureModal(false)
              setNewFeature({
                feature_name: '',
                feature_code: '',
                feature_description: '',
                feature_sort_order: 0,
                feature_is_active: true
              })
              setFormError(null)
            }} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleCreateFeature} disabled={!newFeature.feature_name || !newFeature.feature_code} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50 transition-colors">Save</button>
          </div>
        </div>
      </Modal>
      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedFeature?.feature_name}
        description={`Feature ID: ${selectedFeature?.id} · Code: ${selectedFeature?.feature_code}`}
        icon={HiCube}
        size="lg"
      >
        {selectedFeature && (
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code Identifier</span>
                <p className="mt-1 text-sm font-mono font-bold text-indigo-600">{selectedFeature.feature_code}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <div className="mt-1">
                  <Badge 
                    label={selectedFeature.feature_is_active ? 'Active' : 'Inactive'} 
                    color={selectedFeature.feature_is_active ? 'green' : 'gray'} 
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort Priority</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{selectedFeature.feature_sort_order}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Created</span>
                <p className="mt-1 text-sm font-bold text-slate-900">{new Date(selectedFeature.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Description</span>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {selectedFeature.feature_description || 'No description provided for this feature.'}
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button label="Close" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowDetailModal(false)} />
              <Button label="Edit Feature" variant="primary" className="flex-1" onClick={() => { setShowDetailModal(false); handleEditClick(selectedFeature); }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
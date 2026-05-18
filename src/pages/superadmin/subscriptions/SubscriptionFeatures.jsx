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
  HiChevronRight
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
          <Button 
            variant="ghost" 
            size="sm" 
            icon={HiChartBar}
            className="text-slate-400 hover:text-indigo-600"
            onClick={() => handleViewClick(row)}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={HiPencil}
            className="text-slate-400 hover:text-blue-600"
            onClick={() => handleEditClick(row)}
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={HiTrash}
            className="text-slate-400 hover:text-red-600"
            onClick={() => handleDeleteClick(row)}
          />
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <HiLightBulb className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Features</h1>
            <div className="group relative">
              <HiQuestionMarkCircle className="h-4 w-4 text-slate-300 cursor-help hover:text-indigo-500 transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-3 bg-slate-900 text-white text-[10px] leading-relaxed rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl border border-white/10">
                <p className="font-bold text-indigo-400 mb-1 uppercase tracking-widest">Feature Management</p>
                Configure which features are available in each pricing plan.
                <div className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-500">Manage feature availability across different subscription plans.</p>
        </div>
        <div className="flex gap-2">
          <Button label="Export CSV" variant="ghost" size="sm" icon={HiChartBar} onClick={handleExport} className="text-slate-500 font-bold" />
          <Button label="Add Feature" variant="primary" size="sm" icon={HiPlus} onClick={() => {
            setFormError(null)
            setShowAddFeatureModal(true)
          }} />
        </div>
      </div>

      {/* Filter Section */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input 
            label="Search Features" 
            placeholder="Name or code..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <div>
            <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select 
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button label="Reset Filters" variant="ghost" className="w-full font-bold text-slate-400" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} />
          </div>
        </div>
      </div>

      {/* Stats Section - Dynamic from API */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Features" 
          value={totalFeatures} 
          icon={HiCube}
        />
        <StatCard 
          title="Active Features" 
          value={activeFeaturesCount} 
          icon={HiCheckCircle}
        />
        <StatCard 
          title="Inactive Features" 
          value={inactiveCount} 
          icon={HiExclamationTriangle}
        />
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
            <div className="flex items-center justify-between gap-4 pt-6 pb-2">
              <p className="text-[11px] font-medium text-slate-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} features
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchFeatures(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                            pagination.page === pageNum
                              ? 'bg-indigo-600 text-white shadow-sm'
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
                  className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <HiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rest of the modals remain the same */}
      {/* Edit Feature Modal */}
      <Modal
        isOpen={showEditFeatureModal}
        onClose={() => {
          setShowEditFeatureModal(false)
          setFormError(null)
        }}
        title={selectedFeature ? `Edit Feature: ${selectedFeature.feature_name}` : 'Edit Feature'}
        description="Modify feature details."
        icon={HiPencil}
        size="lg"
      >
        <div className="space-y-8 p-2">
          {formError && (
            <div className="rounded-xl bg-red-50 p-3 flex items-center gap-2 border border-red-100">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                value={editForm.feature_is_active ? 'active' : 'inactive'}
                onChange={(e) => setEditForm({ ...editForm, feature_is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
            <Button 
              label="Cancel" 
              variant="ghost" 
              className="font-black uppercase tracking-widest text-[10px] text-slate-400" 
              onClick={() => setShowEditFeatureModal(false)} 
            />
            <Button 
              label="Save" 
              variant="primary" 
              className="bg-indigo-600 border-none shadow-lg shadow-indigo-100"
              onClick={handleUpdateFeature}
              disabled={!editForm.feature_name || !editForm.feature_code}
            />
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
        title="Add New Feature"
        description="Create a new feature and configure its availability across plans."
        icon={HiPlus}
        size="lg"
      >
        <div className="space-y-8 p-2">
          {formError && (
            <div className="rounded-xl bg-red-50 p-3 flex items-center gap-2 border border-red-100">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none"
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                value={newFeature.feature_is_active ? 'active' : 'inactive'}
                onChange={(e) => setNewFeature({ ...newFeature, feature_is_active: e.target.value === 'active' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <Button 
              label="Cancel" 
              variant="ghost" 
              className="flex-1 font-black uppercase text-[10px] tracking-widest text-slate-400" 
              onClick={() => {
                setShowAddFeatureModal(false)
                setNewFeature({
                  feature_name: '',
                  feature_code: '',
                  feature_description: '',
                  feature_sort_order: 0,
                  feature_is_active: true
                })
                setFormError(null)
              }} 
            />
            <Button 
              label="Save" 
              variant="primary" 
              className="flex-1 bg-indigo-600 border-none shadow-lg shadow-indigo-100"
              onClick={handleCreateFeature}
              disabled={!newFeature.feature_name || !newFeature.feature_code}
            />
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
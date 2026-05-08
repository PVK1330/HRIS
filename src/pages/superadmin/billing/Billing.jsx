import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { superadminService } from '../../../services/superadminService.js'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { 
  HiArrowTrendingDown, 
  HiCurrencyDollar, 
  HiDocumentText, 
  HiCloudArrowDown,
  HiBellAlert,
  HiArrowPath,
  HiDocumentPlus,
  HiMagnifyingGlass,
  HiFunnel,
  HiChevronLeft,
  HiChevronRight,
  HiInformationCircle
  ,HiPrinter
} from 'react-icons/hi2'

export default function Billing() {
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState({
    monthly_revenue: 0,
    annual_revenue: 0,
    outstanding_amount: 0,
    failed_count: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [pageSize] = useState(10)
  
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showManualInvoiceModal, setShowManualInvoiceModal] = useState(false)
  const [manualInvoiceForm, setManualInvoiceForm] = useState({
    tenant_id: '',
    amount: '',
    currency: 'AED',
    billing_start_date: '',
    billing_end_date: '',
    notes: '',
    payment_method: 'Manual'
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await superadminService.getPayments({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter
      })
      if (response.data?.success) {
        setInvoices(response.data.data.payments)
        setTotalCount(response.data.data.meta.total)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await superadminService.getPaymentStats()
      if (response.data?.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [currentPage, searchQuery, statusFilter])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleExport = () => {
    const headers = ['Invoice ID', 'Tenant', 'Plan', 'Amount', 'Currency', 'Status', 'Date']
    const csvData = invoices.map(inv => [
      `INV-${inv.id}`,
      inv.tenant_name,
      inv.plan_name || 'N/A',
      inv.amount,
      inv.currency,
      inv.status,
      new Date(inv.created_at).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `billing_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice)
    setShowDetailModal(true)
  }

  const handleSyncPayments = async () => {
    await Promise.all([fetchPayments(), fetchStats()])
    Swal.fire({
      icon: 'success',
      title: 'Synced',
      text: 'Payments and stats refreshed successfully.',
      timer: 1200,
      showConfirmButton: false
    })
  }

  const fetchInvoiceHtml = async (invoiceId) => {
    const response = await superadminService.getInvoiceHtml(invoiceId)
    return response?.data || ''
  }

  const buildPrintableInvoiceNode = (html) => {
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const host = document.createElement('div')
    host.style.position = 'fixed'
    host.style.left = '-100000px'
    host.style.top = '0'
    host.style.width = '794px'
    host.style.background = '#ffffff'
    host.style.zIndex = '-1'

    parsed.querySelectorAll('style').forEach((styleTag) => {
      host.appendChild(styleTag.cloneNode(true))
    })

    const bodyChildren = Array.from(parsed.body.children)
    if (bodyChildren.length) {
      bodyChildren.forEach((child) => host.appendChild(child.cloneNode(true)))
    } else {
      const fallback = document.createElement('div')
      fallback.innerHTML = parsed.body.innerHTML
      host.appendChild(fallback)
    }

    document.body.appendChild(host)
    return host
  }

  const handlePrintInvoice = async (invoice) => {
    try {
      const html = await fetchInvoiceHtml(invoice.id)
      const printWindow = window.open('', '_blank', 'width=1024,height=768')
      if (!printWindow) {
        Swal.fire('Popup Blocked', 'Please allow popups to print invoice.', 'warning')
        return
      }
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 350)
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to print invoice', 'error')
    }
  }

  const handleDownloadInvoice = async (invoice) => {
    let node = null
    try {
      const html = await fetchInvoiceHtml(invoice.id)
      node = buildPrintableInvoiceNode(html)

      // Give browser a short frame to apply styles/layout before capture.
      await new Promise((resolve) => setTimeout(resolve, 150))

      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'pt', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`invoice_INV-${invoice.id}.pdf`)
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to download invoice', 'error')
    } finally {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node)
      }
    }
  }

  const handleCreateManualInvoice = async () => {
    if (!manualInvoiceForm.tenant_id || !manualInvoiceForm.amount || !manualInvoiceForm.billing_start_date || !manualInvoiceForm.billing_end_date) {
      Swal.fire('Validation', 'Please fill required fields.', 'warning')
      return
    }
    try {
      await superadminService.createManualInvoice({
        ...manualInvoiceForm,
        tenant_id: Number(manualInvoiceForm.tenant_id),
        amount: Number(manualInvoiceForm.amount),
      })
      setShowManualInvoiceModal(false)
      setManualInvoiceForm({
        tenant_id: '',
        amount: '',
        currency: 'AED',
        billing_start_date: '',
        billing_end_date: '',
        notes: '',
        payment_method: 'Manual'
      })
      await handleSyncPayments()
      Swal.fire('Created', 'Manual invoice created successfully.', 'success')
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create manual invoice', 'error')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Update Status',
        text: `Are you sure you want to mark this invoice as ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b'
      })

      if (result.isConfirmed) {
        await superadminService.updatePaymentStatus(id, newStatus)
        Swal.fire('Updated!', 'Payment status has been updated.', 'success')
        fetchPayments()
        fetchStats()
        setShowDetailModal(false)
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to update status.', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Control</h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">Global revenue tracking, invoicing, and subscription reconciliation.</p>
        </div>
        <div className="flex gap-2">
           <Button label="Export History" variant="ghost" icon={HiCloudArrowDown} onClick={handleExport} className="font-bold text-slate-600" />
           <Button label="Sync Payments" variant="ghost" icon={HiArrowPath} className="font-bold text-slate-600" onClick={handleSyncPayments} />
           <Button label="Manual Invoice" variant="primary" icon={HiDocumentPlus} onClick={() => setShowManualInvoiceModal(true)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="MONTHLY REVENUE" value={`AED ${Number(stats.monthly_revenue).toLocaleString()}`} icon={HiCurrencyDollar} trend="+12.5%" trendColor="green" />
        <StatCard title="ANNUAL REVENUE" value={`AED ${Number(stats.annual_revenue).toLocaleString()}`} icon={HiCurrencyDollar} trend="+8.2%" trendColor="green" />
        <StatCard title="OUTSTANDING" value={`AED ${Number(stats.outstanding_amount).toLocaleString()}`} icon={HiBellAlert} trendColor="amber" />
        <StatCard title="FAILED ATTEMPTS" value={stats.failed_count} icon={HiArrowTrendingDown} trendColor="red" />
      </div>

      {/* Filter Section */}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input 
            label="Search Invoices" 
            placeholder="ID or Organization..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            icon={HiMagnifyingGlass}
          />
          <div>
            <label className="mb-2 block text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</label>
            <select 
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-end lg:col-span-2">
            <Button label="Reset Filters" variant="ghost" className="font-bold text-slate-400" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-50 p-5 bg-slate-50/30">
           <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoicing & Ledger</h2>
           <Badge label={`${totalCount} Total Records`} color="indigo" variant="glass" />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <Table
            pageSize={pageSize}
            totalCount={totalCount}
            currentPage={currentPage - 1}
            onPageChange={(page) => setCurrentPage(page + 1)}
            columns={[
              { key: 'invoice', label: 'Reference' },
              { key: 'tenant', label: 'Organization' },
              { key: 'plan', label: 'Plan' },
              { key: 'amount', label: 'Amount' },
              { key: 'dates', label: 'Billing Period' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={invoices.map((invoice) => ({
              invoice: (
                <div className="flex items-center gap-2">
                   <HiDocumentText className="text-slate-300 h-4 w-4" />
                   <span className="font-mono text-[11px] font-black text-indigo-600">INV-{invoice.id}</span>
                </div>
              ),
              tenant: (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{invoice.tenant_name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {invoice.tenant_id}</span>
                </div>
              ),
              plan: <Badge label={invoice.plan_name || 'N/A'} color="indigo" variant="soft" />,
              amount: (
                 <div className="flex flex-col">
                    <span className={`text-sm font-black ${invoice.status === 'completed' ? 'text-slate-900' : 'text-amber-600'}`}>
                      {Number(invoice.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{invoice.currency}</span>
                 </div>
              ),
              dates: (
                 <div className="flex flex-col">
                    <span className="text-xs text-slate-600 font-bold">
                      {new Date(invoice.billing_start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(invoice.billing_end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Issued: {new Date(invoice.created_at).toLocaleDateString()}
                    </span>
                 </div>
              ),
              status: <Badge label={invoice.status.toUpperCase()} color={invoice.status === 'completed' ? 'green' : invoice.status === 'pending' ? 'amber' : 'red'} />,
              actions: (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" icon={HiInformationCircle} className="text-slate-400 hover:text-indigo-600" onClick={() => handleViewDetails(invoice)} />
                  <Button variant="ghost" size="sm" icon={HiCloudArrowDown} className="text-slate-400 hover:text-emerald-600" onClick={() => handleDownloadInvoice(invoice)} />
                  <Button variant="ghost" size="sm" icon={HiPrinter} className="text-slate-400 hover:text-slate-700" onClick={() => handlePrintInvoice(invoice)} />
                </div>
              ),
            }))}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Invoice INV-${selectedInvoice?.id}`}
        description={`Issued for ${selectedInvoice?.tenant_name}`}
        icon={HiDocumentText}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</span>
                <p className="mt-1 text-lg font-black text-slate-900">{selectedInvoice.currency} {Number(selectedInvoice.amount).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</span>
                <div className="mt-1">
                  <Badge 
                    label={selectedInvoice.status.toUpperCase()} 
                    color={selectedInvoice.status === 'completed' ? 'green' : selectedInvoice.status === 'pending' ? 'amber' : 'red'} 
                  />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Period</span>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {new Date(selectedInvoice.billing_start_date).toLocaleDateString()} - {new Date(selectedInvoice.billing_end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</span>
                <p className="mt-1 text-sm font-bold text-slate-700">{selectedInvoice.payment_method}</p>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</span>
                <p className="mt-1 text-sm text-slate-600">{selectedInvoice.notes}</p>
              </div>
            )}

            {selectedInvoice.status === 'pending' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Awaiting Payment</p>
                  <p className="text-[10px] text-amber-700 font-medium">Verify transaction before marking as completed.</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    label="Mark Paid" 
                    variant="primary" 
                    size="sm" 
                    className="bg-green-600 border-none"
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'completed')}
                  />
                  <Button 
                    label="Mark Failed" 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleUpdateStatus(selectedInvoice.id, 'failed')}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Button label="Close" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setShowDetailModal(false)} />
              <Button label="Download Invoice" variant="ghost" className="flex-1 font-bold text-indigo-600" onClick={() => handleDownloadInvoice(selectedInvoice)} />
              <Button label="Print Invoice" variant="ghost" className="flex-1 font-bold text-slate-700" onClick={() => handlePrintInvoice(selectedInvoice)} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showManualInvoiceModal}
        onClose={() => setShowManualInvoiceModal(false)}
        title="Create Manual Invoice"
        description="Generate a pending invoice for a tenant."
        icon={HiDocumentPlus}
        size="lg"
      >
        <div className="space-y-4 p-2">
          <Input
            label="Tenant ID *"
            type="number"
            value={manualInvoiceForm.tenant_id}
            onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, tenant_id: e.target.value }))}
          />
          <Input
            label="Amount *"
            type="number"
            value={manualInvoiceForm.amount}
            onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, amount: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Billing Start Date *"
              type="date"
              value={manualInvoiceForm.billing_start_date}
              onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, billing_start_date: e.target.value }))}
            />
            <Input
              label="Billing End Date *"
              type="date"
              value={manualInvoiceForm.billing_end_date}
              onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, billing_end_date: e.target.value }))}
            />
          </div>
          <Input
            label="Currency"
            value={manualInvoiceForm.currency}
            onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, currency: e.target.value }))}
          />
          <Input
            label="Notes"
            value={manualInvoiceForm.notes}
            onChange={(e) => setManualInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
          />
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Button label="Cancel" variant="ghost" className="flex-1" onClick={() => setShowManualInvoiceModal(false)} />
            <Button label="Create Invoice" variant="primary" className="flex-1" onClick={handleCreateManualInvoice} />
          </div>
        </div>
      </Modal>
    </div>
  )
}


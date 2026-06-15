import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Badge } from '../../../components/ui/Badge.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { StatCard } from '../../../components/ui/StatCard.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { superadminService } from '../../../services/superadminService.js'
import { ExportDropdown } from '../../../components/ui/ExportDropdown.jsx'
import { useCurrency } from '../../../context/CurrencyContext.jsx'
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
  const { format: fmt, breakdown } = useCurrency()
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
    } catch {
      Swal.fire('Error', 'Failed to update status.', 'error')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Title Bar with Moved Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Financial Control</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Billing</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Invoices & Ledger</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ExportDropdown
            onExcel={() => superadminService.exportPayments('excel', { search: searchQuery, status: statusFilter !== 'all' ? statusFilter : '' })}
            onPDF={() => superadminService.exportPayments('pdf', { search: searchQuery, status: statusFilter !== 'all' ? statusFilter : '' })}
            excelFilename="payments.xlsx"
            pdfFilename="payments.pdf"
          />
          <button type="button" onClick={handleSyncPayments} className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiArrowPath className="h-4 w-4" /> Sync Payments
          </button>
          <button type="button" onClick={() => setShowManualInvoiceModal(true)} className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiDocumentPlus className="h-4 w-4" /> Manual Invoice
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          { label: 'MONTHLY REVENUE', count: fmt(Number(stats.monthly_revenue)), bgColor: 'bg-[#10B981]', icon: HiCurrencyDollar },
          { label: 'ANNUAL REVENUE', count: fmt(Number(stats.annual_revenue)), bgColor: 'bg-[#0F172A]', icon: HiCurrencyDollar },
          { label: 'OUTSTANDING', count: fmt(Number(stats.outstanding_amount)), bgColor: 'bg-[#F59E0B]', icon: HiBellAlert },
          { label: 'FAILED ATTEMPTS', count: stats.failed_count, bgColor: 'bg-[#EF4444]', icon: HiArrowTrendingDown }
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
          <h2 className="text-sm font-semibold text-white">Invoicing & Ledger</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by ID or Organisation..." className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] cursor-pointer" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <p className="text-xs font-medium text-slate-500 whitespace-nowrap">{totalCount} records</p>
            {searchQuery || statusFilter !== 'all' ? (
              <button type="button" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50 whitespace-nowrap">Clear Filters</button>
            ) : null}
          </div>
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
              { key: 'tenant', label: 'Organisation' },
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
                      {fmt(Number(invoice.amount))}
                    </span>
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
                <div className="flex items-center justify-start gap-2">
                  <button type="button" onClick={() => handleViewDetails(invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-500 text-white transition-colors hover:bg-slate-600" title="View Details"><HiInformationCircle className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDownloadInvoice(invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-emerald-500 text-white transition-colors hover:bg-emerald-600" title="Download Invoice"><HiCloudArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handlePrintInvoice(invoice)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-800 text-white transition-colors hover:bg-slate-900" title="Print Invoice"><HiPrinter className="h-4 w-4" /></button>
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
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Invoice INV-{selectedInvoice?.id}</h2>
            <p className="text-sm text-slate-500">Issued for {selectedInvoice?.tenant_name}</p>
          </div>
        }
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Due</span>
                <p className="mt-1 text-lg font-black text-slate-900">{fmt(Number(selectedInvoice.amount))}</p>
                {(() => {
                  const b = breakdown(Number(selectedInvoice.amount))
                  return b.taxEnabled && b.taxRate > 0 ? (
                    <div className="mt-2 space-y-0.5 text-[11px] font-medium text-slate-500">
                      <div className="flex justify-between"><span>Subtotal</span><span>{fmt(b.subtotal)}</span></div>
                      <div className="flex justify-between"><span>{b.taxLabel} ({b.taxRate}%)</span><span>{fmt(b.tax)}</span></div>
                      <div className="flex justify-between font-black text-slate-700"><span>Total</span><span>{fmt(b.total)}</span></div>
                    </div>
                  ) : null
                })()}
              </div>
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</span>
                <div className="mt-1">
                  <Badge 
                    label={selectedInvoice.status.toUpperCase()} 
                    color={selectedInvoice.status === 'completed' ? 'green' : selectedInvoice.status === 'pending' ? 'amber' : 'red'} 
                  />
                </div>
              </div>
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billing Period</span>
                <p className="mt-1 text-sm font-bold text-slate-700">
                  {new Date(selectedInvoice.billing_start_date).toLocaleDateString()} - {new Date(selectedInvoice.billing_end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Method</span>
                <p className="mt-1 text-sm font-bold text-slate-700">{selectedInvoice.payment_method}</p>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div className="p-4 rounded-none bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</span>
                <p className="mt-1 text-sm text-slate-600">{selectedInvoice.notes}</p>
              </div>
            )}

            {selectedInvoice.status === 'pending' && (
              <div className="p-4 rounded-none bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Awaiting Payment</p>
                  <p className="text-[10px] text-amber-700 font-medium">Verify transaction before marking as completed.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleUpdateStatus(selectedInvoice.id, 'completed')} className="rounded-none bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors">Mark Paid</button>
                  <button type="button" onClick={() => handleUpdateStatus(selectedInvoice.id, 'failed')} className="rounded-none border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors">Mark Failed</button>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
              <button type="button" onClick={() => handlePrintInvoice(selectedInvoice)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 mr-auto"><HiPrinter className="h-4 w-4"/> Print Invoice</button>
              <button type="button" onClick={() => handleDownloadInvoice(selectedInvoice)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"><HiCloudArrowDown className="h-4 w-4"/> Download Invoice</button>
              <button type="button" onClick={() => setShowDetailModal(false)} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Close</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showManualInvoiceModal}
        onClose={() => setShowManualInvoiceModal(false)}
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">Create Manual Invoice</h2>
            <p className="text-sm text-slate-500">Generate a pending invoice for a tenant.</p>
          </div>
        }
        size="lg"
      >
        <div className="space-y-6">
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
          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button type="button" onClick={() => setShowManualInvoiceModal(false)} className="rounded-none border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="button" onClick={handleCreateManualInvoice} className="rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0c6b64] transition-colors">Create Invoice</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


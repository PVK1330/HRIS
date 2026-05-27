import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import { HiArrowDownTray } from 'react-icons/hi2'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { processSettlement } from '../../services/exitManagementService.js'

export default function SettlementForm({ exitRequestId, existingSettlement, onSubmitted, employeeTenure }) {
  const isProcessed = existingSettlement?.payment_status === 'processed'

  const [form, setForm] = useState({
    unpaid_salary: existingSettlement?.unpaid_salary ?? 0,
    leave_encashment: existingSettlement?.leave_encashment ?? 0,
    gratuity: existingSettlement?.gratuity ?? 0,
    deductions: existingSettlement?.deductions ?? 0,
    notes: existingSettlement?.notes ?? '',
  })
  const [submitting, setSubmitting] = useState(false)

  const netPayable = useMemo(() => {
    const val = Number(form.unpaid_salary || 0) + Number(form.leave_encashment || 0) + Number(form.gratuity || 0) - Number(form.deductions || 0)
    return Math.max(0, val)
  }, [form.unpaid_salary, form.leave_encashment, form.gratuity, form.deductions])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await Swal.fire({
      title: 'Confirm Settlement',
      text: `Net payable amount: £${netPayable.toFixed(2)}. This action will process the final settlement.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, process settlement',
    })

    if (!result.isConfirmed) return

    setSubmitting(true)
    try {
      await processSettlement({
        exit_request_id: exitRequestId,
        unpaid_salary: Number(form.unpaid_salary),
        leave_encashment: Number(form.leave_encashment),
        gratuity: Number(form.gratuity),
        deductions: Number(form.deductions),
        net_payable: netPayable,
        notes: form.notes,
      })
      toast.success('Settlement processed successfully')
      onSubmitted?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to process settlement')
    } finally {
      setSubmitting(false)
    }
  }

  if (isProcessed) {
    return (
      <div className="space-y-4 rounded-none border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Final Settlement — Processed</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-gray-500">Unpaid Salary</span>
            <p className="text-sm font-semibold text-gray-800">£{Number(existingSettlement.unpaid_salary).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Leave Encashment</span>
            <p className="text-sm font-semibold text-gray-800">£{Number(existingSettlement.leave_encashment).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Gratuity</span>
            <p className="text-sm font-semibold text-gray-800">£{Number(existingSettlement.gratuity).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Deductions</span>
            <p className="text-sm font-semibold text-red-600">-£{Number(existingSettlement.deductions).toFixed(2)}</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <span className="text-xs text-gray-500">Net Payable</span>
          <p className="text-lg font-bold text-[#0F766E]">£{Number(existingSettlement.net_payable).toFixed(2)}</p>
        </div>
        {existingSettlement.notes && (
          <div>
            <span className="text-xs text-gray-500">Notes</span>
            <p className="text-sm text-gray-700 mt-1">{existingSettlement.notes}</p>
          </div>
        )}
        {existingSettlement.file_url && (
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Settlement Slip</span>
              <p className="text-sm font-semibold text-gray-800">Full & Final Slip</p>
            </div>
            <a
              href={existingSettlement.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D645D] transition-colors rounded-none"
            >
              <HiArrowDownTray className="h-4 w-4" />
              Download F&F PDF Slip
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-none border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Final Settlement</h3>

      {employeeTenure > 2 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            UK statutory redundancy pay formula: Weekly pay × years of service × age multiplier. Applies if tenure &gt; 2 years.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Unpaid Salary (£)"
          name="unpaid_salary"
          type="number"
          value={form.unpaid_salary}
          onChange={handleChange('unpaid_salary')}
          placeholder="0.00"
        />
        <Input
          label="Leave Encashment (£)"
          name="leave_encashment"
          type="number"
          value={form.leave_encashment}
          onChange={handleChange('leave_encashment')}
          placeholder="0.00"
        />
        <div>
          <Input
            label="Gratuity (£)"
            name="gratuity"
            type="number"
            value={form.gratuity}
            onChange={handleChange('gratuity')}
            placeholder="0.00"
            helpText="Weekly pay × years of service × age multiplier"
          />
        </div>
        <Input
          label="Deductions (£)"
          name="deductions"
          type="number"
          value={form.deductions}
          onChange={handleChange('deductions')}
          placeholder="0.00"
          helpText="Loans, advances, or other recoveries"
        />
      </div>

      <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
        <span className="text-xs text-teal-700">Net Payable</span>
        <p className="text-xl font-bold text-[#0F766E]">£{netPayable.toFixed(2)}</p>
      </div>

      <div>
        <label htmlFor="settlement-notes" className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="settlement-notes"
          rows={3}
          value={form.notes}
          onChange={handleChange('notes')}
          placeholder="Additional settlement notes..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-[#004CA5] focus:ring-blue-100"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          label="Process Settlement"
          variant="primary"
          loading={submitting}
          disabled={submitting}
        />
      </div>
    </form>
  )
}

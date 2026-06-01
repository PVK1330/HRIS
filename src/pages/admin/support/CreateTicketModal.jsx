import React, { useRef } from 'react'
import { HiPaperClip } from 'react-icons/hi2'
import { Input } from '../../../components/ui/Input.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'

const CATEGORIES = [
  'Technical Issue',
  'Payroll Issue',
  'Attendance Issue',
  'Login Problem',
  'Performance Module',
  'Expense Issue',
  'HR Query',
  'Other',
]

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']

export function CreateTicketModal({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onFileChange,
  onSubmit,
  submitting,
  fileInputRef,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showClose
      size="xl"
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900">Create Support Ticket</h2>
          <p className="text-xs font-medium text-slate-500">
            Submit a new support ticket to get help with your issue.
          </p>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="pt-4">
        <div className="space-y-5">
          {/* Admin & Tenant Name - 2 Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Admin Name"
              name="adminName"
              value={formData.adminName}
              onChange={onFormChange}
              placeholder="Enter admin name"
              disabled
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 bg-slate-50"
              labelClassName="mb-2 block text-sm font-medium text-slate-800"
            />

            <Input
              label="Company / Tenant Name"
              name="tenantName"
              value={formData.tenantName}
              onChange={onFormChange}
              placeholder="Enter tenant name"
              disabled
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 bg-slate-50"
              labelClassName="mb-2 block text-sm font-medium text-slate-800"
            />
          </div>

          {/* Subject */}
          <Input
            label="Subject *"
            name="subject"
            value={formData.subject}
            onChange={onFormChange}
            placeholder="Brief description of the issue"
            required
            inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
            labelClassName="mb-2 block text-sm font-medium text-slate-800"
          />

          {/* Category & Priority - 2 Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category *"
              name="category"
              type="select"
              value={formData.category}
              onChange={onFormChange}
              placeholder="Select category"
              required
              options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-2 block text-sm font-medium text-slate-800"
            />

            <Input
              label="Priority *"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={onFormChange}
              placeholder="Select priority"
              required
              options={PRIORITIES.map((p) => ({ label: p, value: p }))}
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-2 block text-sm font-medium text-slate-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onFormChange}
              placeholder="Detailed description of the issue"
              required
              rows="4"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 font-medium resize-none"
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">Attachment <span className="text-slate-400">(Optional)</span></label>
            <div
              className="relative flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 transition hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.jpg,.png,.jpeg"
              />
              <div className="flex flex-col items-center justify-center text-center">
                <HiPaperClip className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {formData.attachment ? `📎 ${formData.attachment}` : 'Click to upload or drag file'}
                </p>
                {!formData.attachment && (
                  <p className="text-xs text-slate-500 mt-1">PDF, images, docs up to 10MB</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-lg bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

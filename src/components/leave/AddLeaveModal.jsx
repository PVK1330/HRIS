import React, { useEffect, useState } from 'react';
import { HiXMark } from 'react-icons/hi2';

export default function AddLeaveModal({ isOpen, onClose, leaveTypes, empList, liveBalance, onSubmit, submitting, form, setForm, lockEmployee = false }) {
  if (!isOpen) return null;

  const handleDaysChange = (e) => {
    setForm({ ...form, totalDays: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Add Leave</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col max-h-[85vh]">
          <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
            
            {/* Employee */}
            {empList && empList.length > 0 && (
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  required
                  disabled={lockEmployee}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Employee</option>
                  {empList.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Leave Type */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.leaveTypeId || ''}
                onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                required
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              >
                <option value="">Select</option>
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* From */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">From</label>
              <input
                type="date"
                required
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            {/* To */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">To</label>
              <input
                type="date"
                required
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            {/* No of Days */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">No of Days</label>
              <input
                type="number"
                value={form.totalDays || ''}
                onChange={handleDaysChange}
                placeholder="Auto-calculated"
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            {/* Remaining Days */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Remaining Days</label>
              <input
                type="text"
                disabled
                value={liveBalance ? ((liveBalance.total_allocated + liveBalance.carry_forward) - liveBalance.used) : ''}
                placeholder="8"
                className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
              />
            </div>

            {/* Reason */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">Reason <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={4}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Record any specific details..."
                className="w-full resize-none rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
            </div>

            {/* Document Upload (Optional or Conditional) */}
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Supporting Document (Optional)
              </label>
              <input
                type="url"
                value={form.supportingDocumentUrl || ''}
                onChange={(e) => setForm({ ...form, supportingDocumentUrl: e.target.value })}
                placeholder="https://link-to-medical-certificate..."
                className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
              />
              <p className="mt-1 text-xs text-slate-500">Provide a URL to your uploaded document if required by the leave type.</p>
            </div>
            
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center justify-end gap-4 px-6 py-6 pb-8 bg-white rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                 setForm({ ...form, isDraft: true });
                 setTimeout(() => onSubmit(e), 0);
              }}
              disabled={submitting}
              className="rounded border border-[#0F766E] bg-white px-5 py-2 text-sm font-bold text-[#0F766E] transition hover:bg-[#0F766E]/5"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => {
                 setForm({ ...form, isDraft: false });
                 setTimeout(() => onSubmit(e), 0);
              }}
              disabled={submitting}
              className="rounded bg-[#0F766E] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#0c6b64] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiCalendar,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiTrash,
  HiPlus
} from 'react-icons/hi2';
import Swal from 'sweetalert2';
import { Input } from '../../../components/ui/Input.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { Toggle } from '../../../components/ui/Toggle.jsx';
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType
} from '../../../services/adminSettingsService';

const PAID_UNPAID = ['Paid', 'Unpaid'];
// Must match backend VALID_ACCRUAL / VALID_LOP_RULES (leaveSettings.service.js) —
// previously-listed values (Annually/Upfront/Hourly, Deduct from Salary) were rejected with HTTP 400.
const ACCRUAL = ['Monthly', 'Yearly', 'None'];
const LOP = ['No LOP', 'Full LOP', 'Half LOP'];
const GENDER_RESTRICTIONS = ['Both', 'Male', 'Female'];

const initialFormData = {
  name: '',
  code: '',
  entitlementLabel: '',
  paidOrUnpaid: 'Paid',
  annualEntitlementDays: 0,
  accrual: 'Monthly',
  carryForwardAllowed: true,
  maxCarryForwardDays: 0,
  noticePeriodRequired: 0,
  genderRestriction: 'Both',
  lossOfPayRule: 'No LOP',
  documentRequired: false,
  autoApproval: false,
  approver: 'Manager',
  description: '',
  encashmentAllowed: false,
  documentMandatoryAfterDays: 0,
  applicableDepartments: [],
  applicableDesignations: [],
  applicableEmploymentTypes: [],
  probationRestriction: false,
  minimumServiceMonths: 0
};

export default function LeaveSettings({ registerToolbar }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [approverOptions, setApproverOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  // Pagination for local data
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!registerToolbar) return undefined;
    registerToolbar({
      dirty: false,
      saving: false,
      onSave: () => {},
      onDiscard: () => {},
      disableSave: true,
    });
    return () => registerToolbar(null);
  }, [registerToolbar]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await getLeaveTypes();
      const payload = res?.data ?? {};
      setLeaveTypes(payload.leaveTypes ?? []);
      setApproverOptions(payload.approverOptions ?? ['Manager']);
    } catch (err) {
      toast.error('Failed to fetch leave types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    setModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handleCloseModal();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialFormData);
    setEditMode(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!formData.name.trim()) {
      toast.error('Leave type name is required.');
      return;
    }

    setSubmitting(true);
    
    const payload = {
      name: formData.name,
      code: formData.code,
      paidOrUnpaid: formData.paidOrUnpaid,
      annualEntitlementDays: Number(formData.annualEntitlementDays ?? 0),
      entitlementLabel: formData.entitlementLabel || null,
      accrual: formData.accrual,
      carryForwardAllowed: Boolean(formData.carryForwardAllowed),
      maxCarryForwardDays: Number(formData.maxCarryForwardDays ?? 0),
      noticePeriodRequired: Number(formData.noticePeriodRequired ?? 0),
      genderRestriction: formData.genderRestriction,
      lossOfPayRule: formData.lossOfPayRule,
      documentRequired: Boolean(formData.documentRequired),
      autoApproval: Boolean(formData.autoApproval),
      approver: formData.approver,
      description: formData.description,
      encashmentAllowed: Boolean(formData.encashmentAllowed),
      documentMandatoryAfterDays: Number(formData.documentMandatoryAfterDays ?? 0),
      applicableDepartments: formData.applicableDepartments ?? [],
      applicableDesignations: formData.applicableDesignations ?? [],
      applicableEmploymentTypes: formData.applicableEmploymentTypes ?? [],
      probationRestriction: Boolean(formData.probationRestriction),
      minimumServiceMonths: Number(formData.minimumServiceMonths ?? 0),
      isActive: true,
    };

    try {
      if (editMode) {
        await updateLeaveType(editingId, payload);
        toast.success('Leave type updated successfully.');
      } else {
        await createLeaveType(payload);
        toast.success('Leave type added successfully.');
      }
      handleCloseModal();
      fetchLeaveTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save leave type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name ?? '',
      code: item.code ?? '',
      entitlementLabel: item.entitlementLabel ?? '',
      paidOrUnpaid: item.paidOrUnpaid ?? 'Paid',
      annualEntitlementDays: item.annualEntitlementDays ?? 0,
      accrual: item.accrual ?? 'Monthly',
      carryForwardAllowed: item.carryForwardAllowed !== false,
      maxCarryForwardDays: item.maxCarryForwardDays ?? 0,
      noticePeriodRequired: item.noticePeriodRequired ?? 0,
      genderRestriction: item.genderRestriction ?? 'Both',
      lossOfPayRule: item.lossOfPayRule ?? 'No LOP',
      documentRequired: Boolean(item.documentRequired),
      autoApproval: Boolean(item.autoApproval),
      approver: item.approver ?? 'Manager',
      description: item.description ?? '',
      encashmentAllowed: Boolean(item.encashmentAllowed),
      documentMandatoryAfterDays: item.documentMandatoryAfterDays ?? 0,
      applicableDepartments: item.applicableDepartments ?? [],
      applicableDesignations: item.applicableDesignations ?? [],
      applicableEmploymentTypes: item.applicableEmploymentTypes ?? [],
      probationRestriction: Boolean(item.probationRestriction),
      minimumServiceMonths: item.minimumServiceMonths ?? 0,
      isCustom: item.isCustom !== false
    });
    setEditingId(item.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!item.isCustom) {
      toast.error('Default leave types cannot be deleted');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'The leave type will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;

    try {
      await deleteLeaveType(item.id);
      toast.success('Leave type deleted.');
      fetchLeaveTypes();
    } catch (err) {
      toast.error('Failed to delete leave type.');
    }
  };

  const filteredLeaveTypes = useMemo(() => {
    if (!debouncedSearch) return leaveTypes;
    return leaveTypes.filter(d => 
      (d.name && d.name.toLowerCase().includes(debouncedSearch)) ||
      (d.code && d.code.toLowerCase().includes(debouncedSearch))
    );
  }, [leaveTypes, debouncedSearch]);

  const totalCount = filteredLeaveTypes.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filteredLeaveTypes.slice(startIndex, startIndex + pageSize);

  const columns = [
    {
      key: 'name',
      label: 'LEAVE NAME',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiCalendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{v}</div>
            {row.code && <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.code}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'annualEntitlementDays',
      label: 'QUOTA',
      render: (v, row) => (
        <span className="text-sm font-medium text-slate-600">
          {row.entitlementLabel ? row.entitlementLabel : `${v} Days`}
        </span>
      ),
    },
    {
      key: 'maxCarryForwardDays',
      label: 'CARRY FORWARD',
      render: (v, row) => (
        <span className="text-sm font-medium text-slate-600">
          {row.carryForwardAllowed ? `${v} Days limit` : 'Not allowed'}
        </span>
      ),
    },
    {
      key: 'paidOrUnpaid',
      label: 'TYPE',
      render: (v) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
             v === 'Unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              v === 'Unpaid' ? 'bg-orange-500' : 'bg-emerald-500'
            }`} />
            {v}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
            aria-label="Edit leave type"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={!row.isCustom}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Delete leave type"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0 py-6">
      <div className="flex items-center justify-between min-w-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Leave Settings</h2>
          <p className="text-xs font-medium text-slate-500">Add, edit, or remove leave types and rules.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
        >
          <HiPlus className="h-4 w-4" /> Add Leave Type
        </button>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Leave Type Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leave name or code..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{totalCount} records shown</p>
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
              >
                Reset Search
              </button>
            ) : null}
          </div>
        </div>

        <Table
          columns={columns}
          data={paginatedData}
          pageSize={pageSize}
          loading={loading}
          square
          totalCount={totalCount}
          currentPage={page - 1}
          onPageChange={(idx) => setPage(idx + 1)}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        size="lg"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Leave Type' : 'Add New Leave Type'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure the leave type name, quota, and rules.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-4 h-[65vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Leave Type Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                disabled={editMode && formData.isCustom === false}
                placeholder="e.g. Annual Leave"
                required
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
              <Input
                label="Code (Optional)"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                placeholder="e.g. AL"
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 uppercase"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Annual Quota (Days)"
                name="annualEntitlementDays"
                type="number"
                min="0"
                value={formData.annualEntitlementDays}
                onChange={handleFormChange}
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">Financial Classification</label>
                <select
                  name="paidOrUnpaid"
                  value={formData.paidOrUnpaid}
                  onChange={handleFormChange}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {PAID_UNPAID.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">Accrual Model</label>
                <select
                  name="accrual"
                  value={formData.accrual}
                  onChange={handleFormChange}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {ACCRUAL.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">Negative Balance (LOP)</label>
                <select
                  name="lossOfPayRule"
                  value={formData.lossOfPayRule}
                  onChange={handleFormChange}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {LOP.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-800">Description</label>
              <textarea
                name="entitlementLabel"
                value={formData.entitlementLabel}
                onChange={handleFormChange}
                placeholder="Enter an optional description or custom quota label..."
                className="w-full min-h-[80px] resize-y rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Notice Period Required (Days)"
                name="noticePeriodRequired"
                type="number"
                min="0"
                value={formData.noticePeriodRequired}
                onChange={handleFormChange}
                placeholder="0"
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">Gender Restriction</label>
                <select
                  name="genderRestriction"
                  value={formData.genderRestriction}
                  onChange={handleFormChange}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {GENDER_RESTRICTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-800">Default Approver Authority</label>
                <select
                  name="approver"
                  value={formData.approver}
                  onChange={handleFormChange}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20"
                >
                  {approverOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Service (Months)"
                name="minimumServiceMonths"
                type="number"
                min="0"
                value={formData.minimumServiceMonths}
                onChange={handleFormChange}
                placeholder="0"
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
              <Input
                label="Document Mandatory After (Days)"
                name="documentMandatoryAfterDays"
                type="number"
                min="0"
                value={formData.documentMandatoryAfterDays}
                onChange={handleFormChange}
                placeholder="0"
                inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                labelClassName="mb-1 block text-sm font-semibold text-slate-800"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Carry Forward Allowed</h4>
                  <p className="text-xs text-slate-500">Allow unused days to rollover to the next year.</p>
                </div>
                <Toggle
                  checked={formData.carryForwardAllowed}
                  onChange={(v) => handleToggleChange('carryForwardAllowed', v)}
                />
              </div>
              
              {formData.carryForwardAllowed && (
                <div className="pl-4 border-l-2 border-slate-200 ml-2 animate-in fade-in slide-in-from-top-2">
                  <Input
                    label="Maximum Rollover Days"
                    name="maxCarryForwardDays"
                    type="number"
                    min="0"
                    value={formData.maxCarryForwardDays}
                    onChange={handleFormChange}
                    inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20 max-w-[200px]"
                    labelClassName="mb-1 block text-sm font-semibold text-slate-800"
                  />
                </div>
              )}

              <div className="h-px w-full bg-slate-200"></div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Evidence Required</h4>
                  <p className="text-xs text-slate-500">Require an attachment when applying for this leave.</p>
                </div>
                <Toggle
                  checked={formData.documentRequired}
                  onChange={(v) => handleToggleChange('documentRequired', v)}
                />
              </div>
              <div className="h-px w-full bg-slate-200"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Autonomous Approval</h4>
                  <p className="text-xs text-slate-500">Automatically approve requests for this leave type.</p>
                </div>
                <Toggle
                  checked={formData.autoApproval}
                  onChange={(v) => handleToggleChange('autoApproval', v)}
                />
              </div>
              <div className="h-px w-full bg-slate-200"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Encashment Allowed</h4>
                  <p className="text-xs text-slate-500">Allow unused days to be paid out.</p>
                </div>
                <Toggle
                  checked={formData.encashmentAllowed}
                  onChange={(v) => handleToggleChange('encashmentAllowed', v)}
                />
              </div>
              <div className="h-px w-full bg-slate-200"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">Probation Restriction</h4>
                  <p className="text-xs text-slate-500">Restrict employees on probation from applying.</p>
                </div>
                <Toggle
                  checked={formData.probationRestriction}
                  onChange={(v) => handleToggleChange('probationRestriction', v)}
                />
              </div>
            </div>

          </div>

          <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-white py-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-10 rounded-md border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 rounded-md bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0d5c56] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Leave Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

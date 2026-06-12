import { useCallback, useEffect, useState } from 'react';
import {
  HiReceiptPercent,
  HiClock,
  HiCheckBadge,
  HiXCircle,
  HiCurrencyDollar,
  HiPlus,
  HiMagnifyingGlass,
  HiEye,
  HiPaperClip,
  HiBanknotes,
  HiPencilSquare,
  HiTrash,
  HiDocumentArrowDown,
  HiInboxStack,
  HiTableCells,
  HiTag,
  HiAdjustmentsHorizontal,
  HiArrowUpTray,
  HiArrowDownTray,
  HiArrowUturnLeft,
  HiExclamationTriangle,
  HiCheckCircle,
} from 'react-icons/hi2';
import { toast } from 'react-hot-toast';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useCurrency } from '../../../context/CurrencyContext.jsx';
import * as expenseService from '../../../services/expenseService.js';
import * as expenseCategoryService from '../../../services/expenseCategoryService.js';
import { listEmployees } from '../../../services/employeeService.js';
import { resolveFileUrl } from '../../../utils/fileUrl.js';

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Company Card', 'Bank Transfer', 'Other'];
const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'INR'];

function receiptHref(path) {
  if (!path) return null;
  return resolveFileUrl(path);
}

function mapRow(row) {
  return {
    id: row.id,
    employee: row.employee_name || '—',
    empId: row.employee_id,
    category: row.expense_category,
    department: row.department,
    amount: parseFloat(row.amount) || 0,
    currency: row.currency || 'AED',
    submitted: row.expense_date,
    status: row.status,
    description: row.description,
    payment_method: row.payment_method,
    receipt_url: row.receipt_url,
    claim_title: row.claim_title || row.expense_title,
    rejection_reason: row.rejection_reason,
    raw: row,
  };
}

function statusBadgeColor(status) {
  const s = String(status);
  if (s === 'Draft') return 'gray';
  if (s === 'Pending') return 'blue';
  if (s === 'Approved') return 'green';
  if (s === 'Rejected' || s === 'Declined') return 'red';
  if (s === 'Processed') return 'orange';
  if (s === 'Paid' || s === 'Reimbursed') return 'green';
  return 'gray';
}

const initialFormData = {
  claimTitle: '',
  category: '',
  date: '',
  amount: '',
  vatAmount: '',
  currency: 'AED',
  paymentMethod: '',
  description: '',
  employeeId: '',
  receiptFile: null,
};

const initialCategoryFormData = {
  id: null,
  name: '',
  description: '',
  isActive: true,
};

function mapCategoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    limitAmount: row.limit_amount,
    receiptRequired: row.receipt_required ?? false,
    isActive: row.is_active !== false,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default function Expenses() {
  const { user } = useAuth();
  const { format: fmt } = useCurrency();
  const [viewMode, setViewMode] = useState('claims');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimApprovals, setClaimApprovals] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [categoryFormData, setCategoryFormData] = useState(initialCategoryFormData);
  const [editingId, setEditingId] = useState(null);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({
    total: 0, drafts: 0, pending: 0, approved: 0, declined: 0, paid: 0,
    totalAmount: 0, pendingAmount: 0, approvedAmount: 0, paidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [approvalLevels, setApprovalLevels] = useState([]);
  const [approvalLevelsSaving, setApprovalLevelsSaving] = useState(false);
  // Import modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  // Mark-paid modal (EXP-19)
  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paidForm, setPaidForm] = useState({ reference: '', date: '', status: 'Paid' });

  const filteredCategories = expenseCategories.filter(
    (cat) =>
      !categorySearch.trim() ||
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.description.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const isEmployee = user?.role === 'employee';
  const canConfigure =
    user?.role === 'admin' || user?.role === 'hr_admin' ||
    user?.role === 'hr_executive' || user?.role === 'superadmin';
  const canApprove = canConfigure || user?.role === 'manager';

  const loadStats = useCallback(async () => {
    try {
      const s = await expenseService.getExpenseStats();
      setStats({
        total: s.total ?? 0,
        drafts: s.drafts ?? s.draftClaims ?? 0,
        pending: s.pending ?? s.pendingClaims ?? 0,
        approved: s.approved ?? s.approvedClaims ?? 0,
        declined: s.declined ?? s.rejectedClaims ?? 0,
        paid: s.paid ?? 0,
        totalAmount: s.totalAmount ?? 0,
        pendingAmount: s.pendingAmount ?? 0,
        approvedAmount: s.approvedAmount ?? 0,
        paidAmount: s.paidAmount ?? 0,
      });
    } catch { /* non-fatal */ }
  }, []);

  const loadClaims = useCallback(async () => {
    if (viewMode !== 'claims') return;
    setLoading(true);
    try {
      const params = { limit: 100, page: 1 };
      if (debouncedQ) params.search = debouncedQ;
      if (activeStatus !== 'All') params.expenseType = activeStatus;
      if (categoryFilter) params.expenseCategoryId = categoryFilter;
      const { rows } = await expenseService.listExpenses(params);
      setClaims(rows.map(mapRow));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load expenses');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, activeStatus, categoryFilter, viewMode]);

  useEffect(() => {
    if (viewMode === 'claims') { loadStats(); loadClaims(); }
  }, [loadStats, loadClaims, viewMode]);

  const loadCategories = useCallback(async () => {
    const forAdminList = viewMode === 'categories';
    if (forAdminList) setCategoryLoading(true);
    try {
      const rows = await expenseCategoryService.listExpenseCategories({ activeOnly: !forAdminList });
      setExpenseCategories((Array.isArray(rows) ? rows : []).map(mapCategoryRow));
    } catch (err) {
      if (forAdminList) toast.error(err.response?.data?.message || 'Failed to load categories');
      setExpenseCategories([]);
    } finally {
      if (forAdminList) setCategoryLoading(false);
    }
  }, [viewMode]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const loadApprovalLevels = useCallback(async () => {
    if (viewMode !== 'config') return;
    try {
      const levels = await expenseService.getApprovalLevels();
      setApprovalLevels(levels.map((l) => ({
        level_no: l.level_no, name: l.name,
        min_amount: parseFloat(l.min_amount) || 0, is_active: l.is_active !== false,
      })));
    } catch { setApprovalLevels([]); }
  }, [viewMode]);

  useEffect(() => { loadApprovalLevels(); }, [loadApprovalLevels]);

  useEffect(() => {
    if (!canApprove || isEmployee) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await listEmployees({ limit: 500, page: 1 });
        const list = res.records || res.employees || [];
        if (!cancelled && Array.isArray(list)) {
          setEmployeeOptions(list.map((e) => ({
            id: e.id, label: `${e.full_name || e.name || 'Employee'} (#${e.id})`,
          })));
        }
      } catch { if (!cancelled) setEmployeeOptions([]); }
    })();
    return () => { cancelled = true; };
  }, [canApprove, isEmployee]);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'receiptFile') {
      setFormData((prev) => ({ ...prev, receiptFile: files?.[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openNewClaim = () => {
    setEditingId(null);
    setFormData({ ...initialFormData, employeeId: isEmployee ? String(user?.employeeId ?? '') : '' });
    setModalOpen(true);
  };

  const openNewCategory = () => { setCategoryFormData(initialCategoryFormData); setCategoryModalOpen(true); };

  const openEditCategory = (category) => {
    setCategoryFormData({ id: category.id, name: category.name, description: category.description || '', isActive: category.isActive !== false });
    setCategoryModalOpen(true);
  };

  const openEditDraft = (row) => {
    const st = String(row.status);
    if (!isEmployee && !canConfigure) return;
    if (isEmployee && !['Draft', 'Rejected', 'Declined'].includes(st)) return;
    setEditingId(row.id);
    setFormData({
      claimTitle: row.claim_title || '',
      category: row.category || '',
      date: row.submitted || '',
      amount: String(row.amount ?? ''),
      vatAmount: '',
      currency: row.currency || 'AED',
      paymentMethod: row.payment_method || '',
      description: row.description || '',
      employeeId: String(row.empId ?? ''),
      receiptFile: null,
    });
    setModalOpen(true);
  };

  const buildFormData = (isDraft) => {
    const fd = new FormData();
    fd.append('claimTitle', formData.claimTitle);
    fd.append('expenseCategory', formData.category);
    fd.append('expenseDate', formData.date);
    fd.append('amount', formData.amount);
    if (formData.vatAmount) fd.append('vatAmount', formData.vatAmount);
    fd.append('currency', formData.currency);
    if (formData.paymentMethod) fd.append('paymentMethod', formData.paymentMethod);
    if (formData.description) fd.append('description', formData.description);
    fd.append('isDraft', isDraft ? 'true' : 'false');
    fd.append('submitNow', isDraft ? 'false' : 'true');
    if (!editingId) {
      const eid = isEmployee ? String(user?.employeeId ?? '') : formData.employeeId;
      fd.append('employeeId', eid);
    }
    if (formData.receiptFile) fd.append('receipt', formData.receiptFile);
    return fd;
  };

  const handleSaveClaim = async (isDraft) => {
    if (!formData.claimTitle?.trim() || !formData.category || !formData.date || !formData.amount) {
      toast.error('Please fill title, category, date, and amount.');
      return;
    }
    if (!isEmployee && !editingId && !formData.employeeId?.trim()) {
      toast.error('Select an employee.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await expenseService.updateExpense(editingId, buildFormData(isDraft));
      } else {
        await expenseService.createExpense(buildFormData(isDraft));
      }
      toast.success(isDraft ? 'Draft saved.' : 'Claim submitted for approval.');
      setModalOpen(false);
      setEditingId(null);
      await loadClaims();
      await loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name?.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (categoryFormData.id) {
        await expenseCategoryService.updateExpenseCategory(categoryFormData.id, {
          name: categoryFormData.name.trim(), description: categoryFormData.description, isActive: categoryFormData.isActive,
        });
        toast.success('Category updated successfully');
      } else {
        await expenseCategoryService.createExpenseCategory({ name: categoryFormData.name.trim(), description: categoryFormData.description });
        toast.success('Category created successfully');
      }
      setCategoryModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally { setSaving(false); }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Delete "${categoryName}"?`)) return;
    try {
      await expenseCategoryService.deleteExpenseCategory(categoryId);
      toast.success('Category deleted');
      await loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  const openReview = async (row) => {
    setSelectedClaim(row);
    setClaimApprovals([]);
    setReviewModalOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await expenseService.getExpense(row.id);
      setClaimApprovals(Array.isArray(detail?.approvals) ? detail.approvals : []);
    } catch { setClaimApprovals([]); }
    finally { setLoadingDetail(false); }
  };

  const refreshReview = async (id) => {
    try {
      const detail = await expenseService.getExpense(id);
      setClaimApprovals(Array.isArray(detail?.approvals) ? detail.approvals : []);
      setSelectedClaim((prev) =>
        prev && prev.id === id
          ? { ...prev, status: detail.status, rejection_reason: detail.rejection_reason ?? prev.rejection_reason }
          : prev,
      );
    } catch { /* non-fatal */ }
  };

  const handleApprove = async () => {
    if (!selectedClaim?.id) return;
    try {
      const res = await expenseService.updateExpenseStatus(selectedClaim.id, { status: 'Approved' });
      toast.success(res?.status === 'Pending' ? 'Level approved — awaiting next approver.' : 'Claim approved.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const handleReject = async () => {
    if (!selectedClaim?.id) return;
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    try {
      await expenseService.updateExpenseStatus(selectedClaim.id, { status: 'Rejected', rejectionReason: reason || undefined });
      toast.success('Claim rejected.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  // EXP-05: send-back to Draft with comment
  const handleSendBack = async () => {
    if (!selectedClaim?.id) return;
    const comment = window.prompt('Comment for employee (required):');
    if (!comment?.trim()) { toast.error('Please enter a comment.'); return; }
    try {
      await expenseService.updateExpenseStatus(selectedClaim.id, { status: 'Draft', rejectionReason: comment.trim() });
      toast.success('Claim sent back to employee for correction.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  // EXP-19: mark paid with reference
  const handleMarkPaid = async () => {
    if (!selectedClaim?.id) return;
    setPaidForm({ reference: '', date: '', status: 'Paid' });
    setPaidModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!selectedClaim?.id) return;
    try {
      await expenseService.updateExpenseStatus(selectedClaim.id, {
        status: paidForm.status,
        paymentReference: paidForm.reference || undefined,
        paymentDate: paidForm.date || undefined,
      });
      toast.success('Marked as paid.');
      setPaidModalOpen(false);
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  // Import handlers (EXP-30)
  const openImportModal = () => { setImportFile(null); setImportResult(null); setImportModalOpen(true); };

  const handleImport = async () => {
    if (!importFile) { toast.error('Please select an Excel file first.'); return; }
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', importFile);
      const result = await expenseService.importExpenses(fd);
      setImportResult(result);
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} claim(s) as drafts.`);
        await loadClaims();
        await loadStats();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
    finally { setImporting(false); }
  };

  // Approval level config handlers (EXP-02)
  const updateApprovalLevel = (idx, field, value) => {
    setApprovalLevels((prev) => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };
  const addApprovalLevel = () => {
    const maxLevel = approvalLevels.reduce((m, l) => Math.max(m, l.level_no || 0), 0);
    setApprovalLevels((prev) => [...prev, { level_no: maxLevel + 1, name: '', min_amount: 0, is_active: true }]);
  };
  const removeApprovalLevel = (idx) => setApprovalLevels((prev) => prev.filter((_, i) => i !== idx));

  const handleSaveApprovalLevels = async () => {
    const payload = approvalLevels.map((l) => ({ levelNo: l.level_no, name: l.name, minAmount: l.min_amount, isActive: l.is_active }));
    setApprovalLevelsSaving(true);
    try {
      const saved = await expenseService.setApprovalLevels(payload);
      setApprovalLevels(saved.map((l) => ({ level_no: l.level_no, name: l.name, min_amount: parseFloat(l.min_amount) || 0, is_active: l.is_active !== false })));
      toast.success('Approval levels saved.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setApprovalLevelsSaving(false); }
  };

  const categoryColumns = [
    {
      key: 'name', label: 'Category Name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiTag className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    { key: 'description', label: 'Description', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
    {
      key: 'isActive', label: 'Status',
      render: (v) => (
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${v ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${v ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {v ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt', label: 'Created',
      render: (v) => <span className="text-sm text-slate-600">{v ? new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => openEditCategory(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600" aria-label="Edit">
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => handleDeleteCategory(row.id, row.name)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600" aria-label="Delete">
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const claimsColumns = [
    {
      key: 'employee', label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] text-sm font-bold shadow-sm">
            {(row.employee || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.employee}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">ID: {row.empId ?? '—'}</div>
          </div>
        </div>
      ),
    },
    { key: 'claim_title', label: 'Title', render: (_, row) => <span className="text-sm font-medium text-slate-800">{row.claim_title || '—'}</span> },
    { key: 'category', label: 'Category', render: (v) => <span className="text-sm text-slate-600">{v}</span> },
    { key: 'department', label: 'Department', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (_, row) => <span className="font-bold text-slate-900">{fmt(row.amount, { from: row.currency })}</span> },
    { key: 'submitted', label: 'Date', render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge label={v} color={statusBadgeColor(v)} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button type="button" onClick={() => openReview(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50" aria-label="View">
            <HiEye className="h-4 w-4" />
          </button>
          {['Draft', 'Rejected', 'Declined'].includes(String(row.status)) && (isEmployee || canConfigure) && (
            <button type="button" onClick={() => openEditDraft(row)} className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600" aria-label="Edit">
              <HiPencilSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statCards = [
    { label: 'TOTAL',    count: stats.total,    amount: stats.totalAmount,    icon: HiReceiptPercent, bgColor: 'bg-[#0F172A]',  key: 'All'      },
    { label: 'DRAFTS',   count: stats.drafts,                                  icon: HiInboxStack,     bgColor: 'bg-slate-600',  key: 'Draft'    },
    { label: 'PENDING',  count: stats.pending,  amount: stats.pendingAmount,  icon: HiClock,          bgColor: 'bg-[#F59E0B]',  key: 'Pending'  },
    { label: 'APPROVED', count: stats.approved, amount: stats.approvedAmount, icon: HiCheckBadge,     bgColor: 'bg-[#10B981]',  key: 'Approved' },
    { label: 'REJECTED', count: stats.declined,                                icon: HiXCircle,        bgColor: 'bg-[#EF4444]',  key: 'Rejected' },
    { label: 'PAID',     count: stats.paid,     amount: stats.paidAmount,     icon: HiBanknotes,      bgColor: 'bg-[#059669]',  key: 'Paid'     },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">
            {isEmployee ? 'My Expenses' : 'Expense Management'}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">
              {viewMode === 'claims' ? (isEmployee ? 'My claims' : 'Disbursement registry') : viewMode === 'categories' ? 'Expense Categories' : 'Approval Config'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex rounded-none border border-slate-200 bg-white p-1">
            {[
              { key: 'claims', icon: HiReceiptPercent, label: 'Claims' },
              ...(canConfigure ? [{ key: 'categories', icon: HiTableCells, label: 'Categories' }, { key: 'config', icon: HiAdjustmentsHorizontal, label: 'Approval' }] : []),
            ].map(({ key, icon: Icon, label }) => (
              <button key={key} type="button" onClick={() => setViewMode(key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${viewMode === key ? 'bg-[#0F766E] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          {viewMode === 'claims' && (
            <div className="flex items-center gap-2">
              {canConfigure && (
                <>
                  <button type="button" onClick={() => expenseService.exportExpenses()} title="Export to Excel"
                    className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                    <HiArrowDownTray className="h-4 w-4" /> Export
                  </button>
                  <button type="button" onClick={openImportModal}
                    className="inline-flex items-center justify-center gap-2 rounded-none border border-[#0F766E] bg-white px-3 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition-colors hover:bg-emerald-50">
                    <HiArrowUpTray className="h-4 w-4" /> Import
                  </button>
                </>
              )}
              <button type="button" onClick={openNewClaim}
                className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]">
                <HiPlus className="h-4 w-4" /> New claim
              </button>
            </div>
          )}

          {viewMode === 'categories' && canConfigure && (
            <button type="button" onClick={openNewCategory}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]">
              <HiPlus className="h-4 w-4" /> New Category
            </button>
          )}
        </div>
      </div>

      {/* Claims view */}
      {viewMode === 'claims' && (
        <>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => {
              const isActiveFilter = activeStatus === card.key;
              return (
                <button key={card.key} type="button" onClick={() => setActiveStatus(card.key)} title={`Filter by ${card.label}`}
                  className={`group flex min-w-0 items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] shadow-sm ${isActiveFilter ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>{card.label}</div>
                    <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                    {card.amount != null && (
                      <div className="mt-1 text-[11px] font-bold text-slate-400 truncate leading-none">{fmt(card.amount)}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Claims Listing</h2>
              <HiDocumentArrowDown className="h-4 w-4 shrink-0 text-white/70" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                <div className="relative min-w-[240px] flex-1 max-w-xs">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search employee name..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
                </div>
                <div className="relative min-w-[180px]">
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium appearance-none pr-8">
                    <option value="">All Categories</option>
                    {expenseCategories.map((c) => <option key={c.id ?? c.name} value={String(c.id ?? '')}>{c.name}</option>)}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs font-medium text-slate-500">{claims.length} records shown</p>
                {(q || categoryFilter || activeStatus !== 'All') ? (
                  <button type="button" onClick={() => { setQ(''); setCategoryFilter(''); setActiveStatus('All'); }}
                    className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50">
                    Reset Filters
                  </button>
                ) : (
                  <button type="button" onClick={() => { loadClaims(); loadStats(); }}
                    className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50">
                    Refresh
                  </button>
                )}
              </div>
            </div>
            <Table columns={claimsColumns} data={claims} pageSize={10} loading={loading} square />
          </div>
        </>
      )}

      {/* Categories view */}
      {viewMode === 'categories' && canConfigure && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Expense Categories</h2>
            <HiTag className="h-4 w-4 shrink-0 text-white/70" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="text" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} placeholder="Search category, description..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium" />
            </div>
            <p className="text-xs font-medium text-slate-500">{filteredCategories.length} records</p>
          </div>
          <Table columns={categoryColumns} data={filteredCategories} pageSize={10} loading={categoryLoading} square />
        </div>
      )}

      {/* Approval config view */}
      {viewMode === 'config' && canConfigure && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Approval Level Configuration</h2>
            <HiAdjustmentsHorizontal className="h-4 w-4 shrink-0 text-white/70" />
          </div>
          <div className="p-5">
            <p className="mb-5 text-xs text-slate-500">Configure multi-level approval routing. Levels are applied in order. Leave empty for single-step approval.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-4 text-left">Level #</th>
                    <th className="py-2 pr-4 text-left">Name</th>
                    <th className="py-2 pr-4 text-left">Min Amount (0 = all)</th>
                    <th className="py-2 pr-4 text-center">Active</th>
                    <th className="py-2 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {approvalLevels.map((lvl, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2 pr-4"><input type="number" min="1" value={lvl.level_no} onChange={(e) => updateApprovalLevel(idx, 'level_no', parseInt(e.target.value, 10) || 1)} className="h-9 w-16 rounded-none border border-slate-200 px-2 text-sm focus:border-[#0F766E] focus:outline-none" /></td>
                      <td className="py-2 pr-4"><input type="text" value={lvl.name} onChange={(e) => updateApprovalLevel(idx, 'name', e.target.value)} placeholder="e.g. Manager Review" className="h-9 w-full min-w-[160px] rounded-none border border-slate-200 px-2 text-sm focus:border-[#0F766E] focus:outline-none" /></td>
                      <td className="py-2 pr-4"><input type="number" min="0" step="0.01" value={lvl.min_amount} onChange={(e) => updateApprovalLevel(idx, 'min_amount', parseFloat(e.target.value) || 0)} className="h-9 w-32 rounded-none border border-slate-200 px-2 text-sm focus:border-[#0F766E] focus:outline-none" /></td>
                      <td className="py-2 pr-4 text-center"><input type="checkbox" checked={lvl.is_active !== false} onChange={(e) => updateApprovalLevel(idx, 'is_active', e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#0F766E]" /></td>
                      <td className="py-2 text-center"><button type="button" onClick={() => removeApprovalLevel(idx)} className="inline-flex h-7 w-7 items-center justify-center text-red-400 hover:text-red-600"><HiTrash className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                  {approvalLevels.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-sm text-slate-400">No levels configured — single-step approval.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <button type="button" onClick={addApprovalLevel} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:underline"><HiPlus className="h-4 w-4" /> Add level</button>
              <button type="button" onClick={handleSaveApprovalLevels} disabled={approvalLevelsSaving} className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50">
                {approvalLevelsSaving ? 'Saving…' : 'Save configuration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category CRUD Modal */}
      <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} size="md">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{categoryFormData.id ? 'Edit Category' : 'New Expense Category'}</h3>
            <p className="mt-1 text-xs text-slate-500">Create or edit expense categories for claims</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Category Name *</label>
            <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:outline-none" placeholder="e.g., Travel, Meals" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea name="description" value={categoryFormData.description} onChange={handleCategoryFormChange} rows={3} className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none" placeholder="Optional" />
          </div>
          {categoryFormData.id && (
            <div className="flex items-center gap-3">
              <input type="checkbox" name="isActive" id="isActive" checked={categoryFormData.isActive} onChange={handleCategoryFormChange} className="h-4 w-4 rounded border-slate-300" />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active (visible to employees)</label>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setCategoryModalOpen(false)} className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleSaveCategory} disabled={saving} className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50">
              {saving ? 'Saving...' : categoryFormData.id ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Claim review modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Claim details" size="xl">
        {selectedClaim && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-none bg-slate-900 text-white"><HiCurrencyDollar className="h-7 w-7" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedClaim.claim_title}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#0F766E]">{selectedClaim.employee} · {selectedClaim.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Amount</p>
                  <p className="mt-1 text-lg font-black text-[#0F766E]">{fmt(selectedClaim.amount, { from: selectedClaim.currency })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Expense date</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedClaim.submitted}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Payment</p>
                  <p className="mt-1 font-semibold text-slate-800">{selectedClaim.payment_method || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className="mt-1"><Badge label={selectedClaim.status} color={statusBadgeColor(selectedClaim.status)} /></p>
                </div>
              </div>
              {selectedClaim.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Purpose</p>
                  <p className="mt-2 rounded-none border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{selectedClaim.description}</p>
                </div>
              )}
              {selectedClaim.rejection_reason && (
                <div className="rounded-none border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <strong>{String(selectedClaim.status) === 'Draft' ? 'Send-back comment:' : 'Rejection reason:'}</strong> {selectedClaim.rejection_reason}
                </div>
              )}
              {(loadingDetail || claimApprovals.length > 0) && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Approval progress</p>
                  {loadingDetail ? <p className="mt-2 text-sm text-slate-400">Loading…</p> : (
                    <ol className="mt-2 space-y-2">
                      {claimApprovals.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 rounded-none border border-slate-200 bg-slate-50 p-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">{a.level}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{a.level_name || `Level ${a.level}`}</p>
                            {a.approver_name && <p className="text-[11px] text-slate-500">by {a.approver_name}{a.actioned_at ? ` · ${new Date(a.actioned_at).toLocaleDateString()}` : ''}</p>}
                            {a.comments && <p className="mt-1 text-[11px] italic text-slate-600">"{a.comments}"</p>}
                          </div>
                          <Badge label={a.status} color={statusBadgeColor(a.status)} />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
              {canApprove && selectedClaim.status === 'Pending' && (
                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <button type="button" onClick={handleReject} className="h-10 flex-1 rounded-none border border-red-200 text-xs font-bold uppercase text-red-600 hover:bg-red-50 sm:min-w-[100px]">Reject</button>
                  <button type="button" onClick={handleSendBack} className="h-10 flex-1 rounded-none border border-amber-200 text-xs font-bold uppercase text-amber-700 hover:bg-amber-50 sm:min-w-[100px]" title="Send back to employee for correction">
                    <HiArrowUturnLeft className="mr-1 inline h-3.5 w-3.5" />Send Back
                  </button>
                  <button type="button" onClick={handleApprove} className="h-10 flex-1 rounded-none bg-[#0F766E] text-xs font-bold uppercase text-white hover:bg-[#0c6b64] sm:min-w-[100px]">Approve</button>
                </div>
              )}
              {canApprove && selectedClaim.status === 'Approved' && (
                <button type="button" onClick={handleMarkPaid} className="h-10 w-full rounded-none bg-emerald-600 text-xs font-bold uppercase text-white hover:bg-emerald-700">
                  Mark Paid / Reimbursed
                </button>
              )}
            </div>
            <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                Receipt <HiPaperClip className="h-4 w-4" />
              </h3>
              {selectedClaim.receipt_url ? (
                <a href={receiptHref(selectedClaim.receipt_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline">
                  <HiDocumentArrowDown className="h-4 w-4" /> Download / view
                </a>
              ) : (
                <p className="text-sm text-slate-500">No receipt uploaded.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Mark Paid modal (EXP-19) */}
      <Modal isOpen={paidModalOpen} onClose={() => setPaidModalOpen(false)} size="sm">
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-slate-900">Mark as Paid / Reimbursed</h3>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Reimbursement Status</label>
            <select value={paidForm.status} onChange={(e) => setPaidForm((p) => ({ ...p, status: e.target.value }))} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:outline-none">
              <option value="Paid">Paid</option>
              <option value="Reimbursed">Reimbursed</option>
              <option value="Processed">Processed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Payment Reference</label>
            <input type="text" value={paidForm.reference} onChange={(e) => setPaidForm((p) => ({ ...p, reference: e.target.value }))} placeholder="e.g. TRF-20260601-001" className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Payment Date</label>
            <input type="date" value={paidForm.date} onChange={(e) => setPaidForm((p) => ({ ...p, date: e.target.value }))} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setPaidModalOpen(false)} className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={handleConfirmPaid} className="h-10 rounded-none bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700">Confirm</button>
          </div>
        </div>
      </Modal>

      {/* Excel Import Modal (EXP-30) */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} size="md">
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Import Expenses from Excel</h3>
            <p className="mt-1 text-xs text-slate-500">Upload a <strong>.xlsx</strong> file. Claims are imported as <strong>Drafts</strong> — employees review and submit for approval.</p>
          </div>
          <div className="flex items-center gap-3 rounded-none border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <HiArrowDownTray className="h-5 w-5 shrink-0 text-[#0F766E]" />
            <div className="flex-1 text-xs text-slate-600">Download the template to see required columns and a sample row.</div>
            <button type="button" onClick={() => expenseService.downloadImportTemplate()} className="shrink-0 text-xs font-bold text-[#0F766E] hover:underline">Download template</button>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Select Excel file *</label>
            <input type="file" accept=".xlsx,.xls" onChange={(e) => { setImportFile(e.target.files?.[0] || null); setImportResult(null); }}
              className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-none file:border-0 file:bg-[#0F766E] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white" />
          </div>
          {importResult && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-none border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                <HiCheckCircle className="h-4 w-4 shrink-0" />
                <span><strong>{importResult.imported}</strong> claim(s) imported.{importResult.skipped > 0 && <span className="ml-1 text-amber-700"><strong>{importResult.skipped}</strong> skipped.</span>}</span>
              </div>
              {importResult.errors?.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-none border border-red-200 bg-red-50 p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-red-700"><HiExclamationTriangle className="h-3.5 w-3.5" /> Skipped rows</p>
                  <ul className="space-y-1">
                    {importResult.errors.map((e, i) => (
                      <li key={i} className="text-[11px] text-red-700"><span className="font-semibold">Row {e.row}:</span> {Array.isArray(e.reasons) ? e.reasons.join(', ') : e.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => setImportModalOpen(false)} className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">{importResult ? 'Close' : 'Cancel'}</button>
            {!importResult && (
              <button type="button" onClick={handleImport} disabled={importing || !importFile} className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50">
                {importing ? 'Importing…' : 'Import'}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* New / Edit claim modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); }} size="lg"
        header={<div className="pr-8"><h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit expense' : 'New expense claim'}</h2><p className="text-xs font-medium text-slate-500">Save a draft or submit for approval. Attach a receipt when possible.</p></div>}>
        <div className="space-y-6">
          {!isEmployee && !editingId && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Employee</label>
              <select name="employeeId" value={formData.employeeId} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 bg-white px-3 text-sm" required>
                <option value="">Select employee</option>
                {employeeOptions.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Title</label>
            <input name="claimTitle" value={formData.claimTitle} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm" placeholder="e.g. Client meeting transport" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Category</label>
              <select name="category" value={formData.category} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm" required>
                <option value="">Select</option>
                {expenseCategories.map((c) => <option key={c.id ?? c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Expense date</label>
              <input type="date" name="date" value={formData.date} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Amount</label>
              <input type="number" name="amount" step="0.01" min="0" value={formData.amount} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">VAT Amount (optional)</label>
              <input type="number" name="vatAmount" step="0.01" min="0" value={formData.vatAmount} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm" placeholder="e.g. 12.50" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Payment method</label>
              <select name="paymentMethod" value={formData.paymentMethod} onChange={handleFormChange} className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm">
                <option value="">Select</option>
                {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Business purpose</label>
            <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Receipt{editingId ? ' (leave empty to keep existing)' : ''}
            </label>
            <input type="file" name="receiptFile" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFormChange} className="w-full text-sm" />
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={saving} onClick={() => handleSaveClaim(true)} className="h-10 rounded-none border border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50">Save draft</button>
            <button type="button" disabled={saving} onClick={() => handleSaveClaim(false)} className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50">Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

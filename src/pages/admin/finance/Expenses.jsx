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

const CURRENCIES = ['INR', 'AED', 'USD', 'EUR', 'GBP'];

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
    currency: row.currency || 'INR',
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
  currency: 'INR',
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
    isActive: row.is_active !== false,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default function Expenses() {
  const { user } = useAuth();
  const { format: fmt } = useCurrency();
  const [viewMode, setViewMode] = useState('claims'); // 'claims' or 'categories'
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
    total: 0,
    drafts: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    paid: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const filteredCategories = expenseCategories.filter(
    (cat) =>
      !categorySearch.trim() ||
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  const isEmployee = user?.role === 'employee';
  const canConfigure =
    user?.role === 'admin' ||
    user?.role === 'hr_admin' ||
    user?.role === 'hr_executive' ||
    user?.role === 'superadmin';
  const canApprove =
    canConfigure || user?.role === 'manager';

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
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadClaims = useCallback(async () => {
    if (viewMode !== 'claims') return;
    setLoading(true);
    try {
      const params = { limit: 100, page: 1 };
      if (debouncedQ) params.search = debouncedQ;
      if (activeStatus !== 'All') params.expenseType = activeStatus;
      const { rows } = await expenseService.listExpenses(params);
      let list = rows.map(mapRow);
      if (categoryFilter) {
        list = list.filter((r) => r.category === categoryFilter);
      }
      setClaims(list);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load expenses');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, activeStatus, categoryFilter, viewMode]);

  useEffect(() => {
    if (viewMode === 'claims') {
      loadStats();
      loadClaims();
    }
  }, [loadStats, loadClaims, viewMode]);

  const loadCategories = useCallback(async () => {
    const forAdminList = viewMode === 'categories';
    if (forAdminList) setCategoryLoading(true);
    try {
      const rows = await expenseCategoryService.listExpenseCategories({
        activeOnly: forAdminList ? false : true,
      });
      const mapped = (Array.isArray(rows) ? rows : []).map(mapCategoryRow);
      setExpenseCategories(mapped);
    } catch (err) {
      console.error(err);
      if (forAdminList) {
        toast.error(err.response?.data?.message || 'Failed to load expense categories');
      }
      setExpenseCategories([]);
    } finally {
      if (forAdminList) setCategoryLoading(false);
    }
  }, [viewMode]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!canApprove || isEmployee) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await listEmployees({ limit: 500, page: 1 });
        const list = res.records || res.employees || [];
        if (!cancelled && Array.isArray(list)) {
          setEmployeeOptions(
            list.map((e) => ({
              id: e.id,
              label: `${e.full_name || e.name || 'Employee'} (#${e.id})`,
            })),
          );
        }
      } catch {
        if (!cancelled) setEmployeeOptions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
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
    setCategoryFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openNewClaim = () => {
    setEditingId(null);
    setFormData({
      ...initialFormData,
      employeeId: isEmployee ? String(user?.employeeId ?? '') : '',
    });
    setModalOpen(true);
  };

  const openNewCategory = () => {
    setCategoryFormData(initialCategoryFormData);
    setCategoryModalOpen(true);
  };

  const openEditCategory = (category) => {
    setCategoryFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      isActive: category.isActive !== false,
    });
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
      currency: row.currency || 'INR',
      paymentMethod: row.payment_method || '',
      description: row.description || '',
      employeeId: String(row.empId ?? ''),
      receiptFile: null,
    });
    setModalOpen(true);
  };

  const buildCreateFormData = (isDraft) => {
    const fd = new FormData();
    fd.append('claimTitle', formData.claimTitle);
    fd.append('expenseCategory', formData.category);
    fd.append('expenseDate', formData.date);
    fd.append('amount', formData.amount);
    fd.append('currency', formData.currency);
    if (formData.paymentMethod) fd.append('paymentMethod', formData.paymentMethod);
    if (formData.description) fd.append('description', formData.description);
    fd.append('isDraft', isDraft ? 'true' : 'false');
    const eid = isEmployee ? String(user?.employeeId ?? '') : formData.employeeId;
    fd.append('employeeId', eid);
    if (formData.receiptFile) fd.append('receipt', formData.receiptFile);
    return fd;
  };

  const handleSaveClaim = async (isDraft) => {
    if (!formData.claimTitle?.trim() || !formData.category || !formData.date || !formData.amount) {
      toast.error('Please fill title, category, date, and amount.');
      return;
    }
    if (!isEmployee && !formData.employeeId?.trim()) {
      toast.error('Select an employee.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await expenseService.updateExpense(editingId, {
          claimTitle: formData.claimTitle,
          expenseCategory: formData.category,
          expenseDate: formData.date,
          amount: formData.amount,
          currency: formData.currency,
          paymentMethod: formData.paymentMethod || null,
          description: formData.description || null,
          isDraft: isDraft,
          submitNow: !isDraft,
        });
        toast.success(isDraft ? 'Draft saved.' : 'Claim submitted for approval.');
      } else {
        await expenseService.createExpense(buildCreateFormData(isDraft));
        toast.success(isDraft ? 'Draft saved.' : 'Claim submitted for approval.');
      }
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
    if (!categoryFormData.name?.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSaving(true);
    try {
      if (categoryFormData.id) {
        await expenseCategoryService.updateExpenseCategory(categoryFormData.id, {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description,
          isActive: categoryFormData.isActive,
        });
        toast.success('Category updated successfully');
      } else {
        await expenseCategoryService.createExpenseCategory({
          name: categoryFormData.name.trim(),
          description: categoryFormData.description,
        });
        toast.success('Category created successfully');
      }
      setCategoryModalOpen(false);
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    try {
      await expenseCategoryService.deleteExpenseCategory(categoryId);
      toast.success('Category deleted successfully');
      await loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Open the review modal and load full detail (incl. the approval timeline).
  const openReview = async (row) => {
    setSelectedClaim(row);
    setClaimApprovals([]);
    setReviewModalOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await expenseService.getExpense(row.id);
      setClaimApprovals(Array.isArray(detail?.approvals) ? detail.approvals : []);
    } catch {
      setClaimApprovals([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Re-fetch detail after an action so the timeline + status update in place.
  const refreshReview = async (id) => {
    try {
      const detail = await expenseService.getExpense(id);
      setClaimApprovals(Array.isArray(detail?.approvals) ? detail.approvals : []);
      setSelectedClaim((prev) =>
        prev && prev.id === id
          ? { ...prev, status: detail.status, rejection_reason: detail.rejection_reason ?? prev.rejection_reason }
          : prev,
      );
    } catch {
      /* non-fatal */
    }
  };

  const handleApprove = async () => {
    if (!selectedClaim?.id) return;
    try {
      const res = await expenseService.updateExpenseStatus(selectedClaim.id, { status: 'Approved' });
      // Multi-level: the claim stays Pending until the final level signs off.
      toast.success(res?.status === 'Pending' ? 'Level approved — awaiting next approver.' : 'Claim approved.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleReject = async () => {
    if (!selectedClaim?.id) return;
    const reason = window.prompt('Rejection reason (optional):') ?? '';
    try {
      await expenseService.updateExpenseStatus(selectedClaim.id, {
        status: 'Rejected',
        rejectionReason: reason || undefined,
      });
      toast.success('Claim rejected.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedClaim?.id) return;
    try {
      await expenseService.updateExpenseStatus(selectedClaim.id, { status: 'Paid' });
      toast.success('Marked as paid.');
      await refreshReview(selectedClaim.id);
      await loadClaims();
      await loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const categoryColumns = [
    {
      key: 'name',
      label: 'Category Name',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiTag className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => {
        const isActive = Boolean(v);
        return (
          <div className="flex items-center justify-center">
            <span
              className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[10px] font-semibold ${
                isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => (
        <span className="text-sm text-slate-600">
          {v ? new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openEditCategory(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
            aria-label="Edit category"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCategory(row.id, row.name)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete category"
          >
            <HiTrash className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const claimsColumns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] text-sm font-bold shadow-sm">
            {(row.employee || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.employee}</div>
            <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              ID: {row.empId ?? '—'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'claim_title',
      label: 'Title',
      render: (_, row) => (
        <span className="text-sm font-medium text-slate-800">{row.claim_title || '—'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v) => <span className="text-sm text-slate-600">{v}</span>,
    },
    {
      key: 'department',
      label: 'Department',
      render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (_, row) => (
        <span className="font-bold text-slate-900">
          {fmt(row.amount, { from: row.currency })}
        </span>
      ),
    },
    {
      key: 'submitted',
      label: 'Date',
      render: (v) => <span className="text-sm text-slate-600">{v || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} color={statusBadgeColor(v)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openReview(row)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
            aria-label="View"
          >
            <HiEye className="h-4 w-4" />
          </button>
          {(['Draft', 'Rejected', 'Declined'].includes(String(row.status)) &&
            (isEmployee || canConfigure)) && (
            <button
              type="button"
              onClick={() => openEditDraft(row)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-sky-500 text-white transition-colors hover:bg-sky-600"
              aria-label="Edit"
            >
              <HiPencilSquare className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statCards = [
    { label: 'TOTAL', count: stats.total, amount: stats.totalAmount, icon: HiReceiptPercent, bgColor: 'bg-[#0F172A]', key: 'All' },
    { label: 'DRAFTS', count: stats.drafts, icon: HiInboxStack, bgColor: 'bg-slate-600', key: 'Draft' },
    { label: 'PENDING', count: stats.pending, amount: stats.pendingAmount, icon: HiClock, bgColor: 'bg-[#F59E0B]', key: 'Pending' },
    { label: 'APPROVED', count: stats.approved, amount: stats.approvedAmount, icon: HiCheckBadge, bgColor: 'bg-[#10B981]', key: 'Approved' },
    { label: 'REJECTED', count: stats.declined, icon: HiXCircle, bgColor: 'bg-[#EF4444]', key: 'Rejected' },
    { label: 'PAID', count: stats.paid, amount: stats.paidAmount, icon: HiBanknotes, bgColor: 'bg-[#059669]', key: 'Paid' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">
            {isEmployee ? 'My Expenses' : 'Expense Management'}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Finance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">
              {viewMode === 'claims' 
                ? (isEmployee ? 'My claims' : 'Disbursement registry')
                : 'Expense Categories'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View Toggle Buttons */}
          <div className="flex rounded-none border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('claims')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                viewMode === 'claims'
                  ? 'bg-[#0F766E] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HiReceiptPercent className="h-4 w-4" />
              Claims
            </button>
            {canConfigure && (
              <button
                type="button"
                onClick={() => setViewMode('categories')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'categories'
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HiTableCells className="h-4 w-4" />
                Categories
              </button>
            )}
          </div>


          {viewMode === 'claims' && (
            <button
              type="button"
              onClick={openNewClaim}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]"
            >
              <HiPlus className="h-4 w-4" /> New claim
            </button>
          )}

          {viewMode === 'categories' && canConfigure && (
            <button
              type="button"
              onClick={openNewCategory}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b64]"
            >
              <HiPlus className="h-4 w-4" /> New Category
            </button>
          )}
        </div>
      </div>

      {viewMode === 'claims' && (
        <>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => {
              const isActiveFilter = activeStatus === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveStatus(card.key)}
                  title={`Filter by ${card.label}`}
                  className={`group flex min-w-0 items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] shadow-sm ${
                    isActiveFilter
                      ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                      {card.label}
                    </div>
                    <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">
                      {card.count}
                    </div>
                    {card.amount != null && (
                      <div className="mt-1 text-[11px] font-bold text-slate-400 truncate leading-none">
                        {fmt(card.amount)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
              <h2 className="text-sm font-semibold text-white">Claims Listing</h2>
              <HiDocumentArrowDown className="h-4 w-4 shrink-0 text-white/70" aria-hidden />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                <div className="relative min-w-[240px] flex-1 max-w-xs">
                  <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search employee name..."
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
                  />
                </div>

                <div className="relative min-w-[180px]">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium appearance-none pr-8"
                  >
                    <option value="">All Categories</option>
                    {expenseCategories.map((c) => (
                      <option key={c.id ?? c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs font-medium text-slate-500">{claims.length} records shown</p>
                {q || categoryFilter || activeStatus !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQ('');
                      setCategoryFilter('');
                      setActiveStatus('All');
                    }}
                    className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      loadClaims();
                      loadStats();
                    }}
                    className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>

            <Table columns={claimsColumns} data={claims} pageSize={10} loading={loading} square />
          </div>
        </>
      )}

      {viewMode === 'categories' && canConfigure && (
        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
            <h2 className="text-sm font-semibold text-white">Expense Categories Listing</h2>
            <HiTag className="h-4 w-4 shrink-0 text-white/70" aria-hidden />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Search category, description..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-medium text-slate-500">{filteredCategories.length} records shown</p>
              {categorySearch ? (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
                >
                  Reset Filters
                </button>
              ) : null}
            </div>
          </div>

          <Table columns={categoryColumns} data={filteredCategories} pageSize={10} loading={categoryLoading} square />
        </div>
      )}

      {/* Category CRUD Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {categoryFormData.id ? 'Edit Category' : 'New Expense Category'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Create or edit expense categories for claims
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={categoryFormData.name}
              onChange={handleCategoryFormChange}
              className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm focus:border-[#0F766E] focus:outline-none"
              placeholder="e.g., Travel, Meals, Office Supplies"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Description
            </label>
            <textarea
              name="description"
              value={categoryFormData.description}
              onChange={handleCategoryFormChange}
              rows={3}
              className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm focus:border-[#0F766E] focus:outline-none"
              placeholder="Optional description of this category"
            />
          </div>

          {categoryFormData.id && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={categoryFormData.isActive}
                onChange={handleCategoryFormChange}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Active (visible to employees)
              </label>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setCategoryModalOpen(false)}
              className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCategory}
              disabled={saving}
              className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50"
            >
              {saving ? 'Saving...' : (categoryFormData.id ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Existing Claim Review and Edit Modals remain unchanged */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Claim details"
        size="xl"
      >
        {selectedClaim && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-none bg-slate-900 text-white">
                  <HiCurrencyDollar className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedClaim.claim_title}</h3>
                  <p className="mt-1 text-xs font-semibold text-[#0F766E]">
                    {selectedClaim.employee} · {selectedClaim.category}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Amount</p>
                  <p className="mt-1 text-lg font-black text-[#0F766E]">
                    {fmt(selectedClaim.amount, { from: selectedClaim.currency })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Expense date</p>
                  <p className="mt-1 font-semibold text-slate-900">{selectedClaim.submitted}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Payment</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedClaim.payment_method || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className="mt-1">
                    <Badge
                      label={selectedClaim.status}
                      color={statusBadgeColor(selectedClaim.status)}
                    />
                  </p>
                </div>
              </div>
              {selectedClaim.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Purpose</p>
                  <p className="mt-2 rounded-none border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {selectedClaim.description}
                  </p>
                </div>
              )}
              {selectedClaim.rejection_reason && (
                <div className="rounded-none border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  <strong>Rejection reason:</strong> {selectedClaim.rejection_reason}
                </div>
              )}
              {(loadingDetail || claimApprovals.length > 0) && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Approval progress</p>
                  {loadingDetail ? (
                    <p className="mt-2 text-sm text-slate-400">Loading…</p>
                  ) : (
                    <ol className="mt-2 space-y-2">
                      {claimApprovals.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-3 rounded-none border border-slate-200 bg-slate-50 p-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
                            {a.level}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {a.level_name || `Level ${a.level}`}
                            </p>
                            {a.approver_name && (
                              <p className="text-[11px] text-slate-500">
                                by {a.approver_name}
                                {a.actioned_at
                                  ? ` · ${new Date(a.actioned_at).toLocaleDateString()}`
                                  : ''}
                              </p>
                            )}
                            {a.comments && (
                              <p className="mt-1 text-[11px] italic text-slate-600">“{a.comments}”</p>
                            )}
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
                  <button
                    type="button"
                    onClick={handleReject}
                    className="h-10 flex-1 rounded-none border border-red-200 text-xs font-bold uppercase text-red-600 hover:bg-red-50 sm:min-w-[120px]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="h-10 flex-1 rounded-none bg-[#0F766E] text-xs font-bold uppercase text-white hover:bg-[#0c6b64] sm:min-w-[120px]"
                  >
                    Approve
                  </button>
                </div>
              )}
              {canApprove && selectedClaim.status === 'Approved' && (
                <button
                  type="button"
                  onClick={handleMarkPaid}
                  className="h-10 w-full rounded-none bg-emerald-600 text-xs font-bold uppercase text-white hover:bg-emerald-700"
                >
                  Mark paid
                </button>
              )}
            </div>
            <div className="rounded-none border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-500">
                Receipt
                <HiPaperClip className="h-4 w-4" />
              </h3>
              {selectedClaim.receipt_url ? (
                <a
                  href={receiptHref(selectedClaim.receipt_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:underline"
                >
                  <HiDocumentArrowDown className="h-4 w-4" />
                  Download / view
                </a>
              ) : (
                <p className="text-sm text-slate-500">No receipt uploaded.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        size="lg"
        header={
          <div className="pr-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit expense' : 'New expense claim'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Save a draft or submit for approval. Attach a receipt when possible.
            </p>
          </div>
        }
      >
        <div className="space-y-6">
          {!isEmployee && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Employee</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 bg-white px-3 text-sm"
                required
              >
                <option value="">Select employee</option>
                {employeeOptions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Title</label>
            <input
              name="claimTitle"
              value={formData.claimTitle}
              onChange={handleFormChange}
              className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
              placeholder="e.g. Client meeting transport"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
                required
              >
                <option value="">Select</option>
                {expenseCategories.map((c) => (
                  <option key={c.id ?? c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Expense date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Amount</label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
                Payment method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleFormChange}
                className="h-11 w-full rounded-none border border-slate-200 px-3 text-sm"
              >
                <option value="">Select</option>
                {PAYMENT_METHODS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">
              Business purpose
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full rounded-none border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          {!editingId && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Receipt</label>
              <input
                type="file"
                name="receiptFile"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFormChange}
                className="w-full text-sm"
              />
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
              className="h-10 rounded-none border border-slate-200 px-6 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveClaim(true)}
              className="h-10 rounded-none border border-slate-300 bg-white px-5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveClaim(false)}
              className="h-10 rounded-none bg-[#0F766E] px-6 text-sm font-semibold text-white hover:bg-[#0c6b64] disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
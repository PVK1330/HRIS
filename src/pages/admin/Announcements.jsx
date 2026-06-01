import React, { useState, useMemo, useEffect } from 'react';
import { 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiCheckCircle, 
  HiClock, 
  HiMegaphone,
  HiMagnifyingGlass,
  HiEnvelope,
  HiUsers,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Table } from '../../components/ui/Table.jsx';
import api from '../../services/api.js';
import Swal from 'sweetalert2';
import { listDepartments } from '../../services/departmentService.js';
import { listEmployeesDropdown } from '../../services/employeeService.js';
import toast from 'react-hot-toast';

export default function Announcements() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, scheduled: 0 });
  const [editingId, setEditingId] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    visibility: 'All Employees',
    scheduleDate: '',
    priority: 'Medium',
    dispatch_channels: 'Both'
  });

  const isCanManage = ['admin', 'hr_admin', 'hr_executive'].includes(user?.role);
  const scheduleIsFuture = formData.scheduleDate && new Date(formData.scheduleDate).getTime() > Date.now();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, statRes, deptPayload, empPayload] = await Promise.all([
        api.get('/admin/announcements').catch(() => null),
        api.get('/admin/announcements/stats').catch(() => null),
        listDepartments().catch(() => null),
        listEmployeesDropdown().catch(() => null)
      ]);
      if (annRes?.data?.data) setAnnouncements(annRes.data.data);
      if (statRes?.data?.data) setStats(statRes.data.data);
      
      const depts = deptPayload?.departments || deptPayload?.records || (Array.isArray(deptPayload) ? deptPayload : []);
      setDepartments(depts);
      
      const emps = empPayload?.employees || empPayload?.records || (Array.isArray(empPayload) ? empPayload : []);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => {
    let data = announcements;
    if (activeStatus !== 'All') {
      data = data.filter(a => a.status === activeStatus);
    }
    const query = debouncedQ.trim().toLowerCase();
    if (query) {
      data = data.filter((a) => `${a.title} ${a.category} ${a.posted_by_name}`.toLowerCase().includes(query));
    }
    return data;
  }, [debouncedQ, activeStatus, announcements]);

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      let visibility = announcement.visibility || 'All Employees';
      let selectedEmps = [];
      if (visibility.startsWith('[') && visibility.endsWith(']')) {
        try {
          selectedEmps = JSON.parse(visibility).map((id) => Number(id));
          visibility = 'Selected Employees';
        } catch (e) {}
      }

      setFormData({
        title: announcement.title || '',
        category: announcement.category || 'General',
        content: announcement.content || '',
        visibility: visibility,
        scheduleDate: announcement.schedule_date ? new Date(announcement.schedule_date).toISOString().slice(0, 16) : '',
        priority: announcement.priority || 'Medium',
        dispatch_channels: announcement.dispatch_channels || 'Both'
      });
      setSelectedEmployees(selectedEmps);
    } else {
      setEditingId(null);
      setFormData({ title: '', category: 'General', content: '', visibility: 'All Employees', scheduleDate: '', priority: 'Medium', dispatch_channels: 'Both' });
      setSelectedEmployees([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEmployeeSearch('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isBoth = formData.dispatch_channels === 'Both';
  const isInAppChecked = isBoth || formData.dispatch_channels === 'In App';
  const isEmailChecked = isBoth || formData.dispatch_channels === 'Email';

  const handleDispatchChange = (type, checked) => {
    let nextChannels = 'Both';
    if (type === 'In App') {
      if (checked) {
        nextChannels = isEmailChecked ? 'Both' : 'In App';
      } else {
        nextChannels = isEmailChecked ? 'Email' : 'Both';
      }
    } else {
      if (checked) {
        nextChannels = isInAppChecked ? 'Both' : 'Email';
      } else {
        nextChannels = isInAppChecked ? 'In App' : 'Both';
      }
    }
    setFormData(prev => ({ ...prev, dispatch_channels: nextChannels }));
  };

  const resolveSaveStatus = (intent) => {
    const schedule = formData.scheduleDate ? new Date(formData.scheduleDate) : null;
    const isFuture = schedule && !Number.isNaN(schedule.getTime()) && schedule.getTime() > Date.now();

    if (intent === 'draft') return 'Draft';
    if (intent === 'schedule') {
      if (!formData.scheduleDate) return { error: 'Pick a date and time to schedule this announcement.' };
      if (!isFuture) return { error: 'Scheduled time must be in the future.' };
      return 'Scheduled';
    }
    if (intent === 'publish') {
      if (isFuture) return 'Scheduled';
      return 'Published';
    }
    return 'Draft';
  };

  const handleSave = async (intent) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const statusResult = resolveSaveStatus(intent);
      if (typeof statusResult === 'object' && statusResult.error) {
        Swal.fire({ icon: 'warning', title: 'Schedule required', text: statusResult.error });
        setIsSubmitting(false);
        return;
      }
      const status = statusResult;

      let finalVisibility = formData.visibility;
      if (formData.visibility === 'Selected Employees') {
        if (selectedEmployees.length === 0) {
          Swal.fire({ icon: 'warning', title: 'Selection required', text: 'Please select at least one employee.' });
          setIsSubmitting(false);
          return;
        }
        finalVisibility = JSON.stringify(selectedEmployees.map((id) => Number(id)));
      }

      const payload = {
        ...formData,
        schedule_date: formData.scheduleDate || null,
        status,
        visibility: finalVisibility,
      };

      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        if (status === 'Scheduled') toast.success('Announcement scheduled.');
        else if (status === 'Published') toast.success('Announcement published — notifications sent.');
        else toast.success('Draft saved.');
      } else {
        await api.post('/admin/announcements', payload);
        if (status === 'Scheduled') toast.success('Announcement scheduled.');
        else if (status === 'Published') toast.success('Announcement published — notifications sent.');
        else toast.success('Draft saved.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Permanent data excision cannot be reversed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        container: 'rounded-xl',
        popup: 'rounded-xl',
        confirmButton: 'rounded-xl px-6 py-2  text-xs font-semibold tracking-widest',
        cancelButton: 'rounded-xl px-6 py-2  text-xs font-semibold tracking-widest'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/announcements/${id}`);
        toast.success('Announcement deleted.');
        fetchData();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete announcement.');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Subject',
      render: (v, row) => (
         <div className="flex flex-col gap-0.5 py-1">
            <span className="text-sm font-semibold text-slate-900  tracking-tight leading-tight">{row.title}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-xs font-semibold text-[#0F766E] ">{row.category}</span>
               <span className="text-slate-200">•</span>
               <span className="text-[8px] font-semibold text-slate-400 ">
                  {row.dispatch_channels || 'Both'}
               </span>
            </div>
         </div>
      )
    },
    { key: 'posted_by_name', label: 'Author', render: (v) => <span className="text-sm font-semibold text-slate-600 ">{v || 'System'}</span> },
    { 
      key: 'created_at', 
      label: 'Date', 
      render: (v) => <span className="text-sm font-bold text-slate-500">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: 'visibility',
      label: 'Audience',
      render: (v) => {
         let label = v === 'all' ? 'All Employees' : v.toUpperCase();
         if (v?.startsWith('[')) {
           try {
             const ids = JSON.parse(v);
             label = `${ids.length} Employees`;
           } catch(e) {}
         }
         return (
           <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 ">
              <HiUsers className="h-3.5 w-3.5 opacity-50" />
              <span>{label}</span>
           </div>
         );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => {
         const color = v === 'High' ? 'bg-red-50 text-red-700 border-red-100' : v === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100';
         return (
            <span className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs font-semibold  border ${color}`}>
               {v}
            </span>
         );
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (v, row) => {
         const color = v === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : v === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100';
         return (
            <div className="flex flex-col gap-0.5">
              <span className={`inline-flex w-fit items-center rounded-xl px-2 py-0.5 text-xs font-semibold border ${color}`}>
                 {v}
              </span>
              {row.schedule_date && v === 'Scheduled' && (
                <span className="text-[10px] font-semibold text-slate-400">
                  {new Date(row.schedule_date).toLocaleString()}
                </span>
              )}
            </div>
         );
      }
    },
    ...(isCanManage
      ? [{
          key: 'actions',
          label: 'Actions',
          render: (_, row) => (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenModal(row)}
                className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] transition-all shadow-md"
              >
                <HiPencilSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                className="h-8 w-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 transition-all shadow-md"
              >
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 ">Company Announcements</h1>
          <p className="mt-1 text-sm font-bold text-slate-400 ">Manage corporate announcements and broadcasts.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isCanManage && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-8 text-sm font-semibold  text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
            >
              <HiPlus className="h-4 w-4" /> Create Announcement
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {(isCanManage
          ? [
              { label: 'Total Announcements', count: stats.total || announcements.length || 0, bgColor: 'bg-slate-900', icon: HiMegaphone, onClickFilter: () => setActiveStatus('All') },
              { label: 'Published', count: stats.published || announcements.filter((a) => a.status === 'Published').length || 0, bgColor: 'bg-[#10B981]', icon: HiCheckCircle, onClickFilter: () => setActiveStatus('Published') },
              { label: 'Drafts', count: stats.drafts || announcements.filter((a) => a.status === 'Draft').length || 0, bgColor: 'bg-[#F59E0B]', icon: HiPencilSquare, onClickFilter: () => setActiveStatus('Draft') },
              { label: 'Scheduled', count: stats.scheduled || announcements.filter((a) => a.status === 'Scheduled').length || 0, bgColor: 'bg-[#3B82F6]', icon: HiClock, onClickFilter: () => setActiveStatus('Scheduled') },
            ]
          : [
              { label: 'Published', count: stats.published || announcements.length || 0, bgColor: 'bg-[#10B981]', icon: HiCheckCircle, onClickFilter: () => setActiveStatus('Published') },
            ]
        ).map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'Total Announcements' && activeStatus === 'All') ||
            (card.label === 'Published' && activeStatus === 'Published') ||
            (card.label === 'Drafts' && activeStatus === 'Draft') ||
            (card.label === 'Scheduled' && activeStatus === 'Scheduled');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              className={`group flex items-center gap-4 rounded-xl border p-5 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-md ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bgColor} text-white shadow-md`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-semibold  truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Table Registry */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md min-w-0">
        <div className="flex items-center justify-between bg-[#0F766E] px-5 py-3.5 text-white min-w-0 border-b border-[#0F766E]">
          <h2 className="text-sm font-semibold  tracking-wider truncate">Announcement History</h2>
          <div className="text-sm font-semibold text-white/60  shrink-0">{isCanManage ? 'Security Level: Admin' : 'Company Broadcasts'}</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="relative min-w-[250px] flex-1 max-w-md">
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search subject, category or author..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-500">{filtered.length} records shown</p>
            {q || activeStatus !== 'All' ? (
              <button
                type="button"
                onClick={() => {
                  setQ('');
                  setActiveStatus('All');
                }}
                className="h-10 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        <Table columns={columns} data={filtered} pageSize={8} square className="rounded-xl" />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Announcement Editor"
        description="Create or update a company broadcast"
        size="announcement"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCloseModal}
              className="h-10 px-5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {isCanManage && (
              <>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSave('draft')}
                  className="h-10 px-5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !scheduleIsFuture}
                  onClick={() => handleSave('schedule')}
                  className="h-10 px-5 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-all inline-flex items-center gap-1.5 disabled:opacity-40"
                >
                  <HiClock className="h-4 w-4" />
                  {isSubmitting ? 'Saving…' : 'Schedule'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSave('publish')}
                  className="h-10 px-6 rounded-xl bg-[#0F766E] text-sm font-semibold text-white hover:bg-[#0d5c56] transition-all inline-flex items-center gap-2"
                >
                  <HiEnvelope className="h-4 w-4" />
                  {isSubmitting ? 'Saving…' : scheduleIsFuture ? 'Schedule & Send Later' : 'Publish Now'}
                </button>
              </>
            )}
          </div>
        }
      >
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Announcement title"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">Category</label>
              <select
                name="category"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option>General</option>
                <option>Corporate</option>
                <option>Benefits</option>
                <option>Training</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">Priority</label>
              <select
                name="priority"
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 ml-0.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] outline-none min-h-[120px] resize-y"
              placeholder="Write your announcement message…"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">Target Audience</label>
                <select
                  name="visibility"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                  value={formData.visibility}
                  onChange={handleInputChange}
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Selected Employees">Selected Employees</option>
                  {departments.map((d, i) => (
                    <option key={i} value={d.name || d.department}>
                      {(d.name || d.department).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {formData.visibility === 'Selected Employees' && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">Select employees</p>
                    {selectedEmployees.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEmployees([])}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="mb-2 w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#0F766E] outline-none"
                  />
                  <div className="max-h-36 overflow-y-auto overscroll-contain space-y-1.5 pr-1 custom-scrollbar">
                    {employees
                      .filter((emp) => {
                        const term = employeeSearch.toLowerCase();
                        return `${emp.full_name || emp.first_name || emp.name || ''} ${emp.last_name || ''} ${emp.work_email || emp.email || ''} ${emp.emp_id || ''}`.toLowerCase().includes(term);
                      })
                      .map((emp) => (
                        <label
                          key={emp.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-100 bg-white p-2 hover:border-[#0F766E]/40 transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                            checked={selectedEmployees.includes(Number(emp.id))}
                            onChange={(e) => {
                              const id = Number(emp.id);
                              if (e.target.checked) {
                                setSelectedEmployees([...selectedEmployees, id]);
                              } else {
                                setSelectedEmployees(selectedEmployees.filter((x) => x !== id));
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-medium text-slate-900">
                              {emp.full_name || `${emp.first_name || emp.name || ''} ${emp.last_name || ''}`.trim() || 'Unknown'}
                            </span>
                            <span className="block truncate text-[11px] text-slate-400">
                              {(emp.work_email || emp.email || '').toLowerCase()}
                            </span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  name="scheduleDate"
                  value={formData.scheduleDate}
                  onChange={handleInputChange}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#0F766E] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-0.5">Dispatch channels</label>
                <div className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                      checked={isInAppChecked}
                      onChange={(e) => handleDispatchChange('In App', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-600">In-app notification</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                      checked={isEmailChecked}
                      onChange={(e) => handleDispatchChange('Email', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-600">Email notification</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { 
  HiPlus, 
  HiPencilSquare, 
  HiTrash, 
  HiCheckCircle, 
  HiClock, 
  HiMegaphone,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiEnvelope,
  HiUsers,
  HiExclamationCircle,
  HiBellAlert,
  HiGlobeAlt,
  HiDocumentText
} from 'react-icons/hi2';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import api from '../../services/api.js';
import Swal from 'sweetalert2';
import { listDepartments } from '../../services/departmentService.js';
import { listEmployeesDropdown } from '../../services/employeeService.js';

export default function Announcements() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
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

  const isHrAdmin = user?.role === 'hr_admin' || user?.role === 'admin';

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

  const filtered = useMemo(() => {
    let data = announcements;
    if (activeStatus !== 'All') {
      data = data.filter(a => a.status === activeStatus);
    }
    const query = q.trim().toLowerCase();
    if (query) {
      data = data.filter((a) => `${a.title} ${a.category} ${a.posted_by_name}`.toLowerCase().includes(query));
    }
    return data;
  }, [q, activeStatus, announcements]);

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      let visibility = announcement.visibility || 'All Employees';
      let selectedEmps = [];
      if (visibility.startsWith('[') && visibility.endsWith(']')) {
        try {
          selectedEmps = JSON.parse(visibility);
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
    if (employees.length === 0) {
      listEmployeesDropdown().then(res => {
        const list = res?.employees || res?.records || [];
        if (list.length > 0) setEmployees(list);
      }).catch(() => null);
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

  const handleSave = async (status) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      let finalVisibility = formData.visibility;
      if (formData.visibility === 'Selected Employees') {
        if (selectedEmployees.length === 0) {
          Swal.fire({ icon: 'warning', title: 'Selection required', text: 'Please select at least one employee.' });
          return;
        }
        finalVisibility = JSON.stringify(selectedEmployees);
      }
      
      const payload = { ...formData, status, visibility: finalVisibility };
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Announcement updated successfully.', timer: 1500, showConfirmButton: false });
      } else {
        await api.post('/admin/announcements', payload);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Announcement created successfully.', timer: 1500, showConfirmButton: false });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save announcement.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/announcements/${id}`);
        Swal.fire('Deleted!', 'The announcement has been deleted.', 'success');
        fetchData();
      } catch (err) {
        console.error(err);
        Swal.fire('Error!', 'Failed to delete announcement.', 'error');
      }
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Announcement',
      render: (v, row) => (
         <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800 leading-tight">{row.title}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.category}</span>
               <span className="text-slate-200">•</span>
               <span className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.2 border border-slate-100 rounded leading-none">
                  {row.dispatch_channels || 'Both'}
               </span>
            </div>
         </div>
      )
    },
    { key: 'posted_by_name', label: 'Author', render: (v) => v || 'System' },
    { 
      key: 'created_at', 
      label: 'Posted On', 
      render: (v) => new Date(v).toLocaleDateString() 
    },
    {
      key: 'visibility',
      label: 'Audience',
      render: (v) => {
         let label = v === 'all' ? 'All Employees' : v;
         if (v?.startsWith('[')) {
           try {
             const ids = JSON.parse(v);
             label = `${ids.length} Selected`;
           } catch(e) {}
         }
         return (
           <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <HiUsers className="h-3.5 w-3.5 opacity-50" />
              <span>{label}</span>
           </div>
         );
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (v) => (
         <Badge 
            label={v} 
            color={v === 'High' ? 'red' : v === 'Medium' ? 'orange' : 'blue'} 
            variant="outline" 
         />
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
         <Badge 
            label={v} 
            color={v === 'Published' ? 'green' : v === 'Scheduled' ? 'blue' : 'orange'} 
         />
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
         <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" icon={HiPencilSquare} className="text-slate-400 hover:text-emerald-600" onClick={() => handleOpenModal(row)} />
            <Button variant="ghost" size="sm" icon={HiTrash} className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(row.id)} />
         </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar with Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Announcements Registry</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Corporate Feed</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Announcements Registry</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isHrAdmin && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
            >
              <HiPlus className="h-4 w-4" />
              Create Announcement
            </button>
          )}
        </div>
      </div>

      {/* Requested KPI Metrics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL POSTS',
            count: stats.total || announcements.length || 0,
            bgColor: 'bg-[#0F172A]',
            icon: HiMegaphone,
            onClickFilter: () => setActiveStatus('All')
          },
          {
            label: 'PUBLISHED',
            count: stats.published || announcements.filter(a => a.status === 'Published').length || 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckCircle,
            onClickFilter: () => setActiveStatus('Published')
          },
          {
            label: 'DRAFTS',
            count: stats.drafts || announcements.filter(a => a.status === 'Draft').length || 0,
            bgColor: 'bg-[#F59E0B]',
            icon: HiPencilSquare,
            onClickFilter: () => setActiveStatus('Draft')
          },
          {
            label: 'SCHEDULED',
            count: stats.scheduled || announcements.filter(a => a.status === 'Scheduled').length || 0,
            bgColor: 'bg-[#3B82F6]',
            icon: HiClock,
            onClickFilter: () => setActiveStatus('Scheduled')
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'TOTAL POSTS' && activeStatus === 'All') ||
            (card.label === 'PUBLISHED' && activeStatus === 'Published') ||
            (card.label === 'DRAFTS' && activeStatus === 'Draft') ||
            (card.label === 'SCHEDULED' && activeStatus === 'Scheduled');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              title={`Filter by ${card.label}`}
              className={`group flex items-center gap-3.5 rounded-none border p-4 text-left transition-all hover:bg-slate-50/50 active:scale-[0.99] min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-slate-50/40 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[11px] font-bold uppercase tracking-wider truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Full width Table container */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Announcements Listing</h2>
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search announcements..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
          </div>
        </div>

        <Table columns={columns} data={filtered} pageSize={8} />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Announcement" : "Create Announcement"} size="xl">
        <form className="animate-in fade-in duration-500 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="col-span-2">
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title <span className="text-rose-500">*</span></label>
                <input 
                   type="text" 
                   name="title" 
                   value={formData.title} 
                   onChange={handleInputChange} 
                   required 
                   placeholder="e.g. New Office Health & Safety Policy"
                   className="w-full rounded-none border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all" 
                />
             </div>
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Area</label>
                <select 
                   name="category"
                   className="w-full rounded-none border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.category} 
                   onChange={handleInputChange}
                >
                   <option>General</option>
                   <option>Corporate</option>
                   <option>Benefits</option>
                   <option>Training</option>
                </select>
             </div>
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                <select 
                   name="priority"
                   className="w-full rounded-none border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.priority} 
                   onChange={handleInputChange}
                >
                   <option>High</option>
                   <option>Medium</option>
                   <option>Low</option>
                </select>
             </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content <span className="text-rose-500">*</span></label>
            <textarea 
              name="content"
              className="w-full rounded-none border border-slate-200 bg-white p-4 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none min-h-[160px] leading-relaxed"
              placeholder="Write your announcement message here. You can use markdown-style formatting..."
              value={formData.content}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
             <div>
                <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                <select 
                   name="visibility"
                   className="w-full rounded-none border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none transition-all"
                   value={formData.visibility} 
                   onChange={handleInputChange}
                >
                   <option value="All Employees">All Employees</option>
                   <option value="Selected Employees">Selected Employees</option>
                   {departments.map((d, i) => (
                      <option key={i} value={d.name || d.department}>{d.name || d.department}</option>
                   ))}
                </select>
                
                {formData.visibility === 'Selected Employees' && (
                  <div className="mt-3 border border-slate-200 rounded-none p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500 font-medium">Select specific employees:</p>
                      {selectedEmployees.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedEmployees([])}
                          className="text-[10px] text-red-600 hover:underline font-bold"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <input 
                      type="text"
                      placeholder="Search by name or email..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full text-xs p-1.5 mb-2 border border-slate-200 rounded-none focus:outline-none focus:border-[#0F766E] bg-slate-50/50"
                    />
                    <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                      {employees
                        .filter(emp => {
                          const term = employeeSearch.toLowerCase();
                          return `${emp.full_name || emp.first_name || emp.name || ''} ${emp.last_name || ''} ${emp.work_email || emp.email || ''} ${emp.emp_id || ''}`.toLowerCase().includes(term);
                        })
                        .map(emp => (
                          <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded-none border-b border-slate-100 last:border-0">
                            <input 
                              type="checkbox" 
                              className="rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, emp.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                                }
                              }}
                            />
                            <span className="font-medium text-slate-700 text-xs">
                              {emp.full_name || `${emp.first_name || emp.name || ''} ${emp.last_name || ''}`.trim() || 'Unnamed Employee'} 
                              <span className="text-slate-400 block text-[10px] font-normal">{emp.work_email || emp.email}</span>
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
             </div>
             <div className="space-y-4">
                <div>
                   <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Publish (Optional)</label>
                   <input 
                      type="datetime-local" 
                      name="scheduleDate" 
                      value={formData.scheduleDate} 
                      onChange={handleInputChange} 
                      className="w-full rounded-none border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm text-slate-900 font-medium focus:border-[#0F766E] focus:bg-white focus:outline-none transition-all"
                   />
                </div>
                <div>
                   <label className="mb-1.5 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Channels</label>
                   <div className="grid grid-cols-2 gap-2 border border-slate-200 bg-slate-50/50 p-3 rounded-lg">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-[#0F766E]">
                         <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] h-4 w-4"
                            checked={isInAppChecked}
                            onChange={(e) => handleDispatchChange('In App', e.target.checked)}
                         />
                         <span>In-App Feed</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-[#0F766E]">
                         <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] h-4 w-4"
                            checked={isEmailChecked}
                            onChange={(e) => handleDispatchChange('Email', e.target.checked)}
                         />
                         <span>Email Notice</span>
                      </label>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={handleCloseModal}
              className="rounded-none border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={() => handleSave('Draft')}
              className="rounded-none border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Save as Draft
            </button>
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={() => handleSave('Published')}
              style={{ backgroundColor: '#0F766E' }}
              className="rounded-none px-6 py-2 text-sm font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center gap-2"
            >
              <HiEnvelope className="h-4 w-4 shrink-0" />
              {isSubmitting ? "Publishing..." : "Publish Now"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

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
          setIsSubmitting(false);
          return;
        }
        finalVisibility = JSON.stringify(selectedEmployees);
      }
      
      const payload = { ...formData, status, visibility: finalVisibility };
      if (editingId) {
        await api.put(`/admin/announcements/${editingId}`, payload);
        toast.success('Announcement updated.');
      } else {
        await api.post('/admin/announcements', payload);
        toast.success('Announcement created.');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save announcement.');
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
        container: 'rounded-none',
        popup: 'rounded-none',
        confirmButton: 'rounded-none px-6 py-2 uppercase text-xs font-black tracking-widest',
        cancelButton: 'rounded-none px-6 py-2 uppercase text-xs font-black tracking-widest'
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
      label: 'TRANSMISSION_SUBJECT',
      render: (v, row) => (
         <div className="flex flex-col gap-0.5 py-1">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-tight">{row.title}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="text-[9px] font-black text-[#0F766E] uppercase tracking-widest">{row.category}</span>
               <span className="text-slate-200">•</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {row.dispatch_channels || 'Both'}
               </span>
            </div>
         </div>
      )
    },
    { key: 'posted_by_name', label: 'AUTHOR_ID', render: (v) => <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{v || 'SYSTEM_CORE'}</span> },
    { 
      key: 'created_at', 
      label: 'TIMESTAMP', 
      render: (v) => <span className="text-[10px] font-bold text-slate-500">{new Date(v).toLocaleDateString()}</span>
    },
    {
      key: 'visibility',
      label: 'AUDIENCE_INDEX',
      render: (v) => {
         let label = v === 'all' ? 'ALL_EMPLOYEES' : v.toUpperCase();
         if (v?.startsWith('[')) {
           try {
             const ids = JSON.parse(v);
             label = `${ids.length}_TARGETS`;
           } catch(e) {}
         }
         return (
           <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <HiUsers className="h-3.5 w-3.5 opacity-50" />
              <span>{label}</span>
           </div>
         );
      }
    },
    {
      key: 'priority',
      label: 'PRIORITY_LEVEL',
      render: (v) => {
         const color = v === 'High' ? 'bg-red-50 text-red-700 border-red-100' : v === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100';
         return (
            <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${color}`}>
               {v}
            </span>
         );
      }
    },
    {
      key: 'status',
      label: 'LIFECYCLE',
      render: (v) => {
         const color = v === 'Published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : v === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100';
         return (
            <span className={`inline-flex items-center rounded-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${color}`}>
               {v}
            </span>
         );
      }
    },
    {
      key: 'actions',
      label: 'COMMAND',
      render: (_, row) => (
         <div className="flex items-center gap-1.5">
            <button 
               onClick={() => handleOpenModal(row)}
               className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] transition-all shadow-sm"
            >
               <HiPencilSquare className="h-4 w-4" />
            </button>
            <button 
               onClick={() => handleDelete(row.id)}
               className="h-8 w-8 flex items-center justify-center rounded-none border border-slate-200 bg-white text-slate-400 hover:text-red-600 transition-all shadow-sm"
            >
               <HiTrash className="h-4 w-4" />
            </button>
         </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-w-0">

      {/* Top Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between min-w-0 border-b border-slate-100 pb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Announcement Intelligence</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Corporate Communications & Broadcast Governance</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isHrAdmin && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="h-10 inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-8 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0c6b64] shadow-lg shadow-emerald-900/10"
            >
              <HiPlus className="h-4 w-4" /> Create Announcement
            </button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
        {[
          {
            label: 'TOTAL BROADCASTS',
            count: stats.total || announcements.length || 0,
            bgColor: 'bg-slate-900',
            icon: HiMegaphone,
            onClickFilter: () => setActiveStatus('All')
          },
          {
            label: 'PUBLISHED_ACTIVE',
            count: stats.published || announcements.filter(a => a.status === 'Published').length || 0,
            bgColor: 'bg-[#10B981]',
            icon: HiCheckCircle,
            onClickFilter: () => setActiveStatus('Published')
          },
          {
            label: 'DRAFT_STAGING',
            count: stats.drafts || announcements.filter(a => a.status === 'Draft').length || 0,
            bgColor: 'bg-[#F59E0B]',
            icon: HiPencilSquare,
            onClickFilter: () => setActiveStatus('Draft')
          },
          {
            label: 'SCHEDULED_QUEUE',
            count: stats.scheduled || announcements.filter(a => a.status === 'Scheduled').length || 0,
            bgColor: 'bg-[#3B82F6]',
            icon: HiClock,
            onClickFilter: () => setActiveStatus('Scheduled')
          }
        ].map((card, idx) => {
          const isActiveFilter = 
            (card.label === 'TOTAL BROADCASTS' && activeStatus === 'All') ||
            (card.label === 'PUBLISHED_ACTIVE' && activeStatus === 'Published') ||
            (card.label === 'DRAFT_STAGING' && activeStatus === 'Draft') ||
            (card.label === 'SCHEDULED_QUEUE' && activeStatus === 'Scheduled');

          return (
            <button
              key={idx}
              type="button"
              onClick={card.onClickFilter}
              className={`flex items-center gap-4 rounded-none border p-5 text-left transition-all min-w-0 shadow-sm ${
                isActiveFilter
                  ? 'border-[#0F766E] bg-emerald-50/50 ring-1 ring-[#0F766E]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] font-black uppercase tracking-widest truncate leading-none ${isActiveFilter ? 'text-[#0F766E]' : 'text-slate-400'}`}>
                  {card.label}
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters + Table Registry */}
      <div className="space-y-6">
        <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
             <div className="flex-1">
                <label className="mb-2 block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Search</label>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="SUBJECT, CATEGORY OR AUTHOR..."
                    className="w-full h-12 rounded-none border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] focus:bg-white outline-none transition-all"
                  />
                </div>
             </div>
             { q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  className="h-12 px-6 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  RESET_FILTERS
                </button>
             )}
          </div>
        </div>

        <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#0F766E] px-5 py-3.5 text-white border-b border-[#0F766E]">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Broadcast Structural Log</h2>
          </div>
          <Table columns={columns} data={filtered} pageSize={8} square className="rounded-none" />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="BROADCAST_CONFIGURATION_INTERFACE" size="xl">
        <form className="animate-in fade-in duration-500 space-y-10 p-2" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-10 md:grid-cols-2">
             <div className="col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Subject <span className="text-red-500">*</span></label>
                <input 
                   type="text" 
                   name="title" 
                   value={formData.title} 
                   onChange={handleInputChange} 
                   required 
                   placeholder="ENTER ANNOUNCEMENT TITLE..."
                   className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none" 
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Classification</label>
                <select 
                   name="category"
                   className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                   value={formData.category} 
                   onChange={handleInputChange}
                >
                   <option>General</option>
                   <option>Corporate</option>
                   <option>Benefits</option>
                   <option>Training</option>
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Protocol</label>
                <select 
                   name="priority"
                   className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                   value={formData.priority} 
                   onChange={handleInputChange}
                >
                   <option>High</option>
                   <option>Medium</option>
                   <option>Low</option>
                </select>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmission Content <span className="text-red-500">*</span></label>
            <textarea 
              name="content"
              className="w-full rounded-none border border-slate-200 bg-white p-5 text-[11px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none transition-all min-h-[180px] placeholder:text-slate-200"
              placeholder="DEFINE BROADCAST MESSAGE PARAMETERS..."
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
            />
          </div>

          <div className="grid gap-10 md:grid-cols-2">
             <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                    <select 
                    name="visibility"
                    className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest focus:border-[#0F766E] outline-none appearance-none cursor-pointer"
                    value={formData.visibility} 
                    onChange={handleInputChange}
                    >
                    <option value="All Employees">ALL_EMPLOYEES</option>
                    <option value="Selected Employees">SELECTED_TARGETS</option>
                    {departments.map((d, i) => (
                        <option key={i} value={d.name || d.department}>{(d.name || d.department).toUpperCase()}</option>
                    ))}
                    </select>
                </div>
                
                {formData.visibility === 'Selected Employees' && (
                  <div className="border border-slate-200 rounded-none p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ASSET_SELECTOR</p>
                      {selectedEmployees.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedEmployees([])}
                          className="text-[9px] text-red-600 font-black uppercase tracking-widest hover:underline"
                        >
                          CLEAR_ALL
                        </button>
                      )}
                    </div>
                    <input 
                      type="text"
                      placeholder="SEARCH_BY_IDENTITY..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full h-10 px-3 mb-4 border border-slate-200 rounded-none bg-white text-[10px] font-bold uppercase tracking-widest focus:border-[#0F766E] outline-none"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {employees
                        .filter(emp => {
                          const term = employeeSearch.toLowerCase();
                          return `${emp.full_name || emp.first_name || emp.name || ''} ${emp.last_name || ''} ${emp.work_email || emp.email || ''} ${emp.emp_id || ''}`.toLowerCase().includes(term);
                        })
                        .map(emp => (
                          <label key={emp.id} className="flex items-center gap-3 p-2 bg-white border border-slate-100 hover:border-[#0F766E] transition-all cursor-pointer group">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                              checked={selectedEmployees.includes(emp.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmployees([...selectedEmployees, emp.id]);
                                } else {
                                  setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                                }
                              }}
                            />
                            <div className="min-w-0">
                                <span className="block text-[10px] font-black text-slate-900 uppercase truncate">
                                {emp.full_name || `${emp.first_name || emp.name || ''} ${emp.last_name || ''}`.trim() || 'UNKNOWN_ASSET'} 
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate block">{(emp.work_email || emp.email || '').toLowerCase()}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
             </div>
             <div className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scheduled Inception (Optional)</label>
                   <input 
                      type="datetime-local" 
                      name="scheduleDate" 
                      value={formData.scheduleDate} 
                      onChange={handleInputChange} 
                      className="w-full h-12 rounded-none border border-slate-200 bg-white px-4 text-[11px] font-bold focus:border-[#0F766E] outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Channels</label>
                   <div className="grid grid-cols-2 gap-4 border border-slate-200 bg-slate-50/50 p-5 rounded-none">
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <input 
                            type="checkbox" 
                            className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                            checked={isInAppChecked}
                            onChange={(e) => handleDispatchChange('In App', e.target.checked)}
                         />
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-[#0F766E]">IN_APP_FEED</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <input 
                            type="checkbox" 
                            className="h-5 w-5 rounded-none border-slate-300 text-[#0F766E] focus:ring-[#0F766E]"
                            checked={isEmailChecked}
                            onChange={(e) => handleDispatchChange('Email', e.target.checked)}
                         />
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-[#0F766E]">EMAIL_NOTICE</span>
                      </label>
                   </div>
                </div>
             </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-6 mt-6">
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={handleCloseModal}
              className="h-12 px-10 rounded-none border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              ABORT_INTERFACE
            </button>
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={() => handleSave('Draft')}
              className="h-12 px-10 rounded-none border border-slate-300 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all"
            >
              SAVE_STAGING_DRAFT
            </button>
            <button 
              type="button" 
              disabled={isSubmitting} 
              onClick={() => handleSave('Published')}
              className="h-12 px-16 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3"
            >
              <HiEnvelope className="h-4 w-4" />
              {isSubmitting ? "TRANSMITTING..." : "EXECUTE_BROADCAST"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

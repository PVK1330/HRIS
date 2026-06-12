import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  HiUserCircle,
  HiChevronDown,
  HiMagnifyingGlass,
  HiDocumentArrowDown,
  HiCheckBadge,
  HiXCircle,
  HiClock,
} from 'react-icons/hi2';
import Swal from 'sweetalert2';
import { Table } from '../../../components/ui/Table.jsx';
import { listAttendance, markAttendanceOverride } from '../../../services/attendanceService.js';
import { applyLeave, getLeaveTypes } from '../../../services/leaveService.js';
import AddLeaveModal from '../../../components/leave/AddLeaveModal.jsx';

export default function AbsenceManagement() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const EMPTY_FORM = {
    employeeId: '', leaveTypeId: '', fromDate: '', toDate: '',
    totalDays: '', reason: '', isDraft: false, supportingDocumentUrl: '',
  };
  const [leaveForm, setLeaveForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, dateFilter]);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        status: 'Absent',
      };
      if (dateFilter) params.date = dateFilter;
      
      const data = await listAttendance(params);
      setAbsences(data?.records || data?.attendance || []);
      setTotal(data?.total ?? data?.pagination?.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch absences:', err);
      toast.error('Failed to load absences.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypesList = async () => {
    try {
      const res = await getLeaveTypes();
      setLeaveTypes((res?.data?.leaveTypes || []).filter(t => t.isActive !== false));
    } catch (err) {
      console.error('Failed to load leave types', err);
    }
  };

  useEffect(() => {
    fetchAbsences();
  }, [debouncedSearch, dateFilter, page]);

  useEffect(() => {
    fetchLeaveTypesList();
  }, []);

  const openLeaveModal = (row) => {
    setSelectedEmployee(row);
    setLeaveForm({
      ...EMPTY_FORM,
      employeeId: String(row.employee_id),
      fromDate: row.date,
      toDate: row.date,
      totalDays: '1',
    });
    setLeaveModalOpen(true);
  };

  const handleApplyLeave = async (e, isDraft = false) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const days = parseInt(leaveForm.totalDays) || 1;
      await applyLeave({
        employeeId: parseInt(leaveForm.employeeId),
        leaveTypeId: parseInt(leaveForm.leaveTypeId),
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        totalDays: days,
        reason: leaveForm.reason,
        supportingDocumentUrl: leaveForm.supportingDocumentUrl,
        // Honor the button the user clicked ("Save as Draft" passes isDraft=true);
        // the form's static leaveForm.isDraft was always false.
        isDraft,
      });
      toast.success('Leave applied successfully');
      setLeaveModalOpen(false);
      fetchAbsences();
    } catch (err) {
      toast.error(err?.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  const promptTimesAndOverride = async (row, targetStatus) => {
    if (targetStatus === 'Present' || targetStatus === 'Half Day') {
      const { value: formValues } = await Swal.fire({
        title: `Mark as ${targetStatus}`,
        html: `
          <div class="text-left space-y-4 pt-2">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Check In Time</label>
              <input id="swal-checkin" type="time" class="w-full rounded border-slate-300 p-2 border" value="09:00">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Check Out Time</label>
              <input id="swal-checkout" type="time" class="w-full rounded border-slate-300 p-2 border" value="18:00">
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#0F766E',
        preConfirm: () => {
          return {
            checkInTime: document.getElementById('swal-checkin').value,
            checkOutTime: document.getElementById('swal-checkout').value
          };
        }
      });

      if (!formValues) return; // cancelled

      try {
        await markAttendanceOverride({
          employeeId: row.employee_id,
          date: row.date,
          status: targetStatus,
          checkInTime: formValues.checkInTime || undefined,
          checkOutTime: formValues.checkOutTime || undefined,
        });
        toast.success(`Marked as ${targetStatus}`);
        fetchAbsences();
      } catch (err) {
        toast.error('Failed to override attendance');
      }
    } else {
      // Just mark absent if it wasn't already (though it should be here)
      try {
        await markAttendanceOverride({
          employeeId: row.employee_id,
          date: row.date,
          status: targetStatus,
        });
        toast.success(`Marked as ${targetStatus}`);
        fetchAbsences();
      } catch (err) {
        toast.error('Failed to override attendance');
      }
    }
  };

  const ActionDropdown = ({ row }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative" onMouseLeave={() => setOpen(false)}>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
        >
          Actions <HiChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => { setOpen(false); openLeaveModal(row); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <HiCheckBadge className="h-4 w-4 text-blue-500" />
                Convert to Leave
              </button>
              <button
                onClick={() => { setOpen(false); promptTimesAndOverride(row, 'Present'); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <HiCheckBadge className="h-4 w-4 text-emerald-500" />
                Mark as Present
              </button>
              <button
                onClick={() => { setOpen(false); promptTimesAndOverride(row, 'Half Day'); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <HiClock className="h-4 w-4 text-amber-500" />
                Mark as Half Day
              </button>
              <button
                onClick={() => { setOpen(false); promptTimesAndOverride(row, 'Absent'); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <HiXCircle className="h-4 w-4 text-red-500" />
                Mark as Absent
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiUserCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{row.employee_name || 'Unknown'}</div>
            {row.department_name && (
              <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{row.department_name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (v) => <span className="text-sm font-medium text-slate-600">{v}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
         <span className="inline-flex items-center rounded-none bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10 uppercase tracking-wider">
           {v || 'Absent'}
         </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => <ActionDropdown row={row} />,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:tracking-tight">
            Absence Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review and resolve employee absences. Convert to leave or override attendance status.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0 flex flex-wrap gap-3">
          <button
            onClick={fetchAbsences}
            className="inline-flex items-center gap-x-2 rounded-none bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 rounded-none bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <HiMagnifyingGlass className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-none border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6 transition-all"
              />
            </div>
            <div className="w-48">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full rounded-none border-0 py-2.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#0F766E] sm:text-sm sm:leading-6 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-none bg-white shadow-sm ring-1 ring-slate-200">
        <Table
          columns={columns}
          data={absences}
          loading={loading}
          pagination={{
            page,
            limit: 10,
            total,
            onPageChange: setPage,
          }}
          emptyMessage="No absences found for the selected date."
        />
      </div>

      {/* Convert to Leave Modal */}
      <AddLeaveModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        leaveTypes={leaveTypes}
        liveBalance={null}
        form={leaveForm}
        setForm={setLeaveForm}
        onSubmit={handleApplyLeave}
        submitting={submitting}
      />
    </div>
  );
}

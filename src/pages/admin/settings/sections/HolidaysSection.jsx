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
import { Input } from '../../../../components/ui/Input.jsx';
import { Modal } from '../../../../components/ui/Modal.jsx';
import { Table } from '../../../../components/ui/Table.jsx';
import {
  listHolidayCalendars,
  getHolidayCalendar,
  createHolidayCalendar,
  addHolidayDate,
  updateHolidayDate,
  removeHolidayDate
} from '../../../../services/holidayService';

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

const initialFormData = {
  name: '',
  holidayDate: '',
};

export default function HolidaysSection({ registerToolbar }) {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [calendar, setCalendar] = useState(null);
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
  }, [debouncedSearch, selectedYear]);

  const fetchCalendar = async () => {
    setLoading(true);
    setCalendar(null);
    try {
      const calendars = await listHolidayCalendars({ year: selectedYear });
      if (calendars && calendars.length > 0) {
        const calData = await getHolidayCalendar(calendars[0].id);
        setCalendar(calData);
      }
    } catch (err) {
      toast.error('Failed to fetch holiday calendar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
    setModalOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

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

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialFormData);
    setEditMode(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    try {
      if (editMode) {
        await updateHolidayDate(editingId, { name: formData.name.trim(), holidayDate: formData.holidayDate });
        toast.success('Holiday updated successfully.');
      } else {
        let calId = calendar?.id;
        if (!calId) {
          const newCal = await createHolidayCalendar({ year: selectedYear, region: 'Global' });
          calId = newCal.id;
        }
        await addHolidayDate(calId, { name: formData.name.trim(), holidayDate: formData.holidayDate });
        toast.success('Holiday added successfully.');
      }
      handleCloseModal();
      fetchCalendar();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save holiday.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name ?? '',
      holidayDate: item.holiday_date ?? '',
    });
    setEditingId(item.id);
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'The holiday will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0F766E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    if (!result.isConfirmed) return;

    try {
      await removeHolidayDate(id);
      toast.success('Holiday deleted.');
      fetchCalendar();
    } catch (err) {
      toast.error('Failed to delete holiday.');
    }
  };

  const allDates = calendar?.dates || [];
  
  const filteredDates = useMemo(() => {
    if (!debouncedSearch) return allDates;
    return allDates.filter(d => 
      (d.name && d.name.toLowerCase().includes(debouncedSearch)) ||
      (d.holiday_date && d.holiday_date.includes(debouncedSearch))
    );
  }, [allDates, debouncedSearch]);

  const totalCount = filteredDates.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedDates = filteredDates.slice(startIndex, startIndex + pageSize);

  const columns = [
    {
      key: 'name',
      label: 'HOLIDAY NAME',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-[#0F766E] shadow-sm">
            <HiCalendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">{v}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'holiday_date',
      label: 'DATE',
      render: (v) => (
        <span className="text-sm font-medium text-slate-600">{v}</span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: () => (
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1 rounded-none bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
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
            aria-label="Edit holiday"
          >
            <HiPencilSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Delete holiday"
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
          <h2 className="text-lg font-bold text-slate-900">Manage Holidays</h2>
          <p className="text-xs font-medium text-slate-500">Add, edit, or remove company holidays and public observances.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm"
        >
          <HiPlus className="h-4 w-4" /> Add Holiday
        </button>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Holiday Listing</h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative min-w-[250px] flex-1 max-w-md">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search holiday name or date..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-10 min-w-[180px] cursor-pointer rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y} Calendar</option>
              ))}
            </select>
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
          data={paginatedDates}
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
        size="md"
        showClose
        header={
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-900">
              {editMode ? 'Edit Holiday' : 'Add New Holiday'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Configure the holiday name and date for the {selectedYear} calendar.
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="space-y-4">
            <Input
              label="Holiday Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. New Year's Day"
              required
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
            <Input
              label="Date"
              name="holidayDate"
              type="date"
              value={formData.holidayDate}
              onChange={handleFormChange}
              required
              inputClassName="h-10 rounded-lg border-slate-300 focus:border-[#0F766E] focus:ring-[#0F766E]/20"
              labelClassName="mb-1 block text-sm font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
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
              {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

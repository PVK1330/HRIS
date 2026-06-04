import React, { useEffect, useState } from 'react';
import { HiCalendar } from 'react-icons/hi2';
import { listHolidayCalendars, getHolidayCalendar } from '../../services/holidayService.js';
import { Table } from '../ui/Table.jsx';

export default function HolidayListWidget() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const year = new Date().getFullYear();
        const cals = await listHolidayCalendars({ year });
        if (cals && cals.length > 0) {
          const calData = await getHolidayCalendar(cals[0].id);
          // Sort dates to show upcoming or just chronologically
          const sorted = (calData?.dates || []).sort((a, b) => new Date(a.holiday_date) - new Date(b.holiday_date));
          setHolidays(sorted);
        }
      } catch (err) {
        console.error('Failed to load holidays:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Holiday',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-100 text-emerald-700">
            <HiCalendar className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-slate-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'holiday_date',
      label: 'Date',
      render: (v) => {
        const d = new Date(v);
        const isPast = d < new Date(new Date().setHours(0,0,0,0));
        return (
          <div className="flex items-center gap-3">
            <span className={`text-sm ${isPast ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
              {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {isPast && <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Past</span>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm mt-6 mb-6">
      <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-5 py-3">
        <h2 className="text-sm font-semibold text-emerald-900">Holiday Calendar ({new Date().getFullYear()})</h2>
        <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
          {holidays.length} Holidays
        </span>
      </div>
      {holidays.length > 0 ? (
        <Table columns={columns} data={holidays} pageSize={5} loading={loading} />
      ) : (
        <div className="p-8 text-center text-sm text-slate-500">
          {loading ? 'Loading holidays...' : 'No holidays found for this year.'}
        </div>
      )}
    </div>
  );
}

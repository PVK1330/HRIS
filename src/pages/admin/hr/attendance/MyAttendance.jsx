import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  HiArrowPath, HiPlay, HiStop, HiClock, HiBriefcase,
  HiCalendarDays, HiBolt, HiPause, HiMagnifyingGlass,
  HiChevronLeft, HiChevronRight, HiArrowsUpDown,
} from 'react-icons/hi2';
import { Table } from '../../../../components/ui/Table.jsx';
import { useAuth } from '../../../../context/AuthContext.jsx';
import { canPunchAttendance } from '../../../../utils/rbac.js';
import {
  getMyToday, checkIn, checkOut, getEmployeeAttendance,
} from '../../../../services/attendanceService.js';
import AttendanceExportMenu from '../../../../components/attendance/AttendanceExportMenu.jsx';

// ─── helpers ──────────────────────────────────────────────────────────────────
function hm(hours) {
  const h = Math.max(0, Number(hours) || 0);
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return `${whole}h ${String(mins).padStart(2, '0')}m`;
}

function greeting(d) {
  const h = d.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function statusColor(s) {
  if (s === 'Present') return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  if (s === 'Remote' || s === 'Work From Home') return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  if (s === 'Late') return 'bg-orange-50 text-orange-700 ring-orange-600/20';
  if (s === 'Absent') return 'bg-red-50 text-red-700 ring-red-600/20';
  if (s === 'Half Day') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  if (s === 'On Leave') return 'bg-purple-50 text-purple-700 ring-purple-600/20';
  if (s === 'Holiday' || s === 'Weekend') return 'bg-slate-50 text-slate-600 ring-slate-500/20';
  return 'bg-slate-50 text-slate-700 ring-slate-600/20';
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColor(status)}`}>
      {status || '—'}
    </span>
  );
}

const startOfWeek = (ref) => {
  const x = new Date(ref);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── small presentational pieces ───────────────────────────────────────────────
function StatTile({ icon, label, value, sub, accent = 'teal' }) {
  const Icon = icon;
  const tone = {
    teal: 'bg-teal-700',
    slate: 'bg-slate-800',
    blue: 'bg-blue-600',
    amber: 'bg-amber-500',
  }[accent] || 'bg-teal-700';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function BreakdownRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
      <span className="ml-auto text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function colLabel(text) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {text}
      <HiArrowsUpDown className="h-3 w-3 shrink-0 opacity-45" aria-hidden />
    </span>
  );
}

export default function MyAttendance() {
  const { user, allowedModules } = useAuth();
  const employeeId = user?.employeeId || user?.id;
  const canPunch = canPunchAttendance(allowedModules || [], user);

  const [now, setNow] = useState(() => new Date());
  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [locationEnabled, setLocationEnabled] = useState(false);

  const nowMonth = new Date();
  const [year, setYear] = useState(nowMonth.getFullYear());
  const [month, setMonth] = useState(nowMonth.getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState({ records: [], summary: null });
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  // live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const refreshToday = useCallback(async () => {
    if (!canPunch) { setLoadingToday(false); return; }
    setLoadingToday(true);
    setError('');
    try {
      const data = await getMyToday();
      setToday(data);
      setLocationEnabled(data?.locationTrackingEnabled === true);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load attendance');
    } finally {
      setLoadingToday(false);
    }
  }, [canPunch]);

  const refreshMonth = useCallback(async () => {
    if (!employeeId) return;
    setLoadingMonth(true);
    try {
      const data = await getEmployeeAttendance(employeeId, { year, month });
      setMonthData({ records: data.records || [], summary: data.summary || null });
    } catch {
      setMonthData({ records: [], summary: null });
    } finally {
      setLoadingMonth(false);
    }
  }, [employeeId, year, month]);

  useEffect(() => { refreshToday(); }, [refreshToday]);
  useEffect(() => { refreshMonth(); }, [refreshMonth]);
  useEffect(() => { setAvatarError(false); }, [today?.profileImageUrl]);

  const captureLocation = () => new Promise((resolve) => {
    if (!locationEnabled || !navigator.geolocation) { resolve({}); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve({}),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });

  const punch = async (fn) => {
    setActing(true);
    setError('');
    try {
      const loc = await captureLocation();
      await fn({ workMode: 'In Office', ...loc });
      await Promise.all([refreshToday(), refreshMonth()]);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Action failed');
    } finally {
      setActing(false);
    }
  };

  const punchStatus = today?.punchStatus || 'Not Checked In';
  const canCheckIn = punchStatus === 'Not Checked In';
  const canCheckOut = punchStatus === 'Checked In';

  // ── derived metrics ──
  const summary = monthData.summary;
  const records = monthData.records;

  const weekWorked = useMemo(() => {
    const ws = startOfWeek(now);
    const we = new Date(ws); we.setDate(we.getDate() + 7);
    return records.reduce((acc, r) => {
      const d = new Date(r.date);
      if (d >= ws && d < we) acc += Number(r.worked_hours || r.total_hours || 0);
      return acc;
    }, 0);
  }, [records, now]);

  const todayWorked = Number(today?.workedHours || 0);
  const todayOt = Number(today?.overtimeHours || 0);
  const todayBreak = Number(today?.record?.break_hours || 0);
  const monthWorked = Number(summary?.total_worked_hours || 0);
  const monthOt = Number(summary?.total_overtime_hours || 0);

  // working-hours breakdown (today if punched, otherwise this month)
  const usingToday = todayWorked > 0 || todayOt > 0 || todayBreak > 0;
  const bProductive = usingToday ? todayWorked : monthWorked;
  const bBreak = usingToday
    ? todayBreak
    : records.reduce((a, r) => a + Number(r.break_hours || 0), 0);
  const bOvertime = usingToday ? todayOt : monthOt;
  const bTotal = bProductive + bBreak + bOvertime;
  const pct = (v) => (bTotal > 0 ? `${(v / bTotal) * 100}%` : '0%');

  const filteredRecords = useMemo(() => {
    let list = records;
    if (statusFilter) list = list.filter((r) => (r.display_status || r.status) === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => String(r.date).toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, statusFilter, search]);

  const stepMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
  };

  const columns = [
    { key: 'date', label: colLabel('Date'), render: (v) => <span className="font-medium text-slate-800">{v}</span> },
    { key: 'check_in_time', label: colLabel('Check In'), render: (v) => <span className="text-sm font-medium text-slate-700">{v || '—'}</span> },
    { key: 'status', label: colLabel('Status'), render: (_, r) => <StatusBadge status={r.display_status || r.status} /> },
    { key: 'check_out_time', label: colLabel('Check Out'), render: (v) => <span className="text-sm font-medium text-slate-700">{v || '—'}</span> },
    { key: 'break_hours', label: colLabel('Break'), render: (v) => <span className="text-sm font-medium text-slate-700">{Number(v) > 0 ? hm(v) : '—'}</span> },
    {
      key: 'late_minutes',
      label: colLabel('Late'),
      render: (v, r) => (r.is_late && Number(v) > 0
        ? <span className="text-sm font-medium text-slate-700">{Math.round(v)} Min</span>
        : <span className="text-sm font-medium text-slate-700">—</span>),
    },
    {
      key: 'overtime_hours',
      label: colLabel('Overtime'),
      render: (v, r) => {
        const h = Number(v) || 0
        if (h <= 0) return <span className="text-sm font-medium text-slate-700">—</span>
        const st = r.overtime_status
        if (st === 'Approved') return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">{hm(h)}</span>
        if (st === 'Pending') return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{hm(h)} · pending</span>
        if (st === 'Rejected') return <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 line-through">{hm(h)}</span>
        return <span className="text-sm font-medium text-slate-700">{hm(h)}</span>
      },
    },
    {
      key: 'worked_hours',
      label: colLabel('Production Hours'),
      render: (_, r) => {
        const h = Number(r.worked_hours || r.total_hours || 0);
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 text-xs font-semibold ${
            h > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            <HiClock className="h-3.5 w-3.5" /> {hm(h)}
          </span>
        );
      },
    },
  ];

  const punchInAt = today?.record?.check_in_time;
  const inputClass = 'h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none';

  return (
    <div className="space-y-6 min-w-0">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 truncate">Employee Attendance</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Attendance</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Employee Attendance</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* ── Left Column: Hero punch card ── */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center text-center h-full">
            <p className="text-sm font-semibold text-slate-500">Good {now.getHours() < 12 ? 'Morning' : 'Afternoon'}, {user?.name?.split(' ')[0] || 'there'}</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<span className="ml-1 text-base font-bold text-slate-500">, {now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </p>

            {today?.profileImageUrl && !avatarError ? (
              <img
                src={today.profileImageUrl}
                alt={user?.name || 'Profile'}
                onError={() => setAvatarError(true)}
                className="mt-6 h-32 w-32 rounded-full object-cover ring-[6px] ring-[#0F766E]/5"
              />
            ) : (
              <div className="mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#0F766E]/10 text-5xl font-bold text-[#0F766E] ring-[6px] ring-[#0F766E]/5">
                {(user?.name || '?').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="mt-6 inline-flex items-center gap-1.5 rounded-none bg-[#0F766E] px-3 py-1.5 text-xs font-semibold text-white tracking-wide">
              Production : {hm(todayWorked)}
            </div>

            {punchInAt && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600">
                <HiClock className="h-4 w-4 text-[#EA580C]" /> {canCheckOut ? 'Punch In at' : 'Last check-in'} {punchInAt}
              </p>
            )}

            <div className="mt-auto w-full pt-6">
              {!canPunch ? (
                <p className="text-sm text-slate-500">You don't have permission to punch.</p>
              ) : (
                canCheckOut ? (
                  <button
                    type="button"
                    onClick={() => punch(checkOut)}
                    disabled={acting || loadingToday}
                    className="w-full rounded-none bg-[#1E293B] px-4 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {acting ? 'Punching...' : 'Punch Out'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => punch(checkIn)}
                    disabled={!canCheckIn || acting || loadingToday}
                    className="w-full rounded-none bg-[#0F766E] px-4 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#0E625A] disabled:opacity-50"
                  >
                    {acting ? 'Punching...' : 'Punch In'}
                  </button>
                )
              )}
            </div>
            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          </div>
        </div>

        {/* ── Right Column: Stats and Breakdown ── */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0 h-full">
          {/* ── Stat tiles ── */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 min-w-0">
            {[
              {
                label: 'Total Hours Today',
                count: `${(todayWorked || 0).toFixed(2)} / 9`,
                bgColor: 'bg-[#EA580C]',
                icon: HiClock,
              },
              {
                label: 'Total Hours Week',
                count: `${(weekWorked || 0).toFixed(0)} / 40`,
                bgColor: 'bg-slate-700',
                icon: HiBriefcase,
              },
              {
                label: 'Total Hours Month',
                count: `${(monthWorked || 0).toFixed(0)} / 160`,
                bgColor: 'bg-[#3B82F6]',
                icon: HiCalendarDays,
              },
              {
                label: 'Overtime this Month',
                count: `${(monthOt || 0).toFixed(0)} / 28`,
                bgColor: 'bg-[#E11D48]',
                icon: HiBolt,
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="group rounded-none border border-slate-200 bg-white p-5 text-left transition-all hover:bg-slate-50/50 hover:border-slate-300 min-w-0 shadow-sm flex flex-col h-full"
              >
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-none ${card.bgColor} text-white shadow-sm mb-3`}>
                  <card.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-end">
                  <div className="text-2xl font-black tracking-tight text-slate-900 leading-none">{card.count}</div>
                  <div className="mt-2 text-sm font-medium tracking-wide text-slate-500">
                    {card.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Working-hours breakdown ── */}
          <div className="rounded-none border border-slate-200 bg-white p-6 shadow-sm flex-1 flex flex-col justify-center">
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Working hours</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{hm(bProductive + bOvertime)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Productive Hours</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{hm(bProductive)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Break hours</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{hm(bBreak)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overtime</p>
                </div>
                <p className="text-xl font-bold text-slate-900">{hm(bOvertime)}</p>
              </div>
            </div>

            {/* segmented bar */}
            <div className="mt-6 flex h-4 w-full overflow-hidden rounded-none bg-slate-100 gap-1">
              <div className="bg-[#10B981] rounded-none" style={{ width: pct(bProductive) }} title="Productive" />
              <div className="bg-[#F59E0B]" style={{ width: pct(bBreak) }} title="Break" />
              <div className="bg-[#3B82F6] rounded-none" style={{ width: pct(bOvertime) }} title="Overtime" />
            </div>
          </div>
        </div>
      </div>

      {/* ── History table ── */}
      <div className="overflow-hidden rounded-none border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#0F766E] bg-[#0F766E] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Employee Attendance</h2>
          <AttendanceExportMenu
            reportType="employee"
            filenameBase="my-attendance"
            params={{ employeeId, year, month }}
          />
        </div>

        <div className="space-y-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search date..."
                className="h-10 w-full rounded-none border border-slate-200 bg-slate-50/70 px-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium"
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-none border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 outline-none transition focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] font-medium cursor-pointer xl:col-span-2">
              <option value="">All statuses</option>
              {['Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Remote', 'Holiday', 'Weekend'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 rounded-none border border-slate-200 bg-slate-50/70 px-1 xl:col-span-2">
              <button type="button" onClick={() => stepMonth(-1)} className="rounded-none p-1.5 text-slate-500 hover:bg-slate-200 transition-colors" aria-label="Previous month">
                <HiChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[84px] text-center text-sm font-medium text-slate-700 w-full">{MONTHS[month - 1]} {year}</span>
              <button type="button" onClick={() => stepMonth(1)} className="rounded-none p-1.5 text-slate-500 hover:bg-slate-200 transition-colors" aria-label="Next month">
                <HiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-medium text-slate-500">{filteredRecords.length} records shown</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="inline-flex items-center rounded-none border border-dashed border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50/50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredRecords}
          pageSize={10}
          loading={loadingMonth}
          square
          emptyMessage="No attendance records for this month"
        />
      </div>
    </div>
  );
}

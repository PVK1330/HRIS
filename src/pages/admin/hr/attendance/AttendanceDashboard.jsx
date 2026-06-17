import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  HiUsers,
  HiClock,
  HiHome,
  HiExclamationTriangle,
  HiCalendar,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiCheckCircle,
  HiXCircle,
  HiBuildingOffice2
} from 'react-icons/hi2';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { getAttendanceDashboard, remindCheckout, exportAttendanceExcel } from '../../../../services/attendanceService.js';
import AttendancePunchCard from '../../../../components/attendance/AttendancePunchCard.jsx';

function MetricCard({ title, value, icon: Icon, tone = 'slate', trend, percent }) {
  const tones = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    red: 'text-red-600 bg-red-50 border-red-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
  };

  const isUp = trend === 'up';
  
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{title}</p>
        <span className={`rounded-xl p-2.5 transition-colors ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-4xl font-black tracking-tight text-slate-900">{value ?? 0}</p>
        {percent !== undefined && (
          <div className="flex flex-col items-end">
            <span className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {isUp ? <HiArrowTrendingUp className="h-3 w-3" /> : <HiArrowTrendingDown className="h-3 w-3" />}
              {percent}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">vs yesterday</span>
          </div>
        )}
      </div>
      {/* Decorative gradient blur on hover */}
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-tr from-transparent via-slate-100/30 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <p className="mb-2 border-b border-slate-100 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs font-bold text-slate-700">{entry.name}</span>
            </div>
            <span className="text-xs font-black text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AttendanceDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAttendanceDashboard({ date });
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
    const id = setInterval(load, 120000); // refresh every 2 mins
    return () => clearInterval(id);
  }, [load]);

  const w = data?.widgets || {};
  const charts = data?.charts || {};
  const insights = data?.insights || {};

  const presentRatioData = [
    { name: 'Present', value: w.present_today || 0, color: '#10B981' },
    { name: 'Absent', value: w.absent_today || 0, color: '#EF4444' },
    { name: 'Leave', value: w.on_leave || 0, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Attendance Dashboard</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
            Real-time workforce availability and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <label className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Date Filter</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
            />
          </div>
          <button
            onClick={() => exportAttendanceExcel({ dateFrom: date, dateTo: date })}
            className="mt-5 h-10 rounded-xl bg-slate-900 px-5 text-[10px] font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-black hover:shadow-lg active:scale-95"
          >
            Export Report
          </button>
        </div>
      </div>

      <AttendancePunchCard />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard title="Total Workforce" value={w.total_employees} icon={HiUsers} tone="indigo" />
            <MetricCard title="Present Today" value={w.present_today} icon={HiCheckCircle} tone="emerald" trend={w.present_trend} percent={w.present_change_pct} />
            <MetricCard title="Absent Today" value={w.absent_today} icon={HiXCircle} tone="red" trend={w.absent_trend} percent={w.absent_change_pct} />
            <MetricCard title="Attendance Rate" value={`${w.attendance_rate || 0}%`} icon={HiArrowTrendingUp} tone="emerald" />
            <MetricCard title="Late Arrivals" value={w.late_today} icon={HiClock} tone="amber" trend={w.late_trend} percent={w.late_change_pct} />
            
            <MetricCard title="On Leave" value={w.on_leave} icon={HiCalendar} tone="purple" />
            <MetricCard title="Work From Home" value={w.work_from_home} icon={HiHome} tone="blue" />
            <MetricCard title="Half Day" value={w.half_day} icon={HiClock} tone="amber" />
            <MetricCard title="Pending Regularizations" value={w.pending_regularizations} icon={HiExclamationTriangle} tone="amber" />
            <MetricCard title="Overtime Requests" value={w.pending_overtime} icon={HiExclamationTriangle} tone="amber" />
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Attendance Trend (7 Days)</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Historical view of present vs absent workforce</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.daily_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={(v) => v.split('-').slice(1).join('/')} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
                    <Area type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAbsent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Today's Ratio</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">Distribution of workforce status</p>
              <div className="flex-1 flex items-center justify-center -mt-4">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={presentRatioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {presentRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-bold text-slate-700 ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Department Overview & Insights Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Department Table */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Department Overview</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Present</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Absent</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">On Leave</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(charts.department_attendance || []).map((dept, i) => {
                      const total = dept.present + dept.absent + dept.on_leave;
                      const health = total > 0 ? (dept.present / total) * 100 : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <HiBuildingOffice2 className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-900">{dept.department}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center text-xs font-black text-slate-700">{dept.present}</td>
                          <td className="px-6 py-4 text-center text-xs font-black text-slate-700">{dept.absent}</td>
                          <td className="px-6 py-4 text-center text-xs font-black text-slate-700">{dept.on_leave}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full max-w-[80px] rounded-full bg-slate-100 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${health >= 80 ? 'bg-emerald-500' : health >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${health}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-500">{Math.round(health)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col flex-1">
                <div className="p-5 border-b border-slate-100 bg-amber-50/30 rounded-t-2xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-900 flex items-center gap-2">
                    <HiClock className="h-4 w-4" /> Top Late Arrivals
                  </h3>
                </div>
                <div className="p-2 flex-1">
                  {(insights.top_late || []).length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-slate-400">No late arrivals today!</div>
                  ) : (
                    <ul className="divide-y divide-slate-50">
                      {insights.top_late.map((user, i) => (
                        <li key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">{user.department}</p>
                          </div>
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-black">
                            {user.late_minutes} min late
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col flex-1">
                <div className="p-5 border-b border-slate-100 bg-red-50/30 rounded-t-2xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-900 flex items-center gap-2">
                    <HiExclamationTriangle className="h-4 w-4" /> Missing Check-Outs
                  </h3>
                </div>
                <div className="p-2 flex-1">
                  {(insights.missing_checkout || []).length === 0 ? (
                    <div className="p-8 text-center text-xs font-semibold text-slate-400">No missing checkouts found.</div>
                  ) : (
                    <ul className="divide-y divide-slate-50">
                      {insights.missing_checkout.map((user, i) => (
                        <li key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                            <p className="text-[10px] font-semibold text-slate-500">In at {user.check_in_time}</p>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await remindCheckout(user.employee_id, date);
                                toast.success('Reminder sent');
                              } catch {
                                toast.error('Failed to send reminder');
                              }
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
                          >
                            Remind
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  HiChartBar, 
  HiArrowDownTray, 
  HiFunnel, 
  HiCalendarDays, 
  HiChevronLeft,
  HiTableCells,
  HiPresentationChartLine,
  HiArrowUpTray
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Table } from '../../../components/ui/Table.jsx';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4', '#F0FDFA'];

const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400, secondary: 240 },
  { name: 'Feb', value: 300, secondary: 139 },
  { name: 'Mar', value: 600, secondary: 980 },
  { name: 'Apr', value: 800, secondary: 390 },
  { name: 'May', value: 500, secondary: 480 },
  { name: 'Jun', value: 900, secondary: 380 },
];

const REPORTS = [
  { id: 'headcount', title: 'Headcount Report', description: 'Total employee growth and distribution across departments.', type: 'bar', category: 'Human Capital' },
  { id: 'attendance', title: 'Attendance Report', description: 'Daily attendance trends, late arrivals, and absence rates.', type: 'area', category: 'Operations' },
  { id: 'leave', title: 'Leave Report', description: 'Leave utilization by type and department.', type: 'bar', category: 'Operations' },
  { id: 'visa', title: 'Visa Expiry Report', description: 'Upcoming visa and work permit expirations.', type: 'pie', category: 'Compliance' },
  { id: 'attrition', title: 'Attrition Report', description: 'Employee turnover rates and exit reasons analysis.', type: 'line', category: 'Retention' },
  { id: 'performance', title: 'Performance Summary', description: 'Overall organization performance ratings distribution.', type: 'bar', category: 'Talent' },
  { id: 'compliance', title: 'Document Compliance', description: 'Track missing or expired mandatory documents.', type: 'pie', category: 'Compliance' },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // chart or table

  const handleGenerate = (report) => {
    setGenerating(report.id);
    setTimeout(() => {
      setGenerating(null);
      setSelectedReport(report);
    }, 1000);
  };

  const DetailView = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedReport(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200"
            >
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{selectedReport.title}</h2>
                <Badge label={selectedReport.category} color="blue" variant="soft" className="text-[10px] uppercase font-black" />
              </div>
              <p className="text-sm text-slate-500">Analytics generated for H1 2026 Cycle</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex rounded-xl bg-slate-100 p-1">
                <button 
                  onClick={() => setViewMode('chart')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'chart' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <HiPresentationChartLine className="h-4 w-4" /> Visual
                </button>
                <button 
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <HiTableCells className="h-4 w-4" /> Data
                </button>
             </div>
             <Button label="Export CSV" icon={HiArrowDownTray} variant="ghost" className="border border-slate-200" />
             <Button label="Print PDF" icon={HiArrowUpTray} variant="primary" className="bg-[#0F766E]" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
           {/* Filters Sidebar */}
           <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Report Filters</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="text-[10px] font-bold text-slate-700 uppercase mb-1.5 block">Time Range</label>
                       <select className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium focus:outline-none focus:border-[#0F766E]">
                          <option>Last 6 Months</option>
                          <option>Current Year</option>
                          <option>Last Year</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-700 uppercase mb-1.5 block">Department</label>
                       <select className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium focus:outline-none focus:border-[#0F766E]">
                          <option>All Departments</option>
                          <option>Engineering</option>
                          <option>Marketing</option>
                       </select>
                    </div>
                    <Button label="Update Report" variant="ghost" className="w-full text-xs font-bold border border-slate-100 bg-slate-50" />
                 </div>
              </div>

              <div className="rounded-2xl bg-[#0F766E] p-6 text-white shadow-xl shadow-emerald-900/20">
                 <h4 className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Key Metric</h4>
                 <p className="text-3xl font-black mb-1">24.5%</p>
                 <p className="text-[10px] font-medium opacity-80">Increase vs. previous quarter audit</p>
              </div>
           </div>

           {/* Main Data View */}
           <div className="lg:col-span-3">
              {viewMode === 'chart' ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm min-h-[500px]">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Visualization Engine</h3>
                   <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         {selectedReport.type === 'bar' ? (
                            <BarChart data={MOCK_CHART_DATA}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                               <Tooltip 
                                 contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} 
                                 cursor={{ fill: '#f8fafc' }}
                               />
                               <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                  {MOCK_CHART_DATA.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                               </Bar>
                            </BarChart>
                         ) : selectedReport.type === 'area' ? (
                            <AreaChart data={MOCK_CHART_DATA}>
                               <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2}/>
                                     <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                               <Tooltip />
                               <Area type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                         ) : selectedReport.type === 'pie' ? (
                            <PieChart>
                               <Pie
                                  data={[
                                     { name: 'Engineering', value: 400 },
                                     { name: 'Marketing', value: 300 },
                                     { name: 'Sales', value: 300 },
                                     { name: 'Operations', value: 200 },
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={80}
                                  outerRadius={120}
                                  paddingAngle={5}
                                  dataKey="value"
                               >
                                  {MOCK_CHART_DATA.map((entry, index) => (
                                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                               </Pie>
                               <Tooltip />
                            </PieChart>
                         ) : (
                            <LineChart data={MOCK_CHART_DATA}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                               <Tooltip />
                               <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={4} dot={{ r: 6, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                         )}
                      </ResponsiveContainer>
                   </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[500px]">
                   <Table 
                      columns={[
                         { key: 'period', label: 'Reporting Period' },
                         { key: 'count', label: 'Primary Metric', render: (v) => <span className="font-bold text-slate-900">{v}</span> },
                         { key: 'variance', label: 'Variance', render: (v) => <span className={v.startsWith('+') ? 'text-emerald-600' : 'text-rose-500'}>{v}</span> },
                         { key: 'status', label: 'Audit Status', render: () => <Badge label="Verified" color="green" variant="soft" /> },
                      ]}
                      data={Array.from({ length: 12 }).map((_, i) => ({
                         period: `Week ${i + 1}, 2026`,
                         count: Math.floor(Math.random() * 1000) + 200,
                         variance: `${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 15)}%`
                      }))}
                      pageSize={10}
                   />
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  if (selectedReport) return <DetailView />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0D5F57] p-8 text-white shadow-xl shadow-emerald-900/20">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight uppercase">REPORTS & ANALYTICS</h1>
            <p className="mt-2 text-emerald-100/80 text-sm max-w-md leading-relaxed">
              Transform raw data into actionable intelligence. Generate, visualize, and export organizational performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button label="Global Date Filter" icon={HiCalendarDays} className="bg-white/10 text-white border-white/20 hover:bg-white/20" />
            <Button label="Batch Export" icon={HiArrowDownTray} className="bg-white text-[#0F766E] font-black" />
          </div>
        </div>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <div 
            key={report.id} 
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-[#0F766E]/30 hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F766E]/10 text-[#0F766E] group-hover:scale-110 transition-transform">
                 <HiChartBar className="h-6 w-6" />
               </div>
               <Badge label={report.category} color="gray" variant="soft" className="text-[8px] font-black tracking-widest opacity-60" />
            </div>
            
            <h3 className="mb-2 text-lg font-black text-slate-900 uppercase tracking-tight">{report.title}</h3>
            <p className="mb-6 flex-1 text-xs text-slate-500 font-medium leading-relaxed">
              {report.description}
            </p>
            
            <div className="mb-6 h-24 w-full overflow-hidden rounded-xl bg-slate-50/50 p-2 border border-slate-100">
              {generating === report.id ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 animate-pulse">
                   <div className="h-2 w-24 rounded-full bg-emerald-200" />
                   <div className="h-2 w-16 rounded-full bg-emerald-100" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                   {report.type === 'bar' ? (
                      <BarChart data={MOCK_CHART_DATA}>
                         <Bar dataKey="value" fill="#0F766E" radius={[2, 2, 0, 0]} opacity={0.6} />
                      </BarChart>
                   ) : report.type === 'pie' ? (
                      <PieChart>
                         <Pie data={[{v:10},{v:20},{v:30}]} cx="50%" cy="50%" innerRadius={15} outerRadius={25} dataKey="v" fill="#0F766E" opacity={0.6} />
                      </PieChart>
                   ) : (
                      <AreaChart data={MOCK_CHART_DATA}>
                         <Area type="monotone" dataKey="value" stroke="#0F766E" fill="#0F766E" fillOpacity={0.1} />
                      </AreaChart>
                   )}
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                label={generating === report.id ? 'Generating...' : 'VIEW REPORT'} 
                variant="primary" 
                className="flex-1 text-[10px] font-black tracking-widest" 
                onClick={() => handleGenerate(report)}
                disabled={generating !== null}
              />
              <button className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#0F766E] transition-all">
                 <HiArrowDownTray className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

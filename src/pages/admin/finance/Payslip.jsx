import React from 'react';
import { 
  HiHome, 
  HiChevronRight, 
  HiArrowDownTray, 
  HiChevronUpDown,
  HiCog6Tooth,
  HiPrinter
} from 'react-icons/hi2';

export default function Payslip() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-w-0">
      
      {/* Top Title Bar - Sync with Employee Directory */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">Payslip</h1>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
            <span>Payroll</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-600">Payslip View</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 shadow-sm">
            <HiPrinter className="h-4 w-4" /> Print
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-none bg-[#0F766E] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b64] shadow-sm">
            <HiArrowDownTray className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Payslip Card - Perfected Document Style */}
      <div className="rounded-none border border-slate-200 bg-white p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 h-48 w-48 bg-[#0F766E]/5 -mr-24 -mt-24 rotate-45" />

        {/* Company Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-12 relative z-10 border-b border-slate-100 pb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/20">
                <span className="text-2xl font-black">S</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-[#1C242E]">Smart<span className="text-[#0F766E]">HR</span></span>
            </div>
            <div className="space-y-1">
               <p className="text-sm font-medium text-slate-500 max-w-[240px] leading-relaxed">
                  3099 Kennedy Court Framingham, MA 01702
               </p>
            </div>
          </div>
          <div className="mt-8 md:mt-0 text-right space-y-1">
            <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Payslip Reference</div>
            <div className="text-3xl font-black text-[#0F766E]">#PS4283</div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-[#0F766E]/10 text-[#0F766E] text-xs font-bold uppercase tracking-wider">
              October 2024
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 py-8 border-b border-slate-100">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-slate-200 pl-3">Disbursement From</h3>
            <div className="space-y-2">
              <div className="text-xl font-black text-[#1C242E]">XYZ Technologies</div>
              <div className="text-sm font-medium text-slate-500 leading-relaxed">2077 Chicago Avenue Orosi, CA 93647</div>
              <div className="flex flex-col gap-1 pt-2">
                <p className="text-xs font-bold text-slate-400">Email: <span className="text-slate-900 ml-1">xyztech@example.com</span></p>
                <p className="text-xs font-bold text-slate-400">Phone: <span className="text-slate-900 ml-1">+1 987 654 3210</span></p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-[#0F766E] uppercase tracking-[0.2em] border-l-4 border-[#0F766E] pl-3">Remittance To</h3>
            <div className="space-y-2">
              <div className="text-xl font-black text-[#1C242E]">Anthony Lewis</div>
              <div className="text-sm font-bold text-[#0F766E] uppercase tracking-widest text-[10px] bg-emerald-50 px-2 py-0.5 inline-block">Web Designer</div>
              <div className="flex flex-col gap-1 pt-2">
                <p className="text-xs font-bold text-slate-400">Email: <span className="text-slate-900 ml-1">anthony@example.com</span></p>
                <p className="text-xs font-bold text-slate-400">ID: <span className="text-slate-900 ml-1">Emp-45826</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Title */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-black text-[#1C242E] uppercase tracking-[0.3em] bg-slate-50 px-6 py-2 rounded-none inline-block border border-slate-100 shadow-sm">
            Statement for October 2024
          </h2>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Earnings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#0F766E] pb-2">
               <div className="h-2 w-2 rounded-none bg-[#0F766E]" />
               <h3 className="text-[11px] font-black text-[#1C242E] uppercase tracking-widest">Earnings</h3>
            </div>
            <div className="space-y-3 px-1">
              {[
                ['Basic Salary', '$3,000'],
                ['House Rent Allowance (H.R.A.)', '$1,000'],
                ['Conveyance', '$200'],
                ['Other Allowance', '$100']
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center group border-b border-slate-50 pb-1">
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">{label}</span>
                  <span className="text-sm font-bold text-slate-900">{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Earnings</span>
                <span className="text-xl font-black text-[#0F766E]">$4,300</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-red-500 pb-2">
               <div className="h-2 w-2 rounded-none bg-red-500" />
               <h3 className="text-[11px] font-black text-[#1C242E] uppercase tracking-widest">Deductions</h3>
            </div>
            <div className="space-y-3 px-1">
              {[
                ['Tax Deducted at Source (T.D.S.)', '$200'],
                ['Provident Fund', '$300'],
                ['ESI', '$150'],
                ['Loan', '$50']
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center group border-b border-slate-50 pb-1">
                  <span className="text-sm font-medium text-slate-500 group-hover:text-red-600 transition-colors">{label}</span>
                  <span className="text-sm font-bold text-red-600">{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Deductions</span>
                <span className="text-xl font-black text-red-600">$700</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Summary */}
        <div className="bg-[#1C242E] rounded-none p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#0F766E]" />
          <div className="space-y-1 relative z-10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Net Salary Payable</div>
            <div className="text-4xl font-black text-white">$3,600</div>
          </div>
          <div className="text-right relative z-10">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Amount in Words</div>
            <div className="text-sm font-bold text-slate-300 italic underline decoration-emerald-500/50 underline-offset-4">
              Three thousand six hundred only
            </div>
          </div>
        </div>

        {/* Settings Gear - Standardized */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button className="flex h-10 w-10 items-center justify-center rounded-none bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/20 transition-all">
            <HiCog6Tooth className="h-6 w-6 animate-spin-slow" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

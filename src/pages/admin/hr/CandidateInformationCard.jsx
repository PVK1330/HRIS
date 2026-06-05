import React, { useState } from 'react';
import { HiUser } from 'react-icons/hi2';

export default function CandidateInformationCard({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    personalEmail: initialData.personalEmail || '',
    phoneNumber: initialData.phoneNumber || '',
    gender: initialData.gender || '',
    nationality: initialData.nationality || '',
    maritalStatus: initialData.maritalStatus || '',
    currentAddress: initialData.currentAddress || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#242424] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-slate-200">
      {/* Card Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          <HiUser className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
          Candidate information
        </h2>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Row 1: Full Name & Date of Birth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Joshi"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 custom-date-input"
            />
          </div>
        </div>

        {/* Row 2: Personal Email & Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Personal Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              placeholder="John@gmail.com"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25"
            />
          </div>
        </div>

        {/* Row 3: Gender, Nationality, Marital Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 cursor-pointer"
            >
              <option value="" className="bg-[#242424]">Select</option>
              <option value="Male" className="bg-[#242424]">Male</option>
              <option value="Female" className="bg-[#242424]">Female</option>
              <option value="Other" className="bg-[#242424]">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Nationality <span className="text-rose-500">*</span>
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 cursor-pointer"
            >
              <option value="" className="bg-[#242424]">Select</option>
              <option value="Indian" className="bg-[#242424]">Indian</option>
              <option value="Emirati" className="bg-[#242424]">Emirati</option>
              <option value="British" className="bg-[#242424]">British</option>
              <option value="American" className="bg-[#242424]">American</option>
              {/* Add more nationalities as required */}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Marital Status
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 cursor-pointer"
            >
              <option value="" className="bg-[#242424]">Select</option>
              <option value="Single" className="bg-[#242424]">Single</option>
              <option value="Married" className="bg-[#242424]">Married</option>
              <option value="Divorced" className="bg-[#242424]">Divorced</option>
              <option value="Widowed" className="bg-[#242424]">Widowed</option>
            </select>
          </div>
        </div>

        {/* Row 4: Current Address (Full Width) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            Current Address
          </label>
          <textarea
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleChange}
            placeholder="Street, City, State, PIN code"
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/25 resize-none"
          />
        </div>
      </form>
    </div>
  );
}

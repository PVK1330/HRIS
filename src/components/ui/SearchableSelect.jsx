import React, { useState, useRef, useEffect } from 'react';
import { HiMagnifyingGlass, HiChevronDown, HiXMark } from 'react-icons/hi2';

export const SearchableSelect = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Search...", 
  name,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div 
        className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-[#0F766E] ring-4 ring-emerald-500/10' : 'border-slate-200'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-[#0F766E] focus:outline-none"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${value === opt.value ? 'bg-emerald-50 text-[#0F766E] font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  onClick={() => {
                    onChange({ target: { name, value: opt.value } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

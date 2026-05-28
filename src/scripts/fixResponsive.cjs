const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LetterBuilder.jsx';
let code = fs.readFileSync(p, 'utf8');

// Fix toggle buttons to be visible on all screens
code = code.replace(/<div className="hidden md:flex bg-slate-100 p-1 rounded-md mx-4">/, '<div className="flex bg-slate-100 p-1 rounded-md mx-2 md:mx-4 overflow-x-auto">');

// Show split button on md and up
code = code.replace(/className={`hidden xl:flex items-center/g, 'className={`hidden lg:flex items-center');

// Change default viewMode to editor to prevent squishing on mobile
code = code.replace(/const \[viewMode, setViewMode\] = useState\('split'\);/, "const [viewMode, setViewMode] = useState('editor');");

// Make Main workspace flex-col on mobile
code = code.replace(/<div className="flex flex-1 overflow-hidden">/, '<div className="flex flex-col lg:flex-row flex-1 overflow-hidden">');

// Make Tags Drawer w-full on mobile, w-72 on lg
code = code.replace(/className="w-72 shrink-0 border-l border-slate-200 bg-white flex flex-col shadow-\[-4px_0_15px_-3px_rgba\(0,0,0,0\.05\)\] z-20"/g, 'className="w-full lg:w-72 shrink-0 lg:border-l border-t lg:border-t-0 border-slate-200 bg-white flex flex-col lg:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 h-64 lg:h-auto"');

// Make A4 preview wrapper scrollable horizontally
code = code.replace(/className="flex-1 overflow-y-auto p-8 flex justify-center"/g, 'className="flex-1 overflow-auto p-4 lg:p-8 flex justify-center"');
code = code.replace(/className="w-full max-w-\[21cm\] bg-white shadow-xl shadow-slate-200\/50 rounded-sm overflow-hidden flex flex-col min-h-\[29.7cm\]"/g, 'className="w-[21cm] min-w-[21cm] bg-white shadow-xl shadow-slate-200/50 rounded-sm overflow-hidden flex flex-col min-h-[29.7cm] transform scale-[0.6] sm:scale-[0.8] lg:scale-100 origin-top"');

fs.writeFileSync(p, code, 'utf8');
console.log('Made LetterBuilder perfectly responsive');

const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LetterBuilder.jsx';
let code = fs.readFileSync(p, 'utf8');

// Add viewMode state
code = code.replace(/const \[previewEmpId, setPreviewEmpId\] = useState\(''\);/, "const [previewEmpId, setPreviewEmpId] = useState('');\n  const [viewMode, setViewMode] = useState('split');");

// Add Icons
code = code.replace(/HiDocumentText, HiEye, HiArrowPath, HiUser/, "HiDocumentText, HiEye, HiArrowPath, HiUser, HiViewColumns, HiPencilSquare");

// Add Toggle in Header
const headerToggle = `
        <div className="hidden md:flex bg-slate-100 p-1 rounded-md mx-4">
          <button onClick={() => setViewMode('editor')} className={\`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all \${viewMode === 'editor' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>
            <HiPencilSquare className="w-4 h-4" /> Editor
          </button>
          <button onClick={() => setViewMode('preview')} className={\`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all \${viewMode === 'preview' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>
            <HiEye className="w-4 h-4" /> Preview
          </button>
          <button onClick={() => setViewMode('split')} className={\`hidden xl:flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all \${viewMode === 'split' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>
            <HiViewColumns className="w-4 h-4" /> Split
          </button>
        </div>
`;

code = code.replace(/<div className="h-6 w-px bg-slate-200"><\/div>/, `<div className="h-6 w-px bg-slate-200"></div>` + headerToggle);

// Add conditional rendering for Left Panel
code = code.replace(/{?\/\* LEFT PANEL: EDITOR \*\//, `{(viewMode === 'editor' || viewMode === 'split') && (\n        {/* LEFT PANEL: EDITOR */}`);
code = code.replace(/<\/ReactQuill>\s*<\/div>\s*<\/div>/, `</ReactQuill>\n          </div>\n        </div>\n        )}`);

// Add conditional rendering for Right Panel
code = code.replace(/{?\/\* RIGHT PANEL: LIVE PREVIEW \*\//, `{(viewMode === 'preview' || viewMode === 'split') && (\n        {/* RIGHT PANEL: LIVE PREVIEW */}`);
code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* RIGHT SIDEBAR/, `</div>\n          </div>\n        </div>\n        )}\n\n        {/* RIGHT SIDEBAR`);

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed Layout Congestion!');

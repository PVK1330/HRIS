const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

// Fix openEdit
const editRegex = new RegExp("const openEdit = \\\\(row\\\\) => \\\\{[\\\\s\\\\S]*?navigate\\\\(`\\\\/admin\\\\/letters\\\\/builder\\\\/\\\\$\\\\{row\\\\.id\\\\}`\\\\)[\\\\s\\\\S]*?setSelectedTemplate\\\\(row\\\\)[\\\\s\\\\S]*?setEditForm\\\\(\\\\{[\\\\s\\\\S]*?body: row\\\\.body \\\\|\\\\| '',[\\\\s\\\\S]*?status: row\\\\.status,[\\\\s\\\\S]*?\\\\}\\\\)[\\\\s\\\\S]*?setEditModalOpen\\\\(true\\\\)[\\\\s\\\\S]*?\\\\}");
code = code.replace(editRegex, 'const openEdit = (row) => { navigate(`/admin/letters/builder/${row.id}`); }');

// Fix Create button that was mangled with TagPicker
const badCreate = `<div className="absolute right-6 bottom-6 flex items-center gap-2">
                <button onClick={() => navigate('/admin/letters/builder/new')} className="h-11 px-8 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                  <HiPlus className="h-4 w-4" /> DRAFT_PROTOCOL
                </button>
                <TagPicker`;
const goodCreate = `<div className="absolute right-6 bottom-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTagPickerOpen(o => !o)}
                  className="h-10 px-4 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all flex items-center gap-2"
                >
                  <HiCodeBracket className="h-4 w-4" /> INJECT_TAG
                </button>
                <TagPicker`;
code = code.replace(badCreate, goodCreate);

// Now correctly replace the DRAFT_PROTOCOL button
const oldDraftBtn = `<button onClick={() => setCreateModalOpen(true)} className="h-11 px-8 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
            <HiPlus className="h-4 w-4" /> DRAFT_PROTOCOL
          </button>`;
const newDraftBtn = `<button onClick={() => navigate('/admin/letters/builder/new')} className="h-11 px-8 rounded-none bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
            <HiPlus className="h-4 w-4" /> DRAFT_PROTOCOL
          </button>`;
code = code.replace(oldDraftBtn, newDraftBtn);

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed navigation logic in LettersTemplates.jsx');

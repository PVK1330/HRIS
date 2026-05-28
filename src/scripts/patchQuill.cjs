const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

// 1. Add imports for ReactQuill
if (!code.includes('ReactQuill')) {
  code = code.replace(
    'import { listEmployees } from \'../../../services/employeeService.js\'',
    'import { listEmployees } from \'../../../services/employeeService.js\'\nimport ReactQuill from \'react-quill\';\nimport \'react-quill/dist/quill.snow.css\';'
  );
}

// 2. Add HiEye button to actions
const tableActionsTarget = `<button
              onClick={() => { setSelectedTemplate(row); setSendModalOpen(true) }}
              className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-[#0F766E]/30 transition-all flex items-center justify-center"
            >
              <HiEnvelope className="h-3.5 w-3.5" />
            </button>`;

const tableActionsWithPreview = `<button
              onClick={() => { setSelectedTemplate(row); setSendModalOpen(true) }}
              className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center justify-center"
              title="Preview / Send"
            >
              <HiEye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { setSelectedTemplate(row); setSendModalOpen(true) }}
              className="h-8 w-8 rounded-none border border-slate-200 bg-white text-slate-400 hover:text-[#0F766E] hover:border-[#0F766E]/30 transition-all flex items-center justify-center"
              title="Use / Dispatch"
            >
              <HiEnvelope className="h-3.5 w-3.5" />
            </button>`;
code = code.replace(tableActionsTarget, tableActionsWithPreview);


// 3. Update insertAtCursor to work with ReactQuill
const oldInsert = `function insertAtCursor(ref, tag, currentValue, setter) {
  const el = ref.current
  if (!el) { setter(f => ({ ...f, body: currentValue + tag })); return }
  const start = el.selectionStart ?? currentValue.length
  const end   = el.selectionEnd   ?? currentValue.length
  const next  = currentValue.slice(0, start) + tag + currentValue.slice(end)
  setter(f => ({ ...f, body: next }))
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + tag.length, start + tag.length)
  })
}`;

const newInsert = `function insertAtCursor(ref, tag, currentValue, setter) {
  const editor = ref.current?.getEditor ? ref.current.getEditor() : null;
  if (!editor) { setter(f => ({ ...f, body: currentValue + tag })); return; }
  
  const range = editor.getSelection(true);
  const index = range ? range.index : editor.getLength();
  editor.insertText(index, tag);
  
  // Note: onChange of Quill will handle state update automatically, but for sync:
  setter(f => ({ ...f, body: editor.root.innerHTML }));
}`;
code = code.replace(oldInsert, newInsert);


// 4. Replace textareas with ReactQuill
const createTextarea = `<textarea
                ref={createBodyRef}
                className="w-full rounded-none border border-slate-200 bg-slate-50/30 p-6 text-[13px] font-mono leading-relaxed text-slate-800 focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none min-h-[350px] transition-all"
                placeholder="START PROTOCOL DRAFTING. USE {{TAGS}} FOR DYNAMIC INJECTION..."
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
              />`;
const createQuill = `<div className="bg-white"><ReactQuill
                ref={createBodyRef}
                theme="snow"
                value={form.body}
                onChange={val => setForm({ ...form, body: val })}
                className="min-h-[350px]"
                modules={{ toolbar: [[{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], ['clean']] }}
              /></div>`;
code = code.replace(createTextarea, createQuill);

const editTextarea = `<textarea
                ref={editBodyRef}
                className="w-full rounded-none border border-slate-200 bg-slate-50/30 p-6 text-[13px] font-mono leading-relaxed text-slate-800 focus:border-[#0F766E] focus:bg-white focus:ring-1 focus:ring-[#0F766E] outline-none min-h-[350px] transition-all"
                placeholder="TEMPLATE BODY..."
                value={editForm.body}
                onChange={e => setEditForm({ ...editForm, body: e.target.value })}
              />`;
const editQuill = `<div className="bg-white"><ReactQuill
                ref={editBodyRef}
                theme="snow"
                value={editForm.body}
                onChange={val => setEditForm({ ...editForm, body: val })}
                className="min-h-[350px]"
                modules={{ toolbar: [[{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], ['clean']] }}
              /></div>`;
code = code.replace(editTextarea, editQuill);

fs.writeFileSync(p, code, 'utf8');
console.log('Quill and Preview integrated');

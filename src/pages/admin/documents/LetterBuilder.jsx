import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiCheck, HiCodeBracket, HiDocumentText, HiEye, HiArrowPath, HiUser, HiViewColumns, HiPencilSquare } from 'react-icons/hi2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import api from '../../../services/api.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { listEmployees } from '../../../services/employeeService.js';
import toast from 'react-hot-toast';

const CATEGORIES = ['Recruitment', 'Compliance', 'Performance', 'Exit', 'HR', 'Finance', 'Leave', 'Disciplinary'];
const TYPES = ['Letter', 'Form', 'Certificate', 'Report'];
const EMPTY_FORM = { name: 'Untitled Template', type: 'Letter', category: 'Recruitment', description: '', body: '', status: 'Active' };

function renderBody(body, employee) {
  if (!body || !employee) return body || '';
  return body
    .replace(/\{\{employee_name\}\}/g, employee.full_name || employee.name || '')
    .replace(/\{\{employee_id\}\}/g, employee.emp_id || employee.empId || '')
    .replace(/\{\{job_title\}\}/g, employee.job_title || employee.jobTitle || '')
    .replace(/\{\{department\}\}/g, employee.department || '')
    .replace(/\{\{joining_date\}\}/g, employee.join_date || employee.joinDate || '')
    .replace(/\{\{salary\}\}/g, employee.salary || '[salary]')
    .replace(/\{\{work_email\}\}/g, employee.work_email || employee.email || '')
    .replace(/\{\{work_location\}\}/g, employee.work_location || employee.location || '')
    .replace(/\{\{today_date\}\}/g, new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }))
    .replace(/\{\{company_name\}\}/g, employee.company || '[Company Name]')
    .replace(/\{\{[^}]+\}\}/g, match => `[${match.slice(2, -2)}]`);
}

export default function LetterBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`lb_form_${id}`);
      return saved ? JSON.parse(saved) : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(`lb_form_${id}`, JSON.stringify(form));
  }, [form, id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tags, setTags] = useState([]);
  const [empList, setEmpList] = useState([]);
  const [previewEmpId, setPreviewEmpId] = useState(() => sessionStorage.getItem('lb_previewEmpId') || '');
  const [viewMode, setViewMode] = useState(() => sessionStorage.getItem('lb_viewMode') || 'editor');

  useEffect(() => {
    sessionStorage.setItem('lb_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    sessionStorage.setItem('lb_previewEmpId', previewEmpId);
  }, [previewEmpId]);

  const quillRef = useRef(null);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get('/letters/tags');
      setTags(data.data.tags || []);
    } catch { }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await listEmployees({ limit: 50 });
      setEmpList(data?.employees || []);
      if (data?.employees?.length > 0) {
        setPreviewEmpId(prev => prev || data.employees[0].id);
      }
    } catch { }
  }, []);

  const fetchTemplate = useCallback(async () => {
    if (!id || id === 'new') return;
    setLoading(true);
    try {
      const { data } = await api.get('/letters/templates', { params: { limit: 100 } });
      const t = data.data.templates.find(x => String(x.id) === String(id));
      if (t) {
        setForm(prev => {
          const isUnsaved = sessionStorage.getItem(`lb_form_${id}`);
          // If we restored unsaved changes from session storage, do NOT overwrite them with the DB version!
          return isUnsaved ? prev : t;
        });
      }
    } catch (err) {
      toast.error('Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTags();
    fetchEmployees();
    fetchTemplate();
  }, [fetchTags, fetchEmployees, fetchTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id && id !== 'new') {
        await api.put(`/letters/templates/${id}`, form);
        toast.success('Template updated successfully');
      } else {
        await api.post('/letters/templates', form);
        toast.success('Template created successfully');
        sessionStorage.removeItem(`lb_form_new`);
        navigate('/admin/letters');
      }
      sessionStorage.removeItem(`lb_form_${id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const insertTag = (tag) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      setForm(f => ({ ...f, body: (f.body || '') + `{{${tag}}}` }));
      return;
    }
    const range = editor.getSelection(true);
    const index = range ? range.index : editor.getLength();
    editor.insertText(index, `{{${tag}}}`);
    setForm(f => ({ ...f, body: editor.root.innerHTML }));
  };

  const selectedEmp = empList.find(e => String(e.id) === String(previewEmpId));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0F766E] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/letters')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex bg-slate-100 p-1 rounded-md mx-2 md:mx-4 overflow-x-auto">
            <button onClick={() => setViewMode('editor')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'editor' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <HiPencilSquare className="w-4 h-4" /> Editor
            </button>
            <button onClick={() => setViewMode('preview')} className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <HiEye className="w-4 h-4" /> Preview
            </button>
            {/* <button onClick={() => setViewMode('split')} className={`hidden lg:flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'split' ? 'bg-white text-[#0F766E] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <HiViewColumns className="w-4 h-4" /> Split
          </button> */}
          </div>

          <input
            type="text"
            className="text-lg font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-0 border-none p-0 min-w-[300px]"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Template Name"
          />
        </div>

        <div className="flex items-center gap-4">
          <select
            className="text-sm font-semibold text-slate-600 border-none bg-slate-100 rounded-md py-1.5 px-3 focus:ring-0 cursor-pointer"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-[#0F766E] px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#0c6b64] transition-all disabled:opacity-50"
          >
            {saving ? <HiArrowPath className="h-4 w-4 animate-spin" /> : <HiCheck className="h-4 w-4" />}
            {saving ? 'SAVING...' : 'SAVE TEMPLATE'}
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="flex flex-1 flex-col border-r border-slate-200 bg-white overflow-hidden relative shadow-sm">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <HiCodeBracket className="h-4 w-4 text-[#0F766E]" /> Document Editor
              </div>
            </div>
            <div className="flex-1 overflow-y-auto [&_.ql-toolbar]:sticky [&_.ql-toolbar]:top-0 [&_.ql-toolbar]:z-10 [&_.ql-toolbar]:bg-white [&_.ql-container]:border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-editor]:min-h-[500px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={form.body}
                onChange={val => setForm({ ...form, body: val })}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex flex-1 flex-col bg-slate-100 overflow-hidden relative">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <HiEye className="h-4 w-4 text-emerald-600" /> Live Document Preview
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><HiUser className="w-3 h-3" /> Preview Data:</span>
                <select
                  className="text-xs font-semibold text-slate-700 border-none bg-slate-50/50 rounded px-2 py-1 focus:ring-0 max-w-[150px] shadow-inner"
                  value={previewEmpId}
                  onChange={e => setPreviewEmpId(e.target.value)}
                >
                  <option value="">[Blank Template]</option>
                  {empList.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.full_name || emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 lg:p-8 flex justify-center">
              {/* A4 Paper Shadow Container */}
              <div className={`w-[21cm] min-w-[21cm] bg-white shadow-xl shadow-slate-200/50 rounded-sm overflow-hidden flex flex-col min-h-[29.7cm] transform scale-[0.6] sm:scale-[0.8] ${viewMode === 'split' ? 'lg:scale-[0.55] xl:scale-[0.7]' : 'lg:scale-100'} origin-top`}>
                {/* Header Letterhead */}
                <div className="border-b border-slate-100 px-12 py-8 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <img src={user?.company_logo || '/HRIS_Logo.png'} alt="Logo" className="max-h-14 w-auto object-contain" />
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{user?.company_name || 'ORGANIZATION'}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Official Document</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                  </p>
                </div>

                {/* Rendered Body */}
                <div className="px-12 py-10 flex-1 bg-white">
                  <div
                    className="text-[13px] text-slate-800 leading-relaxed max-w-none font-sans [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-6 [&_h2]:text-center [&_h2]:text-[#0F766E] [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-bold [&_em]:italic [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_td]:border-b [&_td]:border-slate-200 [&_td]:py-3 [&_td]:px-4"
                    dangerouslySetInnerHTML={{
                      __html: previewEmpId && selectedEmp ? renderBody(form.body, selectedEmp) : form.body || '<p class="text-slate-300 text-center italic mt-10">Start typing to see preview...</p>'
                    }}
                  />
                </div>

                {/* Footer Letterhead */}
                <div className="border-t border-slate-50 px-12 py-8 bg-slate-50/20">
                  <div className="h-px w-32 bg-slate-200 mb-2" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.company_name ? user.company_name + " SIGNATORY" : "AUTHORIZED SIGNATORY"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT SIDEBAR: TAGS DRAWER */}
        <div className="w-full lg:w-72 shrink-0 lg:border-l border-t lg:border-t-0 border-slate-200 bg-white flex flex-col lg:shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 h-64 lg:h-auto">
          <div className="h-12 border-b border-slate-100 flex items-center px-5 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Dynamic Variables</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tags.map(t => (
              <button
                key={t.tag}
                onClick={() => insertTag(t.tag)}
                className="w-full text-left p-3 rounded-md border border-slate-100 bg-white hover:border-[#0F766E] hover:shadow-md hover:shadow-[#0F766E]/10 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[11px] font-bold text-[#0F766E] bg-emerald-50 px-1.5 py-0.5 rounded">{"{{" + t.tag + "}}"}</code>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">{t.description}</p>
              </button>
            ))}
            {tags.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">No variables available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

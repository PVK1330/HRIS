const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

const badChunk = `                  ) : empListError ? (
                  <div className="flex items-center gap-4">
                    <img src={user?.company_logo || '/HRIS_Logo.png'} alt="Logo" className="max-h-14 w-auto object-contain" />
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{user?.company_name || 'ORGANIZATION'}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Official Document</p>
                    </div>
                  </div>
                  ) : empList.length === 0 ? (`

const goodErrorChunk = `                  ) : empListError ? (
                    <div className="text-center py-6 space-y-3">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{empListError}</p>
                      <button
                        type="button"
                        onClick={() => { empListFetched.current = false; fetchEmpList() }}
                        className="text-[9px] font-black text-[#0F766E] hover:underline uppercase tracking-widest"
                      >
                        RETRY_SYNC
                      </button>
                    </div>
                  ) : empList.length === 0 ? (`

code = code.replace(badChunk, goodErrorChunk);

// Fix the actual header fallback logic
const targetFallback = `<div className="h-10 w-10 bg-[#0F766E] rounded-none flex items-center justify-center text-white font-black text-lg shadow-sm">
                        {(user?.company_name || 'H').charAt(0).toUpperCase()}
                      </div>`;
const newFallback = `<img src="/HRIS_Logo.png" alt="Logo" className="max-h-14 w-auto object-contain" />`;
code = code.replace(targetFallback, newFallback);

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed file');

const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

if (!code.includes('useAuth')) {
  code = code.replace(
    'import { listEmployees } from \'../../../services/employeeService.js\'',
    'import { listEmployees } from \'../../../services/employeeService.js\'\nimport { useAuth } from \'../../../context/AuthContext.jsx\''
  );
}

code = code.replace(
  'export default function LettersTemplates() {',
  'export default function LettersTemplates() {\n  const { user } = useAuth()'
);

const targetHeader = `<div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#0F766E] rounded-none flex items-center justify-center text-white font-black text-xs">H</div>
                    <div className="h-4 w-24 bg-slate-200 rounded-none" />
                  </div>`;

const newHeader = `<div className="flex items-center gap-4">
                    {user?.company_logo ? (
                      <img src={user.company_logo} alt="Logo" className="max-h-14 w-auto object-contain" />
                    ) : (
                      <div className="h-10 w-10 bg-[#0F766E] rounded-none flex items-center justify-center text-white font-black text-lg shadow-sm">
                        {(user?.company_name || 'H').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{user?.company_name || 'ORGANIZATION'}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Official Document</p>
                    </div>
                  </div>`;

code = code.replace(targetHeader, newHeader);

code = code.replace(
  '<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AUTHORIZED_SIGNATORY</p>',
  '<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.company_name ? user.company_name + " SIGNATORY" : "AUTHORIZED SIGNATORY"}</p>'
);

fs.writeFileSync(p, code, 'utf8');
console.log('Updated letterhead header');

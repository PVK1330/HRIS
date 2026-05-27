const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

const badLine = '    navigate(/admin/letters/builder/\\)';
const goodLine = '    navigate(`/admin/letters/builder/${row.id}`)';

code = code.replace(badLine, goodLine);
fs.writeFileSync(p, code, 'utf8');
console.log('Fixed navigate line');

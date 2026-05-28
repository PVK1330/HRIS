const fs = require('fs');

const builderPath = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LetterBuilder.jsx';
let builderCode = fs.readFileSync(builderPath, 'utf8');
builderCode = builderCode.replace(/import ReactQuill from ['"]react-quill['"];?/g, "import ReactQuill from 'react-quill-new';");
builderCode = builderCode.replace(/import ['"]react-quill\/dist\/quill\.snow\.css['"];?/g, "import 'react-quill-new/dist/quill.snow.css';");
fs.writeFileSync(builderPath, builderCode, 'utf8');

const templatesPath = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let templatesCode = fs.readFileSync(templatesPath, 'utf8');
templatesCode = templatesCode.replace(/import ReactQuill from ['"]react-quill['"];?/g, "import ReactQuill from 'react-quill-new';");
templatesCode = templatesCode.replace(/import ['"]react-quill\/dist\/quill\.snow\.css['"];?/g, "import 'react-quill-new/dist/quill.snow.css';");
fs.writeFileSync(templatesPath, templatesCode, 'utf8');

console.log('Successfully updated imports in both files!');

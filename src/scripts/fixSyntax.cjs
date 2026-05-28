const fs = require('fs');
const p = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/pages/admin/documents/LettersTemplates.jsx';
let code = fs.readFileSync(p, 'utf8');

const badChunk = `  const openEdit = (row) => {
    navigate(\`/admin/letters/builder/\${row.id}\`)
      await api.patch(\`/letters/templates/\${selectedTemplate.id}\`, editForm)
      setEditModalOpen(false)
      await Promise.all([fetchTemplates(), fetchKpis()])
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update template')
    } finally {
      setSubmitting(false)
    }
  }`;

const goodChunk = `  const openEdit = (row) => {
    navigate(\`/admin/letters/builder/\${row.id}\`)
  }`;

code = code.replace(badChunk, goodChunk);

fs.writeFileSync(p, code, 'utf8');
console.log('Fixed syntax error via string replace.');

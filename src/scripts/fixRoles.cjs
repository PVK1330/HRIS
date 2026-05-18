const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\pkk22\\OneDrive\\Desktop\\TECHNOWEB\\HRIS PROJECT\\HRIS_PROJECT\\HRIS\\src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('super_admin')) {
        content = content.replace(/super_admin/g, 'superadmin');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
      }
    }
  });
}

walk(rootDir);

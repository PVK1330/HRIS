const fs = require('fs');
const path = 'c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/HRIS PROJECT/HRIS_PROJECT/HRIS/src/routes/AppRouter.jsx';
let content = fs.readFileSync(path, 'utf8');

// Add lazy and Suspense to imports
if (!content.includes('import { lazy, Suspense }')) {
  content = content.replace(/import \{/, 'import { lazy, Suspense } from "react";\nimport {');
}

// Replace standard imports with lazy
content = content.replace(/import\s+(\w+)\s+from\s+"(\.\.\/pages\/.*?)";/g, 'const $1 = lazy(() => import("$2"));');

// Replace RootLayout to include Suspense
content = content.replace(
  /function RootLayout\(\) \{\s+return <Outlet \/>;\s+\}/g,
  `function RootLayout() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>}>
      <Outlet />
    </Suspense>
  );
}`
);

fs.writeFileSync(path, content);
console.log('Done refactoring AppRouter.jsx');

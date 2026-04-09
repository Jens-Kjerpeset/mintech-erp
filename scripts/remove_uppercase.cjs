const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Remove Tailwind 'uppercase' class
      content = content.replace(/\buppercase\s/g, '');
      content = content.replace(/\suppercase\b/g, '');
      content = content.replace(/\buppercase\b/g, '');

      // Clean up multiple spaces that might have formed within class strings
      content = content.replace(/className="([^"]+)"/g, (match, classNames) => {
          return `className="${classNames.replace(/\s+/g, ' ').trim()}"`;
      });
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, classNames) => {
          return `className={\`${classNames.replace(/\s+/g, ' ').trim()}\`}`;
      });

      // Fix specific literal strings
      content = content.replace(/>FAKTURA</g, '>Faktura<');
      content = content.replace(/>TOTAL:</g, '>Total:<');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log("Removing uppercase classes...");
processDir(path.join(__dirname, '../src'));
console.log("Cleanup complete.");

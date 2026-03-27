const fs = require('fs');
const path = require('path');

function balancedReplace(text) {
    let idx = 0;
    while (true) {
        idx = text.indexOf('cn(', idx);
        if (idx === -1) break;
        
        if (idx > 0 && /[a-zA-Z0-9_]/.test(text[idx - 1])) {
            idx++;
            continue;
        }
        
        const start = idx + 3;
        let count = 1;
        let end = start;
        
        while (count > 0 && end < text.length) {
            if (text[end] === '(') count++;
            else if (text[end] === ')') count--;
            end++;
        }
        
        if (count === 0) {
            const inner = text.slice(start, end - 1);
            const replacement = `[${inner}].filter(Boolean).join(" ")`;
            text = text.slice(0, idx) + replacement + text.slice(end);
            idx += replacement.length;
        } else {
            idx++;
        }
    }
    return text;
}

function processDirectory(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            count += processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(/import\s+\{\s*cn\s*\}\s+from\s+['"]@\/lib\/utils['"]\s*;?[ \t]*\r?\n?/g, '');
            newContent = balancedReplace(newContent);
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Refactored: ${fullPath}`);
                count++;
            }
        }
    }
    return count;
}

const total = processDirectory(path.join(process.cwd(), 'src'));
console.log(`Total files refactored: ${total}`);

const fs = require('fs');
const path = require('path');
const CWD = process.cwd();

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (path.extname(file) === '.html') {
      results.push(filePath);
    }
  });
  return results;
}

const htmlFiles = walkDir(CWD);
htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Remove Tailwind CDN script tags (handles variations with defer, integrity, etc.)
  content = content.replace(/<script\b[^<]*(?<!\s*src=["'']https:\/\/cdn\.tailwindcss\.com[^<]*["''][^<]*)><\/script>/gi, '');
  content = content.replace(/<script[^>]*src=["']https:\/\/cdn\.tailwindcss\.com[^>]*><\/script>/gi, '');
  // Remove tw-config.js script tags
  content = content.replace(/<script[^>]*src=["']js\/tw-config\.js["'][^>]*><\/script>/gi, '');
  // Add tailwind.css link if not present
  if (!content.includes('css/tailwind.css')) {
    // Try to insert after Google Fonts link
    const fontsPattern = /https:\/\/fonts\.googleapis\.com\/css2[^<"]*["']\s*rel=["']stylesheet["']/i;
    const fontsMatch = content.match(fontsPattern);
    if (fontsMatch) {
      const insertPos = content.indexOf(fontsMatch[0]) + fontsMatch[0].length;
      content = content.slice(0, insertPos) + '\n    <link rel="stylesheet" href="css/tailwind.css">' + content.slice(insertPos);
    } else {
      // Fallback: insert before </head>
      const headIndex = content.toLowerCase().indexOf('</head>');
      if (headIndex > -1) {
        content = content.slice(0, headIndex) + '\n    <link rel="stylesheet" href="css/tailwind.css">' + content.slice(headIndex);
      }
    }
  }
  fs.writeFileSync(file, content);
  console.log(`Updated ${path.relative(CWD, file)}`);
});
console.log('All HTML files updated for local Tailwind CSS.');

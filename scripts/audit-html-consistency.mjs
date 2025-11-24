import fs from 'fs';
import path from 'path';

// Canonical baseline expectations
const baseline = {
  css: ['design-tokens.css', 'components.css', 'main.css'],
  scripts: ['component-loader.js', 'accessibility-enhanced.js'],
  meta: ['<meta name="description"', '<link rel="canonical"'],
  headerMarker: ['<div id="header-container">', '<header'],
  footerMarker: ['<div id="footer-container">', '<footer']
};

// Files that should be excluded from certain checks
const excludeFromHeaderFooterChecks = [
  'components/header.html',
  'components/footer.html',
  'footer-template.html',
  'header-template.html',
  '404.html'  // Error pages should be standalone for fast loading
];

// Utility: walk directory tree
function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (entry.endsWith('.html')) results.push(full);
  }
  return results;
}

// Audit a single file
function auditFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const diffs = [];
  const fileName = path.basename(filePath);

  // Check header/footer (exclude certain special files)
  const shouldCheckHeaderFooter = !excludeFromHeaderFooterChecks.includes(fileName);
  if (shouldCheckHeaderFooter) {
    if (!baseline.headerMarker.some(m => html.includes(m))) {
      diffs.push('❌ Missing header include');
    }
    if (!baseline.footerMarker.some(m => html.includes(m))) {
      diffs.push('❌ Missing footer include');
    }
  }

  // Check CSS includes
  baseline.css.forEach(css => {
    if (!html.includes(css)) diffs.push(`❌ Missing CSS: ${css}`);
  });

  // Check scripts (only for component/template pages)
  if (!excludeFromHeaderFooterChecks.includes(fileName)) {
    baseline.scripts.forEach(js => {
      if (!html.includes(js)) diffs.push(`❌ Missing script: ${js}`);
    });
  }

  // Check meta tags
  baseline.meta.forEach(tag => {
    if (!html.includes(tag)) diffs.push(`❌ Missing meta: ${tag}`);
  });

  // Accessibility (skip for error pages and templates)
  if (!html.includes('skip-to-content') &&
      !excludeFromHeaderFooterChecks.includes(fileName)) {
    diffs.push('⚠️ Missing skip-to-content link for accessibility');
  }

  return {
    file: fileName,
    passed: diffs.length === 0,
    diffs
  };
}

// Run audit
const files = walk('.');
const report = files.map(f => auditFile(f));
fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
console.log('✅ Audit complete. See audit-report.json');

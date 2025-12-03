#!/usr/bin/env node

/**
 * Link Audit Script
 * Validates all internal links in the build output
 * Fails build if broken links are detected
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIST_DIR = './dist';
const BASE_URL = 'https://properties4creations.com';

// Main audit function
async function auditLinks() {
  console.log('🔍 Starting link audit...');

  try {
    const htmlFiles = findHtmlFiles(DIST_DIR);
    console.log(`📄 Found ${htmlFiles.length} HTML files to audit`);

    let brokenLinksFound = false;

    for (const file of htmlFiles) {
      const fileBrokenLinks = await auditHtmlFile(file);
      if (fileBrokenLinks.length > 0) {
        brokenLinksFound = true;
        console.error(`❌ Broken links found in ${file}:`);
        fileBrokenLinks.forEach(link => {
          console.error(`   - ${link.href} (${link.element} at line ${link.line})`);
        });
      }
    }

    if (brokenLinksFound) {
      console.error('❌ Link audit failed: Broken links detected');
      process.exit(1);
    }

    console.log('✅ Link audit passed: All links are valid');
    process.exit(0);

  } catch (error) {
    console.error('💥 Link audit error:', error.message);
    process.exit(1);
  }
}

// Find all HTML files in dist directory
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (item.endsWith('.html') && !item.startsWith('_')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Audit single HTML file
async function auditHtmlFile(filePath) {
  console.log(`📖 Auditing: ${filePath}`);
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const links = Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({
      element: 'a',
      href: a.getAttribute('href'),
      text: a.textContent.trim(),
      line: getLineNumber(html, a)
    }));

  const images = Array.from(document.querySelectorAll('img[src]'))
    .map(img => ({
      element: 'img',
      href: img.getAttribute('src'),
      alt: img.getAttribute('alt') || '',
      line: getLineNumber(html, img)
    }));

  const scripts = Array.from(document.querySelectorAll('script[src]'))
    .map(script => ({
      element: 'script',
      href: script.getAttribute('src'),
      line: getLineNumber(html, script)
    }));

  const styles = Array.from(document.querySelectorAll('link[href]'))
    .map(link => ({
      element: 'link',
      href: link.getAttribute('href'),
      rel: link.getAttribute('rel'),
      line: getLineNumber(html, link)
    }));

  const allLinks = [...links, ...images, ...scripts, ...styles];
  const brokenLinks = [];

  for (const link of allLinks) {
    if (!link.href || link.href.startsWith('#') || link.href.startsWith('javascript:') ||
        link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
      continue;
    }

    if (isBrokenLink(link.href)) {
      brokenLinks.push(link);
    }
  }

  return brokenLinks;
}

// Simple link validation
function isBrokenLink(href) {
  // Check for common broken link patterns
  if (!href || href.trim() === '') return true;

  // Check if internal link exists (simple file existence check)
  if (href.startsWith('/') && !href.startsWith('//')) {
    const filePath = path.join(DIST_DIR, href.replace(/^\/+/, ''));
    if (!fs.existsSync(filePath)) {
      return true;
    }
  }

  return false;
}

// Get line number of element in HTML
function getLineNumber(html, element) {
  const outerHTML = element.outerHTML;
  const lines = html.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(outerHTML)) {
      return i + 1;
    }
  }
  return 'unknown';
}

// Run the audit
auditLinks();

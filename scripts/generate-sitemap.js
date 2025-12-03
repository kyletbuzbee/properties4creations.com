const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://properties4creations.com';

// Static pages that should be in sitemap
const staticPages = [
    '',
    '/about/',
    '/projects/',
    '/gallery/',
    '/contact/',
    '/get-started/',
    '/impact/',
    '/resources/',
    '/privacy/',
    '/terms/',
    '/thank-you/',
    '/transparency/'
];

function generateSitemap(pages, properties) {
    const today = new Date().toISOString().split('T')[0];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${SITE_URL}${page}</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
    });

    // Add property pages
    if (properties) {
        Object.keys(properties).forEach(key => {
            const property = properties[key];
            if (property.link) {
                sitemap += '  <url>\n';
                sitemap += `    <loc>${SITE_URL}${property.link}</loc>\n`;
                sitemap += `    <lastmod>${today}</lastmod>\n`;
                sitemap += '    <changefreq>monthly</changefreq>\n';
                sitemap += '    <priority>0.9</priority>\n';
                sitemap += '  </url>\n';
            }
        });
    }

    sitemap += '</urlset>';

    return sitemap;
}

function generateRobotsTxt() {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /_includes/
Disallow: /_data/

# Crawl delay for respectful crawling
Crawl-delay: 1
`;
}

async function main() {
    try {
        // Load properties data
        let properties = {};
        try {
            properties = JSON.parse(fs.readFileSync('src/_data/properties.json', 'utf8'));
        } catch (e) {
            console.warn('Could not load properties data, generating sitemap without properties');
        }

        // Generate sitemap
        const sitemap = generateSitemap(staticPages, properties);

        // Write sitemap to dist
        fs.mkdirSync('dist', { recursive: true });
        fs.writeFileSync('dist/sitemap.xml', sitemap);

        console.log('✅ Generated: dist/sitemap.xml');

        // Generate robots.txt
        const robotsTxt = generateRobotsTxt();
        fs.writeFileSync('dist/robots.txt', robotsTxt);

        console.log('✅ Generated: dist/robots.txt');

    } catch (error) {
        console.error('❌ Error generating SEO files:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateSitemap, generateRobotsTxt };

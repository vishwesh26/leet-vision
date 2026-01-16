const fs = require('fs');
const path = require('path');

// Paths
const PROBLEMS_PATH = path.join(__dirname, '../server/data/problems.json');
const SITEMAP_PATH = path.join(__dirname, '../client/public/sitemap.xml');

// Base URL
const BASE_URL = 'https://leet-vision.vercel.app';

// Static Routes
const staticRoutes = [
    { loc: '/', priority: '1.0' },
    { loc: '/top-100-leetcode', priority: '0.9' },
    { loc: '/blind-75', priority: '0.9' },
    { loc: '/leetcode-easy', priority: '0.8' },
    { loc: '/leetcode-medium', priority: '0.8' },
    { loc: '/leetcode-hard', priority: '0.8' },
    { loc: '/topics/array', priority: '0.7' },
    { loc: '/topics/string', priority: '0.7' },
    { loc: '/topics/Dynamic%20Programming', priority: '0.7' },
    { loc: '/topics/tree', priority: '0.7' },
    { loc: '/topics/graph', priority: '0.7' },
    { loc: '/company-questions', priority: '0.8' },
    { loc: '/progress', priority: '0.7' },
    { loc: '/interview-roadmap', priority: '0.7' },
    { loc: '/daily', priority: '0.6' },
    { loc: '/saved', priority: '0.6' }
];

const generateSitemap = () => {
    try {
        console.log('Reading problems from:', PROBLEMS_PATH);
        const problems = JSON.parse(fs.readFileSync(PROBLEMS_PATH, 'utf-8'));
        
        const today = new Date().toISOString().split('T')[0];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add Static Routes
        staticRoutes.forEach(route => {
            xml += `
  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <priority>${route.priority}</priority>
  </url>`;
        });

        // Add Dynamic Problem Routes (Video Pages)
        problems.forEach(problem => {
            // Using /search/:id as the main video page
            xml += `
  <url>
    <loc>${BASE_URL}/search/${problem.id}</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`✅ Sitemap generated at ${SITEMAP_PATH} with ${problems.length + staticRoutes.length} URLs.`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    }
};

generateSitemap();

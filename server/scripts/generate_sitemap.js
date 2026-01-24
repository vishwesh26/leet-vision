const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = 'https://leet-vision.vercel.app';
const PUBLIC_DIR = path.join(__dirname, '../../client/public');
const SITEMAP_PATH = path.join(PUBLIC_DIR, 'sitemap.xml');

// Define Schemas (Re-defining for standalone script)
const articleSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    publishedDate: { type: Date, default: Date.now }
});

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

const STATIC_PAGES = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/top-100-leetcode', priority: '0.9', changefreq: 'weekly' },
    { url: '/blind-75', priority: '0.9', changefreq: 'weekly' },
    { url: '/leetcode-easy', priority: '0.8', changefreq: 'weekly' },
    { url: '/leetcode-medium', priority: '0.8', changefreq: 'weekly' },
    { url: '/leetcode-hard', priority: '0.8', changefreq: 'weekly' },
    { url: '/topics/array', priority: '0.7', changefreq: 'monthly' },
    { url: '/topics/string', priority: '0.7', changefreq: 'monthly' },
    { url: '/topics/Dynamic%20Programming', priority: '0.7', changefreq: 'monthly' },
    { url: '/topics/tree', priority: '0.7', changefreq: 'monthly' },
    { url: '/topics/graph', priority: '0.7', changefreq: 'monthly' },
    { url: '/company-questions', priority: '0.8', changefreq: 'monthly' },
    { url: '/interview-roadmap', priority: '0.7', changefreq: 'monthly' },
    { url: '/daily', priority: '0.6', changefreq: 'daily' },
    { url: '/daily-tech', priority: '0.9', changefreq: 'daily' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/how-it-works', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' }
];

async function generateSitemap() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        console.log('Fetching dynamic articles...');
        const articles = await Article.find({}, 'slug publishedDate').sort({ publishedDate: -1 });

        // Fetch Problems (from JSON file as source of truth for IDs)
        const problemsPath = path.join(__dirname, '../data/problems.json');
        let problems = [];
        try {
            const problemsData = fs.readFileSync(problemsPath, 'utf8');
            problems = JSON.parse(problemsData);
        } catch (e) {
            console.error('Warning: Could not load problems.json for sitemap');
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // 1. Add Static Pages
        STATIC_PAGES.forEach(page => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
            xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        // 2. Add Blog/News Articles
        articles.forEach(article => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}/blog/${article.slug}</loc>\n`;
            xml += `    <lastmod>${new Date(article.publishedDate).toISOString().split('T')[0]}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        });

        // 3. Add Hardcoded Blog Posts (from BlogPost.jsx equivalent)
        const hardcodedSlugs = ['coding-interview-prep-guide', 'leetcode-patterns-vs-memorization', 'how-to-use-leetvision-effectively'];
        hardcodedSlugs.forEach(slug => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}/blog/${slug}</loc>\n`;
            xml += `    <lastmod>2026-01-24</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
        });

        // 4. Add Problem Search Pages (Optional but good for indexing search queries if they provide value)
        // Only add top problems or a subset if too many
        problems.slice(0, 1000).forEach(prob => {
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}/search/${prob.id}</loc>\n`;
            xml += `    <lastmod>2026-01-16</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += '</urlset>';

        // Ensure directory exists
        const dir = path.dirname(SITEMAP_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(SITEMAP_PATH, xml);
        console.log(`Sitemap generated successfully at ${SITEMAP_PATH}`);

    } catch (err) {
        console.error('Error generating sitemap:', err);
    } finally {
        await mongoose.disconnect();
    }
}

generateSitemap();

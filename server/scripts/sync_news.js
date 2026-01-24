const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');
const { execSync } = require('child_process');

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const NEWS_API_KEY = process.env.NEWS_API_KEY; // Optional: fallback to RSS if missing

if (!GEMINI_API_KEY || !MONGODB_URI) {
    console.error('Missing required environment variables (GEMINI_API_KEY, MONGODB_URI)');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define Schema (Re-defining here for standalone script use)
const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: String,
    content: String,
    category: String,
    publishedDate: { type: Date, default: Date.now },
    source: String,
    originalLink: String,
    createdAt: { type: Date, default: Date.now }
});

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

async function rewriteArticle(rawArticle) {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    You are a professional tech journalist and developer advocate. 
    Rewrite the following tech news into a long-form, original article (800-1200 words) suitable for software developers and students.
    
    Raw News Data:
    Title: ${rawArticle.title}
    Source: ${rawArticle.source.name || rawArticle.source}
    Summary: ${rawArticle.description || rawArticle.content}
    Link: ${rawArticle.url}

    Requirements:
    1. AI Content Policy: Ensure the content is completely original and adds significant value.
    2. Structure: 
        - Engaging Title (original)
        - Catchy Summary (2-3 sentences)
        - Detailed Introduction
        - Body with multiple subheadings (e.g., "The Technical Impact", "What this means for Developers", "Industry Trends")
        - Conclusion
    3. Context: Specifically mention how this news affects software engineers, hiring trends, or coding interview preparation if applicable.
    4. Quality: Avoid thin content. Write at least 800 words.
    5. Formatting: Return the response as a JSON object with fields: "title", "summary", "content" (HTML formatted), and "category" (one of: Industry, Jobs, Placements, Startups).

    Rules:
    - Return ONLY valid JSON.
    - Title should be catchy and SEO optimized.
    - Content should use <h3> and <p> tags for structure.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Error rewriting article:', err.message);
        return null;
    }
}

async function fetchNews() {
    // If no API key, use a generic search or RSS (simulated here for now)
    // In a real scenario, you'd use a proper RSS parser or GNews API
    const keywords = ['software engineering', 'tech layoffs', 'developer jobs', 'big tech hiring'];
    const query = keywords.join(' OR ');
    
    if (NEWS_API_KEY) {
        console.log('Fetching from NewsAPI...');
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}&language=en`;
        const res = await axios.get(url);
        return res.data.articles;
    } else {
        console.log('No NEWS_API_KEY found. Fetching from GNews (Free tier or alternate)...');
        // Fallback to a mock or alternate fetch for demonstration
        // For production, the user should provide a key or use an RSS library
        return [];
    }
}

async function sync(closeConnection = true) {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
            console.log('Connected to MongoDB');
        }

        const rawArticles = await fetchNews();
        if (!rawArticles || rawArticles.length === 0) {
            console.log('No new articles found to process.');
            return;
        }

        for (const raw of rawArticles) {
            // Check if already exists by link
            const exists = await Article.findOne({ originalLink: raw.url });
            if (exists) {
                console.log(`Skipping existing article: ${raw.title}`);
                continue;
            }

            console.log(`Processing: ${raw.title}`);
            const rewritten = await rewriteArticle(raw);
            
            if (rewritten) {
                const slug = slugify(rewritten.title, { lower: true, strict: true });
                
                await Article.create({
                    ...rewritten,
                    slug: slug,
                    originalLink: raw.url,
                    source: raw.source.name || raw.source,
                    publishedAt: raw.publishedAt || new Date()
                });
                console.log(`Successfully synced: ${rewritten.title}`);
            }
        }

        // Trigger sitemap generation
        console.log('Sync complete. Regenerating sitemap...');
        try {
            execSync('node scripts/generate_sitemap.js');
            console.log('Sitemap regenerated.');
        } catch (e) {
            console.error('Failed to regenerate sitemap:', e.message);
        }

    } catch (err) {
        console.error('Sync process failed:', err);
    } finally {
        if (closeConnection) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }
}

module.exports = { sync };

// Run standalone if executed directly
if (require.main === module) {
    sync(true);
}

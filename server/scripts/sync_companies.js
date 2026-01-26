const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CompanyQuestion = require('../models/CompanyQuestion');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATA_DIR = path.join(__dirname, '..', '..', 'leetcode-company-wise-problems-main');

if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI in environment variables');
    process.exit(1);
}

// Simple CSV Parser to handle quoted fields (specifically Topics)
function parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function sync() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        if (!fs.existsSync(DATA_DIR)) {
            console.error(`Data directory not found: ${DATA_DIR}`);
            process.exit(1);
        }

        const companies = fs.readdirSync(DATA_DIR).filter(file => {
            const fullPath = path.join(DATA_DIR, file);
            return fs.statSync(fullPath).isDirectory() && !file.startsWith('.');
        });

        // Load Problems Database for slug-to-ID mapping
        let problemsDb = [];
        try {
            problemsDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'problems.json'), 'utf8'));
            console.log(`Loaded ${problemsDb.length} problems for ID mapping.`);
        } catch (err) {
            console.error("Failed to load problems.json for mapping:", err.message);
        }

        const slugToIdMap = {};
        problemsDb.forEach(p => {
            slugToIdMap[p.slug] = p.id;
        });

        console.log(`Found ${companies.length} companies to process`);

        for (const companyName of companies) {
            const csvPath = path.join(DATA_DIR, companyName, '5. All.csv');
            if (!fs.existsSync(csvPath)) {
                console.warn(`No '5. All.csv' found for ${companyName}, skipping...`);
                continue;
            }

            console.log(`Processing ${companyName}...`);
            const content = fs.readFileSync(csvPath, 'utf8');
            const lines = content.split('\n').filter(l => l.trim() !== '');
            const headers = lines[0].split(','); // Difficulty,Title,Frequency,Acceptance Rate,Link,Topics

            const questions = [];
            for (let i = 1; i < lines.length; i++) {
                const values = parseCsvLine(lines[i]);
                if (values.length < 5) continue;

                const [difficulty, title, frequency, acceptanceRate, link, topicsStr] = values;
                
                // Extract Slug from Link
                const urlParts = link.split('/');
                const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
                
                // Map Slug to Numeric ID
                const numericId = slugToIdMap[slug] || slug;

                questions.push({
                    company: companyName,
                    title,
                    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),
                    frequency: parseFloat(frequency) || 0,
                    acceptanceRate: parseFloat(acceptanceRate) * 100 || 0, // Convert to percentage
                    topics: topicsStr ? topicsStr.split(',').map(t => t.trim()) : [],
                    leetcodeUrl: link,
                    questionId: numericId,
                    updatedAt: new Date()
                });
            }

            // Bulk Upsert for this company
            for (const q of questions) {
                await CompanyQuestion.findOneAndUpdate(
                    { company: q.company, leetcodeUrl: q.leetcodeUrl },
                    q,
                    { upsert: true, new: true }
                );
            }
            console.log(`Synced ${questions.length} questions for ${companyName}`);
        }

        console.log('Sync completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Sync failed:', err);
        process.exit(1);
    }
}

sync();

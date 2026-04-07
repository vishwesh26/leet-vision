/**
 * sync_companies_remaining.js
 *
 * This script reads the 4 time-bucketed CSV files (Thirty Days, Three Months,
 * Six Months, More Than Six Months) for every company and inserts ONLY the
 * questions that are NOT already present in the CompanyQuestion collection
 * (i.e., questions already added from the "All.csv" file are skipped via upsert).
 *
 * Usage: node server/scripts/sync_companies_remaining.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CompanyQuestion = require('../models/CompanyQuestion');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATA_DIR = path.join(__dirname, '..', '..', 'leetcode-company-wise-problems-main');

// The 4 files we want to pull from (in addition to All.csv which is already done)
const TARGET_FILES = [
    '1. Thirty Days.csv',
    '2. Three Months.csv',
    '3. Six Months.csv',
    '4. More Than Six Months.csv',
];

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

function parseQuestionsFromCsv(csvPath, companyName, slugToIdMap) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const questions = [];

    for (let i = 1; i < lines.length; i++) { // skip header row
        const values = parseCsvLine(lines[i]);
        if (values.length < 5) continue;

        const [difficulty, title, frequency, acceptanceRate, link, topicsStr] = values;
        if (!link || !title) continue;

        // Extract Slug from Link URL
        const urlParts = link.replace(/\/$/, '').split('/');
        const slug = urlParts[urlParts.length - 1];

        // Map Slug to Numeric ID
        const numericId = slugToIdMap[slug] || slug;

        questions.push({
            company: companyName,
            title,
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase(),
            frequency: parseFloat(frequency) || 0,
            acceptanceRate: parseFloat(acceptanceRate) * 100 || 0,
            topics: topicsStr ? topicsStr.split(',').map(t => t.trim()) : [],
            leetcodeUrl: link.replace(/\/$/, ''), // normalize url (remove trailing slash)
            questionId: numericId,
            updatedAt: new Date(),
        });
    }

    return questions;
}

async function sync() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        if (!fs.existsSync(DATA_DIR)) {
            console.error(`❌ Data directory not found: ${DATA_DIR}`);
            process.exit(1);
        }

        // Load Problems Database for slug-to-ID mapping
        let problemsDb = [];
        try {
            problemsDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'problems.json'), 'utf8'));
            console.log(`📦 Loaded ${problemsDb.length} problems for ID mapping.`);
        } catch (err) {
            console.warn('⚠️  Could not load problems.json for ID mapping:', err.message);
        }

        const slugToIdMap = {};
        problemsDb.forEach(p => {
            slugToIdMap[p.slug] = p.id;
        });

        const companies = fs.readdirSync(DATA_DIR).filter(file => {
            const fullPath = path.join(DATA_DIR, file);
            return fs.statSync(fullPath).isDirectory() && !file.startsWith('.');
        });

        console.log(`🏢 Found ${companies.length} companies to process\n`);

        let totalInserted = 0;
        let totalSkipped = 0;

        for (const companyName of companies) {
            let companyInserted = 0;
            let companySkipped = 0;

            for (const csvFileName of TARGET_FILES) {
                const csvPath = path.join(DATA_DIR, companyName, csvFileName);
                if (!fs.existsSync(csvPath)) continue;

                const questions = parseQuestionsFromCsv(csvPath, companyName, slugToIdMap);

                for (const q of questions) {
                    // updateOne with upsert: if the same (company + url) exists, skip update (don't overwrite existing data).
                    // We use $setOnInsert so only brand-new records get written.
                    const result = await CompanyQuestion.updateOne(
                        { company: q.company, leetcodeUrl: q.leetcodeUrl },
                        { $setOnInsert: q },
                        { upsert: true }
                    );

                    if (result.upsertedCount > 0) {
                        companyInserted++;
                    } else {
                        companySkipped++;
                    }
                }
            }

            if (companyInserted > 0 || companySkipped > 0) {
                console.log(`  ${companyName}: +${companyInserted} new, ${companySkipped} already existed`);
            }
            totalInserted += companyInserted;
            totalSkipped += companySkipped;
        }

        console.log(`\n✅ Sync complete!`);
        console.log(`   🆕 Total new questions inserted: ${totalInserted}`);
        console.log(`   ✅ Total questions already in DB (skipped): ${totalSkipped}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

sync();

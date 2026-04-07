/**
 * sync_new_company_data.js
 *
 * Syncs questions from the new "leetcode-companywise-interview-questions-master" folder.
 * This folder has a DIFFERENT CSV format:
 *   ID,URL,Title,Difficulty,Acceptance %,Frequency %
 *
 * File names (lowercase, hyphenated):
 *   all.csv, thirty-days.csv, three-months.csv, six-months.csv, more-than-six-months.csv
 *
 * Uses $setOnInsert to only insert NEW questions -- never overwrites existing data.
 * Company names are derived from the folder name (converted to Title Case).
 *
 * Usage: node server/scripts/sync_new_company_data.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CompanyQuestion = require('../models/CompanyQuestion');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATA_DIR = path.join(
    __dirname, '..', '..',
    'leetcode-companywise-interview-questions-master',
    'leetcode-companywise-interview-questions-master'
);

const TARGET_FILES = [
    'all.csv',
    'thirty-days.csv',
    'three-months.csv',
    'six-months.csv',
    'more-than-six-months.csv',
];

if (!MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in environment variables');
    process.exit(1);
}

/**
 * Convert a hyphenated folder name to a readable company name.
 * e.g. "goldman-sachs" → "Goldman Sachs"
 *      "j-p-morgan"    → "J P Morgan"
 */
function folderToCompanyName(folderName) {
    return folderName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Simple CSV parser that handles quoted fields.
 * New format: ID,URL,Title,Difficulty,Acceptance %,Frequency %
 */
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

/**
 * Parse a CSV file with the new format.
 * Returns an array of question objects for the given company.
 */
function parseNewFormatCsv(csvPath, companyName) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim() !== '');
    const questions = [];

    for (let i = 1; i < lines.length; i++) { // skip header
        const values = parseCsvLine(lines[i]);
        // Format: ID,URL,Title,Difficulty,Acceptance %,Frequency %
        if (values.length < 5) continue;

        const [id, url, title, difficulty, acceptancePct, frequencyPct] = values;
        if (!url || !title || !id) continue;

        // Normalize URL (remove trailing slash)
        const leetcodeUrl = url.replace(/\/$/, '');

        // Parse acceptance (e.g. "47.9%") → 47.9
        const acceptanceRate = parseFloat(acceptancePct?.replace('%', '')) || 0;

        // Parse frequency (e.g. "75.0%") → 75.0
        const frequency = parseFloat(frequencyPct?.replace('%', '')) || 0;

        // Normalize difficulty to Title Case
        const diff = difficulty?.trim();
        const normalizedDiff = diff ? diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase() : 'Unknown';

        questions.push({
            company: companyName,
            title: title.trim(),
            difficulty: normalizedDiff,
            frequency,
            acceptanceRate,
            topics: [], // This source doesn't provide topics
            leetcodeUrl,
            questionId: String(id).trim(),
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

        const companies = fs.readdirSync(DATA_DIR).filter(file => {
            const fullPath = path.join(DATA_DIR, file);
            return fs.statSync(fullPath).isDirectory() && !file.startsWith('.');
        });

        console.log(`🏢 Found ${companies.length} companies to process\n`);

        let totalInserted = 0;
        let totalSkipped = 0;

        for (const folderName of companies) {
            const companyName = folderToCompanyName(folderName);
            let companyInserted = 0;
            let companySkipped = 0;

            for (const csvFileName of TARGET_FILES) {
                const csvPath = path.join(DATA_DIR, folderName, csvFileName);
                if (!fs.existsSync(csvPath)) continue;

                let questions;
                try {
                    questions = parseNewFormatCsv(csvPath, companyName);
                } catch (err) {
                    console.warn(`  ⚠️  Failed to parse ${csvFileName} for ${companyName}: ${err.message}`);
                    continue;
                }

                for (const q of questions) {
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
        console.log(`   ✅ Total already in DB (skipped): ${totalSkipped}`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

sync();

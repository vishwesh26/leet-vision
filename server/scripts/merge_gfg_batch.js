const fs = require('fs');
const path = require('path');

const masterListPath = path.join(__dirname, 'gfg_master_list.js');
const rawBatchPath = path.join(__dirname, 'raw_batch_array.txt');

// Helper to format title from slug
const formatTitle = (slug) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const mergeBatch = () => {
    try {
        // 1. Load Existing Master List
        let masterList = [];
        if (fs.existsSync(masterListPath)) {
            masterList = require(masterListPath);
            console.log(`Loaded ${masterList.length} existing questions from master list.`);
        } else {
            console.log('No existing master list found. Creating new.');
        }

        // 2. Load New Batch
        if (!fs.existsSync(rawBatchPath)) {
            console.error('Raw batch file not found!');
            return;
        }
        const rawContent = fs.readFileSync(rawBatchPath, 'utf-8');
        const newLinks = rawContent.split('\n').map(line => line.trim()).filter(line => line.startsWith('http'));
        console.log(`Loaded ${newLinks.length} potential new links.`);

        let addedCount = 0;
        let skippedCount = 0;

        // 3. Process and Merge
        newLinks.forEach(url => {
            // Check if URL already exists in master list
            const exists = masterList.some(q => q.url === url);
            if (exists) {
                skippedCount++;
                return;
            }

            // Extract logic (same as generate_master.js)
            let slug = '';
            if (url.includes('/dsa/')) {
                const parts = url.split('/dsa/');
                if (parts[1]) slug = parts[1].replace(/\/$/, '');
            } else if (url.includes('/problems/')) {
                const parts = url.split('/problems/');
                if (parts[1]) slug = parts[1].split('/')[0];
            }

            if (!slug) slug = 'Unknown Title';

            masterList.push({
                title: formatTitle(slug),
                url: url
            });
            addedCount++;
        });

        // 4. Save Updated Master List
        const fileContent = `module.exports = ${JSON.stringify(masterList, null, 4)};\n`;
        fs.writeFileSync(masterListPath, fileContent);

        console.log(`\nMerge Complete!`);
        console.log(`Added: ${addedCount}`);
        console.log(`Skipped (Already Existed): ${skippedCount}`);
        console.log(`Total Master List Size: ${masterList.length}`);

    } catch (err) {
        console.error('Merge failed:', err);
    }
};

mergeBatch();

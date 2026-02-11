const fs = require('fs');
const path = require('path');

const rawLinksPath = path.join(__dirname, 'raw_links.txt');
const outputPath = path.join(__dirname, 'gfg_master_list.js');

const rawContent = fs.readFileSync(rawLinksPath, 'utf-8');
const links = rawContent.split('\n').map(line => line.trim()).filter(line => line.startsWith('http'));

const uniqueLinks = [...new Set(links)];

const formatTitle = (slug) => {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const masterList = uniqueLinks.map(url => {
    // Extract slug from URL
    // URL formats:
    // https://www.geeksforgeeks.org/dsa/SLUG/
    // https://www.geeksforgeeks.org/problems/SLUG/1
    
    let slug = '';
    if (url.includes('/dsa/')) {
        const parts = url.split('/dsa/');
        if (parts[1]) {
            slug = parts[1].replace(/\/$/, '');
        }
    } else if (url.includes('/problems/')) {
        const parts = url.split('/problems/');
        if (parts[1]) {
            slug = parts[1].split('/')[0];
        }
    }

    // Fallback if slug extraction fails
    if (!slug) {
         slug = 'Unknown Title';
    }

    // Clean up slug for title
    // remove trailing numbers if they look like IDs (e.g. 4618 from search-in-a-rotated-array4618)
    // simplistic approach: just use the slug properties
    
    return {
        title: formatTitle(slug),
        url: url
    };
});

const fileContent = `module.exports = ${JSON.stringify(masterList, null, 4)};\n`;

fs.writeFileSync(outputPath, fileContent);
console.log(`Generated master list with ${masterList.length} entries.`);

const axios = require('axios');

const testSlugs = [
    'maximum-product-cutting',
    'missing-number-in-array',
    'detect-loop-in-linked-list'
];

async function testRedirects() {
    for (const slug of testSlugs) {
        const url = `https://www.geeksforgeeks.org/problems/${slug}/1`;
        try {
            const res = await axios.get(url, { maxRedirects: 5 });
            console.log(`URL: ${url} -> Status: ${res.status}, Final URL: ${res.request.res.responseUrl}`);
        } catch (err) {
            console.log(`URL: ${url} -> Error: ${err.message}`);
        }
    }
}

testRedirects();

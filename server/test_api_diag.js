const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const testYoutubeAPI = async () => {
    const key = process.env.YOUTUBE_API_KEY;
    const query = 'LeetCode 1 solution';
    console.log('Testing Key:', key ? 'FOUND' : 'MISSING');
    
    try {
        const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 1, key: key }
        });
        console.log('Success! API is working.');
        console.log('First Result:', res.data.items[0].snippet.title);
    } catch (err) {
        console.error('API Error Detected!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
            
            const reason = err.response.data?.error?.errors?.[0]?.reason;
            const message = err.response.data?.error?.message;
            console.log('\n--- DIAGNOSIS ---');
            if (reason === 'quotaExceeded') {
                console.log('RESULT: Your daily YouTube API quota is EXCEEDED.');
            } else if (reason === 'keyInvalid') {
                console.log('RESULT: Your API Key is INVALID.');
            } else if (reason === 'forbidden' || reason === 'accessNotConfigured') {
                console.log('RESULT: API is either not enabled in Cloud Console, or has IP/Referer restrictions.');
            } else {
                console.log('RESULT:', message);
            }
        } else {
            console.error('Error:', err.message);
        }
    }
};

testYoutubeAPI();

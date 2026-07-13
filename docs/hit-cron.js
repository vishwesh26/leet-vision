async function testCron() {
    console.log('Fetching cron API...');
    try {
        const res = await fetch('http://localhost:3000/docs/api/cron/daily-release?secret=leet_vision_secret_cron_key_123');
        const text = await res.text();
        console.log('Status:', res.status);
        try {
            console.log('Response:', JSON.stringify(JSON.parse(text), null, 2));
        } catch(e) {
            console.log('Raw Response:', text);
        }
    } catch(err) {
        console.error('Fetch Error:', err);
    }
}
testCron();

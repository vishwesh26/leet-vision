import http from 'http';

async function testPort(port) {
  return new Promise((resolve) => {
    http.get(`http://localhost:${port}/api/cron/generate?topic=complexity-analysis&subtopic=time-complexity&secret=leet_vision_secret_cron_key_123`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      resolve(null);
    });
  });
}

(async () => {
  console.log("Starting generation trigger...");
  for (let p of [3000, 3001, 3002, 3003]) {
    console.log("Trying port", p);
    const res = await testPort(p);
    if (res && (res.status === 200 || res.status === 400 || res.status === 500)) {
       console.log("SUCCESS on port", p, "Response:", res.data);
       return;
    }
  }
  console.log("Not found");
})();

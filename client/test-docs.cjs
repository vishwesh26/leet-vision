const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log('BROWSER CONSOLE:', msg.type(), msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('BROWSER PAGE ERROR:', error.message);
  });
  
  page.on('requestfailed', request => {
    console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  console.log('Navigating to http://localhost:3000/docs ...');
  await page.goto('http://localhost:3000/docs', { waitUntil: 'networkidle0' });
  
  console.log('Done waiting. Closing.');
  await browser.close();
})();

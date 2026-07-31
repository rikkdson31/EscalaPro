import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on the Timeline tab in the bottom nav
  // Based on TopBar/BottomNav, it's probably an a or button with href="/timeline" or similar.
  // Wait, React Router might be used? Let's check how navigation is done.
  const tabs = await page.$$('button');
  for (const tab of tabs) {
    const text = await page.evaluate(el => el.textContent, tab);
    if (text.includes('Timeline')) {
      console.log('Clicking Timeline tab');
      await tab.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();

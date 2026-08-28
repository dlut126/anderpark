import { chromium } from 'playwright';

const SHOT_DIR = '/private/tmp/claude-501/-Users-danielluttway/a5bcf0f6-7391-4efd-ba03-585f89c07983/scratchpad';
const consoleErrors = [];
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
const page = await context.newPage();
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
page.on('requestfailed', (req) => consoleErrors.push(`requestfailed: ${req.url()}`));

await page.goto('https://dlut126.github.io/anderpark/');
await page.waitForSelector('text=Create Your Character', { timeout: 15000 });
await page.screenshot({ path: `${SHOT_DIR}/live-site-onboarding.png` });

await page.click('img[alt="Octopus"]');
await page.fill('input[placeholder="Give your character a name"]', 'LiveTest');
await page.click('button:has-text("Next")');
await page.waitForSelector('text=What are you working on?');
await page.click('button:has-text("Eat healthier")');
await page.click('button:has-text("Next")');
await page.waitForSelector('text=Goal 1 of 1');
await page.click('button:has-text("Cooked a real meal")');
await page.click('button:has-text("Bring them to life")');
await page.waitForSelector('text=Level 1', { timeout: 5000 });
await page.screenshot({ path: `${SHOT_DIR}/live-site-character-created.png` });

console.log('Live site onboarding + character creation worked: true');
console.log('CONSOLE_ERRORS/FAILED_REQUESTS:', JSON.stringify(consoleErrors, null, 2));
await browser.close();

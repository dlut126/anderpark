// Regenerates resources/icon.png, splash.png, and splash-dark.png from
// scripts/icon-source.html (which composites the in-game pet sprites over a
// pixel-park background). Needs Playwright, which isn't a project dependency
// since this only runs occasionally: `npm install --no-save playwright` first,
// then `node scripts/generate-icons.mjs` from the project root, then
// `npx capacitor-assets generate` to push the results into ios/ and android/.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, '..');

mkdirSync(join(projectRoot, 'resources'), { recursive: true });

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const fileUrl = 'file://' + join(scriptDir, 'icon-source.html');

async function shoot({ size, className, out }) {
  await page.setViewportSize({ width: size, height: size });
  await page.goto(fileUrl);
  await page.evaluate(
    ({ className, size }) => {
      const stage = document.getElementById('stage');
      stage.className = `canvas ${className}`;
      if (size > 1024) stage.classList.add('splash');
    },
    { className, size },
  );
  await page.waitForTimeout(50);
  await page.screenshot({ path: out });
}

await shoot({ size: 1024, className: 'light', out: join(projectRoot, 'resources/icon.png') });
await shoot({ size: 2732, className: 'light', out: join(projectRoot, 'resources/splash.png') });
await shoot({ size: 2732, className: 'dark', out: join(projectRoot, 'resources/splash-dark.png') });

await browser.close();
console.log('done');

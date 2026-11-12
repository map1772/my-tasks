import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const output = path.resolve('screenshots');
const viewports = [
  { name: 'mobile-320', width: 320, height: 760 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1100 },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: edge, headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(output, `${viewport.name}.png`),
      fullPage: true,
    });

    if (viewport.name === 'mobile-390' || viewport.name === 'desktop') {
      await page.getByRole('button', { name: /Завершить дизайн-концепцию проекта/ }).click();
      await page.getByRole('dialog').waitFor();
      await page.evaluate(() =>
        Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
      );
      await page.screenshot({
        path: path.join(output, `${viewport.name}-detail.png`),
        fullPage: false,
      });
      await page.getByRole('dialog').getByRole('button', { name: 'Редактировать' }).click();
      await page.getByRole('dialog').getByRole('textbox', { name: 'Название' }).waitFor();
      await page.evaluate(() =>
        Promise.all(document.getAnimations().map((animation) => animation.finished.catch(() => undefined))),
      );
      await page.screenshot({
        path: path.join(output, `${viewport.name}-edit.png`),
        fullPage: false,
      });
    }

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    console.log(`${viewport.name}: ${dimensions.clientWidth}/${dimensions.scrollWidth}`);
    await page.close();
  }
} finally {
  await browser.close();
}

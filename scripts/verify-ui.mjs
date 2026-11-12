import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await chromium.launch({ executablePath: edge, headless: true });
const errors = [];

const trackErrors = (page) => {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
};

const readDimensions = (page) =>
  page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));

try {
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await mobileContext.newPage();
  trackErrors(page);
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

  const initialDimensions = await readDimensions(page);
  assert.equal(initialDimensions.scroll, initialDimensions.client, 'mobile page must not overflow horizontally');

  const input = page.getByRole('textbox', { name: 'Новая задача' });
  await input.fill('Проверить production');
  await input.press('Enter');
  const task = page.getByRole('button', { name: /Проверить production\. В работе/ });
  await task.waitFor();
  assert.equal(await input.inputValue(), '');

  await task.focus();
  await task.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  await dialog.getByRole('button', { name: 'Редактировать' }).click();
  await dialog.getByRole('textbox', { name: 'Название' }).fill('Проверить production на Vercel');
  await dialog.getByRole('textbox', { name: 'Описание' }).fill('Проверить сборку, маршруты и адаптивность');
  await dialog.getByLabel('Срок').fill('2026-11-18');
  await dialog.getByRole('button', { name: 'Сохранить' }).click();
  await dialog.getByRole('heading', { name: 'Проверить production на Vercel' }).waitFor();
  await dialog.getByText('Проверить сборку, маршруты и адаптивность').waitFor();

  await dialog.getByRole('button', { name: 'Выполнить' }).click();
  await dialog.getByRole('button', { name: 'Вернуть в работу' }).waitFor();
  await page.getByLabel('Прогресс: 60%').waitFor();
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden' });
  assert.match(
    await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? ''),
    /Проверить production на Vercel/,
  );

  await page.reload({ waitUntil: 'networkidle' });
  const completedTask = page.getByRole('button', {
    name: /Проверить production на Vercel\. Выполнено/,
  });
  await completedTask.waitFor();

  const firstCard = page.locator('.task-folder-card').first();
  await page.locator('.task-folder-frame').nth(1).scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.notEqual(await firstCard.evaluate((element) => getComputedStyle(element).transform), 'none');

  await completedTask.click();
  await page.getByRole('dialog').getByRole('button', { name: 'Удалить' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(await page.getByRole('button', { name: /Проверить production на Vercel/ }).count(), 0);
  await mobileContext.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const desktopPage = await desktopContext.newPage();
  trackErrors(desktopPage);
  await desktopPage.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  const desktopDimensions = await readDimensions(desktopPage);
  assert.equal(desktopDimensions.scroll, desktopDimensions.client, 'desktop page must not overflow horizontally');
  await desktopPage.getByRole('button', { name: /Завершить дизайн-концепцию проекта/ }).click();
  await desktopPage.getByRole('dialog').waitFor();
  await desktopPage.keyboard.press('Escape');
  await desktopPage.getByRole('dialog').waitFor({ state: 'hidden' });
  await desktopContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 430, height: 932 },
    reducedMotion: 'reduce',
  });
  const reducedPage = await reducedContext.newPage();
  trackErrors(reducedPage);
  await reducedPage.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  const reducedCard = reducedPage.locator('.task-folder-card').first();
  await reducedPage.locator('.task-folder-frame').nth(1).scrollIntoViewIfNeeded();
  await reducedPage.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  assert.equal(
    await reducedCard.evaluate((element) => getComputedStyle(element).transform),
    'none',
    'folder stack must stay static with reduced motion',
  );
  await reducedContext.close();

  assert.deepEqual(errors, [], `browser console errors: ${errors.join('\n')}`);
  console.log('Browser verification passed: folders, detail view, editing, persistence, focus, sticky stack, reduced motion, responsive overflow');
} finally {
  await browser.close();
}

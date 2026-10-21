import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PAGE_URL = pathToFileURL(
  path.resolve(process.cwd(), 'src/main.html')
).href;

const DEFINED_RANKS = ['大吉', '中吉', '小吉', '吉', '凶'];

test.describe('うちちみくじサイト', () => {

  /* 1. ページが正常に表示される */
  test('1. ページが正常に表示される', async ({ page }) => {
    await page.goto(PAGE_URL);

    await expect(page).toHaveTitle(/うちちみくじ/);
    await expect(page.locator('#site-title')).toHaveText('うちちみくじ');
    await expect(page.locator('#draw-button')).toBeVisible();
    await expect(page.locator('.placeholder')).toBeVisible();
    await expect(page.locator('#stage')).toBeHidden();
  });

  /* 2. 抽選ボタンで結果が表示される */
  test('2. 抽選ボタンで結果が表示される', async ({ page }) => {
    await page.goto(PAGE_URL);

    await page.click('#draw-button');
    await expect(page.locator('#drawing')).toBeVisible();

    await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#result-rank')).not.toBeEmpty();
    await expect(page.locator('#result-message')).not.toBeEmpty();
    await expect(page.locator('#again-button')).toBeVisible();
  });

  /* 3. 結果が定義済みのおみくじのいずれかである */
  test('3. 結果が定義済みのおみくじのいずれかである', async ({ page }) => {
    await page.addInitScript(() => { Math.random = () => 0.01; }); // index 0 = 大吉
    await page.goto(PAGE_URL);

    await page.click('#draw-button');
    await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#result-rank')).toHaveText('大吉');

    const defined = await page.evaluate(() => window.omikuji.results.map(r => r.rank));
    expect(defined.sort()).toEqual([...DEFINED_RANKS].sort());

    const shown = await page.locator('#result').getAttribute('data-rank');
    expect(DEFINED_RANKS).toContain(shown);
  });

  /* 4. 再抽選できる */
  test('4. 再抽選できる', async ({ page }) => {
    await page.goto(PAGE_URL);

    await page.click('#draw-button');
    await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });
    const first = (await page.locator('#result-rank').textContent()).trim();

    await page.click('#again-button');
    await expect(page.locator('#drawing')).toBeVisible();
    await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

    const second = (await page.locator('#result-rank').textContent()).trim();
    expect(DEFINED_RANKS).toContain(second);
    expect(second).not.toBe('');

    await expect(page.locator('#result')).toHaveAttribute('data-rank', second);
    await expect(page.locator('#result-message')).not.toBeEmpty();

    // 100回引いても定義済み値のみ
    const ranks = await page.evaluate(() => {
      const out = [];
      for (let i = 0; i < 100; i++) out.push(window.omikuji.draw().rank);
      return out;
    });
    for (const rank of ranks) expect(DEFINED_RANKS).toContain(rank);

    // 1回目も定義済み
    expect(DEFINED_RANKS).toContain(first);
  });

  /* 5. スマートフォン相当の画面幅でも操作できる */
  test('5. スマートフォン相当の画面幅でも操作できる', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PAGE_URL);

    const drawButton = page.locator('#draw-button');
    await expect(drawButton).toBeVisible();

    const box = await drawButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await drawButton.tap();
    await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#again-button')).toBeVisible();

    await page.locator('#again-button').tap();
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });
      });

      /* 6. 結果表示後にコピーボタンが表示される */
      test('6. 結果表示後にコピーボタンが表示される', async ({ page }) => {
        await page.goto(PAGE_URL);

        await page.click('#draw-button');
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

        await expect(page.locator('#copy-button')).toBeVisible();
      });

      /* 7. コピーボタンで結果がクリップボードにコピーされる */
      test('7. コピーボタンで結果がクリップボードにコピーされる', async ({ page }) => {
        await page.addInitScript(() => {
          window.__copiedText = '';

                    Object.defineProperty(navigator, 'clipboard', {
            value: {
              writeText: async (text) => {
                window.__copiedText = text;
              }
            },
            configurable: true
          });
        });

        await page.goto(PAGE_URL);

        await page.click('#draw-button');
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

        await page.click('#copy-button');

        const copied = await page.evaluate(() => window.__copiedText);
        const rank = (await page.locator('#result-rank').textContent()).trim();
        const message = (await page.locator('#result-message').textContent()).trim();

        expect(copied).toBe(`うちちみくじ結果\n${rank}\n${message}`);
        await expect(page.locator('#copy-status')).toHaveText('コピーしました');
      });

      /* 8. コピー失敗時にフィードバックが表示される */
      test('8. コピー失敗時にフィードバックが表示される', async ({ page }) => {
        await page.addInitScript(() => {
          navigator.clipboard = {
            writeText: async () => {
              throw new Error('clipboard failed');
            }
          };
        });

        await page.goto(PAGE_URL);

        await page.click('#draw-button');
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

        await page.click('#copy-button');

        await expect(page.locator('#copy-status')).toHaveText('コピーに失敗しました');
      });

      /* 9. スマートフォン幅でコピーボタンが操作できる */
      test('9. スマートフォン幅でコピーボタンが操作できる', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await page.addInitScript(() => {
          window.__copiedText = '';

                    Object.defineProperty(navigator, 'clipboard', {
            value: {
              writeText: async (text) => {
                window.__copiedText = text;
              }
            },
            configurable: true
          });
        });

        await page.goto(PAGE_URL);

        await page.click('#draw-button');
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

        const copyButton = page.locator('#copy-button');
        await expect(copyButton).toBeVisible();

        const box = await copyButton.boundingBox();
        expect(box).not.toBeNull();
        expect(box.height).toBeGreaterThanOrEqual(44);

        await copyButton.tap();

                await expect(page.locator('#copy-status')).not.toBeEmpty();
      });

      /* 10. 結果画像が表示される */
      test('10. 結果画像が表示される', async ({ page }) => {
        await page.addInitScript(() => { Math.random = () => 0.01; }); // index 0 = 大吉
        await page.goto(PAGE_URL);

        await page.click('#draw-button');
        await expect(page.locator('#result')).toBeVisible({ timeout: 5000 });

        const img = page.locator('#result-img');
        await expect(img).toBeVisible();
        await expect(img).toHaveAttribute('src', /omikuji-01\.svg$/);
        await expect(page.locator('#result-image-fallback')).toBeHidden();
      });
    });
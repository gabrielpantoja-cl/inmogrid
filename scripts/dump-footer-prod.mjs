#!/usr/bin/env node
/**
 * Descarga el HTML del footer servido en prod para inspección directa.
 * Corré: node scripts/dump-footer-prod.mjs
 */
import { chromium } from '@playwright/test';

const URL = 'https://inmogrid.cl';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log(`\n🔍 Fetch ${URL}\n`);
await page.goto(URL, { waitUntil: 'networkidle' });

// 1. HTML del footer
const footerHtml = await page.locator('footer').first().innerHTML().catch(() => null);
console.log('━━━━━━ footer HTML ━━━━━━');
console.log(footerHtml ? footerHtml.slice(0, 2500) : '(no footer found)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 2. Ver si hay un meta tag o comentario con el commit sha del build
const htmlHead = await page.locator('head').innerHTML().catch(() => '');
const buildMarkers = htmlHead.match(/(build|commit|vercel|sha|version)[^"]*"[^"]*"/gi) || [];
console.log('━━━━━━ head markers ━━━━━━');
buildMarkers.slice(0, 10).forEach((m) => console.log('  · ' + m));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 3. Headers de respuesta Vercel
const response = await page.request.get(URL);
const headers = response.headers();
console.log('━━━━━━ response headers (Vercel) ━━━━━━');
['server', 'x-vercel-cache', 'x-vercel-id', 'x-matched-path', 'age', 'cache-control', 'last-modified']
  .forEach((h) => console.log(`  ${h}: ${headers[h] || '(none)'}`));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━\n');

await browser.close();

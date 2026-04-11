#!/usr/bin/env node
/**
 * Diagnóstico en vivo del footer de producción tras el transfer a inmogrid/inmogrid.
 * Corré: node scripts/diagnose-footer-prod.mjs
 *
 * Verifica:
 *  1. La página carga (HTTP 200)
 *  2. El link "Ver en GitHub" existe y apunta a inmogrid/inmogrid
 *  3. El contador de stars carga (request a api.github.com)
 *  4. La leyenda "Proyecto open source" aparece
 *  5. No hay errores en consola
 *  6. El link viejo "text-blue-700" ya no está (sanity de paleta)
 *  7. Screenshot a disco para verificación visual
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const URL = process.env.DIAGNOSE_URL || 'https://inmogrid.cl';
const SCREENSHOT_PATH = 'playwright-report/footer-prod.png';
const EXPECTED_REPO = 'inmogrid/inmogrid';
const EXPECTED_GH_URL = `https://github.com/${EXPECTED_REPO}`;

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const results = [];
const log = (ok, label, detail = '') => {
  const icon = ok === true ? c.green('✓') : ok === false ? c.red('✗') : c.yellow('~');
  const msg = `  ${icon} ${label}${detail ? c.dim('  ' + detail) : ''}`;
  console.log(msg);
  results.push({ ok, label, detail });
};

console.log(c.bold(`\n🔍 Diagnóstico de footer en ${URL}\n`));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  userAgent: 'Mozilla/5.0 (diagnose-footer-prod/1.0)',
});
const page = await context.newPage();

const consoleErrors = [];
const consoleWarnings = [];
const networkRequests = [];
const failedRequests = [];

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
  if (msg.type() === 'warning') consoleWarnings.push(msg.text());
});
page.on('request', (req) => networkRequests.push({ url: req.url(), method: req.method() }));
page.on('requestfailed', (req) => failedRequests.push({ url: req.url(), error: req.failure()?.errorText }));

// ============ 1. Cargar la página ============
console.log(c.bold('1. Carga inicial'));
let response;
try {
  response = await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  log(response?.ok(), `HTTP ${response?.status()}`, URL);
} catch (err) {
  log(false, 'No se pudo cargar la página', err.message);
  await browser.close();
  process.exit(1);
}

// ============ 2. Footer existe ============
console.log(c.bold('\n2. Footer'));
const footer = page.locator('footer').first();
const footerVisible = await footer.isVisible().catch(() => false);
log(footerVisible, 'El elemento <footer> existe y es visible');

if (footerVisible) {
  await footer.scrollIntoViewIfNeeded();
}

// ============ 3. Link a GitHub ============
console.log(c.bold('\n3. Link "Ver en GitHub"'));
const githubLink = footer.locator('a[href*="github.com"]').first();
const ghLinkVisible = await githubLink.isVisible().catch(() => false);
log(ghLinkVisible, 'Existe un link a github.com en el footer');

if (ghLinkVisible) {
  const href = await githubLink.getAttribute('href');
  log(href === EXPECTED_GH_URL, `href apunta a ${EXPECTED_REPO}`, href);

  const target = await githubLink.getAttribute('target');
  log(target === '_blank', 'Se abre en nueva pestaña', `target="${target}"`);

  const rel = await githubLink.getAttribute('rel');
  log(rel?.includes('noopener'), 'rel incluye noopener (sec)', `rel="${rel}"`);

  const linkText = (await githubLink.textContent())?.trim().replace(/\s+/g, ' ') || '';
  log(linkText.includes('Ver en GitHub'), 'Contiene el texto "Ver en GitHub"', `text="${linkText}"`);

  // Icono SVG
  const svg = githubLink.locator('svg');
  const svgVisible = await svg.isVisible().catch(() => false);
  log(svgVisible, 'Contiene el icono SVG de GitHub');
}

// ============ 4. Contador de stars ============
console.log(c.bold('\n4. Widget de estrellas'));
// Esperar un poco más por si el fetch es tardío
await page.waitForTimeout(2500);

const starsWidget = footer.locator('.github-stars-display').first();
const widgetVisible = await starsWidget.isVisible().catch(() => false);
log(widgetVisible, 'El widget .github-stars-display está renderizado');

if (widgetVisible) {
  const widgetText = (await starsWidget.textContent())?.trim() || '';
  const hasStarIcon = widgetText.includes('⭐');
  log(hasStarIcon, 'Contiene el emoji ⭐', `text="${widgetText}"`);

  const hasNumber = /\d/.test(widgetText);
  const isLoading = widgetText.includes('...');
  const isError = widgetText.toLowerCase().includes('error');
  const isNA = widgetText.includes('N/A');

  if (isError) log(false, 'Widget muestra error', widgetText);
  else if (isLoading) log('warn', 'Widget todavía en loading (...)', 'puede ser lento el primer fetch');
  else if (isNA) log(false, 'Widget devolvió N/A (sin número)', widgetText);
  else log(hasNumber, 'Widget muestra un número de estrellas', widgetText);
}

// Network: hubo request a api.github.com?
const githubApiRequests = networkRequests.filter((r) => r.url.includes('api.github.com'));
log(
  githubApiRequests.length > 0,
  `Se hicieron ${githubApiRequests.length} request(s) a api.github.com`,
  githubApiRequests[0]?.url || ''
);

// ============ 5. Leyenda "Proyecto open source" ============
console.log(c.bold('\n5. Leyenda de transparencia OSS'));
const ossLegend = footer.locator('text=/Proyecto open source/i').first();
const ossVisible = await ossLegend.isVisible().catch(() => false);
log(ossVisible, 'Aparece la leyenda "Proyecto open source · MIT"');

// ============ 6. Sanity de paleta (no debe quedar azul) ============
console.log(c.bold('\n6. Sanity de paleta de marca'));
const blueLink = await footer.locator('.text-blue-700, .text-blue-900').count();
log(blueLink === 0, 'Ningún elemento del footer usa text-blue-700/900', `encontrados: ${blueLink}`);

// ============ 7. Errores de consola ============
console.log(c.bold('\n7. Consola del navegador'));
log(consoleErrors.length === 0, `${consoleErrors.length} errores en consola`);
if (consoleErrors.length) {
  consoleErrors.slice(0, 5).forEach((e) => console.log(c.dim('     · ' + e.slice(0, 200))));
}
log('warn', `${consoleWarnings.length} warnings en consola`);
log(failedRequests.length === 0, `${failedRequests.length} requests fallidas`);
if (failedRequests.length) {
  failedRequests.slice(0, 5).forEach((r) => console.log(c.dim(`     · ${r.error} ${r.url.slice(0, 120)}`)));
}

// ============ 8. Screenshot ============
console.log(c.bold('\n8. Screenshot'));
try {
  mkdirSync(dirname(SCREENSHOT_PATH), { recursive: true });
  // Screenshot completo del footer
  await footer.screenshot({ path: SCREENSHOT_PATH });
  log(true, `Guardado en ${SCREENSHOT_PATH}`);
} catch (err) {
  log(false, 'No se pudo guardar el screenshot', err.message);
}

// ============ Resumen ============
const passed = results.filter((r) => r.ok === true).length;
const failed = results.filter((r) => r.ok === false).length;
const warned = results.filter((r) => r.ok === 'warn').length;

console.log(c.bold('\n📊 Resumen'));
console.log(`  ${c.green(`✓ ${passed} OK`)}  ·  ${c.red(`✗ ${failed} fallos`)}  ·  ${c.yellow(`~ ${warned} warnings`)}`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);

#!/usr/bin/env node
/**
 * Diagnóstico vivo del home de producción enfocado en:
 *  1. Hang/freeze del navegador durante la carga (timings + long tasks).
 *  2. Posts del blog no visibles, especialmente en mobile.
 *
 * Uso: node scripts/diagnose-prod-posts.mjs
 *      node scripts/diagnose-prod-posts.mjs https://staging.inmogrid.cl
 *
 * Cubre:
 *  - Desktop (1280x800) y Mobile (iPhone 14 Pro, 393x852)
 *  - Tiempos: TTFB, DCL, load, networkIdle
 *  - Console errors/warnings con stacktrace
 *  - Requests fallidas, con URL + status
 *  - Requests pendientes al momento del timeout (las que cuelgan el browser)
 *  - Hydration: detecta si React hidrata correctamente
 *  - Contenido "Publicaciones": diferencia skeleton vs posts reales
 *  - Screenshot de cada viewport
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const URL = process.argv[2] || 'https://www.inmogrid.cl/';
const SCREENSHOT_DIR = 'playwright-report';
const NAV_TIMEOUT = 45_000;
const POST_IDLE_WAIT = 8_000; // tras networkidle esperamos un poco más por hydration

const c = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

mkdirSync(SCREENSHOT_DIR, { recursive: true });

/**
 * Corre un diagnóstico completo en un viewport dado.
 * Devuelve un resumen para imprimir al final.
 */
async function diagnose({ name, device, viewport, userAgent }) {
  console.log(c.bold(`\n━━━ ${name} ━━━`));
  const browser = await chromium.launch({ headless: true });
  const contextOpts = device ? { ...device } : { viewport, userAgent };
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const allRequests = new Map(); // url -> { started, finished, status }
  const failedRequests = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') consoleErrors.push(text);
    else if (msg.type() === 'warning') consoleWarnings.push(text);
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  page.on('request', (req) => {
    allRequests.set(req.url(), { started: Date.now(), finished: null, status: null, method: req.method() });
  });
  page.on('response', (res) => {
    const entry = allRequests.get(res.url());
    if (entry) {
      entry.finished = Date.now();
      entry.status = res.status();
    }
  });
  page.on('requestfailed', (req) => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText, method: req.method() });
    const entry = allRequests.get(req.url());
    if (entry) {
      entry.finished = Date.now();
      entry.status = 'failed';
    }
  });

  // ====== 1. Navegación y tiempos ======
  const t0 = Date.now();
  let response;
  let loadError = null;
  try {
    response = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  } catch (err) {
    loadError = err.message;
  }
  const tDCL = Date.now() - t0;

  if (loadError) {
    console.log(c.red(`  ✗ goto() falló: ${loadError}`));
    await browser.close();
    return { name, failed: true, loadError };
  }

  console.log(`  ${c.cyan('●')} HTTP ${response?.status()}  ${c.dim(`(DCL en ${tDCL}ms)`)}`);

  // Esperar a networkidle con un timeout tolerante para ver si hay requests colgados
  let idleReached = true;
  try {
    await page.waitForLoadState('networkidle', { timeout: 15_000 });
  } catch {
    idleReached = false;
    console.log(c.yellow(`  ~ networkidle NO alcanzado en 15s — hay requests pendientes`));
  }
  const tIdle = Date.now() - t0;
  console.log(`  ${c.cyan('●')} networkidle ${idleReached ? 'reached' : 'TIMEOUT'} a los ${tIdle}ms`);

  // Esperar un poco más para que hydration y posts client-side terminen
  await page.waitForTimeout(POST_IDLE_WAIT);
  const tFinal = Date.now() - t0;

  // ====== 2. Requests pendientes ======
  const pending = [...allRequests.entries()]
    .filter(([, v]) => v.finished === null)
    .map(([url, v]) => ({ url, method: v.method, ageMs: Date.now() - v.started }));
  if (pending.length > 0) {
    console.log(c.red(`  ✗ ${pending.length} request(s) PENDIENTES al momento del diagnóstico:`));
    pending.slice(0, 8).forEach((p) =>
      console.log(c.dim(`      · [${p.ageMs}ms] ${p.method} ${p.url.slice(0, 120)}`))
    );
  } else {
    console.log(c.green(`  ✓ 0 requests pendientes`));
  }

  // ====== 3. Requests fallidas ======
  if (failedRequests.length > 0) {
    console.log(c.red(`  ✗ ${failedRequests.length} request(s) FALLIDAS:`));
    failedRequests.slice(0, 8).forEach((r) =>
      console.log(c.dim(`      · ${r.method} ${r.error}  ${r.url.slice(0, 120)}`))
    );
  } else {
    console.log(c.green(`  ✓ 0 requests fallidas`));
  }

  // ====== 4. Console errors y warnings ======
  if (consoleErrors.length > 0) {
    console.log(c.red(`  ✗ ${consoleErrors.length} errores en consola:`));
    consoleErrors.slice(0, 8).forEach((e) => console.log(c.dim(`      · ${e.slice(0, 220)}`)));
  } else {
    console.log(c.green(`  ✓ 0 errores en consola`));
  }
  if (consoleWarnings.length > 0) {
    console.log(c.yellow(`  ~ ${consoleWarnings.length} warnings en consola`));
    consoleWarnings.slice(0, 3).forEach((w) => console.log(c.dim(`      · ${w.slice(0, 180)}`)));
  }

  // ====== 5. Hydration: React actually ran? ======
  const reactHydrated = await page.evaluate(() => {
    // Next.js App Router deja marcas en window. Si hay errores de hidratación
    // el root puede no montar.
    const root = document.getElementById('__next') || document.querySelector('[data-nextjs-scroll-focus-boundary]') || document.body;
    const hasReactRoot = !!(root && (root._reactRootContainer || root.__reactContainer$ || Object.keys(root).some((k) => k.startsWith('__reactContainer'))));
    // Fallback: ver si react-dom loadeo
    const hasReactDom = typeof window !== 'undefined' && !!(window.__NEXT_DATA__ || window.__next_f);
    return { hasReactRoot, hasReactDom };
  });
  const hydratedOk = reactHydrated.hasReactDom;
  console.log(hydratedOk ? c.green(`  ✓ Hydration / __next_f stream detectado`) : c.red(`  ✗ Hydration NO detectada (React no cargó)`));

  // ====== 6. Seccion "Publicaciones" — skeleton vs posts reales ======
  // En el HTML inicial vimos cards con animate-pulse (skeleton loader).
  // Si esas cards siguen ahí después de 8s, significa que los posts nunca se cargaron.
  const publicacionesTitle = await page.locator('h1:has-text("Publicaciones")').first().isVisible().catch(() => false);
  const pulsingSkeletons = await page.locator('.animate-pulse').count().catch(() => 0);

  // Contar posts reales: cualquier article o card dentro del main que NO sea skeleton
  const postsCount = await page.locator('main article, main [data-post-card], main a[href*="/notas/"], main a[href*="/posts/"]').count().catch(() => 0);

  // Detectar mensaje explícito de "no hay posts" o similar
  const emptyStateText = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;
    const text = main.innerText || '';
    if (/no hay publicaciones|sin publicaciones|no posts|still loading/i.test(text)) {
      return text.slice(0, 300);
    }
    return null;
  });

  console.log(`  ${c.cyan('●')} Sección "Publicaciones": título ${publicacionesTitle ? 'visible' : c.red('NO visible')}`);
  console.log(`  ${c.cyan('●')} Skeletons .animate-pulse: ${pulsingSkeletons > 0 ? c.yellow(pulsingSkeletons) : c.green(pulsingSkeletons)}`);
  console.log(`  ${c.cyan('●')} Posts reales detectados: ${postsCount > 0 ? c.green(postsCount) : c.red(0)}`);
  if (emptyStateText) {
    console.log(c.yellow(`  ~ Empty state detectado: "${emptyStateText.slice(0, 150)}..."`));
  }

  const postsBroken = pulsingSkeletons > 0 && postsCount === 0;
  if (postsBroken) {
    console.log(c.red(`  ✗ POSTS NO CARGARON: skeletons siguen ahí y no hay posts reales`));
  }

  // ====== 7. API endpoints — se llamaron? con qué status? ======
  const apiCalls = [...allRequests.entries()]
    .filter(([url]) => url.includes('/api/') || url.includes('supabase') || url.includes('pooler'))
    .map(([url, v]) => ({ url, status: v.status, durationMs: v.finished ? v.finished - v.started : null }));
  if (apiCalls.length > 0) {
    console.log(c.bold(`  API calls (${apiCalls.length}):`));
    apiCalls.slice(0, 10).forEach((a) => {
      const statusStr = a.status === null ? c.red('PENDING') :
                        a.status === 'failed' ? c.red('FAILED') :
                        a.status >= 200 && a.status < 300 ? c.green(a.status) :
                        c.red(a.status);
      const durStr = a.durationMs ? `${a.durationMs}ms` : c.red('—');
      console.log(c.dim(`      · ${statusStr}  ${durStr}  ${a.url.replace(/https?:\/\/[^/]+/, '').slice(0, 100)}`));
    });
  }

  // ====== 8. Screenshot ======
  const shotPath = `${SCREENSHOT_DIR}/prod-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
  try {
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(c.dim(`  📸 ${shotPath}`));
  } catch (err) {
    console.log(c.red(`  ✗ screenshot falló: ${err.message}`));
  }

  await browser.close();

  return {
    name,
    tDCL,
    tIdle,
    tFinal,
    idleReached,
    pendingRequests: pending.length,
    failedRequests: failedRequests.length,
    consoleErrors: consoleErrors.length,
    consoleWarnings: consoleWarnings.length,
    hydratedOk,
    publicacionesTitle,
    pulsingSkeletons,
    postsCount,
    postsBroken,
    apiCalls,
    failed: false,
  };
}

// ====== Main ======
console.log(c.bold(`\n🔍 Diagnóstico de producción: ${URL}`));

const results = [];
results.push(await diagnose({
  name: 'Desktop',
  viewport: { width: 1280, height: 800 },
  userAgent: 'Mozilla/5.0 (diagnose-prod-posts/1.0)',
}));
results.push(await diagnose({
  name: 'Mobile iPhone 14 Pro',
  device: devices['iPhone 14 Pro'],
}));

// ====== Resumen final ======
console.log(c.bold('\n📊 Resumen'));
for (const r of results) {
  if (r.failed) {
    console.log(`  ${c.red('✗')} ${r.name}: ${r.loadError}`);
    continue;
  }
  const status = r.postsBroken ? c.red('BROKEN') :
                 r.pendingRequests > 0 || r.failedRequests > 0 || r.consoleErrors > 0 ? c.yellow('WARN') :
                 c.green('OK');
  console.log(`  ${status}  ${r.name}:  DCL ${r.tDCL}ms  ·  idle ${r.tIdle}ms  ·  posts ${r.postsCount}  ·  skeletons ${r.pulsingSkeletons}  ·  pending ${r.pendingRequests}  ·  errors ${r.consoleErrors}`);
}

const anyBroken = results.some((r) => r.postsBroken || r.failed);
process.exit(anyBroken ? 1 : 0);

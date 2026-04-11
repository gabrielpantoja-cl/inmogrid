#!/usr/bin/env node
/**
 * Diagnóstico de rendimiento y salud de inmogrid.cl
 * - Captura métricas de Web Vitals (Navigation Timing + Paint)
 * - Lista todas las requests (status, tipo, tamaño, duración)
 * - Captura TODOS los mensajes de consola (log/info/warn/error/debug)
 * - Captura page errors y request failures
 * - Verifica service workers registrados
 * - Inspecciona caches (Cache Storage) y localStorage/sessionStorage
 */
import { chromium } from 'playwright'

const URL = process.env.TARGET_URL || 'https://inmogrid.cl'

function fmtBytes(n) {
  if (n == null) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

function fmtMs(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `${Math.round(n)} ms`
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: 'allow', // queremos DETECTAR si hay SW, no bloquearlos
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  })

  const consoleEvents = []
  const pageErrors = []
  const failedRequests = []
  const requests = new Map() // url -> { method, type, startedAt }
  const responses = []

  const page = await context.newPage()

  page.on('console', (msg) => {
    const loc = msg.location()
    consoleEvents.push({
      type: msg.type(),
      text: msg.text(),
      url: loc?.url,
      line: loc?.lineNumber,
    })
  })

  page.on('pageerror', (err) => {
    pageErrors.push({ name: err.name, message: err.message, stack: err.stack })
  })

  page.on('requestfailed', (req) => {
    failedRequests.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText,
      resourceType: req.resourceType(),
    })
  })

  page.on('request', (req) => {
    requests.set(req.url(), {
      method: req.method(),
      resourceType: req.resourceType(),
      startedAt: Date.now(),
    })
  })

  page.on('response', async (res) => {
    const req = res.request()
    const url = res.url()
    const meta = requests.get(url)
    let size = null
    try {
      const buf = await res.body().catch(() => null)
      if (buf) size = buf.length
    } catch {}
    responses.push({
      url,
      status: res.status(),
      method: req.method(),
      resourceType: req.resourceType(),
      fromCache: res.fromServiceWorker() ? 'sw' : res.request().timing ? 'net' : 'net',
      size,
      duration: meta ? Date.now() - meta.startedAt : null,
      serverTiming: res.headers()['server-timing'] || null,
      cacheControl: res.headers()['cache-control'] || null,
      contentType: res.headers()['content-type'] || null,
    })
  })

  const navStart = Date.now()
  let navError = null
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 45_000 })
  } catch (e) {
    navError = e.message
  }
  const navEnd = Date.now()

  // Métricas de Navigation Timing + Paint
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime
    const fp = paint.find((p) => p.name === 'first-paint')?.startTime

    let lcp = null
    try {
      // no siempre disponible en modo sync, intentamos
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
      if (lcpEntries.length) lcp = lcpEntries[lcpEntries.length - 1].startTime
    } catch {}

    return {
      navigationType: nav?.type,
      dnsLookup: nav ? nav.domainLookupEnd - nav.domainLookupStart : null,
      tcpConnect: nav ? nav.connectEnd - nav.connectStart : null,
      tlsHandshake: nav && nav.secureConnectionStart ? nav.connectEnd - nav.secureConnectionStart : null,
      ttfb: nav ? nav.responseStart - nav.requestStart : null,
      responseTime: nav ? nav.responseEnd - nav.responseStart : null,
      domInteractive: nav?.domInteractive,
      domContentLoaded: nav?.domContentLoadedEventEnd,
      loadEvent: nav?.loadEventEnd,
      transferSize: nav?.transferSize,
      encodedBodySize: nav?.encodedBodySize,
      decodedBodySize: nav?.decodedBodySize,
      firstPaint: fp,
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,
    }
  })

  // Service Workers registrados
  const swInfo = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false, registrations: [] }
    const regs = await navigator.serviceWorker.getRegistrations()
    return {
      supported: true,
      controller: !!navigator.serviceWorker.controller,
      controllerScriptURL: navigator.serviceWorker.controller?.scriptURL || null,
      registrations: regs.map((r) => ({
        scope: r.scope,
        active: r.active?.scriptURL || null,
        installing: r.installing?.scriptURL || null,
        waiting: r.waiting?.scriptURL || null,
      })),
    }
  })

  // Cache Storage
  const cacheInfo = await page.evaluate(async () => {
    if (!('caches' in window)) return { supported: false, caches: [] }
    const keys = await caches.keys()
    const details = []
    for (const k of keys) {
      const c = await caches.open(k)
      const reqs = await c.keys()
      details.push({ name: k, entries: reqs.length })
    }
    return { supported: true, caches: details }
  })

  const storage = await page.evaluate(() => ({
    localStorageKeys: Object.keys(localStorage),
    sessionStorageKeys: Object.keys(sessionStorage),
    cookies: document.cookie ? document.cookie.split(';').map((c) => c.trim().split('=')[0]) : [],
  }))

  // Output estructurado
  const report = {
    url: URL,
    navigationError: navError,
    wallClockNavigationMs: navEnd - navStart,
    perf,
    serviceWorkers: swInfo,
    cacheStorage: cacheInfo,
    storage,
    counts: {
      requests: responses.length,
      failed: failedRequests.length,
      consoleErrors: consoleEvents.filter((c) => c.type === 'error').length,
      consoleWarnings: consoleEvents.filter((c) => c.type === 'warning').length,
      pageErrors: pageErrors.length,
    },
  }

  console.log('\n========== DIAGNÓSTICO inmogrid.cl ==========')
  console.log(JSON.stringify(report, null, 2))

  console.log('\n========== PERFORMANCE ==========')
  console.log(`Wall clock (networkidle):   ${fmtMs(report.wallClockNavigationMs)}`)
  console.log(`DNS lookup:                 ${fmtMs(perf.dnsLookup)}`)
  console.log(`TCP connect:                ${fmtMs(perf.tcpConnect)}`)
  console.log(`TLS handshake:              ${fmtMs(perf.tlsHandshake)}`)
  console.log(`TTFB:                       ${fmtMs(perf.ttfb)}`)
  console.log(`Response download:          ${fmtMs(perf.responseTime)}`)
  console.log(`First Paint:                ${fmtMs(perf.firstPaint)}`)
  console.log(`First Contentful Paint:     ${fmtMs(perf.firstContentfulPaint)}`)
  console.log(`Largest Contentful Paint:   ${fmtMs(perf.largestContentfulPaint)}`)
  console.log(`DOM Interactive:            ${fmtMs(perf.domInteractive)}`)
  console.log(`DOMContentLoaded:           ${fmtMs(perf.domContentLoaded)}`)
  console.log(`Load Event:                 ${fmtMs(perf.loadEvent)}`)
  console.log(`Transfer size (HTML doc):   ${fmtBytes(perf.transferSize)}`)
  console.log(`Decoded body size:          ${fmtBytes(perf.decodedBodySize)}`)

  console.log('\n========== SERVICE WORKERS ==========')
  if (!swInfo.supported) {
    console.log('serviceWorker API no soportada')
  } else if (swInfo.registrations.length === 0) {
    console.log('OK: ningún Service Worker registrado')
  } else {
    console.log(`ALERTA: ${swInfo.registrations.length} registration(s) detectadas`)
    console.log(JSON.stringify(swInfo, null, 2))
  }
  console.log(`Controller activo: ${swInfo.controller ? 'SI — ' + swInfo.controllerScriptURL : 'NO'}`)

  console.log('\n========== CACHE STORAGE ==========')
  if (cacheInfo.caches.length === 0) {
    console.log('OK: sin caches en Cache Storage')
  } else {
    cacheInfo.caches.forEach((c) => console.log(`  ${c.name}: ${c.entries} entradas`))
  }

  console.log('\n========== STORAGE / COOKIES ==========')
  console.log(`localStorage keys:   ${storage.localStorageKeys.join(', ') || '(vacío)'}`)
  console.log(`sessionStorage keys: ${storage.sessionStorageKeys.join(', ') || '(vacío)'}`)
  console.log(`cookie names:        ${storage.cookies.join(', ') || '(vacío)'}`)

  console.log('\n========== CONSOLE LOG (todos los niveles) ==========')
  if (consoleEvents.length === 0) {
    console.log('(sin mensajes de consola)')
  } else {
    consoleEvents.forEach((c, i) => {
      const where = c.url ? ` @ ${c.url}:${c.line}` : ''
      console.log(`[${i + 1}] ${c.type.toUpperCase()}: ${c.text}${where}`)
    })
  }

  console.log('\n========== PAGE ERRORS (uncaught) ==========')
  if (pageErrors.length === 0) {
    console.log('(ninguno)')
  } else {
    pageErrors.forEach((e, i) => {
      console.log(`[${i + 1}] ${e.name}: ${e.message}`)
      if (e.stack) console.log(e.stack.split('\n').slice(0, 5).join('\n'))
    })
  }

  console.log('\n========== REQUESTS FALLIDAS ==========')
  if (failedRequests.length === 0) {
    console.log('(ninguna)')
  } else {
    failedRequests.forEach((f, i) => {
      console.log(`[${i + 1}] ${f.method} ${f.url} — ${f.resourceType} — ${f.failure}`)
    })
  }

  console.log('\n========== TOP 20 REQUESTS MÁS PESADAS ==========')
  const top = [...responses]
    .filter((r) => r.size != null)
    .sort((a, b) => (b.size || 0) - (a.size || 0))
    .slice(0, 20)
  top.forEach((r) => {
    console.log(`${String(r.status).padEnd(4)} ${r.resourceType.padEnd(10)} ${fmtBytes(r.size).padEnd(10)} ${fmtMs(r.duration).padEnd(8)} ${r.url}`)
  })

  console.log('\n========== STATUS CODES (resumen) ==========')
  const byStatus = {}
  responses.forEach((r) => {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1
  })
  Object.entries(byStatus)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([s, n]) => console.log(`  ${s}: ${n}`))

  console.log('\n========== REQUESTS !== 200 / 204 / 304 ==========')
  const anomalous = responses.filter((r) => ![200, 204, 304].includes(r.status))
  if (anomalous.length === 0) {
    console.log('(ninguna)')
  } else {
    anomalous.forEach((r) => {
      console.log(`${r.status} ${r.method} ${r.resourceType} ${r.url}`)
    })
  }

  console.log('\n========== RESUMEN ==========')
  console.log(JSON.stringify(report.counts, null, 2))

  await browser.close()
})().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})

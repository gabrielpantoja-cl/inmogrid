#!/usr/bin/env node
/**
 * Diagnóstico del flujo OAuth Google de inmogrid.cl (v2).
 *
 * Capturamos TODO: mainframe navigations, network requests/responses,
 * console, popups, errores no capturados. Supabase con PKCE hace una
 * request XHR a /auth/v1/authorize que devuelve 303 con Location hacia
 * accounts.google.com — eso no aparece en frameNavigated, hay que mirar
 * el stream de responses.
 *
 * BONUS: para desactivar el loop de GitHubStars que está en producción y
 * que satura el JS, bloqueamos api.github.com a nivel de route handler
 * antes de empezar.
 */

import { chromium } from 'playwright'

const START_URL = 'https://inmogrid.cl/auth/login'

function parseUrl(url) {
  try {
    const u = new URL(url)
    return {
      host: u.host,
      path: u.pathname,
      params: Object.fromEntries(u.searchParams.entries()),
    }
  } catch {
    return { host: '?', path: url, params: {} }
  }
}

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })

  // Neutralizar el loop de GitHubStars (api.github.com) que todavía está
  // en producción y colapsa el JS — devolvemos un 200 falso para que el
  // hook no re-intente.
  await context.route('**/api.github.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 0 }),
    })
  )

  const mainNavs = []
  const allRequests = []
  const consoleEvents = []
  const pageErrors = []

  const page = await context.newPage()

  // Popups (OAuth a veces abre nueva ventana)
  context.on('page', (p) => {
    console.log(`[popup] nueva página: ${p.url()}`)
    p.on('framenavigated', (f) => {
      if (f === p.mainFrame()) {
        mainNavs.push({ source: 'popup', url: f.url(), at: Date.now() })
      }
    })
  })

  page.on('framenavigated', (f) => {
    if (f === page.mainFrame()) {
      mainNavs.push({ source: 'main', url: f.url(), at: Date.now() })
    }
  })

  page.on('console', (msg) => {
    consoleEvents.push({ type: msg.type(), text: msg.text() })
  })
  page.on('pageerror', (err) => {
    pageErrors.push({ name: err.name, message: err.message })
  })

  page.on('request', (req) => {
    allRequests.push({
      kind: 'request',
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
    })
  })
  page.on('response', (res) => {
    const status = res.status()
    if (status >= 300 && status < 400) {
      allRequests.push({
        kind: 'redirect',
        url: res.url(),
        status,
        location: res.headers()['location'] || null,
      })
    }
  })

  console.log(`[1] Navegando a ${START_URL}`)
  await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  console.log(`    URL final tras cargar login: ${page.url()}`)

  // Esperamos hasta 3 seg para que termine de hidratar React
  await page.waitForTimeout(3000)

  const buttonSel = 'button:has-text("Continuar con Google")'
  const hasButton = await page.locator(buttonSel).count()
  console.log(`[2] Botón encontrado: ${hasButton > 0}`)

  if (hasButton > 0) {
    console.log(`    Click sobre el botón…`)
    await page.locator(buttonSel).first().click().catch((e) => {
      console.log(`    click falló: ${e.message}`)
    })
    // Dejamos tiempo para que Supabase haga su fetch y el browser navegue
    await page.waitForTimeout(6000)
  }

  console.log(`\n[3] URL actual tras click: ${page.url()}`)

  console.log(`\n========== NAVEGACIONES DE MAIN/POPUPS ==========`)
  mainNavs.forEach((n, i) => {
    console.log(`[${i + 1}] (${n.source}) ${n.url}`)
  })

  console.log(`\n========== REQUESTS A supabase.co / google ==========`)
  const filtered = allRequests.filter((r) =>
    /supabase\.co|accounts\.google|oauth2|googleapis/.test(r.url)
  )
  if (filtered.length === 0) {
    console.log('(no se detectaron requests a Supabase ni Google)')
  } else {
    filtered.forEach((r, i) => {
      if (r.kind === 'request') {
        console.log(`[${i + 1}] REQ ${r.method} ${r.url}`)
      } else {
        console.log(`[${i + 1}] REDIR ${r.status} ${r.url}`)
        console.log(`       → ${r.location}`)
      }
    })
  }

  // Intento específico: detectar la URL de authorize de Supabase y extraer
  // el client_id / redirect_to
  const authorizeHop = allRequests.find(
    (r) => r.kind === 'request' && r.url.includes('/auth/v1/authorize')
  )
  if (authorizeHop) {
    console.log(`\n========== SUPABASE authorize URL ==========`)
    const p = parseUrl(authorizeHop.url)
    console.log(`Supabase project host: ${p.host}`)
    console.log(`provider:               ${p.params.provider}`)
    console.log(`redirect_to:            ${p.params.redirect_to || '(no presente)'}`)
  }

  // Intento específico: detectar la llamada a accounts.google.com
  const googleHop = mainNavs.find((n) => n.url.includes('accounts.google.com'))
  if (googleHop) {
    console.log(`\n========== accounts.google.com ==========`)
    const p = parseUrl(googleHop.url)
    console.log(`client_id:    ${p.params.client_id || '(no presente)'}`)
    console.log(`redirect_uri: ${p.params.redirect_uri || '(no presente)'}`)
    console.log(`response_type: ${p.params.response_type || '(no presente)'}`)
    console.log(`scope:        ${p.params.scope || '(no presente)'}`)

    // El redirect_uri de Google apunta a supabase.co/auth/v1/callback.
    // Supabase guarda el destino final en state (PKCE) o en un parámetro aparte.
    // Intentamos decodificarlo del path del redirect_uri si tiene query.
    if (p.params.redirect_uri) {
      try {
        const inner = new URL(p.params.redirect_uri)
        const rt = inner.searchParams.get('redirect_to')
        if (rt) console.log(`redirect_to embebido: ${rt}`)
      } catch {}
    }
  }

  console.log(`\n========== CONSOLE (errores/warnings) ==========`)
  consoleEvents
    .filter((c) => ['error', 'warning'].includes(c.type))
    .slice(0, 20)
    .forEach((c, i) => {
      console.log(`[${i + 1}] ${c.type.toUpperCase()}: ${c.text.slice(0, 200)}`)
    })

  console.log(`\n========== PAGE ERRORS ==========`)
  if (pageErrors.length === 0) console.log('(ninguno)')
  else pageErrors.forEach((e, i) => console.log(`[${i + 1}] ${e.name}: ${e.message}`))

  console.log(`\n========== CONTEO TOTAL ==========`)
  console.log(`mainNavs:         ${mainNavs.length}`)
  console.log(`requests total:   ${allRequests.filter((r) => r.kind === 'request').length}`)
  console.log(`redirects 3xx:    ${allRequests.filter((r) => r.kind === 'redirect').length}`)
  console.log(`console errors:   ${consoleEvents.filter((c) => c.type === 'error').length}`)
  console.log(`console warnings: ${consoleEvents.filter((c) => c.type === 'warning').length}`)

  await browser.close()
})().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})

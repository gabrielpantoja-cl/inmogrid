/**
 * Script de debug para inspeccionar Portal Inmobiliario
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function main() {
    console.log('🔍 Inspeccionando Portal Inmobiliario...\n');

    const browser = await puppeteer.launch({
        headless: false, // Mostrar navegador
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

    const url = 'https://www.portalinmobiliario.com/venta/departamento/rm-metropolitana/santiago';

    console.log('📄 Navegando a:', url);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('⏳ Esperando 5 segundos para que cargue todo...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Guardar screenshot
    const screenshotPath = path.join(__dirname, 'portal-debug.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Screenshot guardado en:', screenshotPath);

    // Guardar HTML
    const html = await page.content();
    const htmlPath = path.join(__dirname, 'portal-debug.html');
    fs.writeFileSync(htmlPath, html);
    console.log('📝 HTML guardado en:', htmlPath);

    // Intentar encontrar elementos de listados
    console.log('\n🔎 Buscando selectores comunes...');

    const selectors = [
        'article',
        '.ui-search-result',
        '.ui-search-layout__item',
        '[class*="search-result"]',
        '[class*="listing"]',
        '[class*="card"]',
        '.property',
        '.item',
    ];

    for (const selector of selectors) {
        try {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
                console.log(`✓ Selector "${selector}": ${elements.length} elementos encontrados`);

                // Obtener clases del primer elemento
                const firstEl = elements[0];
                const classes = await firstEl.evaluate(el => el.className);
                console.log(`  Clases: ${classes}`);
            }
        } catch (e) {
            // Ignorar errores
        }
    }

    // Extraer todas las clases únicas de la página
    console.log('\n📋 Extrayendo clases principales...');
    const allClasses = await page.evaluate(() => {
        const classes = new Set<string>();
        document.querySelectorAll('*').forEach(el => {
            const classList = el.className;
            if (typeof classList === 'string' && classList.trim()) {
                classList.split(/\s+/).forEach(c => classes.add(c));
            }
        });
        return Array.from(classes)
            .filter(c => c.includes('search') || c.includes('listing') || c.includes('item') || c.includes('card') || c.includes('property'))
            .sort();
    });

    console.log('Clases relevantes encontradas:');
    allClasses.slice(0, 30).forEach(c => console.log(`  - ${c}`));

    console.log('\n✅ Inspección completada. Presiona Ctrl+C para cerrar el navegador.');

    // Mantener el navegador abierto para inspección manual
    await new Promise(() => {}); // Esperar indefinidamente
}

main().catch(console.error);
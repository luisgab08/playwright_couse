import { test, expect, Page } from '@playwright/test';

// URL base para las pruebas
const paginaLulo = 'https://www.lulobank.com/';

/**
 * Función para manejar y cerrar popups informativos y de cookies si están visibles.
 * Es tolerante a que los popups no siempre aparezcan.
 * @param page - La instancia de la página de Playwright.
 */
async function handlePopups(page: Page): Promise<void> {
  console.log('Iniciando handlePopups...');

  // 1. Intentar manejar el popup informativo (el original, que mencionaste aparece primero a veces)
  const infoPopupSelector = 'div#modal-alert__custom';
  
  try {
    const infoPopupLocator = page.locator(infoPopupSelector);
    // Usamos un timeout más generoso para el primer popup que podría aparecer
    if (await infoPopupLocator.isVisible({ timeout: 7000 })) { 
      console.log('Popup informativo (modal-alert__custom) detectado.');
      const infoCloseButtonLocator = infoPopupLocator.getByRole('button', { name: "Cerrar" });
      try {
        await infoCloseButtonLocator.waitFor({ state: 'visible', timeout: 3000}); // Esperar a que el botón sea visible
        await infoCloseButtonLocator.click({ timeout: 3000 });
        console.log('Botón "Cerrar" del popup informativo presionado.');
        await infoPopupLocator.waitFor({ state: 'hidden', timeout: 3000 });
        console.log('Popup informativo (modal-alert__custom) cerrado.');
      } catch (clickError) {
         console.log(`No se pudo hacer clic en el botón "Cerrar" del popup informativo o el popup no se cerró: ${clickError.message}`);
      }
    } else {
      console.log('Popup informativo (modal-alert__custom) no visible o no presente en el tiempo esperado.');
    }
  } catch (error) {
    // Solo loguear si realmente hubo un error intentando interactuar, no si simplemente no estaba.
    // El error de timeout de isVisible ya es manejado por la condición del if.
    if (!(error.message.includes('TimeoutError: Target closed') || error.message.includes('Target page, context or browser has been closed'))) {
        console.log('Excepción general al intentar manejar el popup informativo (modal-alert__custom):', error.message);
    }
  }

  // 2. Intentar manejar el popup de Aviso de Cookies
  const cookiePopupSelector = 'div.modal-cookies';
  const cookieAcceptButtonLocator = page.locator(cookiePopupSelector).getByRole('button', { name: "Aceptar" });

  try {
    const cookiePopupLocator = page.locator(cookiePopupSelector);
    // Damos un timeout razonable para este segundo popup
    if (await cookiePopupLocator.isVisible({ timeout: 5000 })) { 
      console.log('Popup de Aviso de Cookies detectado.');
      try {
        await cookieAcceptButtonLocator.waitFor({ state: 'visible', timeout: 3000});
        await cookieAcceptButtonLocator.click({ timeout: 3000 }); 
        console.log('Botón "Aceptar" del popup de cookies presionado.');
        await cookiePopupLocator.waitFor({ state: 'hidden', timeout: 3000 });
        console.log('Popup de Aviso de Cookies cerrado.');
      } catch (clickError) {
        console.log(`No se pudo hacer clic en el botón "Aceptar" del popup de cookies o el popup no se cerró: ${clickError.message}`);
      }
    } else {
      console.log('Popup de Aviso de Cookies no visible o no presente en el tiempo esperado.'); 
    }
  } catch (error) {
    if (!(error.message.includes('TimeoutError: Target closed') || error.message.includes('Target page, context or browser has been closed'))) {
        console.log('Excepción general al intentar manejar el popup de cookies:', error.message);
    }
  }
  console.log('Finalizando handlePopups.');
}


test.describe('Pruebas Generales LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Cambiado a domcontentloaded
    await handlePopups(page); 
  });

  test('Lulobank online', async ({ page }) => {
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 15000 });
    console.log('Test "Lulobank online" completado, footer visible.');
  });
});


test.describe('Pruebas de Menús LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Cambiado a domcontentloaded
    await handlePopups(page);
  });

  test('Menu ¿Qué puedes hacer?', async ({ page }) => {
    const triggerMenu = page.locator('li[data-route="/features"] > span.navigation-list-dropdown:has-text("¿Qué puedes hacer?")');
    const selectorEnlacesSubmenu = 'li[data-route="/features"] ul.navigation-sub-list a.navigation-sub-list-link';

    await triggerMenu.click();
    const subMenu = page.locator('li[data-route="/features"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible', timeout: 5000 });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de "¿Qué puedes hacer?".`);
    expect(numeroDeEnlaces).toBeGreaterThan(0); 

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración ¿Qué puedes hacer? ${i + 1} de ${numeroDeEnlaces}:`);
      
      if (i > 0 || !(await subMenu.isVisible({timeout: 1000}))) { 
          await triggerMenu.waitFor({ state: 'visible', timeout: 5000 });
          await triggerMenu.click();
          await subMenu.waitFor({ state: 'visible', timeout: 5000 });
      }
      
      const enlaceActual = enlaces.nth(i);
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      await enlaceActual.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 20000 }); // Cambiado a domcontentloaded
      console.log(`Página visitada: ${page.url()}`);
      await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
      await handlePopups(page); 

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Cambiado a domcontentloaded
        await handlePopups(page); 
      }
    }
    console.log('\nTodos los enlaces del submenú "¿Qué puedes hacer?" han sido visitados.');
  });

  test('Menu Ayuda', async ({ page }) => {
    const triggerAyuda = page.locator('li[data-route="/ayuda"] > span.navigation-list-dropdown:has-text("Ayuda")');
    const selectorEnlacesSubmenu = 'li[data-route="/ayuda"] ul.navigation-sub-list a.navigation-sub-list-link';

    await triggerAyuda.click();
    const subMenu = page.locator('li[data-route="/ayuda"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible', timeout: 5000 });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de Ayuda.`);
    expect(numeroDeEnlaces).toBeGreaterThan(0);

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración Ayuda ${i + 1} de ${numeroDeEnlaces}:`);
       if (i > 0 || !(await subMenu.isVisible({timeout: 1000}))) {
          await triggerAyuda.waitFor({ state: 'visible', timeout: 5000 });
          await triggerAyuda.click();
          await subMenu.waitFor({ state: 'visible', timeout: 5000 });
      }

      const enlaceActual = enlaces.nth(i);
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      const esEnlaceExterno = hrefEnlace && (hrefEnlace.startsWith('http://') || hrefEnlace.startsWith('https://')) && !hrefEnlace.includes('lulobank.com');

      if (esEnlaceExterno) {
        const [newPage] = await Promise.all([
            page.waitForEvent('popup', {timeout: 7000}).catch(() => null), 
            enlaceActual.click(),
        ]);
        if (newPage) {
            console.log(`Nueva pestaña abierta para: ${newPage.url()}`);
            await newPage.waitForLoadState('load', {timeout: 20000}).catch(() => console.warn("Timeout esperando carga de nueva pestaña"));
            await expect(newPage).not.toHaveTitle(/Error/, {timeout: 5000});
            await newPage.close();
            console.log('Nueva pestaña cerrada.');
        } else {
            await page.waitForLoadState('load', {timeout: 20000}).catch(() => console.warn("Timeout esperando carga de página tras clic en enlace externo"));
            console.log(`Página visitada (posiblemente externa): ${page.url()}`);
            await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
        }
      } else { 
        await enlaceActual.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 20000 }); // Cambiado a domcontentloaded
        console.log(`Página visitada: ${page.url()}`);
        await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
        if (page.url().includes('lulobank.com')) { 
            await handlePopups(page);
        }
      }

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Cambiado a domcontentloaded
        await handlePopups(page);
      }
    }
    console.log('\nTodos los enlaces del submenú Ayuda han sido visitados.');
  });
});


test.describe('Pruebas de Navegación Directa LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Cambiado a domcontentloaded
    await handlePopups(page);
  });

  test('Snacks', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/snacks\')]').getByText('Snacks').click();
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 }); // Cambiado a domcontentloaded
    await handlePopups(page); 
    await expect(page).toHaveURL(/.*\/snacks/, {timeout: 10000}); 
    console.log('Navegado a la página de Snacks.');
  });

  test('Nosotros', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/about\')]').getByText('Nosotros').click();
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 }); // Cambiado a domcontentloaded
    await handlePopups(page); 
    await expect(page).toHaveURL(/.*\/about/, {timeout: 10000}); 
    console.log('Navegado a la página Nosotros.');
  });

  test('Tips de seguridad', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/tips-de-seguridad\')]').getByText('Tips de seguridad').click();
    await page.waitForLoadState('domcontentloaded', { timeout: 20000 }); // Cambiado a domcontentloaded
    await handlePopups(page); 
    await expect(page).toHaveURL(/.*\/tips-de-seguridad/, {timeout: 10000}); 
    console.log('Navegado a la página Tips de seguridad.');
  });
});


const URL_ESPERADA_IOS: string = 'https://apps.apple.com/co/app/lulo-bank/id1534359078';
const URL_BASE_ESPERADA_ANDROID: string = 'https://play.google.com/store/apps/details?id=co.com.lulobank.production';
const PAGINA_DESCARGA: string = 'https://www.lulobank.com/descarga-lulo-bank';

test.describe('Pruebas de la página de descarga de Lulo Bank', () => {
  test('Debe cargar la página de descarga y verificar los enlaces de las tiendas', async ({ page }) => {
    await page.goto(PAGINA_DESCARGA, { waitUntil: 'domcontentloaded', timeout: 60000 }); 
    await handlePopups(page); 
    
    console.log('Esperando estabilización de página de descarga después de manejar popups...');
    const seccionDescargaPrincipal = page.locator('div.download-app-introduction-section-content');
    await expect(seccionDescargaPrincipal).toBeVisible({timeout: 15000});

    await expect(page).toHaveTitle(/Lulo bank - Descarga y prueba la app/, {timeout: 10000});

    const enlaceIOS = seccionDescargaPrincipal.getByRole('link', { name: /Download on the App Store/i });
    await expect(enlaceIOS).toBeVisible({ timeout: 10000 });
    const hrefIOS = await enlaceIOS.getAttribute('href');
    expect(hrefIOS).toContain(URL_ESPERADA_IOS); 
    console.log(`Enlace iOS href: ${hrefIOS}`);

    const enlaceAndroid = seccionDescargaPrincipal.getByRole('link', { name: /Google Play store/i });
    await expect(enlaceAndroid).toBeVisible({ timeout: 10000 });
    const hrefAndroid = await enlaceAndroid.getAttribute('href');
    expect(hrefAndroid).toContain(URL_BASE_ESPERADA_ANDROID); 
    console.log(`Enlace Android href: ${hrefAndroid}`);


    const imagenAppStore = seccionDescargaPrincipal.locator('img[src="/images/app_store_badge_EN.svg"]');
    await expect(imagenAppStore).toBeVisible({ timeout: 10000 });

    const imagenGooglePlay = seccionDescargaPrincipal.locator('img[src="/images/google-play-badge-EN.svg"]');
    await expect(imagenGooglePlay).toBeVisible({ timeout: 10000 });
    console.log('Verificación de enlaces y logos de tiendas en página de descarga completada.');
  });
});

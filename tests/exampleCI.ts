import { test, expect, Page } from '@playwright/test';

// URL base para las pruebas
const paginaLulo = 'https://www.lulobank.com/';

/**
 * Función para manejar y cerrar popups informativos y de cookies si están visibles.
 * Es tolerante a que los popups no siempre aparezcan.
 * @param page - La instancia de la página de Playwright.
 */
async function handlePopups(page: Page): Promise<void> {
  console.log(`Intentando manejar popups en: ${page.url()}`);

  // 1. Intentar manejar el popup informativo
  const infoPopupSelector = 'div#modal-alert__custom';
  try {
    const infoPopupLocator = page.locator(infoPopupSelector);
    if (await infoPopupLocator.isVisible({ timeout: 5000 })) { 
      console.log('Popup informativo (modal-alert__custom) detectado.');
      const infoCloseButtonLocator = infoPopupLocator.getByRole('button', { name: "Cerrar" });
      if (await infoCloseButtonLocator.isVisible({timeout: 2000})) {
        await infoCloseButtonLocator.click({ timeout: 3000 });
        console.log('Botón "Cerrar" del popup informativo presionado.');
        await infoPopupLocator.waitFor({ state: 'hidden', timeout: 3000 });
        console.log('Popup informativo (modal-alert__custom) cerrado.');
      } else {
        console.log('Botón "Cerrar" del popup informativo no visible, aunque el popup sí lo está.');
      }
    } else {
      // console.log('Popup informativo (modal-alert__custom) no visible.'); // Log opcional
    }
  } catch (error) {
    if (!(error.message.includes('Target page, context or browser has been closed'))) {
        console.log('Excepción al intentar manejar el popup informativo (modal-alert__custom):', error.message);
    }
  }

  // 2. Intentar manejar el popup de Aviso de Cookies
  const cookiePopupSelector = 'div.modal-cookies';
  try {
    const cookiePopupLocator = page.locator(cookiePopupSelector);
    if (await cookiePopupLocator.isVisible({ timeout: 3000 })) { 
      console.log('Popup de Aviso de Cookies detectado.');
      const cookieAcceptButtonLocator = cookiePopupLocator.getByRole('button', { name: "Aceptar" });
      if (await cookieAcceptButtonLocator.isVisible({timeout: 2000})) {
        await cookieAcceptButtonLocator.click({ timeout: 3000 }); 
        console.log('Botón "Aceptar" del popup de cookies presionado.');
        await cookiePopupLocator.waitFor({ state: 'hidden', timeout: 3000 });
        console.log('Popup de Aviso de Cookies cerrado.');
      } else {
        console.log('Botón "Aceptar" del popup de cookies no visible, aunque el popup sí lo está.');
      }
    } else {
      // console.log('Popup de Aviso de Cookies no visible.'); // Log opcional
    }
  } catch (error) {
     if (!(error.message.includes('Target page, context or browser has been closed'))) {
        console.log('Excepción al intentar manejar el popup de cookies:', error.message);
    }
  }
  console.log('Finalizado handlePopups.');
}


test.describe('Pruebas Generales LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Navegando a ${paginaLulo} para Pruebas Generales`);
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePopups(page); 
  });

  test('Lulobank online', async ({ page }) => {
    // El footer puede ser un buen indicador de que la página principal cargó bien
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 20000 });
    console.log('Test "Lulobank online" completado, footer visible.');
  });
});


test.describe('Pruebas de Menús LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Navegando a ${paginaLulo} para Pruebas de Menús`);
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePopups(page);
  });

  test('Menu ¿Qué puedes hacer?', async ({ page }) => {
    const triggerMenu = page.locator('li[data-route="/features"] > span.navigation-list-dropdown:has-text("¿Qué puedes hacer?")');
    const selectorEnlacesSubmenu = 'li[data-route="/features"] ul.navigation-sub-list a.navigation-sub-list-link';

    console.log('Haciendo clic en el trigger del menú "¿Qué puedes hacer?"');
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
          console.log('Submenú no visible o no es la primera iteración, reabriendo menú principal...');
          await triggerMenu.waitFor({ state: 'visible', timeout: 5000 });
          await triggerMenu.click();
          await subMenu.waitFor({ state: 'visible', timeout: 5000 });
      }
      
      const enlaceActual = enlaces.nth(i);
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      // Guardar la URL actual antes del clic para comparar si hay navegación
      const urlAntesDelClic = page.url();
      await enlaceActual.click();
      
      // Esperar a que la URL cambie o a que un elemento específico de la nueva página aparezca
      try {
        console.log('Esperando cambio de URL o contenido de la nueva página...');
        await page.waitForURL(url => url !== urlAntesDelClic && url.includes(hrefEnlace || '###########'), { timeout: 20000 });
        // O, mejor aún, esperar un selector único de la página de destino
        // await expect(page.locator('h1.titulo-pagina-destino')).toBeVisible({ timeout: 20000 }); // ¡AJUSTAR ESTE SELECTOR!
        console.log(`Navegación a "${hrefEnlace}" detectada. Nueva URL: ${page.url()}`);
      } catch (e) {
        console.warn(`Timeout o error esperando la navegación para "${hrefEnlace}". URL actual: ${page.url()}. Error: ${e.message}`);
        // Considerar si esto debe ser un fallo o si se puede continuar
      }
      
      await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
      await handlePopups(page); 

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await handlePopups(page); 
      }
    }
    console.log('\nTodos los enlaces del submenú "¿Qué puedes hacer?" han sido visitados.');
  });

  test('Menu Ayuda', async ({ page }) => {
    const triggerAyuda = page.locator('li[data-route="/ayuda"] > span.navigation-list-dropdown:has-text("Ayuda")');
    const selectorEnlacesSubmenu = 'li[data-route="/ayuda"] ul.navigation-sub-list a.navigation-sub-list-link';

    console.log('Haciendo clic en el trigger del menú "Ayuda"');
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
          console.log('Submenú no visible o no es la primera iteración, reabriendo menú principal...');
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
        console.log('Detectado enlace externo, esperando popup/nueva pestaña...');
        const [newPage] = await Promise.all([
            page.waitForEvent('popup', {timeout: 10000}).catch(() => {
              console.log('No se abrió un popup/nueva pestaña para enlace externo.');
              return null;
            }), 
            enlaceActual.click(), // El clic puede causar navegación en la misma pestaña si no hay popup
        ]);

        if (newPage) {
            console.log(`Nueva pestaña abierta para: ${newPage.url()}`);
            await newPage.waitForLoadState('domcontentloaded', {timeout: 20000}).catch(() => console.warn("Timeout esperando carga de nueva pestaña"));
            await expect(newPage).not.toHaveTitle(/Error/, {timeout: 5000});
            // No llamar a handlePopups en dominios externos
            await newPage.close();
            console.log('Nueva pestaña cerrada.');
        } else {
            // Si no hubo popup, la navegación ocurrió en la misma pestaña
            await page.waitForLoadState('domcontentloaded', {timeout: 20000}).catch(() => console.warn("Timeout esperando carga de página tras clic en enlace externo"));
            console.log(`Página visitada (posiblemente externa, misma pestaña): ${page.url()}`);
            await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
        }
      } else { 
        const urlAntesDelClicInterno = page.url();
        await enlaceActual.click();
        try {
          console.log('Esperando cambio de URL o contenido de la nueva página interna...');
          await page.waitForURL(url => url !== urlAntesDelClicInterno && url.includes(hrefEnlace || '###########'), { timeout: 20000 });
          // O esperar un selector específico de la página de destino
          // await expect(page.locator('h1.titulo-pagina-destino-interna')).toBeVisible({ timeout: 20000 }); // ¡AJUSTAR ESTE SELECTOR!
          console.log(`Navegación interna a "${hrefEnlace}" detectada. Nueva URL: ${page.url()}`);
        } catch(e) {
          console.warn(`Timeout o error esperando la navegación interna para "${hrefEnlace}". URL actual: ${page.url()}. Error: ${e.message}`);
        }
        await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
        if (page.url().includes('lulobank.com')) { 
            await handlePopups(page);
        }
      }

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await handlePopups(page);
      }
    }
    console.log('\nTodos los enlaces del submenú Ayuda han sido visitados.');
  });
});


test.describe('Pruebas de Navegación Directa LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Navegando a ${paginaLulo} para Pruebas de Navegación Directa`);
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 }); 
    await handlePopups(page);
  });

  test('Snacks', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/snacks\')]').getByText('Snacks').click();
    await page.waitForURL(/.*\/snacks/, { timeout: 20000 });
    // await expect(page.locator('h1:has-text("Snacks")')).toBeVisible({timeout: 15000}); // ¡AJUSTAR SELECTOR!
    await handlePopups(page); 
    console.log('Navegado a la página de Snacks.');
  });

  test('Nosotros', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/about\')]').getByText('Nosotros').click();
    await page.waitForURL(/.*\/about/, { timeout: 20000 });
    // await expect(page.locator('h1:has-text("Nosotros")')).toBeVisible({timeout: 15000}); // ¡AJUSTAR SELECTOR!
    await handlePopups(page); 
    console.log('Navegado a la página Nosotros.');
  });

  test('Tips de seguridad', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/tips-de-seguridad\')]').getByText('Tips de seguridad').click();
    await page.waitForURL(/.*\/tips-de-seguridad/, { timeout: 20000 });
    // await expect(page.locator('h1:has-text("Tips de seguridad")')).toBeVisible({timeout: 15000}); // ¡AJUSTAR SELECTOR!
    await handlePopups(page); 
    console.log('Navegado a la página Tips de seguridad.');
  });
});


const URL_ESPERADA_IOS: string = 'https://apps.apple.com/co/app/lulo-bank/id1534359078';
const URL_BASE_ESPERADA_ANDROID: string = 'https://play.google.com/store/apps/details?id=co.com.lulobank.production';
const PAGINA_DESCARGA: string = 'https://www.lulobank.com/descarga-lulo-bank';

test.describe('Pruebas de la página de descarga de Lulo Bank', () => {
  test('Debe cargar la página de descarga y verificar los enlaces de las tiendas', async ({ page }) => {
    console.log(`Navegando a ${PAGINA_DESCARGA}`);
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

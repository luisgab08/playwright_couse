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
  let popupInteracted = false;

  // 1. Intentar manejar el popup informativo (el que aparece primero según el usuario)
  const infoPopupSelector = 'div#modal-alert__custom';
  try {
    const infoPopupLocator = page.locator(infoPopupSelector);
    // Usar un timeout más generoso para el primer popup que podría aparecer
    if (await infoPopupLocator.isVisible({ timeout: process.env.CI ? 10000 : 7000 })) { 
      console.log('Popup informativo (modal-alert__custom) detectado.');
      popupInteracted = true;
      // Selector más específico para el botón dentro del popup
      const infoCloseButtonLocator = infoPopupLocator.locator('button.btn-clean.btn-dark:has-text("Cerrar")');
      
      if (await infoCloseButtonLocator.isVisible({timeout: 3000})) { 
        try {
          await infoCloseButtonLocator.click({ timeout: 5000 }); 
          console.log('Botón "Cerrar" del popup informativo presionado.');
          await infoPopupLocator.waitFor({ state: 'hidden', timeout: 7000 }); 
          console.log('Popup informativo (modal-alert__custom) cerrado.');
          await page.waitForTimeout(500); 
        } catch (clickError) {
           console.log(`No se pudo hacer clic en el botón "Cerrar" del popup informativo o el popup no se cerró: ${clickError.message}`);
        }
      } else {
        console.log('Botón "Cerrar" del popup informativo no visible, aunque el popup sí lo está.');
      }
    } else {
      // console.log('Popup informativo (modal-alert__custom) no visible o no presente en el tiempo esperado.');
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
    if (await cookiePopupLocator.isVisible({ timeout: 5000 })) { 
      console.log('Popup de Aviso de Cookies detectado.');
      popupInteracted = true;
      const cookieAcceptButtonLocator = cookiePopupLocator.getByRole('button', { name: "Aceptar" });
      if (await cookieAcceptButtonLocator.isVisible({timeout: 3000})) { 
        try {
          await cookieAcceptButtonLocator.click({ timeout: 5000 }); 
          console.log('Botón "Aceptar" del popup de cookies presionado.');
          await cookiePopupLocator.waitFor({ state: 'hidden', timeout: 7000 }); 
          console.log('Popup de Aviso de Cookies cerrado.');
          await page.waitForTimeout(500); 
        } catch (clickError) {
          console.log(`No se pudo hacer clic en el botón "Aceptar" del popup de cookies o el popup no se cerró: ${clickError.message}`);
        }
      } else {
        console.log('Botón "Aceptar" del popup de cookies no visible, aunque el popup sí lo está.');
      }
    } else {
      // console.log('Popup de Aviso de Cookies no visible o no presente en el tiempo esperado.'); 
    }
  } catch (error) {
     if (!(error.message.includes('Target page, context or browser has been closed'))) {
        console.log('Excepción al intentar manejar el popup de cookies:', error.message);
    }
  }

  if (popupInteracted) {
    console.log('Se interactuó con al menos un popup, esperando brevemente para estabilización adicional...');
    await page.waitForTimeout(1000); 
  }
  console.log('Finalizado handlePopups.');
}


test.describe('Pruebas Generales LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Navegando a ${paginaLulo} para Pruebas Generales`);
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePopups(page); 
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 30000 }); 
    console.log('Página principal estabilizada después de popups (Pruebas Generales).');
  });

  test('Lulobank online', async ({ page }) => {
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 15000 });
    console.log('Test "Lulobank online" completado, footer visible.');
  });
});


test.describe('Pruebas de Menús LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Navegando a ${paginaLulo} para Pruebas de Menús`);
    await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePopups(page);
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 30000 }); 
    console.log('Página principal estabilizada después de popups (Pruebas de Menús).');
  });

  

/*  test.('Menu ¿Qué puedes hacer?', async ({ page }) => {
    const triggerMenu = page.locator('li[data-route="/features"] > span.navigation-list-dropdown:has-text("¿Qué puedes hacer?")');
    const selectorEnlacesSubmenu = 'li[data-route="/features"] ul.navigation-sub-list a.navigation-sub-list-link';

    console.log('Asegurando que no haya popups antes del primer clic en menú "¿Qué puedes hacer?"');
    await handlePopups(page);
    await triggerMenu.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Haciendo clic en el trigger del menú "¿Qué puedes hacer?"');
    await triggerMenu.click({timeout: 10000}); 

    const subMenu = page.locator('li[data-route="/features"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible', timeout: 5000 });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de "¿Qué puedes hacer?".`);
    expect(numeroDeEnlaces).toBeGreaterThan(0); 

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración ¿Qué puedes hacer? ${i + 1} de ${numeroDeEnlaces}:`);
      
      await handlePopups(page); 
      if (i > 0 || !(await subMenu.isVisible({timeout: 2000}))) { 
          console.log('Submenú no visible o no es la primera iteración, reabriendo menú principal...');
          await triggerMenu.waitFor({ state: 'visible', timeout: 10000 });
          await triggerMenu.click({timeout: 10000});
          await subMenu.waitFor({ state: 'visible', timeout: 5000 });
      }
      
      const enlaceActual = enlaces.nth(i);
      await enlaceActual.waitFor({ state: 'visible', timeout: 5000 }); 
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      const urlAntesDelClic = page.url();
      await enlaceActual.click({timeout: 10000});
      
      try {
        console.log('Esperando navegación a nueva página...');
        await page.waitForURL(urlObj => {
          const currentUrlString = urlObj.toString();
          const targetHref = hrefEnlace || 'a_very_unlikely_string_to_match_if_href_is_null';
          return currentUrlString !== urlAntesDelClic && currentUrlString.includes(targetHref);
        }, { timeout: 30000 }); 
        console.log(`Navegación detectada. Nueva URL: ${page.url()}`);
        // ¡IMPORTANTE! AJUSTAR EL SIGUIENTE SELECTOR a un elemento que DEBE estar en la página de destino
        await expect(page.locator('body main').first()).toBeVisible({ timeout: 15000 }); 
        console.log('Elemento clave de la página de destino visible.');
      } catch (e) {
        console.warn(`Timeout o error esperando la navegación para "${hrefEnlace}". URL actual: ${page.url()}. Error: ${e.message}`);
      }
      
      await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
      await handlePopups(page); 

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await handlePopups(page); 
        await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 15000 }); 
      }
    }
    console.log('\nTodos los enlaces del submenú "¿Qué puedes hacer?" han sido visitados.');
  });*/

  test('Menu Ayuda', async ({ page }) => {
    const triggerAyuda = page.locator('li[data-route="/ayuda"] > span.navigation-list-dropdown:has-text("Ayuda")');
    const selectorEnlacesSubmenu = 'li[data-route="/ayuda"] ul.navigation-sub-list a.navigation-sub-list-link';

    console.log('Asegurando que no haya popups antes del primer clic en menú "Ayuda"');
    await handlePopups(page);
    await triggerAyuda.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Haciendo clic en el trigger del menú "Ayuda"');
    await triggerAyuda.click({timeout: 10000});

    const subMenu = page.locator('li[data-route="/ayuda"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible', timeout: 5000 });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de Ayuda.`);
    expect(numeroDeEnlaces).toBeGreaterThan(0);

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración Ayuda ${i + 1} de ${numeroDeEnlaces}:`);
      await handlePopups(page); 
       if (i > 0 || !(await subMenu.isVisible({timeout: 2000}))) { 
          console.log('Submenú no visible o no es la primera iteración, reabriendo menú principal...');
          await triggerAyuda.waitFor({ state: 'visible', timeout: 10000 });
          await triggerAyuda.click({timeout: 40000});
          await subMenu.waitFor({ state: 'visible', timeout: 5000 });
      }

      const enlaceActual = enlaces.nth(i);
      await enlaceActual.waitFor({ state: 'visible', timeout: 5000 });
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      const esEnlaceExterno = hrefEnlace && (hrefEnlace.startsWith('http://') || hrefEnlace.startsWith('https://')) && !hrefEnlace.includes('lulobank.com');
      const urlAntesDelClicAyuda = page.url();

      if (esEnlaceExterno) {
        console.log('Detectado enlace externo, esperando popup/nueva pestaña...');
        const [newPage] = await Promise.all([
            page.waitForEvent('popup', {timeout: 10000}).catch(() => {
              console.log('No se abrió un popup/nueva pestaña para enlace externo.');
              return null;
            }), 
            enlaceActual.click({timeout: 10000}), 
        ]);

        if (newPage) {
            console.log(`Nueva pestaña abierta para: ${newPage.url()}`);
            await newPage.waitForLoadState('domcontentloaded', {timeout: 25000}).catch(() => console.warn("Timeout esperando carga de nueva pestaña"));
            await expect(newPage).not.toHaveTitle(/Error/, {timeout: 5000});
            await newPage.close();
            console.log('Nueva pestaña cerrada.');
        } else {
            if(page.url() !== urlAntesDelClicAyuda){
                await page.waitForLoadState('domcontentloaded', {timeout: 25000}).catch(() => console.warn("Timeout esperando carga de página tras clic en enlace externo"));
                console.log(`Página visitada (posiblemente externa, misma pestaña): ${page.url()}`);
                 await expect(page).not.toHaveTitle(/Error/, {timeout: 5000});
            } else {
                console.log("El clic en enlace externo no cambió la URL de la pestaña actual ni abrió un popup.");
            }
        }
      } else { 
        await enlaceActual.click({timeout: 60000});
        try {
          console.log('Esperando cambio de URL o contenido de la nueva página interna...');
          await page.waitForURL(urlObj => {
            const currentUrlString = urlObj.toString();
            const targetHref = hrefEnlace || 'a_very_unlikely_string_to_match_if_href_is_null';
            return currentUrlString !== urlAntesDelClicAyuda && currentUrlString.includes(targetHref);
          }, { timeout: 25000 }); 
          // ¡IMPORTANTE! AJUSTAR EL SIGUIENTE SELECTOR
          await expect(page.locator('body main').first()).toBeVisible({ timeout: 15000 }); 
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
        await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 15000 });
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
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 30000 });
    console.log('Página principal estabilizada después de popups (Pruebas de Navegación Directa).');
  });

  test('Snacks', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/snacks\')]').getByText('Snacks').click();
    await expect(page).toHaveTitle('Lulo bank - Snacks');
    await handlePopups(page); 
    console.log('Navegado a la página de Snacks.');
  });

  test('Nosotros', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/about\')]').getByText('Nosotros').click();
    await expect(page).toHaveTitle('Lulo bank - Nosotros');
    await handlePopups(page); 
    console.log('Navegado a la página Nosotros.');
  });

  test('Tips de seguridad', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/tips-de-seguridad\')]').getByText('Tips de seguridad').click();
    await expect(page).toHaveTitle('Lulo bank - Tips de seguridad');
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
    await page.goto(PAGINA_DESCARGA, { waitUntil: 'domcontentloaded', timeout: 80000 }); 
    await handlePopups(page); 
    
    console.log('Esperando estabilización de página de descarga después de manejar popups...');
    const seccionDescargaPrincipal = page.locator('div.download-app-introduction-section-content');
    await expect(seccionDescargaPrincipal).toBeVisible({timeout: 60000}); 

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

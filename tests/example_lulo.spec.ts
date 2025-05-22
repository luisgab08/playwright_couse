import { test, expect, Page } from '@playwright/test';

// URL base para las pruebas
const paginaLulo = 'https://www.lulobank.com/';

/**
 * Función para manejar y cerrar el popup informativo si está visible.
 * @param page - La instancia de la página de Playwright.
 */
async function handleInfoPopup(page: Page): Promise<void> {
  const popupSelector = 'div#modal-alert__custom';
  const closeButtonSelector = 'div#modal-alert__custom button.btn-clean.btn-dark:has-text("Cerrar")'; // Selector más específico para el botón cerrar

  try {
    const popup = page.locator(popupSelector);
    if (await popup.isVisible({ timeout: 5000 })) { // Espera hasta 5 segundos por el popup
      console.log('Popup informativo detectado.');
      const closeButton = page.locator(closeButtonSelector);
      if (await closeButton.isVisible({ timeout: 2000 })) {
        await closeButton.click();
        console.log('Botón "Cerrar" del popup informativo presionado.');
        await popup.waitFor({ state: 'hidden', timeout: 3000 }); // Esperar a que el popup desaparezca
        console.log('Popup informativo cerrado.');
      } else {
        console.log('Botón "Cerrar" del popup no encontrado o no visible, aunque el popup sí lo está.');
      }
    } else {
      console.log('Popup informativo no visible o no presente.');
    }
  } catch (error) {
    console.log('No se pudo interactuar con el popup informativo o no apareció:', error);
  }
}


test.describe('Pruebas Generales LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo);
    await page.waitForLoadState('load'); // Esperar a que la página principal cargue
    await handleInfoPopup(page); // Intentar cerrar el popup después de cargar la página
  });

  test('Lulobank online', async ({ page }) => {
    // La navegación y el manejo del popup ya se hicieron en beforeEach
    // Solo se añaden aserciones o interacciones específicas de esta prueba
    await expect(page.locator('//p[contains(@class, \'footer-copyright\')]').first()).toBeVisible({ timeout: 10000 });
    console.log('Test "Lulobank online" completado, footer visible.');
    // await page.waitForTimeout(5000) // Generalmente no se recomienda para pruebas reales
    // await page.pause() // Solo para depuración
  });
});


test.describe('Pruebas de Menús LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo);
    await page.waitForLoadState('load');
    await handleInfoPopup(page);
  });

  test('Menu ¿Qué puedes hacer?', async ({ page }) => {
    const triggerMenu = page.locator('li[data-route="/features"] > span.navigation-list-dropdown:has-text("¿Qué puedes hacer?")');
    const selectorEnlacesSubmenu = 'li[data-route="/features"] ul.navigation-sub-list a.navigation-sub-list-link';

    await triggerMenu.click();
    const subMenu = page.locator('li[data-route="/features"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible' });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de "¿Qué puedes hacer?".`);
    expect(numeroDeEnlaces).toBeGreaterThan(0); // Asegurarse de que hay enlaces

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración ¿Qué puedes hacer? ${i + 1}:`);
      // Reabrir el menú en cada iteración si se cierra después de la navegación
      if (i > 0 || !(await subMenu.isVisible())) { // Si no es la primera iteración O el submenú no está visible
          await triggerMenu.waitFor({ state: 'visible' });
          await triggerMenu.click();
          await subMenu.waitFor({ state: 'visible' });
      }
      
      const enlaceActual = enlaces.nth(i);
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      await enlaceActual.click();
      await page.waitForLoadState('load');
      console.log(`Página visitada: ${page.url()}`);
      await expect(page).not.toHaveTitle(/Error/);

      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo); // Volver a la página principal para la siguiente iteración
        await page.waitForLoadState('load');
        await handleInfoPopup(page); // Manejar popup de nuevo si aparece al volver
      }
    }
    console.log('\nTodos los enlaces del submenú "¿Qué puedes hacer?" han sido visitados.');
  });

  test('Menu Ayuda', async ({ page }) => {
    const triggerAyuda = page.locator('li[data-route="/ayuda"] > span.navigation-list-dropdown:has-text("Ayuda")');
    const selectorEnlacesSubmenu = 'li[data-route="/ayuda"] ul.navigation-sub-list a.navigation-sub-list-link';

    await triggerAyuda.click();
    const subMenu = page.locator('li[data-route="/ayuda"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible' });

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de Ayuda.`);
    expect(numeroDeEnlaces).toBeGreaterThan(0);

    for (let i = 0; i < numeroDeEnlaces; i++) {
      console.log(`\nIteración Ayuda ${i + 1}:`);
       if (i > 0 || !(await subMenu.isVisible())) {
          await triggerAyuda.waitFor({ state: 'visible' });
          await triggerAyuda.click();
          await subMenu.waitFor({ state: 'visible' });
      }

      const enlaceActual = enlaces.nth(i);
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);
      
      // Si el enlace es externo, la navegación puede ser diferente
      const esEnlaceExterno = hrefEnlace && (hrefEnlace.startsWith('http://') || hrefEnlace.startsWith('https://'));

      if (esEnlaceExterno) {
        // Para enlaces externos, Playwright puede manejarlos en una nueva pestaña si se abren así
        // o simplemente navegar. Aquí asumimos navegación en la misma pestaña.
        const [newPage] = await Promise.all([
            page.waitForEvent('popup', {timeout: 5000}).catch(() => null), // Intenta capturar un popup si se abre
            enlaceActual.click(),
        ]);
        if (newPage) {
            console.log(`Nueva pestaña abierta para: ${newPage.url()}`);
            await newPage.waitForLoadState('load', {timeout: 15000}).catch(() => console.warn("Timeout esperando carga de nueva pestaña"));
            await expect(newPage).not.toHaveTitle(/Error/);
            await newPage.close();
            console.log('Nueva pestaña cerrada.');
        } else {
            await page.waitForLoadState('load', {timeout: 15000}).catch(() => console.warn("Timeout esperando carga de página tras clic en enlace externo"));
            console.log(`Página visitada (posiblemente externa): ${page.url()}`);
            await expect(page).not.toHaveTitle(/Error/);
        }

      } else {
        await enlaceActual.click();
        await page.waitForLoadState('load');
        console.log(`Página visitada: ${page.url()}`);
        await expect(page).not.toHaveTitle(/Error/);
      }


      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página principal...');
        await page.goto(paginaLulo);
        await page.waitForLoadState('load');
        await handleInfoPopup(page);
      }
    }
    console.log('\nTodos los enlaces del submenú Ayuda han sido visitados.');
  });
});


test.describe('Pruebas de Navegación Directa LuloBank', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(paginaLulo);
    await page.waitForLoadState('load');
    await handleInfoPopup(page);
  });

  test('Snacks', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/snacks\')]').getByText('Snacks').click();
    await page.waitForLoadState('load');
    await expect(page).toHaveURL(/.*\/snacks/);
    console.log('Navegado a la página de Snacks.');
  });

  test('Nosotros', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/about\')]').getByText('Nosotros').click();
    await page.waitForLoadState('load');
    await expect(page).toHaveURL(/.*\/about/);
    console.log('Navegado a la página Nosotros.');
  });

  test('Tips de seguridad', async ({ page }) => {
    await page.locator('//a[contains(@href, \'/tips-de-seguridad\')]').getByText('Tips de seguridad').click();
    await page.waitForLoadState('load');
    await expect(page).toHaveURL(/.*\/tips-de-seguridad/);
    console.log('Navegado a la página Tips de seguridad.');
  });
});


const URL_ESPERADA_IOS: string = 'https://apps.apple.com/co/app/lulo-bank/id1534359078'; // Quitamos el '?' al final si no es necesario
const URL_ESPERADA_ANDROID: string = 'https://play.google.com/store/apps/details?id=co.com.lulobank.production'; // Simplificado
const PAGINA_DESCARGA: string = 'https://www.lulobank.com/descarga-lulo-bank';

test.describe('Pruebas de la página de descarga de Lulo Bank', () => {
  test.beforeEach(async ({ page }) => {
    // Para esta suite, la navegación a la página específica se hace en el test
    // pero podríamos manejar un popup genérico si apareciera aquí también.
    // Sin embargo, es más probable que el popup aparezca en la página principal.
  });

  test('Debe cargar la página de descarga y verificar los enlaces de las tiendas', async ({ page }) => {
    await page.goto(PAGINA_DESCARGA);
    await page.waitForLoadState('load');
    await handleInfoPopup(page); // Manejar popup si aparece en esta página específica

    await expect(page).toHaveTitle(/Lulo bank - Descarga y prueba la app/);

    const seccionDescargaPrincipal = page.locator('div.download-app-introduction-section-content');
    await expect(seccionDescargaPrincipal).toBeVisible();

    const enlaceIOS = seccionDescargaPrincipal.getByRole('link', { name: /Download on the App Store/i });
    await expect(enlaceIOS).toBeVisible();
    // Para URLs que pueden tener parámetros de campaña, es mejor usar `toContain` o regex.
    await expect(enlaceIOS).toHaveAttribute('href', new RegExp(`^${URL_ESPERADA_IOS}`));


    const enlaceAndroid = seccionDescargaPrincipal.getByRole('link', { name: /Google Play store/i });
    await expect(enlaceAndroid).toBeVisible();
    await expect(enlaceAndroid).toHaveAttribute('href', new RegExp(`^${URL_ESPERADA_ANDROID}`));

    const imagenAppStore = seccionDescargaPrincipal.locator('img[src="/images/app_store_badge_EN.svg"]');
    await expect(imagenAppStore).toBeVisible();

    const imagenGooglePlay = seccionDescargaPrincipal.locator('img[src="/images/google-play-badge-EN.svg"]');
    await expect(imagenGooglePlay).toBeVisible();
    console.log('Verificación de enlaces y logos de tiendas en página de descarga completada.');
  });
});

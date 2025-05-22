import { test, expect, Page } from '@playwright/test';

// Asume que la URL base ya está configurada en playwright.config.js o navega aquí
const paginaLulo = 'https://www.lulobank.com/'; // Reemplaza esto

test('Lulobank online', async ({ page }) => {
  await page.goto(paginaLulo);

  //Espera a que cargue la página
  await page.waitForLoadState('load');
  
  // Espera a encontrar el footer con la clase footer-copyright
  //await expect(page.locator('//p[contains(@class, \'footer-copyright\')]')).toBeVisible();
  //await page.waitForTimeout(5000)
  //await page.pause()
});


test('Menu ¿Qué puedes hacer?', async ({ page }) => {
  await page.goto(paginaLulo);

  // Selector para el trigger del menú "Ayuda"
  const triggerAyuda = page.locator('li[data-route="/features"] > span.navigation-list-dropdown:has-text("¿Qué puedes hacer?")');

  // Selector base para los enlaces dentro del submenú de Ayuda
  // Esto localiza los 'a' dentro de la 'ul' que es hermana del 'span' dentro del 'li' principal
  const selectorEnlacesSubmenu = 'li[data-route="/features"] ul.navigation-sub-list a.navigation-sub-list-link';

  // 1. Primero, necesitamos saber cuántos enlaces hay para iterar.
  //    Abrimos el menú una vez para contarlos.
  await triggerAyuda.click(); // O .hover() si se abre al pasar el cursor
  const subMenu = page.locator('li[data-route="/features"] ul.navigation-sub-list');
  await subMenu.waitFor({ state: 'visible' }); // Esperar a que el submenú sea visible

  const enlaces = page.locator(selectorEnlacesSubmenu);
  const numeroDeEnlaces = await enlaces.count();
  console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de Ayuda.`);

  // Si el menú se cierra al hacer clic fuera, podríamos cerrarlo aquí o dejarlo.
  // Para este bucle, lo reabriremos en cada iteración por seguridad.

  // 2. Iterar N veces, donde N es el número de enlaces.
  for (let i = 0; i < numeroDeEnlaces; i++) {
    // a. Asegurarse de que el menú "Ayuda" esté abierto antes de cada interacción
    console.log(`\nIteración ${i + 1}:`);
    await triggerAyuda.waitFor({ state: 'visible' }); // Asegurarse que el trigger está ahí
    await triggerAyuda.click(); // Hacer clic para abrir/reabrir el menú
    await subMenu.waitFor({ state: 'visible' }); // Esperar a que el submenú sea visible

    // b. Localizar el enlace específico para esta iteración (nth es 0-indexed)
    const enlaceActual = enlaces.nth(i);

    // c. (Opcional) Obtener el texto y el href para logging o verificación
    const textoEnlace = await enlaceActual.textContent();
    const hrefEnlace = await enlaceActual.getAttribute('href');
    console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);

    // d. Hacer clic en el enlace
    await enlaceActual.click();

    // e. Esperar a que la nueva página cargue y realizar acciones/verificaciones
    // Playwright espera automáticamente a que la navegación se complete después de un clic.
    // Puedes añadir esperas explícitas si es necesario.
    await page.waitForLoadState('load'); // Ejemplo de espera
    console.log(`Página visitada: ${page.url()}`);
    await expect(page).not.toHaveTitle(/Error/); // Ejemplo de aserción básica

    // f. Si no es el último enlace, navegar de regreso
    if (i < numeroDeEnlaces - 1) {
      console.log('Navegando de regreso a la página del menú...');
      //await page.goBack();
      await page.goto(paginaLulo);
      // Esperar a que la página original cargue y que el trigger del menú esté disponible de nuevo
      await page.waitForLoadState('load');
      await triggerAyuda.waitFor({ state: 'visible' });
    }
  }
  console.log('\nTodos los enlaces del submenú han sido visitados.');
});


test('Snacks', async ({ page }) => {
  await page.goto(paginaLulo);
  await page.locator('//a[contains(@href, \'/snacks\')]').getByText('Snacks').click();
  await page.waitForLoadState('load');
});


test('Nosotros', async ({ page }) => {
  await page.goto(paginaLulo);
  await page.locator('//a[contains(@href, \'/about\')]').getByText('Nosotros').click();
  await page.waitForLoadState('load');
});


test('Ayuda', async ({ page }) => {
    await page.goto(paginaLulo);

    // Selector para el trigger del menú "Ayuda"
    const triggerAyuda = page.locator('li[data-route="/ayuda"] > span.navigation-list-dropdown:has-text("Ayuda")');

    // Selector base para los enlaces dentro del submenú de Ayuda
    // Esto localiza los 'a' dentro de la 'ul' que es hermana del 'span' dentro del 'li' principal
    const selectorEnlacesSubmenu = 'li[data-route="/ayuda"] ul.navigation-sub-list a.navigation-sub-list-link';

    // 1. Primero, necesitamos saber cuántos enlaces hay para iterar.
    //    Abrimos el menú una vez para contarlos.
    await triggerAyuda.click(); // O .hover() si se abre al pasar el cursor
    const subMenu = page.locator('li[data-route="/ayuda"] ul.navigation-sub-list');
    await subMenu.waitFor({ state: 'visible' }); // Esperar a que el submenú sea visible

    const enlaces = page.locator(selectorEnlacesSubmenu);
    const numeroDeEnlaces = await enlaces.count();
    console.log(`Se encontraron ${numeroDeEnlaces} enlaces en el submenú de Ayuda.`);

    // Si el menú se cierra al hacer clic fuera, podríamos cerrarlo aquí o dejarlo.
    // Para este bucle, lo reabriremos en cada iteración por seguridad.

    // 2. Iterar N veces, donde N es el número de enlaces.
    for (let i = 0; i < numeroDeEnlaces; i++) {
      // a. Asegurarse de que el menú "Ayuda" esté abierto antes de cada interacción
      console.log(`\nIteración ${i + 1}:`);
      await triggerAyuda.waitFor({ state: 'visible' }); // Asegurarse que el trigger está ahí
      await triggerAyuda.click(); // Hacer clic para abrir/reabrir el menú
      await subMenu.waitFor({ state: 'visible' }); // Esperar a que el submenú sea visible

      // b. Localizar el enlace específico para esta iteración (nth es 0-indexed)
      const enlaceActual = enlaces.nth(i);

      // c. (Opcional) Obtener el texto y el href para logging o verificación
      const textoEnlace = await enlaceActual.textContent();
      const hrefEnlace = await enlaceActual.getAttribute('href');
      console.log(`Intentando hacer clic en: "${textoEnlace?.trim()}" con href: "${hrefEnlace}"`);

      // d. Hacer clic en el enlace
      await enlaceActual.click();

      // e. Esperar a que la nueva página cargue y realizar acciones/verificaciones
      // Playwright espera automáticamente a que la navegación se complete después de un clic.
      // Puedes añadir esperas explícitas si es necesario.
      await page.waitForLoadState('load'); // Ejemplo de espera
      console.log(`Página visitada: ${page.url()}`);
      await expect(page).not.toHaveTitle(/Error/); // Ejemplo de aserción básica

      // f. Si no es el último enlace, navegar de regreso
      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página del menú...');
        await page.goBack();
        // Esperar a que la página original cargue y que el trigger del menú esté disponible de nuevo
        await page.waitForLoadState('load');
        await triggerAyuda.waitFor({ state: 'visible' });
      }
    }
    console.log('\nTodos los enlaces del submenú han sido visitados.');
  });


test('Tips de seguridad', async ({ page }) => {
  await page.goto(paginaLulo);
  await page.locator('//a[contains(@href, \'/tips-de-seguridad\')]').getByText('Tips de seguridad').click();
  await page.waitForLoadState('load');
});


// Define las URLs esperadas para las tiendas de aplicaciones (CORREGIDAS)
const URL_ESPERADA_IOS: string = 'https://apps.apple.com/co/app/lulo-bank/id1534359078?';
const URL_ESPERADA_ANDROID: string = 'https://play.google.com/store/apps/details?id=co.com.lulobank.production&hl=es&gl=US';
// Alternativa más flexible para Android si los parámetros hl y gl pueden variar:
// const URL_ESPERADA_ANDROID_REGEX: RegExp = /https:\/\/play\.google\.com\/store\/apps\/details\?id=co\.com\.lulobank\.production/;

const PAGINA_DESCARGA: string = 'https://www.lulobank.com/descarga-lulo-bank';

test.describe('Pruebas de la página de descarga de Lulo Bank (TypeScript)', () => {

  test('Debe cargar la página de descarga y verificar los enlaces de las tiendas', async ({ page }) => {
    // 1. Navegar a la página de descarga
    await page.goto(PAGINA_DESCARGA);

    // 2. Verificar el título de la página (ajustado según el HTML proporcionado)
    await expect(page).toHaveTitle(/Lulo bank - Descarga y prueba la app/);

    // 3. Localizar la sección principal de descarga para evitar ambigüedad con el footer.
    // Esta clase parece ser un buen contenedor para los botones de descarga principales.
    const seccionDescargaPrincipal = page.locator('div.download-app-introduction-section-content');

    // 4. Comprobar el enlace de descarga para iOS dentro de la sección principal
    const enlaceIOS = seccionDescargaPrincipal.getByRole('link', { name: /Download on the App Store/i });
    await expect(enlaceIOS).toBeVisible();
    await expect(enlaceIOS).toHaveAttribute('href', URL_ESPERADA_IOS);

    // 5. Comprobar el enlace de descarga para Android dentro de la sección principal
    //    El texto del enlace es "Download on the Google Play store"
    const enlaceAndroid = seccionDescargaPrincipal.getByRole('link', { name: /Google Play store/i });
    await expect(enlaceAndroid).toBeVisible();
    await expect(enlaceAndroid).toHaveAttribute('href', URL_ESPERADA_ANDROID);
    // Si usas la expresión regular para Android:
    // await expect(enlaceAndroid).toHaveAttribute('href', URL_ESPERADA_ANDROID_REGEX);

    // 6. Opcional: Verificar que las imágenes de las tiendas estén presentes dentro de la sección principal
    //    Las imágenes en el HTML tienen alt="", por lo que { name: '' } podría no ser suficientemente específico.
    //    Es más robusto localizarlas por su atributo 'src' si el 'alt' no es único o descriptivo.

    const imagenAppStore = seccionDescargaPrincipal.locator('img[src="/images/app_store_badge_EN.svg"]');
    await expect(imagenAppStore).toBeVisible(); // Playwright espera automáticamente a que el elemento exista y sea visible

    const imagenGooglePlay = seccionDescargaPrincipal.locator('img[src="/images/google-play-badge-EN.svg"]');
    await expect(imagenGooglePlay).toBeVisible();
  });
});


// tests/mercadolibre.spec.ts
// Función auxiliar para hacer scroll hacia abajo una cantidad de píxeles
async function scrollDown(page: Page, pixels: number) {
  await page.evaluate((pixelsToScroll) => {
    window.scrollBy(0, pixelsToScroll);
  }, pixels);
}

// Función auxiliar para hacer scroll hasta el inicio de la página
async function scrollToTop(page: Page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

test.describe('Pruebas en MercadoLibre Colombia', () => {
  test('Buscar producto, hacer scroll y volver arriba', async ({ page }) => {
    // 1. Ingresar al portal https://www.mercadolibre.com.co/
    await page.goto('https://www.mercadolibre.com.co/');
    console.log('Página de MercadoLibre cargada.');

    // (Opcional) Manejar el popup de cookies si aparece
    // Los selectores pueden cambiar, es importante verificarlos.
    const cookieButtonSelector = 'button[data-testid="action:understood-button"]'; // Selector común para el botón de aceptar cookies
    try {
      const cookieButton = page.locator(cookieButtonSelector);
      if (await cookieButton.isVisible({ timeout: 5000 })) { // Espera 5 segundos por el botón
        await cookieButton.click();
        console.log('Popup de cookies cerrado.');
      } else {
        console.log('Popup de cookies no encontrado o ya cerrado.');
      }
    } catch (error) {
      console.log('No se pudo interactuar con el popup de cookies o no apareció:', error);
    }
    
    // 2. En la barra de búsqueda de productos escribir el texto: "Samsung s23 Ultra"
    // El ID del input de búsqueda es usualmente 'cb1-edit' o similar, pero puede cambiar.
    // Usaremos un selector de placeholder que es más robusto si el ID cambia.
    const searchBarSelector = 'input[placeholder="Buscar productos, marcas y más…"]';
    const searchBar = page.locator(searchBarSelector);

    // Esperar a que la barra de búsqueda esté visible y habilitada
    await searchBar.waitFor({ state: 'visible', timeout: 10000 });
    await searchBar.waitFor({ state: 'visible', timeout: 10000 });
    
    const searchText = "Samsung s23 Ultra";
    await searchBar.fill(searchText);
    console.log(`Texto "${searchText}" ingresado en la barra de búsqueda.`);

    // 3. Presionar enter o hacer clic en la lupa de buscar disponible.
    // Opción A: Presionar Enter
    await searchBar.press('Enter');
    console.log('Tecla Enter presionada para buscar.');

    // Opción B: Hacer clic en el botón de búsqueda (si se prefiere)
    // const searchButtonSelector = 'button[type="submit"].nav-search-btn'; // Selector común para el botón de búsqueda
    // const searchButton = page.locator(searchButtonSelector);
    // await searchButton.click();
    // console.log('Botón de búsqueda presionado.');

    // Esperar a que los resultados de la búsqueda carguen.
    // Un buen indicador es esperar a que aparezca la sección de resultados.
    // Este selector es un ejemplo y podría necesitar ajuste.
    const resultsSectionSelector = 'section.ui-search-results'; 
    try {
      await page.waitForSelector(resultsSectionSelector, { state: 'visible', timeout: 20000 });
      console.log('Resultados de búsqueda cargados.');
    } catch (error) {
      console.error('Error: No se cargaron los resultados de búsqueda o el selector es incorrecto.', error);
      // Podrías añadir una aserción de fallo aquí o simplemente dejar que el test continúe y falle en pasos posteriores si es crítico.
    }
    

    // 4. Hacer un poco de scroll vertical hacia abajo
    console.log('Haciendo scroll hacia abajo...');
    await scrollDown(page, 1000); // Scroll de 1000 píxeles hacia abajo
    await page.waitForTimeout(1000); // Pausa breve para observar el scroll

    await scrollDown(page, 1000); // Otro scroll de 1000 píxeles hacia abajo
    await page.waitForTimeout(1000); // Pausa breve

    // 5. Volver a arriba nuevamente al inicio de la página.
    console.log('Haciendo scroll hacia arriba (inicio de la página)...');
    await scrollToTop(page);
    await page.waitForTimeout(2000); // Pausa breve para observar que se volvió al inicio

    // (Opcional) Añadir una aserción para verificar algo después del scroll
    // Por ejemplo, verificar que un elemento del header esté visible nuevamente
    const logoMercadoLibre = page.locator('a.nav-logo'); // Selector del logo
    await expect(logoMercadoLibre).toBeVisible();
    console.log('Verificado que el logo de MercadoLibre está visible después de volver arriba.');
  });
});

import { test, expect } from '@playwright/test';

  // Asume que la URL base ya está configurada en playwright.config.js o navega aquí
  const paginaConElMenu = 'https://www.lulobank.com/'; // Reemplaza esto

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});


test('Lulobank online', async ({ page }) => {
  await page.goto('https://www.lulobank.com/');

  // Espera a encontrar el footer con la clase footer-copyright
  await expect(page.locator('//p[contains(@class, \'footer-copyright\')]')).toBeVisible();
  await page.waitForTimeout(5000)
  //await page.pause()
});


/*test('Menu ¿Qué puedes hacer?', async ({ page }) => {
  await page.goto(paginaConElMenu);

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
    await page.waitForLoadState('domcontentloaded'); // Ejemplo de espera
    console.log(`Página visitada: ${page.url()}`);
    await expect(page).not.toHaveTitle(/Error/); // Ejemplo de aserción básica

    // f. Si no es el último enlace, navegar de regreso
    if (i < numeroDeEnlaces - 1) {
      console.log('Navegando de regreso a la página del menú...');
      //await page.goBack();
      await page.goto(paginaConElMenu);
      // Esperar a que la página original cargue y que el trigger del menú esté disponible de nuevo
      await page.waitForLoadState('domcontentloaded');
      await triggerAyuda.waitFor({ state: 'visible' });
    }
  }
  console.log('\nTodos los enlaces del submenú han sido visitados.');
});
*/

test('Snacks', async ({ page }) => {
  await page.goto('https://www.lulobank.com/');

  await expect(page.locator('//a[contains(@href, \'/snacks\')]')).toBeVisible();
  await page.getByText('Snacks').click();
  await expect(page.locator('//p[contains(@class, \'footer-copyright\')]')).toBeVisible();
  //await expect(page.locator('//span[contains(text(), \'¿Qué puedes hacer?\')]')).toBeVisible();
  await page.waitForTimeout(5000)
  //await page.pause()
});


test('Nosotros', async ({ page }) => {
  await page.goto('https://www.lulobank.com/');

  await expect(page.locator('//a[contains(@href, \'/about\')]')).toBeVisible();
  await page.getByText('Nosotros').click();
  await expect(page.locator('//p[contains(@class, \'footer-copyright\')]')).toBeVisible();
  await page.waitForTimeout(5000)
  //await page.pause()
});


test('Ayuda', async ({ page }) => {
    await page.goto(paginaConElMenu);

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
      await page.waitForLoadState('domcontentloaded'); // Ejemplo de espera
      console.log(`Página visitada: ${page.url()}`);
      await expect(page).not.toHaveTitle(/Error/); // Ejemplo de aserción básica

      // f. Si no es el último enlace, navegar de regreso
      if (i < numeroDeEnlaces - 1) {
        console.log('Navegando de regreso a la página del menú...');
        await page.goBack();
        // Esperar a que la página original cargue y que el trigger del menú esté disponible de nuevo
        await page.waitForLoadState('domcontentloaded');
        await triggerAyuda.waitFor({ state: 'visible' });
      }
    }
    console.log('\nTodos los enlaces del submenú han sido visitados.');
  });


test('Tips de seguridad', async ({ page }) => {
  await page.goto('https://www.lulobank.com/');

  await expect(page.locator('//a[contains(@href, \'/tips-de-seguridad\')]')).toBeVisible();
  await page.getByText('Tips de seguridad').click();
  await expect(page.locator('//p[contains(@class, \'footer-copyright\')]')).toBeVisible();
  await page.waitForTimeout(5000)
  //await page.pause()
});



test('test', async ({ page }) => {  
  await page.goto('https://www.mercadolibre.com.co/');
  await page. locator('input[id=\'cb1-edit\']').fill('iPhone')
  await page.keyboard.press('Enter')
  await expect(page.locator('//ol[contains(@class, \'ui-search-layout\')]')).toBeVisible()
  await page.pause()
});
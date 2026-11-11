import { expect, test } from "@playwright/test";

test("recorre los módulos principales en escritorio y móvil", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /física se entiende mejor/i }),
  ).toBeVisible();

  for (const label of [
    "Campo eléctrico",
    "Capacitores",
    "Circuitos y Ohm",
    "Campo magnético",
    "Fuerza de Lorentz",
  ]) {
    await page
      .getByRole("button", { name: new RegExp(label, "i") })
      .first()
      .click();
    await expect(page.getByText("Unidades de esta vista")).toBeVisible();
    await expect(
      page.getByText("Electrones, protones y neutrones"),
    ).toBeVisible();
  }
});

test("guarda y carga una configuración local", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Guardar$/ }).click();
  await expect(page.getByText(/configuración guardada/i)).toBeVisible();
  await page.getByRole("button", { name: /^Cargar$/ }).click();
  await expect(page.getByText(/configuración cargada/i)).toBeVisible();
});

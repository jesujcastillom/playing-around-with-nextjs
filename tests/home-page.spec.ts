import { expect, test } from "@playwright/test";
import { HomePage } from "./models/home-page.page";

const PAGE_SIZE = 20;

test.describe("Home page", () => {
  test(`Home page loads the initial ${PAGE_SIZE} products`, async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await page.goto("/");
    expect(await homePage.productItems.count()).toBe(PAGE_SIZE);
  });

  test("User can paginate over all the results", async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto("/");
    const { count: total } = await (
      await page.request.get("/api/products")
    ).json();

    let currentPage = 1;
    do {
      await page.click("text=Show more");
      homePage.productItems
        .nth(PAGE_SIZE * currentPage)
        .waitFor({ state: "visible" });
      expect(await homePage.productItems.count()).toBe(
        PAGE_SIZE * (currentPage + 1)
      );
      currentPage++;
    } while (currentPage * PAGE_SIZE < total);
  });

  test("A random product can be added to the cart", async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto("/");
    const count = await homePage.productItems.count();
    const randomProduct = homePage.productItems.nth(
      Math.min(count - 1, Math.round(Math.random() * count))
    );
    await randomProduct.locator("text=/add.+to\\scart/i").click();
    const productName = await randomProduct.locator("p").nth(0).textContent();
    await page.click("text=Your cart");
    await page.waitForNavigation();
    expect(await page.locator(`text="${productName}"`).isVisible()).toBe(true);
  });
});

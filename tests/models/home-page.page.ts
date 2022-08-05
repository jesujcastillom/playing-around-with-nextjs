import { Locator, Page } from "@playwright/test";

export class HomePage {
  productItems: Locator;
  constructor(private readonly page: Page) {
    this.productItems = this.page.locator("ul.grid >> li");
  }
}

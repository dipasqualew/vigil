import { expect } from '@playwright/test';

import { test } from '../src/e2e-test-utils';


test("ingests a text note", async ({ page }) => {
    const content = "A bolognese sauce lasagna with besciamella, with a side of french fries with mayonnaise and a salad with green leaves, cherry tomatoes, and olives.";
    await page.goto("/ingest");
    await page.getByRole("link", { name: "Write something" }).click();
    await page.getByPlaceholder('What\'s on your mind?').fill(content);
    await page.getByRole('button', { name: 'Ingest' }).click({ force: true });

    const contentUrlRegex = /\/usercontent\/([\w-]+)/;
    await page.waitForURL(contentUrlRegex);

    const match = contentUrlRegex.exec(page.url());
    const contentUuid = match && match[1];

    expect(contentUuid).toBeTruthy();

    await expect(page.locator("main")).toContainText("Showing Sources");
    await expect(page.locator("main")).toContainText(content);
});

test("ingests a file (image)", async ({ page, getFixture }) => {
    const filePath = await getFixture("contents/five-guys-burger-photo.jpg");
    await page.goto("/ingest");
    await page.getByRole("link", { name: "Upload a file" }).click();
    await page.getByRole('textbox').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Ingest' }).click();

    const contentUrlRegex = /\/usercontent\/([\w-]+)/;
    await page.waitForURL(contentUrlRegex);

    const match = contentUrlRegex.exec(page.url());
    const contentUuid = match && match[1];

    expect(contentUuid).toBeTruthy();

    await expect(page.locator("main")).toContainText("Showing Sources");
    await expect(page.locator("main")).toContainText("You uploaded a file");
});

test("ingests a file (audio)", async ({ page, getFixture }) => {
    const filePath = await getFixture("contents/five-guys-burger-reminder.mp3");
    await page.goto("/ingest");
    await page.getByRole("link", { name: "Upload a file" }).click();
    await page.getByRole('textbox').setInputFiles(filePath);
    await page.getByRole('button', { name: 'Ingest' }).click();

    const contentUrlRegex = /\/usercontent\/([\w-]+)/;
    await page.waitForURL(contentUrlRegex);

    const match = contentUrlRegex.exec(page.url());
    const contentUuid = match && match[1];

    expect(contentUuid).toBeTruthy();

    await expect(page.locator("main")).toContainText("Showing Sources");
    await expect(page.locator("main")).toContainText("You uploaded a file");
});

test("ingests a photo", async ({ page }) => {
    await page.goto("/ingest");
    await page.getByRole("link", { name: "Take a photo" }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Take Picture' }).click({ force: true });

    const contentUrlRegex = /\/usercontent\/([\w-]+)/;
    await page.waitForURL(contentUrlRegex);

    const match = contentUrlRegex.exec(page.url());
    const contentUuid = match && match[1];

    expect(contentUuid).toBeTruthy();

    await expect(page.locator("main")).toContainText("Showing Sources");
    await expect(page.locator("main")).toContainText("You took a photo");
});

test("ingests an audio recording", async ({ page }) => {
    await page.goto("/ingest");
    await page.getByRole("link", { name: "Record an audio note" }).click();
    await page.getByRole('button', { name: 'Start Recording' }).click({ force: true });
    await page.waitForTimeout(6000); // The audio is about 5 seconds long
    await page.getByRole('button', { name: 'Stop Recording' }).click({ force: true });
    await page.waitForTimeout(1000);

    const contentUrlRegex = /\/usercontent\/([\w-]+)/;
    await page.waitForURL(contentUrlRegex);

    const match = contentUrlRegex.exec(page.url());
    const contentUuid = match && match[1];

    expect(contentUuid).toBeTruthy();

    await expect(page.locator("main")).toContainText("Showing Sources");
    await expect(page.locator("main")).toContainText("You recorded an audio note");
});

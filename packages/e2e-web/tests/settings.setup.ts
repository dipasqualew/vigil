import { CACHE_FOLDER, test } from "../src/e2e-test-utils";


test("Sets the user settings", async ({ page, env }) => {
    await page.goto("/settings");
    await page.getByLabel('OpenAI API Key').fill(env.OPENAI_API_KEY);
    await page.context().storageState({ path: `${CACHE_FOLDER}/settings.json` });
});

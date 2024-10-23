import path from "path";

import { defineConfig, devices } from '@playwright/test';
import dotenv from "dotenv";

import * as utils from "./src/e2e-test-utils";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';

dotenv.config({ path: path.resolve(utils.ROOT_FOLDER, '.env') });

const baseURL = process.env.CI
    ? process.env.WEBAPP_URL
    : process.env.WEBAPP_URL || `http://localhost:${utils.WEB_PORT}`;

if (!baseURL) {
    throw new Error('Missing WEBAPP_URL environment variable');
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: path.join(utils.CACHE_FOLDER, "html-report") }],
    ],
    use: {
        baseURL,
        screenshot: process.env.CI ? "only-on-failure" : 'off',
        trace: 'retain-on-failure',
    },

    /* Configure projects for major browsers */
    projects: [
        // Setup project
        { name: 'setup', testMatch: /.*\.setup\.ts/ },

        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: `${utils.CACHE_FOLDER}/settings.json`,
                permissions: ["microphone","camera"],
                launchOptions: {
                    args: [
                        "--use-fake-device-for-media-stream",
                        "--use-fake-ui-for-media-stream",
                        `--use-file-for-fake-video-capture=${path.resolve(utils.ROOT_FOLDER, 'fixtures/contents/five-guys-burger-video.mjpeg')}`,
                        `--use-file-for-fake-audio-capture=${path.resolve(utils.ROOT_FOLDER, 'fixtures/contents/five-guys-burger-reminder.wav')}`,
                    ],
                },
            },
            testMatch: /.*\.spec\.ts/,
            dependencies: process.env.CI ? ['setup'] : [],
        },

        // {
        //     name: 'firefox',
        //     use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //     name: 'webkit',
        //     use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
    ],
    outputDir: path.join(utils.CACHE_FOLDER, "test-results"),

    /* Run your local dev server before starting the tests */
    webServer: process.env.CI ? undefined : {
        command: `just dev web --port ${utils.WEB_PORT}`,
        url: `http://localhost:${utils.WEB_PORT}`,
        reuseExistingServer: !process.env.CI,
    },
});

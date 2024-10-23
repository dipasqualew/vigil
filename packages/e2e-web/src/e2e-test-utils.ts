/* eslint-disable no-empty-pattern */
import path from 'path';

import { BrowserContext, test as baseTest } from '@playwright/test';
import * as dotenv from 'dotenv';



export const WEB_PORT = 9999;
export const ROOT_FOLDER = path.join(__dirname, '../../../');
export const CACHE_FOLDER = path.join(ROOT_FOLDER, '.cache/e2e-web');

export interface TestEnvironmentVariables {
    OPENAI_API_KEY: string;
}

export const getEnv = (): TestEnvironmentVariables => {
    dotenv.config({ path: path.join(ROOT_FOLDER, '.env') });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set");
    }

    return { OPENAI_API_KEY };
};

export interface TestFixtures {
    context: BrowserContext;
    getFixture: (name: string) => Promise<string>;
    env: {
        OPENAI_API_KEY: string;
    }
}

export const test = baseTest.extend<TestFixtures>({
    context: async ({ context, env }, use) => {
        const userSettings = JSON.stringify({
            OPENAI_API_KEY: env.OPENAI_API_KEY,
        });

        await context.addInitScript(() => {
            window.localStorage.setItem('userSettings', userSettings);
        });

        await use(context);
    },

    getFixture: async ({ }, use) => {
        const getFixture = async (name: string) => {
            const fixturePath = path.join(ROOT_FOLDER, 'fixtures', name);
            return fixturePath;
        };

        await use(getFixture);
    },
    env: async ({ }, use) => {
        await use(getEnv());
    },
});

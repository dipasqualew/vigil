import pluginJs from "@eslint/js";
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";


const projectConfig = {
    rules: {
        "@stylistic/indent": ["error", 4],
        "@stylistic/object-curly-spacing": ["error", "always"],
        "@stylistic/array-bracket-spacing": ["error", "never"],
        "@stylistic/semi": ["error", "always"],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "always-multiline",
        }],

        // TypeScript rules
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "args": "all",
                "argsIgnorePattern": "^_",
                "caughtErrors": "all",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
                "ignoreRestSiblings": true,
            },
        ],

        // Import rules
        "import/named": "off",
        "import/no-cycle": "off",
        "import/extensions": "off",
        "import/no-unresolved": "off",
        "import/prefer-default-export": "off",
        "import/order": ["error", {
            "alphabetize": {
                "order": "asc",
            },
            "groups": ["builtin", "external", "internal"],
            "pathGroups": [
                // Order all ~/
                // just before all local/relative imports
                {
                    "pattern": "~/**",
                    "group": "internal",
                    "position": "before",
                },
            ],
            "pathGroupsExcludedImportTypes": ["builtin"],
            "newlines-between": "always",
        }],
        "import/newline-after-import": ["error", { "count": 2 }],
        // Also order the individual import members
        // from each file declaration
        "sort-imports": ["error", {
            "ignoreDeclarationSort": true,
        }],
    },
};

export default [
    {
        files: ["**/*.{js,mjs,cjs,ts,vue}"],
    },
    {
        plugins: {
            "@stylistic": stylistic,
        },
    },
    {
        ignores: [
            "**/node_modules/**/*.{js,mjs,cjs,ts,vue}",
            "**/dist/**/*.{js,mjs,cjs,ts,vue}",
            "**/.vercel/**/*.{js,mjs,cjs,ts,vue}",
        ],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    pluginJs.configs.recommended,
    importPlugin.flatConfigs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs["flat/essential"],
    projectConfig,
    {
        files: ["**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },
];

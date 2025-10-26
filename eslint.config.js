const { defineConfig, globalIgnores } = require('eslint/config');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const html = require('eslint-plugin-html');
const prettier = require('eslint-plugin-prettier');
const sonarjs = require('eslint-plugin-sonarjs');
const globals = require('globals');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,

      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },

      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: true,
      },
    },

    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:sonarjs/recommended-legacy'
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      html,
      prettier,
      sonarjs,
    },

    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      semi: 2,
      'no-console': 0,
      'sonarjs/todo-tag': 1,

      'prettier/prettier': [
        0,
        {
          trailingComma: 'es6',
          singleQuote: true,
          printWidth: 80,
          endOfLine: 'auto',
        },
      ],
    },
  },
  globalIgnores([
    'src/**/*.js',
    '**/coverage',
    '**/playwright-report',
    '**/dist',
  ]),
  {
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
]);

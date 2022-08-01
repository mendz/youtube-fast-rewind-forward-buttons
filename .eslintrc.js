module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:sonarjs/recommended',
    'plugin:cypress/recommended',
  ],
  plugins: ['@typescript-eslint', 'html', 'prettier', 'sonarjs', 'cypress'],
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      impliedStrict: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    'cypress/globals': true,
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    semi: 2,
    'no-console': 0,
    'prettier/prettier': [
      0,
      {
        trailingComma: 'es6',
        singleQuote: true,
        printWidth: 80,
        endOfLine: 'auto',
      },
    ],
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
  },
  globals: {
    chrome: true,
  },
};

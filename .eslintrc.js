module.exports = {
  extends: ['airbnb/base', 'prettier'],
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
  },
  rules: {
    semi: 2,
    'no-console': 0,
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 80,
        endOfLine: 'auto',
      },
    ],
  },
  globals: {
    chrome: true,
  },
  plugins: ['html', 'prettier'],
};

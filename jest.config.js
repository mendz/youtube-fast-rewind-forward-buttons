/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  coverageReporters: ['html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__utils__/**',
    '!src/**/options/**',
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  testPathIgnorePatterns: [
    '/__utils__/',
    '<rootDir>/e2e-tests',
    '<rootDir>/playwright-examples',
  ],
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
};

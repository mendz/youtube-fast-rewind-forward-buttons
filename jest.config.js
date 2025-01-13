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
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
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

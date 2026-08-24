/**
 * Jest Configuration for Docker Database API Tests
 */

module.exports = {
  displayName: 'Docker Database API Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.spec.js', '<rootDir>/**/*.test.js'],
  // database-api.js is exercised by spawned-process integration tests, not by
  // required-in unit tests; including it would zero out global coverage.
  collectCoverageFrom: ['../api/auth.js'],
  coverageDirectory: 'coverage/docker',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    '^@/docker/(.*)$': '<rootDir>/../$1',
  },
};

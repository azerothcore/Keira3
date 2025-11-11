/**
 * Jest Configuration for Docker Database API Tests
 */

module.exports = {
  displayName: 'Docker Database API Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.spec.js', '<rootDir>/**/*.test.js'],
  collectCoverageFrom: ['../api/**/*.js', '!../api/**/*.test.js', '!../api/**/*.spec.js'],
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

/**
 * Jest Configuration for Docker Database API Tests
 */

module.exports = {
  displayName: 'Docker Database API Tests',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.spec.js', '<rootDir>/**/*.test.js'],
  collectCoverageFrom: ['../api/auth.js', '../api/database-api.js'],
  coverageDirectory: 'coverage/docker',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  // Thresholds reflect what database-api.spec.js and auth.spec.js genuinely achieve today
  // (combined auth.js + database-api.js: ~82% stmts, ~86% branches, ~76% funcs, ~80% lines
  // as of this writing). Set a bit below that so incidental drift doesn't fail CI; do not
  // raise these without re-measuring. The remaining gaps in database-api.js are mostly
  // process-level concerns (SIGINT/SIGTERM handlers, startServer()'s internal self-check,
  // error-path branches that need a real/broken MySQL pool) covered instead by the
  // live-DB-gated integration suites (KEIRA_LIVE_DB=1).
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/docker/(.*)$': '<rootDir>/../$1',
  },
};

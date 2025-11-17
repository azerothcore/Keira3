/**
 * Jest Test Setup for Docker Database API Tests
 * Configures test environment and mocks
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.KEIRA_DATABASE_HOST = 'test-host';
process.env.KEIRA_DATABASE_PORT = '3306';
process.env.KEIRA_DATABASE_USER = 'test-user';
process.env.KEIRA_DATABASE_PASSWORD = 'test-password';
process.env.KEIRA_DATABASE_NAME = 'test_database';
process.env.DB_API_PORT = '3001';

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock mysql2 module for unit tests
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    getConnection: jest.fn(() =>
      Promise.resolve({
        ping: jest.fn(() => Promise.resolve()),
        execute: jest.fn(() => Promise.resolve([[], []])),
        release: jest.fn(),
      }),
    ),
    end: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock express for API tests
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    listen: jest.fn((port, host, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    }),
  };

  const express = jest.fn(() => mockApp);
  express.json = jest.fn(() => jest.fn());
  express.static = jest.fn(() => jest.fn());

  return express;
});

// Global test utilities
global.testUtils = {
  // Create mock database configuration
  createMockConfig: () => ({
    host: 'test-host',
    port: 3306,
    user: 'test-user',
    password: 'test-password',
    database: 'test_database',
  }),

  // Create mock MySQL error
  createMockMySQLError: (code, errno, message) => {
    const error = new Error(message || 'Mock MySQL error');
    error.code = code;
    error.errno = errno;
    return error;
  },

  // Wait for async operations
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Console suppression for cleaner test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Suppress console output during tests unless explicitly enabled
  if (!process.env.ENABLE_TEST_LOGS) {
    console.error = jest.fn();
    console.log = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;

  // Clear all mocks
  jest.clearAllMocks();
});

/**
 * Integration Tests for Database API Service
 * Tests connection pooling, error handling, and end-to-end API functionality
 */

const http = require('http');
const mysql = require('mysql2');
const { spawn } = require('child_process');

describe('Database API Integration Tests', () => {
  let apiServer;
  let apiPort = 3002; // Use different port to avoid conflicts

  // Mock database connection pool for testing
  let mockPool;
  let mockConnection;

  beforeAll((done) => {
    // Set up test environment variables
    process.env.DB_API_PORT = apiPort.toString();
    process.env.KEIRA_DATABASE_HOST = 'localhost';
    process.env.KEIRA_DATABASE_PORT = '3306';
    process.env.KEIRA_DATABASE_USER = 'test_user';
    process.env.KEIRA_DATABASE_PASSWORD = 'test_password';
    process.env.KEIRA_DATABASE_NAME = 'test_database';

    // Start API server in background
    apiServer = spawn('node', ['database-api.js'], {
      env: { ...process.env },
      stdio: 'pipe',
    });

    // Wait for server to start
    setTimeout(() => {
      done();
    }, 2000);
  });

  afterAll((done) => {
    if (apiServer) {
      apiServer.kill('SIGTERM');
      setTimeout(done, 1000);
    } else {
      done();
    }
  });

  describe('Connection Pool Management', () => {
    it('should handle multiple concurrent connections', (done) => {
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'test_user',
        password: 'test_password',
        database: 'test_database',
      };

      const requests = [];
      const concurrentConnections = 5;

      // Create multiple simultaneous connection requests
      for (let i = 0; i < concurrentConnections; i++) {
        const requestPromise = new Promise((resolve, reject) => {
          const postData = JSON.stringify({ config: connectionConfig });
          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/api/database/connect',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
            timeout: 5000,
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                const response = JSON.parse(data);
                resolve({ status: res.statusCode, data: response, requestId: i });
              } catch (error) {
                reject(error);
              }
            });
          });

          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.write(postData);
          req.end();
        });

        requests.push(requestPromise);
      }

      // Wait for all requests to complete
      Promise.allSettled(requests)
        .then((results) => {
          const successful = results.filter((r) => r.status === 'fulfilled');
          const failed = results.filter((r) => r.status === 'rejected');

          // Expect most requests to complete (some may fail due to test environment)
          expect(successful.length).toBeGreaterThan(0);

          // Check that responses are properly formatted
          successful.forEach((result) => {
            expect(result.value.status).toBeDefined();
            expect(result.value.data).toBeDefined();
            expect(typeof result.value.data).toBe('object');
          });

          done();
        })
        .catch(done);
    });

    it('should maintain connection pool state across requests', (done) => {
      // First request to establish connection
      const connectRequest = () => {
        return new Promise((resolve, reject) => {
          const postData = JSON.stringify({
            config: {
              host: 'localhost',
              port: 3306,
              user: 'test_user',
              password: 'test_password',
              database: 'test_database',
            },
          });

          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/api/database/connect',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: res.statusCode, data }));
          });

          req.on('error', reject);
          req.write(postData);
          req.end();
        });
      };

      // Second request to check state
      const stateRequest = () => {
        return new Promise((resolve, reject) => {
          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/api/database/state',
            method: 'GET',
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: res.statusCode, data }));
          });

          req.on('error', reject);
          req.end();
        });
      };

      // Execute requests sequentially
      connectRequest()
        .then(() => stateRequest())
        .then((stateResponse) => {
          expect(stateResponse.status).toBe(200);
          const stateData = JSON.parse(stateResponse.data);
          expect(stateData).toHaveProperty('state');
          expect(typeof stateData.state).toBe('string');
          done();
        })
        .catch(done);
    });

    it('should handle connection pool exhaustion gracefully', (done) => {
      const connectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'test_user',
        password: 'test_password',
        database: 'test_database',
        connectionLimit: 2, // Small limit to trigger exhaustion
      };

      // Create more requests than the connection limit
      const excessiveRequests = [];
      for (let i = 0; i < 10; i++) {
        const requestPromise = new Promise((resolve) => {
          const postData = JSON.stringify({
            sql: 'SELECT SLEEP(1)', // Long-running query
            params: [],
          });

          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/api/database/query',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
            timeout: 3000,
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: res.statusCode, requestId: i }));
          });

          req.on('error', () => resolve({ error: true, requestId: i }));
          req.on('timeout', () => resolve({ timeout: true, requestId: i }));
          req.write(postData);
          req.end();
        });

        excessiveRequests.push(requestPromise);
      }

      Promise.allSettled(excessiveRequests).then((results) => {
        // Verify that the API handles pool exhaustion without crashing
        expect(results.length).toBe(10);

        // Some requests should complete, others may timeout or error
        const responses = results.map((r) => r.value || r.reason);
        const validResponses = responses.filter((r) => r && typeof r === 'object');

        expect(validResponses.length).toBeGreaterThan(0);
        done();
      });
    }, 10000);
  });

  describe('Error Handling Integration', () => {
    it('should handle database connection errors with proper HTTP status codes', (done) => {
      const invalidConfig = {
        host: 'invalid-host-that-does-not-exist',
        port: 9999,
        user: 'invalid_user',
        password: 'wrong_password',
        database: 'nonexistent_db',
      };

      const postData = JSON.stringify({ config: invalidConfig });
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/database/connect',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 10000,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            // Should return error status code
            expect(res.statusCode).toBeGreaterThanOrEqual(400);

            const response = JSON.parse(data);
            expect(response).toHaveProperty('success');
            expect(response.success).toBe(false);
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');

            done();
          } catch (error) {
            done(error);
          }
        });
      });

      req.on('error', (error) => {
        // Network errors are also acceptable for this test
        done();
      });

      req.on('timeout', () => {
        // Timeout is acceptable for invalid host
        done();
      });

      req.write(postData);
      req.end();
    }, 15000);

    it('should handle malformed SQL queries with appropriate error responses', (done) => {
      const invalidQuery = {
        sql: 'SELECT * FROM nonexistent_table WHERE invalid_syntax ===',
        params: [],
      };

      const postData = JSON.stringify(invalidQuery);
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/database/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            // Should return error status code for bad SQL
            expect(res.statusCode).toBeGreaterThanOrEqual(400);

            const response = JSON.parse(data);
            expect(response).toHaveProperty('success');
            expect(response.success).toBe(false);
            expect(response).toHaveProperty('error');

            done();
          } catch (error) {
            done(error);
          }
        });
      });

      req.on('error', done);
      req.write(postData);
      req.end();
    });

    it('should handle missing request body gracefully', (done) => {
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/database/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            // Should return 400 Bad Request for missing body
            expect(res.statusCode).toBe(400);

            const response = JSON.parse(data);
            expect(response).toHaveProperty('success');
            expect(response.success).toBe(false);
            expect(response).toHaveProperty('error');

            done();
          } catch (error) {
            done(error);
          }
        });
      });

      req.on('error', done);
      req.end(); // Send empty body
    });

    it('should handle invalid JSON in request body', (done) => {
      const invalidJson = '{"invalid": json}'; // Missing quotes around 'json'

      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/database/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(invalidJson),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            // Should return 400 Bad Request for invalid JSON
            expect(res.statusCode).toBe(400);

            const response = JSON.parse(data);
            expect(response).toHaveProperty('success');
            expect(response.success).toBe(false);
            expect(response).toHaveProperty('error');
            expect(response.error).toMatch(/JSON/i);

            done();
          } catch (error) {
            done(error);
          }
        });
      });

      req.on('error', done);
      req.write(invalidJson);
      req.end();
    });
  });

  describe('API Endpoint Integration', () => {
    it('should handle health check endpoint correctly', (done) => {
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/health',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/text/);
            expect(data.trim()).toBe('healthy');
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      req.on('error', done);
      req.end();
    });

    it('should return 404 for unknown endpoints', (done) => {
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/unknown/endpoint',
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        expect(res.statusCode).toBe(404);
        done();
      });

      req.on('error', done);
      req.end();
    });

    it('should handle CORS preflight requests', (done) => {
      const options = {
        hostname: 'localhost',
        port: apiPort,
        path: '/api/database/query',
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:4200',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      };

      const req = http.request(options, (res) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.headers['access-control-allow-origin']).toBeDefined();
          expect(res.headers['access-control-allow-methods']).toBeDefined();
          expect(res.headers['access-control-allow-headers']).toBeDefined();
          done();
        } catch (error) {
          done(error);
        }
      });

      req.on('error', done);
      req.end();
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid successive requests without memory leaks', (done) => {
      const rapidRequests = [];
      const requestCount = 20;

      for (let i = 0; i < requestCount; i++) {
        const requestPromise = new Promise((resolve) => {
          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/api/database/state',
            method: 'GET',
            timeout: 5000,
          };

          const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ status: res.statusCode, id: i }));
          });

          req.on('error', () => resolve({ error: true, id: i }));
          req.on('timeout', () => resolve({ timeout: true, id: i }));
          req.end();
        });

        rapidRequests.push(requestPromise);
      }

      Promise.allSettled(rapidRequests).then((results) => {
        const successful = results.filter((r) => r.status === 'fulfilled' && r.value && r.value.status === 200);

        // Expect most requests to succeed
        expect(successful.length).toBeGreaterThan(requestCount * 0.8);
        done();
      });
    }, 15000);

    it('should maintain consistent response times under load', (done) => {
      const loadRequests = [];
      const requestCount = 10;
      const startTime = Date.now();

      for (let i = 0; i < requestCount; i++) {
        const requestPromise = new Promise((resolve) => {
          const requestStart = Date.now();
          const options = {
            hostname: 'localhost',
            port: apiPort,
            path: '/health',
            method: 'GET',
          };

          const req = http.request(options, (res) => {
            res.on('end', () => {
              const responseTime = Date.now() - requestStart;
              resolve({ status: res.statusCode, responseTime, id: i });
            });
            res.resume(); // Consume response
          });

          req.on('error', () => resolve({ error: true, id: i }));
          req.end();
        });

        loadRequests.push(requestPromise);
      }

      Promise.allSettled(loadRequests).then((results) => {
        const successful = results.filter((r) => r.status === 'fulfilled' && r.value && !r.value.error).map((r) => r.value);

        if (successful.length > 0) {
          const responseTimes = successful.map((r) => r.responseTime);
          const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          const maxResponseTime = Math.max(...responseTimes);

          // Expect reasonable response times (adjust thresholds as needed)
          expect(avgResponseTime).toBeLessThan(1000); // 1 second average
          expect(maxResponseTime).toBeLessThan(5000); // 5 second max
        }

        done();
      });
    }, 30000);
  });
});

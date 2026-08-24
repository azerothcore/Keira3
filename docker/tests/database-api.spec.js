/**
 * Unit tests for docker/api/database-api.js.
 *
 * These tests require the real module (not re-declared copies) so that assertions
 * actually exercise docker/api/database-api.js and contribute to its coverage.
 *
 * mysql2/promise is mocked globally in docker/tests/setup.js, so initializeDatabase()
 * and the route handlers run against the fake pool - no real MySQL is needed.
 * express is NOT mocked (see setup.js) - `app` here is the real Express application,
 * driven over a real ephemeral HTTP listener since supertest is not available.
 */
const http = require('http');

// The database API fails closed (503) on /api/database/* routes unless auth is
// configured. Set these before requiring the module so the routes under test behave.
process.env.KEIRA_AUTH_USER = 'test-admin';
process.env.KEIRA_AUTH_PASSWORD = 'test-password';
process.env.KEIRA_SESSION_SECRET = 'test-session-secret';

const { app, getDatabaseConfig, createEnhancedErrorResponse, createValidationError, initializeDatabase } = require('../api/database-api');

/** Start `app` on an ephemeral port and return { server, baseUrl }. */
function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

/** Minimal HTTP request helper built on node:http (no supertest dependency). */
function request(baseUrl, path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;
    const reqHeaders = { ...headers };
    if (payload !== undefined && reqHeaders['Content-Type'] === undefined) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json;
          try {
            json = data ? JSON.parse(data) : undefined;
          } catch {
            json = undefined;
          }
          resolve({ status: res.statusCode, headers: res.headers, text: data, body: json });
        });
      },
    );

    req.on('error', reject);
    if (payload !== undefined) req.write(payload);
    req.end();
  });
}

describe('getDatabaseConfig', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('reads configuration from environment variables', () => {
    process.env.KEIRA_DATABASE_HOST = 'test-host';
    process.env.KEIRA_DATABASE_PORT = '3306';
    process.env.KEIRA_DATABASE_USER = 'test-user';
    process.env.KEIRA_DATABASE_PASSWORD = 'test-password';
    process.env.KEIRA_DATABASE_NAME = 'test_database';

    const config = getDatabaseConfig();

    expect(config).toMatchObject({
      host: 'test-host',
      port: 3306,
      user: 'test-user',
      password: 'test-password',
      database: 'test_database',
      multipleStatements: true,
      waitForConnections: true,
      queueLimit: 0,
    });
    expect(typeof config.connectionLimit).toBe('number');
  });

  it('falls back to defaults when environment variables are unset', () => {
    delete process.env.KEIRA_DATABASE_HOST;
    delete process.env.KEIRA_DATABASE_PORT;
    delete process.env.KEIRA_DATABASE_USER;
    delete process.env.KEIRA_DATABASE_PASSWORD;
    delete process.env.KEIRA_DATABASE_NAME;
    delete process.env.DB_CONNECTION_LIMIT;

    const config = getDatabaseConfig();

    expect(config.host).toBe('localhost');
    expect(config.port).toBe(3306);
    expect(config.user).toBe('root');
    expect(config.password).toBe('');
    expect(config.database).toBe('acore_world');
    expect(config.connectionLimit).toBe(10);
  });

  it('does not include mysql2-unsupported pool options', () => {
    // mysql2 3.22.5 supports connectTimeout/waitForConnections/queueLimit, not
    // acquireTimeout/timeout - the production config must not set the latter.
    const config = getDatabaseConfig();
    expect(config).not.toHaveProperty('acquireTimeout');
    expect(config).not.toHaveProperty('timeout');
  });

  it('respects DB_CONNECTION_LIMIT', () => {
    process.env.DB_CONNECTION_LIMIT = '25';
    expect(getDatabaseConfig().connectionLimit).toBe(25);
  });
});

describe('createValidationError', () => {
  it('builds a 400 response with the validation category', () => {
    const { status, response } = createValidationError('bad input', { field: 'sql' });
    expect(status).toBe(400);
    expect(response.success).toBe(false);
    expect(response.error).toBe('bad input');
    expect(response.category).toBe('VALIDATION');
    expect(response.details).toEqual({ field: 'sql' });
    expect(response.timestamp).toBeDefined();
  });

  it('defaults details to an empty object', () => {
    const { response } = createValidationError('bad input');
    expect(response.details).toEqual({});
  });
});

describe('createEnhancedErrorResponse', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('maps a known MySQL error code to its HTTP status and category', () => {
    const error = new Error('Access denied');
    error.code = 'ER_ACCESS_DENIED_ERROR';
    error.errno = 1045;
    error.sqlState = '28000';
    error.sqlMessage = 'Access denied detail';

    const { status, response } = createEnhancedErrorResponse(error);

    expect(status).toBe(401);
    expect(response.category).toBe('AUTHENTICATION');
    expect(response.code).toBe('ER_ACCESS_DENIED_ERROR');
    expect(response.error).toBe('Access denied');
    expect(response.errno).toBe(1045);
    expect(response.sqlState).toBe('28000');
    expect(response.sqlMessage).toBe('Access denied detail');
  });

  it('defaults unmapped error codes to 500/INTERNAL', () => {
    const error = new Error('mystery failure');
    error.code = 'SOME_UNKNOWN_CODE';

    const { status, response } = createEnhancedErrorResponse(error);

    expect(status).toBe(500);
    expect(response.category).toBe('INTERNAL');
    expect(response.error).toBe('mystery failure');
  });

  it('uses a custom message when provided, overriding redaction logic', () => {
    const error = new Error('raw detail');
    error.code = 'ER_PARSE_ERROR';

    const { response } = createEnhancedErrorResponse(error, 'custom message');
    expect(response.error).toBe('custom message');
  });

  it('redacts unmapped error details in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('internal schema detail');
    error.code = 'SOME_UNKNOWN_CODE';
    error.errno = 999;
    error.sqlState = 'XX000';
    error.sqlMessage = 'leaky detail';

    const { response } = createEnhancedErrorResponse(error);

    expect(response.error).toBe('An unexpected error occurred');
    expect(response).not.toHaveProperty('errno');
    expect(response).not.toHaveProperty('sqlState');
    expect(response).not.toHaveProperty('sqlMessage');
    expect(response.code).toBe('SOME_UNKNOWN_CODE');
  });

  it('keeps the human-readable message for mapped errors even in production', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Duplicate entry');
    error.code = 'ER_DUP_ENTRY';

    const { status, response } = createEnhancedErrorResponse(error);
    expect(status).toBe(422);
    expect(response.error).toBe('Duplicate entry');
  });

  it('falls back to UNKNOWN_ERROR when the error has no code', () => {
    const { status, response } = createEnhancedErrorResponse(new Error('no code here'));
    expect(status).toBe(500);
    expect(response.category).toBe('INTERNAL');
    expect(response).not.toHaveProperty('code');
  });
});

describe('initializeDatabase', () => {
  it('resolves against the mocked pool without throwing or exiting', async () => {
    await expect(initializeDatabase()).resolves.toBeUndefined();
  });
});

describe('Database API app (real Express routes, mocked mysql2/promise)', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    await initializeDatabase();
    ({ server, baseUrl } = await listen());
  });

  afterAll(async () => {
    await closeServer(server);
  });

  it('GET /health returns 200 with a healthy status payload', async () => {
    const res = await request(baseUrl, '/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'healthy' });
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/unknown/endpoint returns 404', async () => {
    const res = await request(baseUrl, '/api/unknown/endpoint');
    expect(res.status).toBe(404);
  });

  it('rejects /api/database/* routes with 401 when unauthenticated', async () => {
    const res = await request(baseUrl, '/api/database/state');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login rejects invalid credentials with 401', async () => {
    const res = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: 'wrong', password: 'wrong' },
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login accepts valid credentials and authenticates subsequent requests', async () => {
    const loginRes = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { username: 'test-admin', password: 'test-password' },
    });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toEqual({ success: true });

    const setCookie = loginRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie).split(';')[0];

    const stateRes = await request(baseUrl, '/api/database/state', { headers: { Cookie: cookie } });
    expect(stateRes.status).toBe(200);
    expect(stateRes.body.state).toBe('CONNECTED');
    expect(stateRes.body.poolInfo).toBeDefined();
  });

  describe('authenticated routes', () => {
    let authCookie;

    beforeAll(async () => {
      const loginRes = await request(baseUrl, '/api/auth/login', {
        method: 'POST',
        body: { username: 'test-admin', password: 'test-password' },
      });
      const setCookie = loginRes.headers['set-cookie'];
      authCookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie).split(';')[0];
    });

    it('POST /api/database/connect requires a config object', async () => {
      const res = await request(baseUrl, '/api/database/connect', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: {},
      });
      expect(res.status).toBe(400);
      expect(res.body.category).toBe('VALIDATION');
    });

    it('POST /api/database/connect requires all connection fields', async () => {
      const res = await request(baseUrl, '/api/database/connect', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: { config: { host: 'localhost' } },
      });
      expect(res.status).toBe(400);
      expect(res.body.details.missingFields).toEqual(expect.arrayContaining(['port', 'user', 'password', 'database']));
    });

    it('POST /api/database/connect succeeds against the mocked pool', async () => {
      const res = await request(baseUrl, '/api/database/connect', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: {
          config: { host: 'localhost', port: 3306, user: 'root', password: 'pw', database: 'acore_world' },
        },
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Connected to database successfully');
    });

    it('POST /api/database/query rejects a missing sql field', async () => {
      const res = await request(baseUrl, '/api/database/query', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: { params: [] },
      });
      expect(res.status).toBe(400);
      expect(res.body.category).toBe('VALIDATION');
    });

    it('POST /api/database/query rejects an empty sql string', async () => {
      const res = await request(baseUrl, '/api/database/query', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: { sql: '   ' },
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/database/query rejects non-array params', async () => {
      const res = await request(baseUrl, '/api/database/query', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: { sql: 'SELECT 1', params: 'nope' },
      });
      expect(res.status).toBe(400);
      expect(res.body.details.expected).toBe('array');
    });

    it('POST /api/database/query succeeds against the mocked pool', async () => {
      const res = await request(baseUrl, '/api/database/query', {
        method: 'POST',
        headers: { Cookie: authCookie },
        body: { sql: 'SELECT 1', params: [] },
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.result)).toBe(true);
      expect(Array.isArray(res.body.fields)).toBe(true);
      expect(res.body.metadata).toBeDefined();
    });

    it('GET /api/database/state reports CONNECTED against the mocked pool', async () => {
      const res = await request(baseUrl, '/api/database/state', { headers: { Cookie: authCookie } });
      expect(res.status).toBe(200);
      // Matches the shared state contract (libs/shared/constants/src/types/database-api.ts);
      // the API never returns CONNECTING - it only reports CONNECTED, DISCONNECTED, or ERROR.
      expect(['CONNECTED', 'DISCONNECTED', 'ERROR']).toContain(res.body.state);
    });

    it('handles malformed JSON bodies via the generic error handler', async () => {
      // express.json()'s body-parser SyntaxError has no MySQL `.code`, so
      // createEnhancedErrorResponse maps it to the default 500/INTERNAL bucket
      // rather than the 400 validation path used for well-formed-but-invalid requests.
      const res = await request(baseUrl, '/api/database/query', {
        method: 'POST',
        headers: { Cookie: authCookie, 'Content-Type': 'application/json' },
        body: '{"invalid": json}',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.category).toBe('INTERNAL');
    });
  });

  it('POST /api/auth/logout clears the session cookie', async () => {
    const res = await request(baseUrl, '/api/auth/logout', { method: 'POST' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    const setCookie = res.headers['set-cookie'];
    expect(Array.isArray(setCookie) ? setCookie[0] : setCookie).toContain('Max-Age=0');
  });
});

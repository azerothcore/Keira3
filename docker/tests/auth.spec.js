/**
 * Unit tests for docker/api/auth.js — credentials, session tokens, cookies.
 */
const auth = require('../api/auth');

describe('getAuthConfig', () => {
  it('enables auth only when both user and password are set', () => {
    expect(auth.getAuthConfig({}).enabled).toBe(false);
    expect(auth.getAuthConfig({ KEIRA_AUTH_USER: 'admin' }).enabled).toBe(false);
    expect(auth.getAuthConfig({ KEIRA_AUTH_PASSWORD: 'pw' }).enabled).toBe(false);
    expect(auth.getAuthConfig({ KEIRA_AUTH_USER: 'admin', KEIRA_AUTH_PASSWORD: 'pw' }).enabled).toBe(true);
  });

  it('uses defaults: 86400s TTL, 500ms failure delay, random secret when unset', () => {
    const config = auth.getAuthConfig({});
    expect(config.ttlSeconds).toBe(86400);
    expect(config.failureDelayMs).toBe(500);
    expect(typeof config.secret).toBe('string');
    expect(config.secret.length).toBeGreaterThanOrEqual(32);
  });

  it('honors KEIRA_SESSION_SECRET and KEIRA_SESSION_TTL', () => {
    const config = auth.getAuthConfig({ KEIRA_SESSION_SECRET: 's3cret', KEIRA_SESSION_TTL: '3600' });
    expect(config.secret).toBe('s3cret');
    expect(config.ttlSeconds).toBe(3600);
  });
});

describe('verifyCredentials', () => {
  const config = auth.getAuthConfig({ KEIRA_AUTH_USER: 'admin', KEIRA_AUTH_PASSWORD: 'pw' });

  it('accepts the configured pair and rejects everything else', () => {
    expect(auth.verifyCredentials(config, 'admin', 'pw')).toBe(true);
    expect(auth.verifyCredentials(config, 'admin', 'wrong')).toBe(false);
    expect(auth.verifyCredentials(config, 'wrong', 'pw')).toBe(false);
    expect(auth.verifyCredentials(config, '', '')).toBe(false);
  });
});

describe('session tokens', () => {
  const secret = 'test-secret';

  it('round-trips a valid unexpired token', () => {
    const token = auth.createSessionToken(secret, Date.now() + 60000);
    expect(auth.verifySessionToken(secret, token)).toBe(true);
  });

  it('rejects expired tokens', () => {
    const token = auth.createSessionToken(secret, Date.now() - 1000);
    expect(auth.verifySessionToken(secret, token)).toBe(false);
  });

  it('rejects tampered and malformed tokens', () => {
    const token = auth.createSessionToken(secret, Date.now() + 60000);
    expect(auth.verifySessionToken(secret, token.slice(0, -2) + 'ff')).toBe(false);
    expect(auth.verifySessionToken('other-secret', token)).toBe(false);
    expect(auth.verifySessionToken(secret, 'garbage')).toBe(false);
    expect(auth.verifySessionToken(secret, '')).toBe(false);
    expect(auth.verifySessionToken(secret, undefined)).toBe(false);
  });
});

describe('cookies', () => {
  it('parses a cookie header', () => {
    expect(auth.parseCookies('a=1; keira_session=abc.def; b=2')).toEqual({ a: '1', keira_session: 'abc.def', b: '2' });
    expect(auth.parseCookies(undefined)).toEqual({});
  });

  it('builds session and clear cookies with the required flags', () => {
    const set = auth.buildSessionCookie('tok', 3600);
    expect(set).toContain('keira_session=tok');
    expect(set).toContain('Max-Age=3600');
    expect(set).toContain('HttpOnly');
    expect(set).toContain('SameSite=Lax');
    expect(set).toContain('Path=/');
    expect(auth.buildClearCookie()).toContain('Max-Age=0');
  });
});

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
  };
  return res;
}

describe('createAuthMiddleware', () => {
  const config = { ...auth.getAuthConfig({ KEIRA_AUTH_USER: 'admin', KEIRA_AUTH_PASSWORD: 'pw' }), secret: 's' };

  it('passes through when auth is disabled', () => {
    const next = jest.fn();
    auth.createAuthMiddleware({ ...config, enabled: false })({ headers: {} }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects requests without a valid cookie', () => {
    const next = jest.fn();
    const res = mockRes();
    auth.createAuthMiddleware(config)({ headers: {} }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, error: 'Authentication required' });
  });

  it('passes through with a valid session cookie', () => {
    const token = auth.createSessionToken('s', Date.now() + 60000);
    const next = jest.fn();
    const req = { headers: { cookie: `keira_session=${encodeURIComponent(token)}` } };
    auth.createAuthMiddleware(config)(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects an expired cookie', () => {
    const token = auth.createSessionToken('s', Date.now() - 1000);
    const next = jest.fn();
    const res = mockRes();
    auth.createAuthMiddleware(config)({ headers: { cookie: `keira_session=${token}` } }, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});

describe('createLoginHandler', () => {
  const config = { ...auth.getAuthConfig({ KEIRA_AUTH_USER: 'admin', KEIRA_AUTH_PASSWORD: 'pw' }), secret: 's' };
  const noDelay = { delay: jest.fn(() => Promise.resolve()) };

  it('sets a session cookie on valid credentials', async () => {
    const res = mockRes();
    await auth.createLoginHandler(config, noDelay)({ body: { username: 'admin', password: 'pw' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers['Set-Cookie']).toContain('keira_session=');
    expect(res.headers['Set-Cookie']).toContain('HttpOnly');
  });

  it('401s and delays on invalid credentials', async () => {
    const delay = jest.fn(() => Promise.resolve());
    const res = mockRes();
    await auth.createLoginHandler(config, { delay })({ body: { username: 'admin', password: 'nope' } }, res);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, error: 'Invalid credentials' });
    expect(delay).toHaveBeenCalledWith(config.failureDelayMs);
    expect(res.headers['Set-Cookie']).toBeUndefined();
  });

  it('applies a real delay by default on invalid credentials', async () => {
    const res = mockRes();
    const start = Date.now();
    await auth.createLoginHandler(config)({ body: { username: 'admin', password: 'nope' } }, res);
    expect(Date.now() - start).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBe(401);
  });

  it('400s on missing fields', async () => {
    const res = mockRes();
    await auth.createLoginHandler(config, noDelay)({ body: { username: 'admin' } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('succeeds without a cookie when auth is disabled', async () => {
    const res = mockRes();
    await auth.createLoginHandler({ ...config, enabled: false }, noDelay)({ body: { username: 'x', password: 'y' } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers['Set-Cookie']).toBeUndefined();
  });
});

describe('createLogoutHandler', () => {
  it('clears the cookie', () => {
    const res = mockRes();
    auth.createLogoutHandler()({ headers: {} }, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Set-Cookie']).toContain('Max-Age=0');
  });
});

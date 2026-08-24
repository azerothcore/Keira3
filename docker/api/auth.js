/**
 * App-level authentication for the Keira3 web/docker API server.
 * Single account from env vars, HMAC-signed expiry-token session cookie.
 * Uses only Node built-ins.
 */
const crypto = require('crypto');

const SESSION_COOKIE = 'keira_session';

const DEFAULT_TTL_SECONDS = 86400;

function getAuthConfig(env = process.env) {
  const user = env.KEIRA_AUTH_USER || '';
  const password = env.KEIRA_AUTH_PASSWORD || '';
  const parsedTtl = parseInt(env.KEIRA_SESSION_TTL || String(DEFAULT_TTL_SECONDS), 10);
  const ttlSeconds = Number.isFinite(parsedTtl) && parsedTtl > 0 ? parsedTtl : DEFAULT_TTL_SECONDS;
  if (env.KEIRA_SESSION_TTL !== undefined && ttlSeconds !== parsedTtl) {
    console.warn(`Invalid KEIRA_SESSION_TTL "${env.KEIRA_SESSION_TTL}"; falling back to ${DEFAULT_TTL_SECONDS} seconds.`);
  }
  return {
    enabled: Boolean(user && password),
    user,
    password,
    secret: env.KEIRA_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    ttlSeconds,
    failureDelayMs: 500,
  };
}

// Constant-time comparison of arbitrary-length strings via digest.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function verifyCredentials(config, username, password) {
  const userOk = safeEqual(username, config.user);
  const passOk = safeEqual(password, config.password);
  return userOk && passOk;
}

function signExpiry(secret, expiresAtMs) {
  return crypto.createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
}

function createSessionToken(secret, expiresAtMs) {
  return `${expiresAtMs}.${signExpiry(secret, expiresAtMs)}`;
}

function verifySessionToken(secret, token, nowMs = Date.now()) {
  if (typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expiresAtMs = Number(token.slice(0, dot));
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) return false;
  return safeEqual(token.slice(dot + 1), signExpiry(secret, expiresAtMs));
}

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const name = part.slice(0, eq).trim();
      const rawValue = part.slice(eq + 1).trim();
      try {
        cookies[name] = decodeURIComponent(rawValue);
      } catch {
        // Malformed percent-encoding (e.g. "%zz") - skip this pair rather than throwing.
      }
    }
  }
  return cookies;
}

function buildSessionCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax`;
}

function buildClearCookie() {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
}

function isAuthenticated(config, req) {
  const token = parseCookies(req.headers && req.headers.cookie)[SESSION_COOKIE];
  return verifySessionToken(config.secret, token);
}

function createAuthMiddleware(config) {
  return (req, res, next) => {
    if (!config.enabled || isAuthenticated(config, req)) return next();
    res.status(401).json({ success: false, error: 'Authentication required' });
  };
}

function createLoginHandler(config, deps = {}) {
  const delay = deps.delay || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  return async (req, res) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'username and password are required' });
    }
    if (!config.enabled) {
      return res.json({ success: true });
    }
    if (!verifyCredentials(config, username, password)) {
      await delay(config.failureDelayMs);
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const expiresAtMs = Date.now() + config.ttlSeconds * 1000;
    res.setHeader('Set-Cookie', buildSessionCookie(createSessionToken(config.secret, expiresAtMs), config.ttlSeconds));
    return res.json({ success: true });
  };
}

function createLogoutHandler() {
  return (req, res) => {
    res.setHeader('Set-Cookie', buildClearCookie());
    return res.json({ success: true });
  };
}

module.exports = {
  SESSION_COOKIE,
  getAuthConfig,
  verifyCredentials,
  createSessionToken,
  verifySessionToken,
  parseCookies,
  buildSessionCookie,
  buildClearCookie,
  createAuthMiddleware,
  createLoginHandler,
  createLogoutHandler,
};

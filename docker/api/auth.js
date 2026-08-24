/**
 * App-level authentication for the Keira3 web/docker API server.
 * Single account from env vars, HMAC-signed expiry-token session cookie.
 * Uses only Node built-ins.
 */
const crypto = require('crypto');

const SESSION_COOKIE = 'keira_session';

function getAuthConfig(env = process.env) {
  const user = env.KEIRA_AUTH_USER || '';
  const password = env.KEIRA_AUTH_PASSWORD || '';
  return {
    enabled: Boolean(user && password),
    user,
    password,
    secret: env.KEIRA_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    ttlSeconds: parseInt(env.KEIRA_SESSION_TTL || '86400', 10),
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
    if (eq > 0) cookies[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return cookies;
}

function buildSessionCookie(token, maxAgeSeconds) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax`;
}

function buildClearCookie() {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;
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
};

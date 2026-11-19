/**
 * The login data of an AzerothCore account, as the core makes it (`Acore::Crypto::SRP6::MakeRegistrationData`): a
 * random 32-byte salt and the verifier v = g^x mod N, x = SHA1(salt ‖ SHA1(USERNAME ":" PASSWORD)), with g = 7 and the
 * core's N. Numbers are read and written little-endian, as the core's `BigNumber` does by default.
 */

/** SRP6's N (SRP6.cpp), as a number. */
export const SRP6_N = 0x894b645e89e1535bbdad5b8b290650530801b18ebfbf5e8fab3c82872a3e9bb7n;
export const SRP6_G = 7n;

/** The core's limits (AccountMgr.h: MAX_ACCOUNT_STR, MAX_PASS_STR). */
export const MAX_ACCOUNT_LENGTH = 17;
export const MAX_PASSWORD_LENGTH = 16;

const sha1 = async (...parts: Uint8Array[]): Promise<Uint8Array> => {
  const all = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let at = 0;
  for (const part of parts) {
    all.set(part, at);
    at += part.length;
  }
  return new Uint8Array(await crypto.subtle.digest('SHA-1', all));
};

/** Bytes read as a little-endian number. */
export function fromLittleEndian(bytes: Uint8Array): bigint {
  let value = 0n;
  for (let i = bytes.length - 1; i >= 0; i--) {
    value = (value << 8n) | BigInt(bytes[i]);
  }
  return value;
}

/** A number written as `size` little-endian bytes. */
export function toLittleEndian(value: bigint, size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;
  base %= modulus;
  while (exponent > 0n) {
    if (exponent & 1n) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent >>= 1n;
  }
  return result;
}

/** The core upper-cases the name and the password (Latin letters only) before making the verifier. */
export const upperLatin = (text: string): string => text.replace(/[a-z]/g, (letter) => letter.toUpperCase());

/** The verifier of a name and password with a salt (`SRP6::CalculateVerifier`). */
export async function srp6Verifier(username: string, password: string, salt: Uint8Array): Promise<Uint8Array> {
  const inner = await sha1(new TextEncoder().encode(`${upperLatin(username)}:${upperLatin(password)}`));
  const x = fromLittleEndian(await sha1(salt, inner));
  return toLittleEndian(modPow(SRP6_G, x, SRP6_N), 32);
}

/** A new account's salt and verifier. */
export async function srp6Registration(username: string, password: string): Promise<{ salt: Uint8Array; verifier: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  return { salt, verifier: await srp6Verifier(username, password, salt) };
}

/** Bytes as a MySQL hex literal (`X'…'`). */
export const hexLiteral = (bytes: Uint8Array): string => `X'${[...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')}'`;

import { fromLittleEndian, hexLiteral, srp6Registration, srp6Verifier, toLittleEndian, upperLatin } from './srp6';

describe('SRP6 (the core account login)', () => {
  const salt = Uint8Array.from({ length: 32 }, (_, i) => i);

  it('makes the verifier as the core does', async () => {
    // (worked out apart from Keira, from SRP6.cpp: g = 7, the core's N, little-endian numbers, name and password upper-cased)
    const verifier = await srp6Verifier('Keira1234567', 'Secret16chars!!a', salt);
    expect([...verifier].map((byte) => byte.toString(16).padStart(2, '0')).join('')).toBe(
      '63a0f9ce98b8977f9da6119ec0bd4a8ff3eb2e113c306f82685bafcd3097360a',
    );
    // the case of the letters doesn't matter
    expect(await srp6Verifier('KEIRA1234567', 'SECRET16CHARS!!A', salt)).toEqual(verifier);
  });

  it('makes a random salt for a new account', async () => {
    const one = await srp6Registration('a', 'b');
    const two = await srp6Registration('a', 'b');
    expect(one.salt.length).toBe(32);
    expect(one.verifier.length).toBe(32);
    expect(one.salt).not.toEqual(two.salt);
    expect(await srp6Verifier('a', 'b', one.salt)).toEqual(one.verifier);
  });

  it('reads and writes little-endian numbers, upper-cases Latin letters only, writes hex literals', () => {
    expect(fromLittleEndian(Uint8Array.from([1, 2]))).toBe(0x0201n);
    expect([...toLittleEndian(0x0201n, 3)]).toEqual([1, 2, 0]);
    expect(upperLatin('abcé1')).toBe('ABCé1');
    expect(hexLiteral(Uint8Array.from([0, 255]))).toBe("X'00ff'");
  });
});

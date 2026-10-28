import { EMPTY_COLLISION, parseM2Collision, parseWmoGroupCollision } from './collision';

const chunk = (magic: string, data: Uint8Array): Uint8Array => {
  const out = new Uint8Array(8 + data.length);
  out.set([...magic].reverse().map((c) => c.charCodeAt(0)));
  new DataView(out.buffer).setUint32(4, data.length, true);
  out.set(data, 8);
  return out;
};
const concat = (...parts: Uint8Array[]): Uint8Array => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
};
const floats = (values: number[]) => new Uint8Array(new Float32Array(values).buffer);
const shorts = (values: number[]) => new Uint8Array(new Uint16Array(values).buffer);

describe('collision', () => {
  it('reads the collision triangles of an M2 model in scene axes', () => {
    const bytes = new Uint8Array(0x100 + 14 + 4 * 12);
    const view = new DataView(bytes.buffer);
    view.setUint32(0xd8, 7, true); // 7 indices: the incomplete triangle is dropped
    view.setUint32(0xdc, 0x100, true);
    view.setUint32(0xe0, 4, true);
    view.setUint32(0xe4, 0x100 + 14, true);
    [0, 1, 2, 2, 1, 3, 0].forEach((index, i) => view.setUint16(0x100 + i * 2, index, true));
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((value, i) => view.setFloat32(0x100 + 14 + i * 4, value, true));
    const collision = parseM2Collision(bytes);
    expect(Array.from(collision.indices)).toEqual([0, 1, 2, 2, 1, 3]);
    // (x, y, z) → (−y, z, −x)
    expect(Array.from(collision.positions.slice(0, 3))).toEqual([-2, 3, -1]);
  });

  it('has no M2 collision for models without one, or broken ones', () => {
    expect(parseM2Collision(new Uint8Array(16))).toBe(EMPTY_COLLISION);
    const bytes = new Uint8Array(0x100);
    expect(parseM2Collision(bytes)).toBe(EMPTY_COLLISION);
    const view = new DataView(bytes.buffer);
    view.setUint32(0xd8, 3, true);
    expect(parseM2Collision(bytes)).toBe(EMPTY_COLLISION);
    view.setUint32(0xe0, 3, true);
    view.setUint32(0xdc, 0xf0, true);
    view.setUint32(0xe4, 0xff, true);
    expect(parseM2Collision(bytes)).toBe(EMPTY_COLLISION);
    view.setUint32(0xdc, 0xff, true);
    view.setUint32(0xe4, 0x10, true);
    expect(parseM2Collision(bytes)).toBe(EMPTY_COLLISION);
  });

  it('picks the colliding triangles of a WMO group like the vmap extractor', () => {
    // triangles: collision flag, drawn, drawn detail (no collision), nothing
    const mopy = new Uint8Array([0x08, 0xff, 0x20, 0, 0x24, 0, 0x00, 0]);
    const movi = shorts([0, 1, 2, 1, 2, 3, 0, 2, 3, 3, 2, 1]);
    const movt = floats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const body = concat(new Uint8Array(0x44), chunk('MOPY', mopy), chunk('MOVI', movi), chunk('MOVT', movt));
    const collision = parseWmoGroupCollision(concat(chunk('MVER', new Uint8Array(4)), chunk('MOGP', body)));
    expect(Array.from(collision.indices)).toEqual([0, 1, 2, 1, 2, 3]);
    expect(collision.positions).toHaveLength(12);
    expect(Array.from(collision.positions.slice(0, 3))).toEqual([-2, 3, -1]);
    // the first one has no material: an invisible wall
    expect(Array.from(collision.invisible ?? [])).toEqual([0, 1, 2]);
    // drawn walls only: no invisible ones
    const drawn = concat(
      new Uint8Array(0x44),
      chunk('MOPY', new Uint8Array([0x20, 0])),
      chunk('MOVI', shorts([0, 1, 2])),
      chunk('MOVT', movt),
    );
    expect(parseWmoGroupCollision(chunk('MOGP', drawn)).invisible).toBeUndefined();

    // nothing colliding, missing chunks, no MOGP
    const none = concat(
      new Uint8Array(0x44),
      chunk('MOPY', new Uint8Array([0x24, 0])),
      chunk('MOVI', shorts([0, 1, 2])),
      chunk('MOVT', movt),
    );
    expect(parseWmoGroupCollision(chunk('MOGP', none))).toBe(EMPTY_COLLISION);
    expect(parseWmoGroupCollision(chunk('MOGP', concat(new Uint8Array(0x44), chunk('MOPY', mopy))))).toBe(EMPTY_COLLISION);
    expect(parseWmoGroupCollision(chunk('MVER', new Uint8Array(4)))).toBe(EMPTY_COLLISION);
  });
});

/** Builds a WDBC file from rows of fields; string fields are added to the string block. */
export function buildDbc(rows: (number | string)[][], fieldCount = rows[0]?.length ?? 0): Uint8Array {
  const encoder = new TextEncoder();
  const strings: number[] = [0];
  const stringOffsets = new Map<string, number>([['', 0]]);
  const offsetOf = (value: string): number => {
    let offset = stringOffsets.get(value);
    if (offset === undefined) {
      offset = strings.length;
      stringOffsets.set(value, offset);
      strings.push(...encoder.encode(value), 0);
    }
    return offset;
  };

  const recordSize = fieldCount * 4;
  const body = new DataView(new ArrayBuffer(rows.length * recordSize));
  rows.forEach((row, r) => {
    for (let f = 0; f < fieldCount; f++) {
      const value = row[f] ?? 0;
      body.setUint32(r * recordSize + f * 4, typeof value === 'string' ? offsetOf(value) : value, true);
    }
  });

  const header = new DataView(new ArrayBuffer(20));
  [0x57, 0x44, 0x42, 0x43].forEach((byte, i) => header.setUint8(i, byte));
  header.setUint32(4, rows.length, true);
  header.setUint32(8, fieldCount, true);
  header.setUint32(12, recordSize, true);
  header.setUint32(16, strings.length, true);

  const out = new Uint8Array(20 + body.byteLength + strings.length);
  out.set(new Uint8Array(header.buffer), 0);
  out.set(new Uint8Array(body.buffer), 20);
  out.set(Uint8Array.from(strings), 20 + body.byteLength);
  return out;
}

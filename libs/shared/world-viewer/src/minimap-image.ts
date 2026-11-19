import { RgbaImage } from '@keira/shared/wow-data';

/** An image shrunk to `size` × `size` by averaging the pixels each one covers. */
export function shrinkImage(image: RgbaImage, size: number): RgbaImage {
  const data = new Uint8Array(size * size * 4);
  const [sx, sy] = [image.width / size, image.height / size];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [x0, x1] = [Math.floor(x * sx), Math.max(Math.floor(x * sx) + 1, Math.floor((x + 1) * sx))];
      const [y0, y1] = [Math.floor(y * sy), Math.max(Math.floor(y * sy) + 1, Math.floor((y + 1) * sy))];
      const sum = [0, 0, 0, 0];
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * image.width + xx) * 4;
          for (let c = 0; c < 4; c++) {
            sum[c] += image.data[i + c];
          }
        }
      }
      const count = (x1 - x0) * (y1 - y0);
      sum.forEach((value, c) => (data[(y * size + x) * 4 + c] = Math.round(value / count)));
    }
  }
  return { width: size, height: size, data };
}

/** An image as a `data:` URL of a 24-bit BMP (no canvas needed; alpha is dropped). */
export function imageToDataUrl(image: RgbaImage): string {
  const rowSize = Math.ceil((image.width * 3) / 4) * 4;
  const size = 54 + rowSize * image.height;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  bytes.set([0x42, 0x4d]); // 'BM'
  view.setUint32(2, size, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, image.width, true);
  view.setInt32(22, image.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, rowSize * image.height, true);
  for (let y = 0; y < image.height; y++) {
    // rows bottom-up, pixels as BGR
    const row = 54 + (image.height - 1 - y) * rowSize;
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4;
      bytes.set([image.data[i + 2], image.data[i + 1], image.data[i]], row + x * 3);
    }
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:image/bmp;base64,${btoa(binary)}`;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c = CRC_TABLE[(c ^ byte) & 255] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/** Most bytes a stored (not compressed) deflate block holds. */
const STORED_BLOCK = 0xffff;

/** An image as a `data:` URL of a PNG, alpha kept (stored without compression: no canvas or zlib needed). */
export function imageToPngUrl(image: RgbaImage): string {
  const rowSize = image.width * 4 + 1;
  const raw = new Uint8Array(rowSize * image.height);
  for (let y = 0; y < image.height; y++) {
    // filter 0, then the row as it is
    raw.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), y * rowSize + 1);
  }
  const blocks = Math.max(1, Math.ceil(raw.length / STORED_BLOCK));
  const zlib = new Uint8Array(2 + blocks * 5 + raw.length + 4);
  zlib.set([0x78, 0x01]);
  let at = 2;
  let [a, b] = [1, 0];
  for (let block = 0; block < blocks; block++) {
    const part = raw.subarray(block * STORED_BLOCK, (block + 1) * STORED_BLOCK);
    zlib.set([block === blocks - 1 ? 1 : 0, part.length & 255, part.length >> 8, ~part.length & 255, (~part.length >> 8) & 255], at);
    zlib.set(part, at + 5);
    at += 5 + part.length;
    for (const byte of part) {
      a = (a + byte) % 65521;
      b = (b + a) % 65521;
    }
  }
  new DataView(zlib.buffer).setUint32(at, ((b << 16) | a) >>> 0);

  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const out = new Uint8Array(12 + data.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, data.length);
    out.set(
      [...type].map((c) => c.charCodeAt(0)),
      4,
    );
    out.set(data, 8);
    view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
  };
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, image.width);
  view.setUint32(4, image.height);
  header.set([8, 6], 8); // 8 bits, RGBA
  const parts = [
    Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib),
    chunk('IEND', new Uint8Array(0)),
  ];
  const png = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    png.set(part, offset);
    offset += part.length;
  }
  let binary = '';
  for (let i = 0; i < png.length; i += 0x8000) {
    binary += String.fromCharCode(...png.subarray(i, i + 0x8000));
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

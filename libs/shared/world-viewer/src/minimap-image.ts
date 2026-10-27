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

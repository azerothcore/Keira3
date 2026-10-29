import { inflateSync } from 'node:zlib';
import { imageToDataUrl, imageToPngUrl, shrinkImage } from './minimap-image';

describe('minimap images', () => {
  // 4 × 2: left half red, right half blue
  const image = {
    width: 4,
    height: 2,
    data: Uint8Array.from([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    ]),
  };

  it('shrinks by averaging the pixels each one covers', () => {
    const small = shrinkImage(image, 2);
    expect(small.width).toBe(2);
    expect([...small.data.slice(0, 8)]).toEqual([255, 0, 0, 255, 0, 0, 255, 255]);
    // growing repeats pixels
    expect(shrinkImage(image, 8).data.length).toBe(8 * 8 * 4);
  });

  it('turns an image into a BMP data URL', () => {
    const url = imageToDataUrl(shrinkImage(image, 2));
    expect(url.startsWith('data:image/bmp;base64,')).toBe(true);
    const bytes = Uint8Array.from(atob(url.slice(22)), (c) => c.charCodeAt(0));
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe('BM');
    // 2 pixels of 3 bytes, rows padded to 8 bytes, bottom row first: red is stored as B, G, R
    expect(bytes.length).toBe(54 + 8 * 2);
    expect([...bytes.slice(54, 57)]).toEqual([0, 0, 255]);
  });

  it('turns an image into a PNG data URL keeping alpha', () => {
    const decode = (url: string) => {
      const bytes = Uint8Array.from(atob(url.slice(22)), (c) => c.charCodeAt(0));
      const view = new DataView(bytes.buffer);
      expect(url.startsWith('data:image/png;base64,')).toBe(true);
      expect(String.fromCharCode(...bytes.slice(1, 4))).toBe('PNG');
      const length = view.getUint32(33);
      return { width: view.getUint32(16), height: view.getUint32(20), raw: inflateSync(bytes.subarray(41, 41 + length)) };
    };
    const png = decode(imageToPngUrl({ width: 2, height: 1, data: Uint8Array.from([255, 0, 0, 128, 0, 0, 255, 255]) }));
    expect([png.width, png.height]).toEqual([2, 1]);
    expect([...png.raw]).toEqual([0, 255, 0, 0, 128, 0, 0, 255, 255]);
    // bigger than one stored block (64 KiB)
    const big = decode(imageToPngUrl({ width: 200, height: 100, data: new Uint8Array(200 * 100 * 4).fill(7) }));
    expect(big.raw.length).toBe(100 * 801);
    expect(big.raw[1]).toBe(7);
  });
});

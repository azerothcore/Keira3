import { imageToDataUrl, shrinkImage } from './minimap-image';

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
});

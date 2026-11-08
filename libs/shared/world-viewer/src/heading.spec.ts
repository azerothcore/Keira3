import { headingText, stretchText } from './heading';

describe('heading', () => {
  it('names the compass point of an orientation', () => {
    expect(headingText(0)).toBe('N (0.00)');
    expect(headingText(Math.PI / 2)).toBe('W (1.57)');
    expect(headingText(-Math.PI / 2)).toBe('E (4.71)');
    expect(headingText(Math.PI * 2 - 0.1)).toBe('N (6.18)');
  });

  it('tells the way and the distance between two places', () => {
    expect(stretchText({ x: 0, y: 0, z: 0 }, { x: 3, y: 3, z: 0 })).toBe('→ NW (0.79), 4.2 yd');
  });
});

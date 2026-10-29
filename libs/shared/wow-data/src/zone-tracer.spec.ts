import { RgbaImage } from './formats';
import {
  edgeButton,
  fillRings,
  labelPoint,
  neighbourParts,
  outlinesTouch,
  pointInRings,
  Ring,
  ringsArea,
  ringsBox,
  ringsPath,
  TRACE_HEIGHT,
  TRACE_WIDTH,
  traceRegions,
  vectorizeLabels,
} from './zone-tracer';

const W = TRACE_WIDTH;
const H = TRACE_HEIGHT;

/** A picture whose texels are given by `texel(x, y)` as [r, g, b, a]. */
const picture = (width: number, height: number, texel: (x: number, y: number) => number[]): RgbaImage => {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(texel(x, y), (y * width + x) * 4);
    }
  }
  return { width, height, data };
};
const lit = (width: number, height: number) => picture(width, height, () => [255, 255, 255, 255]);
const blank = (width: number, height: number) => picture(width, height, () => [0, 0, 0, 0]);
/** A point (pixels) inside an outline traced in percent. */
const inside = (rings: Ring[] | undefined, x: number, y: number) => !!rings && pointInRings((x * 100) / W, (y * 100) / H, rings);
const square = (x0: number, y0: number, x1: number, y1: number): Ring => [x0, y0, x1, y0, x1, y1, x0, y1];

describe('zone tracer', () => {
  it('gives each pixel to the region it lies deepest inside, so borders end up halfway', () => {
    // two glows overlapping by 40 pixels
    const shapes = traceRegions([
      { id: 'west', parts: [{ image: lit(10, 10), rect: [100, 100, 300, 300], crop: false }] },
      { id: 'east', parts: [{ image: lit(10, 10), rect: [260, 100, 460, 300], crop: false }] },
    ]);
    expect([...shapes.keys()]).toEqual(['west', 'east']);
    expect(inside(shapes.get('west'), 200, 200)).toBe(true);
    expect(inside(shapes.get('west'), 270, 200)).toBe(true);
    expect(inside(shapes.get('east'), 290, 200)).toBe(true);
    expect(inside(shapes.get('east'), 270, 200)).toBe(false);
    expect(inside(shapes.get('west'), 50, 50)).toBe(false);
    // in percent of the map
    const [x0, y0, x1, y1] = ringsBox(shapes.get('west') as Ring[]);
    expect(x0).toBeGreaterThan(9);
    expect(y1).toBeLessThan(46);
    expect(x1).toBeGreaterThan(x0);
    expect(y0).toBeGreaterThan(14);
  });

  it('uses only the top 1002:668 of a zone highlight, and lit texels from a share of its brightest', () => {
    // lit in its lower third only (cut off), dim but lit in its upper part
    const highlight = picture(30, 30, (_, y) => (y >= 21 ? [255, 255, 255, 255] : y < 5 ? [40, 0, 0, 255] : [1, 1, 1, 255]));
    const shapes = traceRegions([{ id: 'a', parts: [{ image: highlight, rect: [100, 100, 400, 400] }] }]);
    expect(inside(shapes.get('a'), 250, 120)).toBe(true);
    expect(inside(shapes.get('a'), 250, 250)).toBe(false);
    // the same, not cropped: the bottom wins
    const whole = traceRegions([{ id: 'a', parts: [{ image: highlight, rect: [100, 100, 400, 400], crop: false }] }]);
    expect(inside(whole.get('a'), 250, 380)).toBe(true);
  });

  it('puts regions nested in another on top, blank highlights (cities) as ellipses', () => {
    const shapes = traceRegions([
      { id: 'zone', parts: [{ image: lit(10, 10), rect: [100, 100, 500, 500], crop: false }] },
      { id: 'town', parts: [{ image: lit(10, 10), rect: [150, 150, 200, 200], crop: false }] },
      { id: 'city', parts: [{ image: blank(8, 8), rect: [300, 300, 400, 400] }] },
      { id: 'capital', parts: [{ image: blank(8, 8), rect: [300, 150, 450, 300] }] },
    ]);
    expect(inside(shapes.get('town'), 175, 175)).toBe(true);
    expect(inside(shapes.get('zone'), 175, 175)).toBe(false);
    // an ellipse of 0.3 of its rectangle each way
    expect(inside(shapes.get('city'), 350, 350)).toBe(true);
    expect(inside(shapes.get('city'), 315, 315)).toBe(false);
    expect(inside(shapes.get('capital'), 375, 225)).toBe(true);
    expect(inside(shapes.get('zone'), 375, 225)).toBe(false);
  });

  it('fills an outline, unions parts, cuts by opacity and takes ellipses', () => {
    const ring = picture(40, 40, (x, y) => (x < 2 || y < 2 || x >= 38 || y >= 38 ? [255, 255, 255, 255] : [0, 0, 0, 0]));
    const shapes = traceRegions(
      [
        // an outline reaching past the map's top-left corner
        { id: 'outline', parts: [{ image: ring, rect: [-5, -5, 195, 195], crop: false, outline: true }] },
        {
          id: 'overlay',
          parts: [
            { image: picture(10, 10, () => [0, 0, 0, 100]), rect: [400, 100, 450, 150], crop: false, mode: 'alpha', threshold: 64 },
            { image: picture(10, 10, () => [0, 0, 0, 100]), rect: [440, 100, 500, 150], crop: false, mode: 'alpha', threshold: 64 },
            { image: picture(10, 10, () => [0, 0, 0, 30]), rect: [400, 150, 500, 200], crop: false, mode: 'alpha', threshold: 64 },
          ],
        },
        { id: 'world', parts: [{ ellipse: [700, 400, 80, 80] }] },
        // nothing to trace
        { id: 'none', parts: [{}, { ellipse: [-20, 100, 2, 2] }, { ellipse: [-2, 100, 2.5, 2.5] }] },
        { id: 'dark', parts: [{ image: picture(4, 4, () => [3, 3, 3, 255]), rect: [600, 100, 640, 140] }] },
        {
          id: 'off',
          parts: [
            { image: lit(4, 4), rect: [1100, 100, 1200, 200] },
            { image: lit(4, 4), rect: [10, 10, 10.5, 50] },
          ],
        },
      ],
      { gapClose: 0 },
    );
    expect(inside(shapes.get('outline'), 80, 80)).toBe(true);
    expect(inside(shapes.get('overlay'), 425, 125)).toBe(true);
    expect(inside(shapes.get('overlay'), 475, 125)).toBe(true);
    expect(inside(shapes.get('overlay'), 450, 175)).toBe(false);
    expect(inside(shapes.get('world'), 700, 400)).toBe(true);
    expect(inside(shapes.get('world'), 700, 490)).toBe(false);
    expect([...shapes.keys()]).toEqual(['outline', 'overlay', 'world']);
    expect(traceRegions([]).size).toBe(0);
    expect(traceRegions([{ id: 'none', parts: [{}] }]).size).toBe(0);
  });

  it('samples a picture between its texels over a rectangle off the pixel grid', () => {
    const shapes = traceRegions([{ id: 'a', parts: [{ image: lit(3, 3), rect: [100.8, 100.8, 200.2, 200.2], crop: false }] }]);
    const [x0, , x1] = ringsBox(shapes.get('a') as Ring[]);
    expect((x0 * W) / 100).toBeGreaterThan(100);
    expect((x1 * W) / 100).toBeLessThan(201);
  });

  it('closes narrow gaps between regions, keeps coasts and fills holes enclosed by one region', () => {
    const shapes = traceRegions([
      { id: 'a', parts: [{ image: lit(4, 4), rect: [100, 100, 200, 200], crop: false }] },
      // 6 pixels apart
      { id: 'b', parts: [{ image: lit(4, 4), rect: [206, 100, 306, 200], crop: false }] },
      // a ring with a lake (enclosed) and a bay
      {
        id: 'c',
        parts: [
          {
            image: picture(30, 30, (x, y) => (x >= 10 && x < 20 && y >= 10 && y < 20 ? [0, 0, 0, 0] : [255, 255, 255, 255])),
            rect: [400, 300, 700, 600],
            crop: false,
          },
        ],
      },
      {
        id: 'd',
        parts: [
          {
            image: picture(10, 10, (x, y) => (x >= 3 && y >= 3 && y < 7 ? [0, 0, 0, 0] : [255, 255, 255, 255])),
            rect: [100, 400, 300, 600],
            crop: false,
          },
        ],
      },
    ]);
    const a = shapes.get('a');
    const b = shapes.get('b');
    expect(inside(a, 202, 150) || inside(b, 202, 150)).toBe(true);
    expect(inside(a, 150, 230) || inside(b, 150, 230)).toBe(false);
    expect(inside(shapes.get('c'), 550, 450)).toBe(true);
    expect(inside(shapes.get('d'), 270, 500)).toBe(false);
  });

  it('keeps holes between regions that two regions enclose', () => {
    const half = (left: boolean) =>
      picture(20, 20, (x, y) => (x >= 5 && x < 15 && y >= 5 && y < 15 ? [0, 0, 0, 0] : [255, 255, 255, left ? 255 : 255]));
    const shapes = traceRegions(
      [
        { id: 'a', parts: [{ image: half(true), rect: [100, 100, 300, 300], crop: false }] },
        { id: 'b', parts: [{ image: lit(4, 4), rect: [190, 190, 210, 210], crop: false }] },
      ],
      { nestedRatio: 0 },
    );
    // the hole touches both: it stays a hole (except where 'b' is)
    expect(inside(shapes.get('a'), 160, 160)).toBe(false);
    expect(inside(shapes.get('b'), 200, 200)).toBe(true);
  });

  it('covers a region filling the whole map', () => {
    const shapes = traceRegions([{ id: 'all', parts: [{ image: lit(4, 4), rect: [0, 0, W, H], crop: false }] }]);
    expect(inside(shapes.get('all'), 501, 1)).toBe(true);
    expect(inside(shapes.get('all'), 1, 334)).toBe(true);
    expect(inside(shapes.get('all'), W - 2, 334)).toBe(true);
    expect(inside(shapes.get('all'), 501, H - 2)).toBe(true);
  });
});

describe('vectorizing labels', () => {
  const labels = (fill: (x: number, y: number) => number) => {
    const grid = new Int32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        grid[y * W + x] = fill(x, y);
      }
    }
    return grid;
  };

  it('traces rings in pixels, drops specks and turns right where pixels meet at a corner', () => {
    const grid = labels((x, y) =>
      x >= 10 && x < 40 && y >= 10 && y < 40 && !(x >= 20 && x < 30 && y >= 20 && y < 30)
        ? 1
        : (x >= 100 && x < 120 && y >= 100 && y < 120) || (x >= 120 && x < 140 && y >= 120 && y < 140)
          ? 2
          : x < 2 && y < 2
            ? 3
            : x >= W - 6 && y >= H - 6
              ? 4
              : -1,
    );
    const shapes = vectorizeLabels(grid, 0, { smoothPasses: 0 });
    // the square and its hole
    expect(shapes.get(1)).toHaveLength(2);
    expect(pointInRings(15, 15, shapes.get(1) as Ring[])).toBe(true);
    expect(pointInRings(25, 25, shapes.get(1) as Ring[])).toBe(false);
    // two blocks touching at a corner: kept apart
    expect(shapes.get(2)).toHaveLength(2);
    // specks: 4 pixels dropped, 36 kept (at the map's corner)
    expect(shapes.has(3)).toBe(false);
    expect(shapes.has(4)).toBe(true);
    expect(grid[0]).toBe(3);
    // a speck limit of its own
    expect(vectorizeLabels(grid, 40, { smoothPasses: 0 }).has(4)).toBe(false);
    // rings too small once simplified
    expect(vectorizeLabels(grid, 0, { smoothPasses: 0, minRingArea: 1e9 }).size).toBe(0);
  });

  it('smooths by majority (a pixel with no majority keeps its label)', () => {
    // three bands of three labels meeting
    const grid = labels((x, y) => (x >= 300 && x < 400 && y >= 300 && y < 400 ? Math.floor((y - 300) / 34) : -1));
    grid[350 * W + 200] = 5;
    const shapes = vectorizeLabels(grid);
    expect([...shapes.keys()].sort()).toEqual([0, 1, 2]);
  });
});

describe('outline helpers', () => {
  const box: Ring[] = [square(10, 10, 30, 30)];

  it('tests points, boxes, areas and draws paths', () => {
    expect(pointInRings(20, 20, box)).toBe(true);
    expect(pointInRings(40, 20, box)).toBe(false);
    expect(pointInRings(20, 20, [square(0, 0, 50, 50), square(10, 10, 30, 30)])).toBe(false);
    expect(ringsBox(box)).toEqual([10, 10, 30, 30]);
    expect(ringsArea(box)).toBe(400);
    expect(ringsPath([[1, 2, 3, 4, 5, 6]])).toBe('M1 2L3 4L5 6Z');
  });

  it('finds where to name an outline', () => {
    expect(labelPoint(box)).toEqual([20, 20]);
    // a C: its middle is outside
    const c: Ring = [0, 0, 30, 0, 30, 10, 10, 10, 10, 20, 30, 20, 30, 30, 0, 30];
    const [x, y] = labelPoint([c]);
    expect(pointInRings(x, y, [c])).toBe(true);
    // its biggest ring a hole: the middle, as nothing near it is inside
    const hole: Ring = [10, 10, 20, 10, 30, 10, 30, 20, 30, 30, 20, 30, 10, 30, 10, 20];
    expect(labelPoint([square(0, 0, 40, 40), hole])).toEqual([20, 20]);
  });

  it('tells outlines that touch', () => {
    expect(outlinesTouch(box, [square(30.5, 10, 50, 30)], 1)).toBe(true);
    expect(outlinesTouch(box, [square(40, 10, 50, 30)], 1)).toBe(false);
    expect(outlinesTouch(box, [square(-30, 10, 0, 30)], 1)).toBe(false);
    expect(outlinesTouch(box, [square(10, 40, 30, 50)], 1)).toBe(false);
    expect(outlinesTouch(box, [square(10, -30, 30, 0)], 1)).toBe(false);
    // boxes close, corners far
    expect(outlinesTouch([[0, 0, 100, 0, 100, 1]], [[50, 1.5, 51, 1.5, 51, 3]], 1)).toBe(false);
  });

  it('fills rings into a grid, except where skipped', () => {
    const grid = new Uint8Array(W * H);
    const skip = new Uint8Array(W * H);
    skip[15 * W + 15] = 1;
    fillRings(grid, [square(10, 10, 20, 20), square(-5, H - 2, 3, H + 5)], 7, skip);
    expect(grid[12 * W + 12]).toBe(7);
    expect(grid[15 * W + 15]).toBe(0);
    expect(grid[25 * W + 25]).toBe(0);
    expect(grid[(H - 1) * W]).toBe(7);
    const plain = new Uint8Array(W * H);
    fillRings(plain, [square(10, 10, 20, 20)], 1);
    expect(plain[15 * W + 15]).toBe(1);
  });

  it("finds the parts of a zone's neighbours on its map, and where buttons to the others go", () => {
    // the zone is the continent's 20..40 × 20..40 (its map shows it in full), its sub-zones in percent of its map
    const frame: [number, number, number, number] = [20, 20, 40, 40];
    const parts = neighbourParts(
      frame,
      [square(25, 25, 35, 35)],
      [[square(0, 0, 10, 10)]],
      new Map([
        ['east', [square(35, 20, 60, 40)]],
        ['far-east', [square(60, 20, 70, 40)]],
        ['far-west', [square(0, 20, 10, 40)]],
        ['far-south', [square(20, 60, 40, 70)]],
        ['far-north', [square(20, 0, 40, 10)]],
        // too little of it on the map
        ['sliver', [square(39.9, 20, 40.5, 21)]],
      ]),
    );
    expect([...parts.keys()]).toEqual(['east']);
    const east = parts.get('east') as Ring[];
    expect(pointInRings(90, 50, east)).toBe(true);
    // the zone's own part is left out
    expect(pointInRings(70, 50, east)).toBe(false);
    expect(edgeButton(frame, [65, 30])).toEqual({ x: 94, y: 50, side: 'e' });
    expect(edgeButton(frame, [5, 30])).toEqual({ x: 6, y: 50, side: 'w' });
    expect(edgeButton(frame, [30, 65])).toEqual({ x: 50, y: 92, side: 's' });
    expect(edgeButton(frame, [30, 5])).toEqual({ x: 50, y: 8, side: 'n' });
  });
});

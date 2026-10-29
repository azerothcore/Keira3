import { DbcFile } from './dbc';
import { buildDbc } from './dbc.mock';
import {
  composeGameMap,
  firstPage,
  fromGameMap,
  GameMapData,
  GameMapOverlay,
  gameMapPages,
  onContinent,
  onGameMap,
  overlayPieces,
  pageAt,
  pageChildren,
  pageFloors,
  pageKey,
  pageTiles,
  parseGameMapAreas,
  parseGameMapFloors,
  parseGameMapOverlays,
  parseGameMapTransforms,
  parseGameZones,
  toGameMap,
  regionShapes,
  shapeEdges,
  shapeCentres,
  labelAt,
  SHAPE_WIDTH,
  SHAPE_HEIGHT,
} from './game-map';

const float = (value: number): number => {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getUint32(0, true);
};
const dbcOf = (rows: (number | string)[][], fields?: number) => new DbcFile(buildDbc(rows, fields));
const bounds = (minX: number, maxX: number, minY: number, maxY: number) => ({ minX, maxX, minY, maxY });

describe('game map DBCs', () => {
  it('reads the world maps, with their bounds, parent and default floor', () => {
    const areas = parseGameMapAreas(
      dbcOf([
        [30, 0, 12, 'Elwynn', float(1500), float(-2000), float(-8000), float(-10000), -1, 0, 0],
        [504, 571, 4395, 'Dalaran', 0, 0, 0, 0, -1, 27, 510],
      ]),
    );
    expect(areas).toEqual([
      { id: 30, mapId: 0, areaId: 12, folder: 'Elwynn', bounds: bounds(-10000, -8000, -2000, 1500), parent: 0, defaultFloor: 0 },
      { id: 504, mapId: 571, areaId: 4395, folder: 'Dalaran', bounds: bounds(0, 0, 0, 0), parent: 510, defaultFloor: 27 },
    ]);
  });

  it('reads the overlays that have a picture', () => {
    const overlays = parseGameMapOverlays(
      dbcOf([
        [84, 41, 736, 0, 0, 0, 0, 0, 'BANETHILHOLLOW', 160, 210, 382, 281, 305, 420, 460, 510],
        [85, 41, 1, 0, 0, 0, 0, 0, '', 0, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
    expect(overlays).toEqual([
      {
        mapAreaId: 41,
        areaIds: [736],
        texture: 'BANETHILHOLLOW',
        width: 160,
        height: 210,
        x: 382,
        y: 281,
        hit: { top: 305, left: 420, bottom: 460, right: 510 },
      },
    ]);
  });

  it('reads the floors and the transforms to another map', () => {
    expect(parseGameMapFloors(dbcOf([[56, 533, 1, float(-3734), float(-2640), float(2886), float(3615), 488]]))).toEqual([
      { id: 56, mapId: 533, floor: 1, bounds: bounds(2886, 3615, -3734, -2640), parent: 488 },
    ]);
    expect(
      parseGameMapTransforms(
        dbcOf([
          [2, 530, float(4800), float(-10000), float(16000), float(-2600), 0, float(-2400), float(2400), 0],
          [4, 600, 0, 0, 0, 0, 600, 0, 0, 37],
        ]),
      ),
    ).toEqual([{ mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 }]);
  });

  it('reads zones with their levels and land from the dungeon finder, by name', () => {
    const area = (id: number, parent: number, flags: number, name: string, field = 11) => {
      const row: (number | string)[] = [id, 0, parent, 0, flags];
      row[field] = name;
      return row;
    };
    const lfg = (name: string, min: number, max: number, type: number, faction: number) => {
      const row: (number | string)[] = new Array(28).fill(0);
      Object.assign(row, { 0: 1, 1: name, 18: min, 19: max, 26: type, 27: faction });
      return row;
    };
    const zones = parseGameZones(
      dbcOf(
        [
          area(12, 0, 64, 'Elwynn Forest'),
          area(47, 0, 64, 'The Hinterlands', 12),
          area(87, 12, 0, 'Goldshire'),
          area(41, 0, 0, 'Deadwind Pass'),
          area(1519, 0, 0x100, 'Stormwind City'),
        ],
        27,
      ),
      dbcOf([lfg('Elwynn Forest', 1, 14, 4, 1), lfg('Hinterlands', 38, 54, 4, -1), lfg('Stormwind City', 1, 2, 1, 1), lfg('', 1, 2, 4, 0)]),
    );
    expect([...zones.keys()]).toEqual([12, 47, 87, 41, 1519]);
    expect(zones.get(87)).toEqual({ name: 'Goldshire', flags: 0 });
    expect(zones.get(12)).toEqual({ name: 'Elwynn Forest', flags: 64, levels: [1, 14], faction: 1 });
    expect(zones.get(47)).toEqual({ name: 'The Hinterlands', flags: 64, levels: [38, 54], faction: -1 });
    expect(zones.get(41)?.levels).toEqual([55, 60]);
    expect(zones.get(1519)).toEqual({ name: 'Stormwind City', flags: 0x100 });
    expect(parseGameZones(dbcOf([area(12, 0, 0, 'Elwynn Forest')], 27)).get(12)).toEqual({ name: 'Elwynn Forest', flags: 0 });
  });
});

describe('game map coordinates', () => {
  const elwynn = bounds(-10000, -8000, -2000, 1500);

  it('places world positions on a picture and back', () => {
    expect(toGameMap(elwynn, -8000, 1500)).toEqual({ u: 0, v: 0 });
    expect(toGameMap(elwynn, -9000, -250)).toEqual({ u: 0.5, v: 0.5 });
    expect(fromGameMap(elwynn, { u: 1, v: 1 })).toEqual({ x: -10000, y: -2000 });
    expect(onGameMap({ u: 0.5, v: 0.5 })).toBe(true);
    expect(onGameMap({ u: 1.2, v: 0.5 })).toBe(false);
    expect(onGameMap({ u: 0.5, v: -0.1 })).toBe(false);
  });

  it('moves zones of one map onto another continent', () => {
    const transforms = [{ mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 }];
    expect(onContinent({ mapId: 530, bounds: bounds(7000, 11000, -9000, -4000) }, transforms)).toEqual({
      mapId: 0,
      bounds: bounds(4600, 8600, -6600, -1600),
    });
    expect(onContinent({ mapId: 530, bounds: bounds(-1000, 1000, 0, 10) }, transforms).mapId).toBe(530);
    expect(onContinent({ mapId: 0, bounds: elwynn }, transforms).mapId).toBe(0);
  });
});

describe('game map pages', () => {
  const area = (id: number, mapId: number, areaId: number, folder: string, b = bounds(0, 0, 0, 0), parent = 0, defaultFloor = 0) => ({
    id,
    mapId,
    areaId,
    folder,
    bounds: b,
    parent,
    defaultFloor,
  });
  const floor = (id: number, mapId: number, n: number, b: ReturnType<typeof bounds>, parent = 0) => ({
    id,
    mapId,
    floor: n,
    bounds: b,
    parent,
  });
  const data: GameMapData = {
    areas: [
      area(14, 0, 0, 'Azeroth', bounds(-16000, 12000, -22000, 18000)),
      area(13, 1, 0, 'Kalimdor', bounds(-12000, 12000, -20000, 17000)),
      area(466, 530, 0, 'Expansion01', bounds(-6000, 6000, -4500, 13000)),
      area(485, 571, 0, 'Northrend', bounds(-1200, 10600, -8500, 9200)),
      area(99, 0, 0, 'NotAContinent', bounds(0, 1, 0, 1)),
      area(30, 0, 12, 'Elwynn', bounds(-10000, -8000, -2000, 1500)),
      area(301, 0, 1519, 'Stormwind', bounds(-9150, -8000, -15, 1700)),
      area(864, 0, 6170, 'Northshire', bounds(-9200, -8600, -800, 200), 30),
      area(462, 530, 3430, 'EversongWoods', bounds(7700, 11000, -9400, -4500)),
      area(465, 530, 3483, 'Hellfire', bounds(-2000, 1500, 400, 5500)),
      area(488, 571, 65, 'Dragonblight', bounds(1800, 5600, -2000, 3600)),
      area(510, 571, 2817, 'CrystalsongForest', bounds(4700, 6500, -1300, 1400)),
      area(504, 571, 4395, 'Dalaran', bounds(0, 0, 0, 0), 510, 27),
      area(535, 533, 3456, 'Naxxramas', bounds(2300, 3600, -4400, -2500)),
      area(529, 603, 4273, 'Ulduar', bounds(-1000, 1200, -1700, 1600), 0, -1),
      area(401, 30, 2597, 'AlteracValley', bounds(-1700, 1100, -2500, 1800)),
      area(531, 615, 4493, 'TheObsidianSanctum', bounds(2800, 3600, -30, 1100), 488),
      area(600, 999, 1, 'Blank', bounds(0, 0, 0, 0)),
    ],
    overlays: [],
    floors: [
      floor(56, 533, 1, bounds(2886, 3615, -3734, -2640), 488),
      floor(57, 533, 2, bounds(2886, 3615, -3734, -2640), 488),
      floor(27, 571, 1, bounds(5500, 6000, 200, 1000), 495),
      floor(26, 571, 2, bounds(5600, 6000, 350, 900), 495),
      floor(69, 603, 1, bounds(1400, 1800, -450, 220)),
    ],
    transforms: [{ mapId: 530, region: bounds(4800, 16000, -10000, -2600), newMapId: 0, offsetX: -2400, offsetY: 2400 }],
    zones: new Map(),
  };
  const pages = gameMapPages(data);

  it('has the cosmic map, the world map and the continents with their zones', () => {
    expect(pages.get('cosmic')?.regions.map((r) => r.page)).toEqual(['world', 'outland']);
    expect(pages.get('cosmic')?.regions.every((r) => r.circle)).toBe(true);
    const world = pages.get('world');
    expect(world?.parent).toBe('cosmic');
    expect(world?.regions.map((r) => r.page)).toEqual(['area:14', 'area:13', 'area:485']);
    expect(world?.regions[0].highlight).toBe('Interface\\WorldMap\\Azeroth\\AzerothHighlight.blp');
    expect(world?.regions[0].outline).toBe(true);
    const azeroth = pages.get('area:14');
    expect(azeroth).toMatchObject({ kind: 'continent', prefix: 'Azeroth\\Azeroth', parent: 'world', mapId: 0 });
    // Eversong Woods is on the Eastern Kingdoms, moved there from Outland's map
    expect(azeroth?.regions.map((r) => r.page)).toEqual(['area:30', 'area:301', 'area:462']);
    expect(azeroth?.regions[0].highlight).toBe('Interface\\WorldMap\\Elwynn\\ElwynnHighlight.blp');
    const elwynn = azeroth?.regions[0].rect;
    expect(elwynn?.left).toBeCloseTo((18000 - 1500) / 40000);
    expect(elwynn?.bottom).toBeCloseTo((12000 + 10000) / 28000);
    expect(pages.get('outland')).toMatchObject({ kind: 'continent', parent: 'cosmic' });
    expect(pages.get('outland')?.regions.map((r) => r.page)).toEqual(['area:465']);
    expect(pages.has('area:99')).toBe(false);
  });

  it('has the zones, instances and their floors, each going back where it belongs', () => {
    expect(pages.get('area:30')).toMatchObject({ kind: 'zone', prefix: 'Elwynn\\Elwynn', parent: 'area:14', areaId: 12 });
    expect(pages.get('area:462')?.parent).toBe('area:14');
    expect(pages.get('area:465')?.parent).toBe('outland');
    // Dalaran: only floors, back to Crystalsong Forest
    expect(pages.has('area:504')).toBe(false);
    expect(pages.get('area:504:1')).toMatchObject({ kind: 'floor', prefix: 'Dalaran\\Dalaran1_', parent: 'area:510', floor: 1 });
    // Naxxramas: floors, back to Dragonblight (from its floors); Ulduar: a picture of its own and floors
    expect(pages.has('area:535')).toBe(false);
    expect(pages.get('area:535:2')?.parent).toBe('area:488');
    expect(pages.get('area:529')?.kind).toBe('zone');
    expect(pages.get('area:529:1')?.parent).toBe('world');
    expect(pages.get('area:531')?.parent).toBe('area:488');
    expect(pages.get('area:401')?.parent).toBe('world');
    expect(pages.has('area:600')).toBe(false);
    expect(pageKey(5)).toBe('area:5');
    expect(pageKey(5, 2)).toBe('area:5:2');
  });

  it('switches between the pictures of one world map', () => {
    expect(pageFloors(pages, pages.get('area:529:1')!).map((p) => p.key)).toEqual(['area:529', 'area:529:1']);
    expect(pageFloors(pages, pages.get('world')!)).toEqual([]);
    expect(firstPage(pages, 'area:30')?.key).toBe('area:30');
    // the maps reached from a zone: a cave on its map, instances (once each, by their first page)
    expect(pageChildren(pages, pages.get('area:30')!).map((p) => p.key)).toEqual(['area:864']);
    expect(pageChildren(pages, pages.get('area:488')!).map((p) => p.key)).toEqual(['area:535:1', 'area:531']);
    expect(pageChildren(pages, pages.get('area:510')!).map((p) => p.key)).toEqual(['area:504:1']);
    expect(firstPage(pages, 'area:535')?.key).toBe('area:535:1');
    expect(firstPage(pages, 'area:12345')).toBeUndefined();
    expect(firstPage(pages, 'nowhere')).toBeUndefined();
  });

  it('opens the page that best shows a place', () => {
    // Stormwind's rectangle is inside Elwynn's: the zone the camera is in decides, else the one it is most inside
    expect(pageAt(pages, 0, -8913, 554).key).toBe('area:30');
    expect(pageAt(pages, 0, -8913, 554, 1519).key).toBe('area:301');
    // floors before outdoor pictures, the nearer the middle the better
    expect(pageAt(pages, 603, 1600, -100).key).toBe('area:529:1');
    expect(pageAt(pages, 533, 3200, -3100).key).toBe('area:535:1');
    // no zone there: the continent, else the world map
    expect(pageAt(pages, 0, 5000, 5000).key).toBe('area:14');
    expect(pageAt(pages, 33, 0, 0).key).toBe('world');
  });
});

describe('game map pictures', () => {
  const solid = (width: number, height: number, rgba: number[]) => ({
    width,
    height,
    data: Uint8Array.from({ length: width * height * 4 }, (_, i) => rgba[i % 4]),
  });

  it('names the tiles and the pieces of overlays', () => {
    expect(pageTiles({ prefix: 'Elwynn\\Elwynn' })[11]).toBe('Interface\\WorldMap\\Elwynn\\Elwynn12.blp');
    const overlay = { x: 10, y: 20, width: 300, height: 260 } as GameMapOverlay;
    expect(overlayPieces(overlay)).toEqual([
      { index: 1, x: 10, y: 20 },
      { index: 2, x: 266, y: 20 },
      { index: 3, x: 10, y: 276 },
      { index: 4, x: 266, y: 276 },
    ]);
  });

  it('lays tiles out 4 by 3, blends pieces over them and marks where labelled ones are solid', () => {
    const red = solid(256, 256, [255, 0, 0, 255]);
    const { image: picture, labels } = composeGameMap(
      [red, undefined, undefined, undefined, red],
      [
        { image: solid(2, 2, [0, 0, 255, 128]), x: -1, y: -1, label: 3 },
        { image: solid(4, 4, [0, 255, 0, 255]), x: 1000, y: 666 },
        { image: solid(10, 10, [0, 0, 0, 10]), x: 100, y: 100, label: 4 },
        { image: solid(6, 6, [9, 9, 9, 255]), x: 200, y: 200, label: 5 },
      ],
    );
    expect([picture.width, picture.height]).toEqual([1002, 668]);
    const at = (x: number, y: number) => Array.from(picture.data.subarray((y * 1002 + x) * 4, (y * 1002 + x) * 4 + 4));
    expect(at(0, 0)).toEqual([127, 0, 128, 255]);
    expect(at(1, 1)).toEqual([255, 0, 0, 255]);
    expect(at(300, 0)).toEqual([0, 0, 0, 255]);
    expect(at(0, 300)).toEqual([255, 0, 0, 255]);
    expect(at(1001, 667)).toEqual([0, 255, 0, 255]);
    // the shape grid is half the picture: solid pieces only
    expect(labels.length).toBe(SHAPE_WIDTH * SHAPE_HEIGHT);
    expect(labels[0]).toBe(3);
    expect(labels[50 * SHAPE_WIDTH + 50]).toBe(0);
    expect(labels[101 * SHAPE_WIDTH + 101]).toBe(5);
    expect(labels[104 * SHAPE_WIDTH + 104]).toBe(0);
  });
});

describe('game map shapes', () => {
  const W = SHAPE_WIDTH;
  const lit = (width: number, height: number, value = 40) => ({ width, height, data: new Uint8Array(width * height * 4).fill(value) });
  const rect = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom });
  const at = (labels: ArrayLike<number>, u: number, v: number) => labelAt(labels, { u, v });

  it('gives each pixel to the zone whose highlight lights it, the gaps between zones closed', () => {
    const { labels, keys } = regionShapes([
      { key: 'west', rect: rect(0.1, 0.1, 0.495, 0.5), image: lit(8, 8) },
      { key: 'east', rect: rect(0.505, 0.1, 0.9, 0.5), image: lit(8, 8) },
      { key: 'none', rect: rect(0.1, 0.6, 0.2, 0.7) },
      { key: 'off', rect: rect(2, 2, 3, 3), image: lit(8, 8) },
    ]);
    expect(keys).toEqual(['west', 'east', 'none', 'off']);
    expect(at(labels, 0.3, 0.2)).toBe(1);
    expect(at(labels, 0.7, 0.2)).toBe(2);
    // the 4-pixel gap between them closed; the sea around them not
    expect(at(labels, 0.5, 0.2)).not.toBe(0);
    // a gap nearer one side goes to that side
    const uneven = regionShapes([
      { key: 'w', rect: rect(0.1, 0.1, 0.495, 0.5), image: lit(8, 8) },
      { key: 'e', rect: rect(0.5, 0.1, 0.9, 0.5), image: lit(8, 8) },
    ]);
    expect(at(uneven.labels, 0.4985, 0.3)).toBe(2);
    expect(at(labels, 0.05, 0.2)).toBe(0);
    expect(at(labels, 0.15, 0.65)).toBe(0);
    // a zone highlight only uses its top 1002:668 part: the bottom row of this one is never drawn
    const cropped = { width: 3, height: 3, data: new Uint8Array(36) };
    cropped.data.set([
      0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 40, 40, 40, 255, 40, 40, 40, 255, 40, 40, 40, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255,
    ]);
    const crop = regionShapes([{ key: 'a', rect: rect(0, 0, 0.3, 0.3), image: cropped }]);
    expect(at(crop.labels, 0.15, 0.25)).toBe(1);
    expect(at(crop.labels, 0.15, 0.05)).toBe(0);
  });

  it('puts the place deep inside one zone in it, and cities (blank highlights) on top of their zone', () => {
    const { labels } = regionShapes([
      { key: 'a', rect: rect(0.1, 0.1, 0.5, 0.5), image: lit(4, 4) },
      { key: 'b', rect: rect(0.3, 0.1, 0.7, 0.5), image: lit(4, 4) },
      { key: 'city', rect: rect(0.12, 0.12, 0.2, 0.2), image: lit(4, 4, 0) },
      { key: 'town', rect: rect(0.14, 0.14, 0.18, 0.18), image: lit(4, 4, 0) },
      { key: 'above', rect: rect(0.2, 0.01, 0.22, 0.03), image: lit(4, 4) },
      { key: 'below', rect: rect(0.2, 0.8, 0.22, 0.82), image: lit(4, 4) },
      { key: 'right', rect: rect(0.9, 0.3, 0.92, 0.32), image: lit(4, 4) },
    ]);
    expect(at(labels, 0.32, 0.3)).toBe(1);
    expect(at(labels, 0.48, 0.3)).toBe(2);
    expect(at(labels, 0.16, 0.16)).toBe(4);
    expect(at(labels, 0.142, 0.16)).toBe(3);
    expect(at(labels, 0.121, 0.121)).toBe(1);
  });

  it('fills outlines, draws circles, and has no shape for a highlight too small to show', () => {
    const ring = { width: 9, height: 9, data: new Uint8Array(9 * 9 * 4) };
    for (let i = 0; i < 81; i++) {
      const [x, y] = [i % 9, Math.floor(i / 9)];
      const edge = Math.max(Math.abs(x - 4), Math.abs(y - 4)) === 3;
      ring.data.set([edge ? 200 : 0, 0, 0, 255], i * 4);
    }
    const tiny = { width: 64, height: 64, data: new Uint8Array(64 * 64 * 4) };
    tiny.data.set([255, 255, 255, 255], 63 * 4);
    const { labels } = regionShapes([
      { key: 'outline', rect: rect(0.1, 0.1, 0.4, 0.5), image: ring, outline: true, crop: false },
      { key: 'circle', rect: rect(0.6, 0.1, 0.9, 0.5), circle: true },
      { key: 'tiny', rect: rect(0.95, 0.95, 0.953, 0.953), image: tiny },
      { key: 'speck', rect: rect(0.97, 0.97, 0.9701, 0.9701), circle: true },
      { key: 'away', rect: rect(-2, -2, -1, -1), circle: true },
      // an outline along its picture's edge: all of it inside
      { key: 'framed', rect: rect(0.1, 0.6, 0.3, 0.9), image: lit(3, 3, 200), outline: true, crop: false },
    ]);
    expect(at(labels, 0.2, 0.75)).toBe(6);
    expect(at(labels, 0.25, 0.3)).toBe(1);
    // outside the outline
    expect(at(labels, 0.105, 0.105)).toBe(0);
    expect(at(labels, 0.75, 0.3)).toBe(2);
    expect(at(labels, 0.61, 0.11)).toBe(0);
    expect([...labels].some((l) => l === 3 || l === 4)).toBe(false);
  });

  it('finds the edges and middles of shapes, and the label at a point', () => {
    const labels = new Uint16Array(W * SHAPE_HEIGHT);
    for (let y = 10; y < 20; y++) {
      for (let x = 10; x < 20; x++) {
        labels[y * W + x] = 7;
      }
    }
    labels[(SHAPE_HEIGHT - 1) * W + W - 1] = 2;
    const edges = shapeEdges(labels);
    expect(edges[10 * W + 15]).toBe(1);
    expect(edges[15 * W + 15]).toBe(0);
    expect(edges[19 * W + 19]).toBe(1);
    expect(edges[5 * W + 5]).toBe(0);
    expect(edges[(SHAPE_HEIGHT - 1) * W + W - 1]).toBe(1);
    const middle = shapeCentres(labels).get(7);
    expect(middle?.size).toBe(100);
    expect(middle?.u).toBeCloseTo(15 / W);
    expect(at(labels, 15 / W, 15 / SHAPE_HEIGHT)).toBe(7);
    expect(at(labels, -0.1, 0.5)).toBe(0);
    expect(at(labels, 0.5, 1)).toBe(0);
  });
});

import { WorldBounds } from './coords';
import { DbcFile } from './dbc';
import { RgbaImage } from './formats';

/**
 * The in-game world map, from the client's own files: the pictures under `Interface\WorldMap` and the DBCs that say
 * which part of the world each one shows (WorldMapArea, DungeonMap), what lights up on it (WorldMapOverlay) and where
 * zones of one map are drawn on another's continent (WorldMapTransforms).
 */

/** The part of a world map picture that shows the map (its 12 tiles of 256 pixels make 1024 × 768). */
export const GAME_MAP_WIDTH = 1002;
export const GAME_MAP_HEIGHT = 668;
export const GAME_MAP_TILE = 256;
const GAME_MAP_COLUMNS = 4;
const GAME_MAP_TILES = 12;
export const GAME_MAP_ROOT = 'Interface\\WorldMap\\';

/** The four continents (Map.dbc ids). */
export const CONTINENT_MAPS = [0, 1, 530, 571];

/** A world map (WorldMapArea.dbc): a continent (area 0), a zone, a city or an instance. */
export interface GameMapArea {
  id: number;
  mapId: number;
  areaId: number;
  /** Its folder under `Interface\WorldMap`, also the name of its pictures. */
  folder: string;
  /** The part of the world its picture shows (all 0 for maps that only have floors, like Dalaran). */
  bounds: WorldBounds;
  /** The map it belongs to (0 for none): Dalaran's is Crystalsong Forest, the Obsidian Sanctum's Dragonblight. */
  parent: number;
  /** The floor shown first (DungeonMap id); −1 when it also has a picture of its own besides its floors (Ulduar). */
  defaultFloor: number;
}

/** A piece the world map lights up once explored (WorldMapOverlay.dbc): a sub-zone. */
export interface GameMapOverlay {
  mapAreaId: number;
  areaIds: number[];
  /** Its pictures are `<texture>1…n` in the world map's folder, in pieces of 256 pixels. */
  texture: string;
  width: number;
  height: number;
  x: number;
  y: number;
  /** Where the pointer names it, in pixels of the world map. */
  hit: { left: number; top: number; right: number; bottom: number };
}

/** A floor of a world map (DungeonMap.dbc), with its own picture (`<folder><floor>_1…12`). */
export interface GameMapFloor {
  id: number;
  mapId: number;
  floor: number;
  bounds: WorldBounds;
  /** The outdoor world map it is reached from (0 for none). */
  parent: number;
}

/** A part of a map drawn on another map's continent (WorldMapTransforms.dbc): Eversong Woods on the Eastern Kingdoms. */
export interface GameMapTransform {
  mapId: number;
  region: WorldBounds;
  newMapId: number;
  offsetX: number;
  offsetY: number;
}

/** What the world map tells of an area (a zone or a sub-zone). */
export interface GameZone {
  name: string;
  /** AreaTable flags (capital, sanctuary…). */
  flags: number;
  /** Its level range (LFGDungeons.dbc's zone rows), when known. */
  levels?: [number, number];
  /** Whose land it is (LFGDungeons.dbc): 0 Horde, 1 Alliance, −1 contested. */
  faction?: number;
}

export interface GameMapData {
  areas: GameMapArea[];
  overlays: GameMapOverlay[];
  floors: GameMapFloor[];
  transforms: GameMapTransform[];
  zones: Map<number, GameZone>;
}

/** AREA_FLAG_CAPITAL and AREA_FLAG_SANCTUARY. */
export const AREA_CAPITAL = 0x100;
export const AREA_SANCTUARY = 0x800;

/** LFGDungeons.dbc rows of type 4 are zones. */
const LFG_ZONE = 4;

/** Zones LFGDungeons.dbc has no levels for. */
const LEVELS_MISSING: Record<number, [number, number]> = { 41: [55, 60], 493: [55, 60], 2817: [74, 76], 4742: [77, 80] };

/**
 * WorldMapArea.dbc: 0 ID, 1 MapID, 2 AreaID, 3 AreaName (folder), 4 LocLeft (max y), 5 LocRight (min y), 6 LocTop
 * (max x), 7 LocBottom (min x), 8 DisplayMapID, 9 DefaultDungeonFloor, 10 ParentWorldMapID.
 */
export function parseGameMapAreas(dbc: DbcFile): GameMapArea[] {
  const areas: GameMapArea[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    const [maxY, minY, maxX, minX] = [4, 5, 6, 7].map((field) => dbc.getFloat(r, field));
    areas.push({
      id: dbc.getUint(r, 0),
      mapId: dbc.getInt(r, 1),
      areaId: dbc.getUint(r, 2),
      folder: dbc.getString(r, 3),
      bounds: { minX, maxX, minY, maxY },
      parent: Math.max(0, dbc.getInt(r, 10)),
      defaultFloor: dbc.getInt(r, 9),
    });
  }
  return areas;
}

/**
 * WorldMapOverlay.dbc: 0 ID, 1 MapAreaID, 2..5 AreaID, 6..7 MapPoint, 8 TextureName, 9 TextureWidth, 10 TextureHeight,
 * 11 OffsetX, 12 OffsetY, 13 HitRectTop, 14 HitRectLeft, 15 HitRectBottom, 16 HitRectRight. Rows without a picture
 * are left out.
 */
export function parseGameMapOverlays(dbc: DbcFile): GameMapOverlay[] {
  const overlays: GameMapOverlay[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    const texture = dbc.getString(r, 8);
    if (!texture) {
      continue;
    }
    overlays.push({
      mapAreaId: dbc.getUint(r, 1),
      areaIds: [2, 3, 4, 5].map((field) => dbc.getUint(r, field)).filter((id) => id > 0),
      texture,
      width: dbc.getUint(r, 9),
      height: dbc.getUint(r, 10),
      x: dbc.getInt(r, 11),
      y: dbc.getInt(r, 12),
      hit: { top: dbc.getInt(r, 13), left: dbc.getInt(r, 14), bottom: dbc.getInt(r, 15), right: dbc.getInt(r, 16) },
    });
  }
  return overlays;
}

/** DungeonMap.dbc: 0 ID, 1 MapID, 2 FloorIndex, 3 MinY, 4 MaxY, 5 MinX, 6 MaxX, 7 ParentWorldMapID. */
export function parseGameMapFloors(dbc: DbcFile): GameMapFloor[] {
  const floors: GameMapFloor[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    const [minY, maxY, minX, maxX] = [3, 4, 5, 6].map((field) => dbc.getFloat(r, field));
    floors.push({
      id: dbc.getUint(r, 0),
      mapId: dbc.getUint(r, 1),
      floor: dbc.getUint(r, 2),
      bounds: { minX, maxX, minY, maxY },
      parent: Math.max(0, dbc.getInt(r, 7)),
    });
  }
  return floors;
}

/** WorldMapTransforms.dbc: 0 ID, 1 MapID, 2 MinX, 3 MinY, 4 MaxX, 5 MaxY, 6 NewMapID, 7 OffsetX, 8 OffsetY. Only moves to another map. */
export function parseGameMapTransforms(dbc: DbcFile): GameMapTransform[] {
  const transforms: GameMapTransform[] = [];
  for (let r = 0; r < dbc.recordCount; r++) {
    const [mapId, newMapId] = [dbc.getUint(r, 1), dbc.getUint(r, 6)];
    if (mapId === newMapId) {
      continue;
    }
    const [minX, minY, maxX, maxY] = [2, 3, 4, 5].map((field) => dbc.getFloat(r, field));
    transforms.push({ mapId, region: { minX, maxX, minY, maxY }, newMapId, offsetX: dbc.getFloat(r, 7), offsetY: dbc.getFloat(r, 8) });
  }
  return transforms;
}

/** The first filled locale of a localized string (fields `first`…`first + 15`). */
function localized(dbc: DbcFile, record: number, first: number): string {
  for (let field = first; field < first + 16; field++) {
    const text = dbc.getString(record, field);
    if (text) {
      return text;
    }
  }
  return '';
}

/**
 * The areas (AreaTable.dbc: 0 ID, 2 ParentAreaID, 4 Flags, 11..26 AreaName) with their levels and whose land they are
 * (zones only) from LFGDungeons.dbc (1..16 Name, 18 MinLevel, 19 MaxLevel, 26 TypeID, 27 Faction), matched by name: the zone's
 * name ends with the dungeon finder's ("The Hinterlands", "Hinterlands").
 */
export function parseGameZones(areaTable: DbcFile, lfgDungeons?: DbcFile): Map<number, GameZone> {
  const zones = new Map<number, GameZone>();
  const topLevel = new Set<number>();
  for (let r = 0; r < areaTable.recordCount; r++) {
    const id = areaTable.getUint(r, 0);
    zones.set(id, { name: localized(areaTable, r, 11), flags: areaTable.getUint(r, 4) });
    if (areaTable.getUint(r, 2) === 0) {
      topLevel.add(id);
    }
  }
  const finder: { name: string; levels: [number, number]; faction: number }[] = [];
  for (let r = 0; r < (lfgDungeons?.recordCount ?? 0); r++) {
    const dbc = lfgDungeons as DbcFile;
    if (dbc.getUint(r, 26) === LFG_ZONE) {
      finder.push({
        name: localized(dbc, r, 1).toLowerCase(),
        levels: [dbc.getUint(r, 18), dbc.getUint(r, 19)],
        faction: dbc.getInt(r, 27),
      });
    }
  }
  topLevel.forEach((id) => {
    const zone = zones.get(id) as GameZone;
    const name = zone.name.toLowerCase();
    const found = finder.find((row) => row.name && name.endsWith(row.name));
    if (found) {
      zone.levels = found.levels;
      zone.faction = found.faction;
    } else if (LEVELS_MISSING[id]) {
      zone.levels = LEVELS_MISSING[id];
    }
  });
  return zones;
}

/** A place on a world map picture, from its top-left corner (0) to its bottom-right one (1). */
export interface GameMapPoint {
  u: number;
  v: number;
}

/** Where a place of the world is on a world map showing `bounds` (left to right is +y to −y, top to bottom +x to −x). */
export function toGameMap(bounds: WorldBounds, x: number, y: number): GameMapPoint {
  return { u: (bounds.maxY - y) / (bounds.maxY - bounds.minY), v: (bounds.maxX - x) / (bounds.maxX - bounds.minX) };
}

/** The place of the world at a point of a world map showing `bounds`. */
export function fromGameMap(bounds: WorldBounds, point: GameMapPoint): { x: number; y: number } {
  return { x: bounds.maxX - point.v * (bounds.maxX - bounds.minX), y: bounds.maxY - point.u * (bounds.maxY - bounds.minY) };
}

/** Whether a point is on the picture. */
export function onGameMap(point: GameMapPoint): boolean {
  return point.u > 0.001 && point.u < 0.999 && point.v > 0.001 && point.v < 0.999;
}

function hasBounds(bounds: WorldBounds): boolean {
  return bounds.maxX !== bounds.minX && bounds.maxY !== bounds.minY;
}

export type GamePageKind = 'cosmic' | 'world' | 'continent' | 'zone' | 'floor';

/** A rectangle of a page, in fractions of the picture. */
export interface GameMapRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A place on a page that leads to another one (a zone on its continent, a continent on the world map). */
export interface GameMapRegion {
  page: string;
  rect: GameMapRect;
  /** Its glow when the pointer is on it (a picture of the client), which gives its shape; else the circle in its rectangle. */
  highlight?: string;
  circle?: boolean;
  /** Its highlight is an outline of the whole picture (the world map's continents), not a zone's glow. */
  outline?: boolean;
}

/** A page of the world map. */
export interface GamePage {
  key: string;
  kind: GamePageKind;
  /** Its 12 tiles are `<prefix>1…12.blp`. */
  prefix: string;
  /** The world map row it shows (0 for the cosmic and world pages). */
  mapAreaId: number;
  mapId: number;
  areaId: number;
  bounds?: WorldBounds;
  floor?: number;
  /** The page "back" goes to. */
  parent?: string;
  regions: GameMapRegion[];
}

export const COSMIC_PAGE = 'cosmic';
export const WORLD_PAGE = 'world';
export const pageKey = (mapAreaId: number, floor?: number): string =>
  floor === undefined ? `area:${mapAreaId}` : `area:${mapAreaId}:${floor}`;

/** The world map's continents (WorldMapArea ids). */
const CONTINENT_AREAS: Record<number, number> = { 0: 14, 1: 13, 530: 466, 571: 485 };

/**
 * Where the client draws each continent's glow on the world map, in pixels: [highlight, x, y, scale x, scale y] (the
 * picture is 512 pixels across before scaling). The client places them in code; these were fitted against the art.
 */
const WORLD_CONTINENTS: [number, string, number, number, number, number][] = [
  [0, 'Azeroth\\AzerothHighlight', 702, 56, 1.182, 1.118],
  [1, 'Kalimdor\\KalimdorHighlight', -1, 131, 0.962, 0.959],
  [571, 'Northrend\\NorthrendHighlight', 354, 9, 0.647, 0.652],
];
const HIGHLIGHT_SIZE = 512;
/** The two worlds of the cosmic map, as circles in pixels: [page, centre x, centre y, radius]. */
const COSMIC_WORLDS: [string, number, number, number][] = [
  [WORLD_PAGE, 777, 425, 163],
  ['outland', 309, 228, 166],
];

const pixelRect = (left: number, top: number, right: number, bottom: number): GameMapRect => ({
  left: left / GAME_MAP_WIDTH,
  top: top / GAME_MAP_HEIGHT,
  right: right / GAME_MAP_WIDTH,
  bottom: bottom / GAME_MAP_HEIGHT,
});

/** Where a world map row is drawn on its continent: its map and bounds once moved by WorldMapTransforms. */
export function onContinent(
  area: Pick<GameMapArea, 'mapId' | 'bounds'>,
  transforms: GameMapTransform[],
): { mapId: number; bounds: WorldBounds } {
  const { bounds } = area;
  const [x, y] = [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
  const move = transforms.find(
    (t) => t.mapId === area.mapId && x >= t.region.minX && x <= t.region.maxX && y >= t.region.minY && y <= t.region.maxY,
  );
  return move
    ? {
        mapId: move.newMapId,
        bounds: {
          minX: bounds.minX + move.offsetX,
          maxX: bounds.maxX + move.offsetX,
          minY: bounds.minY + move.offsetY,
          maxY: bounds.maxY + move.offsetY,
        },
      }
    : { mapId: area.mapId, bounds };
}

/**
 * Every page of the world map: the cosmic map (Azeroth, Outland), the world map (its three continents), each continent
 * (its zones), each zone, city and instance, and each floor of the instances and cities that have floors.
 */
export function gameMapPages(data: GameMapData): Map<string, GamePage> {
  const pages = new Map<string, GamePage>();
  const continentKey = (mapId: number) => (mapId === 530 ? 'outland' : pageKey(CONTINENT_AREAS[mapId]));
  pages.set(COSMIC_PAGE, {
    key: COSMIC_PAGE,
    kind: 'cosmic',
    prefix: 'Cosmic\\Cosmic',
    mapAreaId: 0,
    mapId: -1,
    areaId: 0,
    regions: COSMIC_WORLDS.map(([page, x, y, r]) => ({ page, rect: pixelRect(x - r, y - r, x + r, y + r), circle: true })),
  });
  pages.set(WORLD_PAGE, {
    key: WORLD_PAGE,
    kind: 'world',
    prefix: 'World\\World',
    mapAreaId: 0,
    mapId: -1,
    areaId: 0,
    parent: COSMIC_PAGE,
    regions: WORLD_CONTINENTS.map(([mapId, highlight, x, y, sx, sy]) => ({
      page: continentKey(mapId),
      rect: pixelRect(x, y, x + HIGHLIGHT_SIZE * sx, y + HIGHLIGHT_SIZE * sy),
      highlight: `${GAME_MAP_ROOT}${highlight}.blp`,
      outline: true,
    })),
  });

  const byId = new Map(data.areas.map((area) => [area.id, area]));
  const continents = new Map(data.areas.filter((area) => area.areaId === 0 && hasBounds(area.bounds)).map((area) => [area.mapId, area]));
  for (const area of data.areas) {
    const tiles = `${area.folder}\\${area.folder}`;
    if (area.areaId === 0) {
      if (!continents.has(area.mapId) || CONTINENT_AREAS[area.mapId] !== area.id) {
        continue;
      }
      // its zones, where they are drawn on it (not the maps inside a zone, like the caves some patches add)
      const regions: GameMapRegion[] = [];
      for (const zone of data.areas) {
        if (zone.areaId === 0 || zone.parent || !hasBounds(zone.bounds)) {
          continue;
        }
        const placed = onContinent(zone, data.transforms);
        if (placed.mapId !== area.mapId) {
          continue;
        }
        const [a, b] = [
          toGameMap(area.bounds, placed.bounds.maxX, placed.bounds.maxY),
          toGameMap(area.bounds, placed.bounds.minX, placed.bounds.minY),
        ];
        regions.push({
          page: pageKey(zone.id),
          rect: { left: a.u, top: a.v, right: b.u, bottom: b.v },
          highlight: `${GAME_MAP_ROOT}${zone.folder}\\${zone.folder}Highlight.blp`,
        });
      }
      const key = continentKey(area.mapId);
      pages.set(key, {
        key,
        kind: 'continent',
        prefix: tiles,
        mapAreaId: area.id,
        mapId: area.mapId,
        areaId: 0,
        bounds: area.bounds,
        parent: area.mapId === 530 ? COSMIC_PAGE : WORLD_PAGE,
        regions,
      });
      continue;
    }

    // the floors of an instance; on a continent only the maps with no picture of their own (Dalaran) have floors
    const floors = data.floors
      .filter((f) => f.mapId === area.mapId && (!CONTINENT_MAPS.includes(area.mapId) || (!hasBounds(area.bounds) && area.defaultFloor > 0)))
      .sort((a, b) => a.floor - b.floor);
    const parentArea = byId.get(area.parent) ?? byId.get(floors.find((f) => f.parent)?.parent ?? 0);
    const placed = onContinent(area, data.transforms);
    const parent = parentArea
      ? pageKey(parentArea.id)
      : continents.has(placed.mapId) && CONTINENT_MAPS.includes(placed.mapId)
        ? continentKey(placed.mapId)
        : WORLD_PAGE;
    const base = { mapAreaId: area.id, mapId: area.mapId, areaId: area.areaId, parent, regions: [] };
    if (hasBounds(area.bounds) && (floors.length === 0 || area.defaultFloor < 0)) {
      const key = pageKey(area.id);
      pages.set(key, { ...base, key, kind: 'zone', prefix: tiles, bounds: area.bounds });
    }
    for (const floor of floors) {
      const key = pageKey(area.id, floor.floor);
      pages.set(key, { ...base, key, kind: 'floor', prefix: `${tiles}${floor.floor}_`, bounds: floor.bounds, floor: floor.floor });
    }
  }
  return pages;
}

/** The pages of one world map row (its own picture first, then its floors), to switch between them. */
export function pageFloors(pages: Map<string, GamePage>, page: GamePage): GamePage[] {
  return page.mapAreaId ? [...pages.values()].filter((p) => p.mapAreaId === page.mapAreaId && p.kind !== 'continent') : [];
}

/** The maps reached from a page (caves, mines, instances), each by the page it is first shown on, by name order of key. */
export function pageChildren(pages: Map<string, GamePage>, page: GamePage): GamePage[] {
  const seen = new Set<number>();
  const children: GamePage[] = [];
  for (const child of pages.values()) {
    if (child.parent === page.key && child.kind !== 'continent' && child.mapAreaId !== page.mapAreaId && !seen.has(child.mapAreaId)) {
      seen.add(child.mapAreaId);
      children.push(child);
    }
  }
  return children;
}

/** The page a zone, city or instance is first shown on: its own picture, else its first floor. */
export function firstPage(pages: Map<string, GamePage>, key: string): GamePage | undefined {
  const page = pages.get(key);
  if (page) {
    return page;
  }
  const match = /^area:(\d+)$/.exec(key);
  return match ? [...pages.values()].find((p) => p.mapAreaId === Number(match[1]) && p.kind === 'floor') : undefined;
}

/**
 * The page that best shows a place (like the game opens its map): the zone `zoneId` when given and the place is on its
 * picture, else the page the place is most inside of, a floor before an outdoor picture (and the upper of stacked
 * floors); else the continent of the map; else the world map.
 */
export function pageAt(pages: Map<string, GamePage>, mapId: number, x: number, y: number, zoneId = 0): GamePage {
  const candidates = [...pages.values()]
    .filter((page) => (page.kind === 'zone' || page.kind === 'floor') && page.mapId === mapId)
    .map((page) => ({ page, point: toGameMap(page.bounds as WorldBounds, x, y) }))
    .filter(({ point }) => onGameMap(point))
    .map(({ page, point }) => ({ page, distance: Math.hypot(point.u - 0.5, point.v - 0.5) }))
    .sort(
      (a, b) =>
        Number(b.page.areaId === zoneId) - Number(a.page.areaId === zoneId) ||
        Number(b.page.kind === 'floor') - Number(a.page.kind === 'floor') ||
        a.distance - b.distance ||
        // stacked floors: the lower number (usually where it is entered)
        a.page.key.localeCompare(b.page.key, undefined, { numeric: true }),
    );
  if (candidates.length) {
    return candidates[0].page;
  }
  const continent = [...pages.values()].find((page) => page.kind === 'continent' && page.mapId === mapId);
  return continent ?? (pages.get(WORLD_PAGE) as GamePage);
}

/** A piece of picture to draw on a world map, at a place in pixels; `label` marks where it is solid in `labels`. */
export interface GameMapPiece {
  image: RgbaImage;
  x: number;
  y: number;
  label?: number;
}

/** The grid shapes are kept in: half the picture. */
export const SHAPE_WIDTH = 501;
export const SHAPE_HEIGHT = 334;
/** How solid an overlay's pixel must be to count as its sub-zone (of 255). */
const OVERLAY_SOLID = 64;

/** A world map picture, with which overlay (its index + 1; 0 none) covers each pixel of the shape grid. */
export interface GameMapPicture {
  image: RgbaImage;
  labels: Uint8Array;
}

/** The pictures (`<texture><n>`, n from 1) an overlay is made of, with where each goes. */
export function overlayPieces(overlay: GameMapOverlay): { index: number; x: number; y: number }[] {
  const [columns, rows] = [Math.ceil(overlay.width / GAME_MAP_TILE), Math.ceil(overlay.height / GAME_MAP_TILE)];
  const pieces: { index: number; x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      pieces.push({ index: row * columns + column + 1, x: overlay.x + column * GAME_MAP_TILE, y: overlay.y + row * GAME_MAP_TILE });
    }
  }
  return pieces;
}

/** The paths of a page's 12 tiles. */
export function pageTiles(page: Pick<GamePage, 'prefix'>): string[] {
  return Array.from({ length: GAME_MAP_TILES }, (_, i) => `${GAME_MAP_ROOT}${page.prefix}${i + 1}.blp`);
}

/**
 * A world map picture (1002 × 668): its 12 tiles (missing ones stay black), then the pieces laid over them, with where
 * each labelled piece is solid on the shape grid.
 */
export function composeGameMap(tiles: (RgbaImage | undefined)[], pieces: GameMapPiece[] = []): GameMapPicture {
  const labels = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT);
  const picture: RgbaImage = { width: GAME_MAP_WIDTH, height: GAME_MAP_HEIGHT, data: new Uint8Array(GAME_MAP_WIDTH * GAME_MAP_HEIGHT * 4) };
  for (let i = 3; i < picture.data.length; i += 4) {
    picture.data[i] = 255;
  }
  tiles.forEach(
    (tile, i) =>
      tile &&
      draw(picture, { image: tile, x: (i % GAME_MAP_COLUMNS) * GAME_MAP_TILE, y: Math.floor(i / GAME_MAP_COLUMNS) * GAME_MAP_TILE }),
  );
  pieces.forEach((piece) => {
    draw(picture, piece);
    if (piece.label) {
      markSolid(labels, piece, piece.label);
    }
  });
  return { image: picture, labels };
}

/** Where a piece is solid, on the shape grid. */
function markSolid(labels: Uint8Array, { image, x: left, y: top }: GameMapPiece, label: number): void {
  for (let gy = Math.max(0, Math.ceil(top / 2)); gy < SHAPE_HEIGHT && gy * 2 < top + image.height; gy++) {
    for (let gx = Math.max(0, Math.ceil(left / 2)); gx < SHAPE_WIDTH && gx * 2 < left + image.width; gx++) {
      if (image.data[((gy * 2 - top) * image.width + gx * 2 - left) * 4 + 3] >= OVERLAY_SOLID) {
        labels[gy * SHAPE_WIDTH + gx] = label;
      }
    }
  }
}

/** Shapes on the grid: the key each pixel belongs to (labels are indexes + 1 into `keys`; 0 for none). */
export interface GameMapShapes {
  labels: Uint16Array;
  keys: string[];
}

/**
 * A region to find the shape of: by its highlight (the client's picture, drawn over `rect`; zone highlights only use
 * their top 1002:668 part, `crop`; the world map's continent highlights are outlines to fill), or as the circle in `rect`.
 */
export interface ShapeSource {
  key: string;
  rect: GameMapRect;
  image?: RgbaImage;
  crop?: boolean;
  outline?: boolean;
  circle?: boolean;
}

/** A pixel of a highlight is lit from this share of its brightest, and at least this bright (of 255). */
const LIT_SHARE = 0.07;
const LIT_MIN = 4;
/** Cities have blank highlights: an ellipse of this share of their rectangle instead. */
const CITY_RADIUS = 0.3;
/** A shape mostly (this share) inside another one this many times bigger is nested in it (a city in its zone). */
const NESTED_COVER = 0.7;
const NESTED_RATIO = 0.35;

/** A region's lit pixels on the grid, in its bounding box. */
interface Mask {
  x: number;
  y: number;
  w: number;
  h: number;
  m: Uint8Array;
  n: number;
}

/**
 * The shapes of regions (zones on a continent, continents on the world map), as the game lights the zone under the
 * pointer: each region's highlight thresholded, then each pixel given to the region it is deepest inside, with regions
 * nested in another (cities) on top.
 */
export function regionShapes(sources: ShapeSource[], gap = GAP_CLOSE): GameMapShapes {
  const labels = new Uint16Array(SHAPE_WIDTH * SHAPE_HEIGHT);
  const masks = sources.map((source) => regionMask(source));
  const nested = new Set<number>();
  masks.forEach((mask, i) => {
    if (
      mask &&
      masks.some((other, j) => j !== i && other && mask.n <= other.n * NESTED_RATIO && overlap(mask, other) >= mask.n * NESTED_COVER)
    ) {
      nested.add(i);
    }
  });
  const best = new Float32Array(SHAPE_WIDTH * SHAPE_HEIGHT);
  masks.forEach((mask, i) => {
    if (!mask || nested.has(i)) {
      return;
    }
    const depth = chamfer(mask);
    eachLit(mask, (gi, mi) => {
      if (depth[mi] > best[gi]) {
        best[gi] = depth[mi];
        labels[gi] = i + 1;
      }
    });
  });
  // nested ones on top, the biggest first so the smallest wins
  [...nested]
    .sort((a, b) => (masks[b] as Mask).n - (masks[a] as Mask).n)
    .forEach((i) => eachLit(masks[i] as Mask, (gi) => (labels[gi] = i + 1)));
  closeGaps(labels, gap);
  return { labels, keys: sources.map((s) => s.key) };
}

/** Gaps between shapes up to twice this wide (grid pixels) are closed; coasts stay as they are. */
const GAP_CLOSE = 3;

/** Fills the pixels between two shapes (left and right, or above and below, within `gap`) with the nearer one. */
function closeGaps(labels: Uint16Array, gap: number): void {
  const source = labels.slice();
  const find = (x: number, y: number, dx: number, dy: number): [number, number] => {
    for (let step = 1; step <= gap; step++) {
      const [nx, ny] = [x + dx * step, y + dy * step];
      if (nx < 0 || ny < 0 || nx >= SHAPE_WIDTH || ny >= SHAPE_HEIGHT) {
        break;
      }
      const label = source[ny * SHAPE_WIDTH + nx];
      if (label) {
        return [label, step];
      }
    }
    return [0, 0];
  };
  for (let y = 0; y < SHAPE_HEIGHT; y++) {
    for (let x = 0; x < SHAPE_WIDTH; x++) {
      if (source[y * SHAPE_WIDTH + x]) {
        continue;
      }
      for (const [dx, dy] of [
        [1, 0],
        [0, 1],
      ]) {
        const [a, da] = find(x, y, -dx, -dy);
        const [b, db] = find(x, y, dx, dy);
        if (a && b) {
          labels[y * SHAPE_WIDTH + x] = da <= db ? a : b;
          break;
        }
      }
    }
  }
}

/** Calls `visit` with the grid index and mask index of each lit pixel of a mask. */
function eachLit(mask: Mask, visit: (gridIndex: number, maskIndex: number) => void): void {
  for (let y = 0; y < mask.h; y++) {
    for (let x = 0; x < mask.w; x++) {
      if (mask.m[y * mask.w + x]) {
        visit((mask.y + y) * SHAPE_WIDTH + mask.x + x, y * mask.w + x);
      }
    }
  }
}

/** How many lit pixels two masks share. */
function overlap(a: Mask, b: Mask): number {
  let count = 0;
  eachLit(a, (gi) => {
    const [x, y] = [(gi % SHAPE_WIDTH) - b.x, Math.floor(gi / SHAPE_WIDTH) - b.y];
    if (x >= 0 && y >= 0 && x < b.w && y < b.h && b.m[y * b.w + x]) {
      count++;
    }
  });
  return count;
}

/** How far each lit pixel is from the mask's edge (in pixels, along the grid). */
function chamfer(mask: Mask): Float32Array {
  const { w, h, m } = mask;
  const d = new Float32Array(w * h);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      d[y * w + x] = m[y * w + x] ? Math.min(at(x - 1, y), at(x, y - 1)) + 1 : 0;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      if (m[y * w + x]) {
        d[y * w + x] = Math.min(d[y * w + x], at(x + 1, y) + 1, at(x, y + 1) + 1);
      }
    }
  }
  return d;
}

/** The pixels of the grid inside a rectangle (in fractions of the picture), clipped to the grid. */
function gridBox(rect: GameMapRect): { x: number; y: number; w: number; h: number } | undefined {
  const [x0, x1] = [Math.max(0, Math.floor(rect.left * SHAPE_WIDTH)), Math.min(SHAPE_WIDTH, Math.ceil(rect.right * SHAPE_WIDTH))];
  const [y0, y1] = [Math.max(0, Math.floor(rect.top * SHAPE_HEIGHT)), Math.min(SHAPE_HEIGHT, Math.ceil(rect.bottom * SHAPE_HEIGHT))];
  return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : undefined;
}

/** An ellipse filling `share` of a rectangle around its middle. */
function ellipseMask(rect: GameMapRect, share: number): Mask | undefined {
  const box = gridBox(rect);
  if (!box) {
    return undefined;
  }
  const m = new Uint8Array(box.w * box.h);
  let n = 0;
  const [cu, cv] = [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2];
  const [ru, rv] = [((rect.right - rect.left) / 2) * share * 2, ((rect.bottom - rect.top) / 2) * share * 2];
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const [u, v] = [(box.x + x + 0.5) / SHAPE_WIDTH, (box.y + y + 0.5) / SHAPE_HEIGHT];
      if (((u - cu) / ru) ** 2 + ((v - cv) / rv) ** 2 <= 1) {
        m[y * box.w + x] = 1;
        n++;
      }
    }
  }
  return n ? { ...box, m, n } : undefined;
}

/** A region's mask: its circle, or its highlight thresholded (blank ones, cities, an ellipse). */
function regionMask(source: ShapeSource): Mask | undefined {
  if (source.circle) {
    return ellipseMask(source.rect, 0.5);
  }
  const image = source.image;
  const box = gridBox(source.rect);
  if (!image || !box) {
    return undefined;
  }
  const rows = Math.min(image.height, Math.ceil(source.crop === false ? image.height : (image.height * GAME_MAP_HEIGHT) / GAME_MAP_WIDTH));
  const lum = new Float32Array(image.width * rows);
  let peak = 0;
  for (let i = 0; i < lum.length; i++) {
    const [r, g, b, a] = image.data.subarray(i * 4, i * 4 + 4);
    lum[i] = (Math.max(r, g, b) * a) / 255;
    peak = Math.max(peak, lum[i]);
  }
  if (peak <= 0) {
    return ellipseMask(source.rect, CITY_RADIUS);
  }
  const threshold = Math.max(LIT_MIN, peak * LIT_SHARE);
  const { left, top, right, bottom } = source.rect;
  const m = new Uint8Array(box.w * box.h);
  let n = 0;
  for (let y = 0; y < box.h; y++) {
    const ty = Math.min(rows - 1, Math.floor((((box.y + y + 0.5) / SHAPE_HEIGHT - top) / (bottom - top)) * rows));
    for (let x = 0; x < box.w; x++) {
      const tx = Math.min(image.width - 1, Math.floor((((box.x + x + 0.5) / SHAPE_WIDTH - left) / (right - left)) * image.width));
      if (tx >= 0 && ty >= 0 && lum[ty * image.width + tx] >= threshold) {
        m[y * box.w + x] = 1;
        n++;
      }
    }
  }
  if (!n) {
    return undefined;
  }
  const mask = { ...box, m, n };
  return source.outline ? fillOutline(mask) : mask;
}

/** An outline's inside filled: what can't be reached from the box's edge without crossing it (gaps of a pixel closed). */
function fillOutline(mask: Mask): Mask {
  const { w, h } = mask;
  // thicken the outline by a pixel, so small gaps don't let the outside in
  const wall = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask.m[y * w + x]) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const [nx, ny] = [x + dx, y + dy];
            if (nx >= 0 && ny >= 0 && nx < w && ny < h) {
              wall[ny * w + nx] = 1;
            }
          }
        }
      }
    }
  }
  const outside = new Uint8Array(w * h);
  const stack: number[] = [];
  for (let x = 0; x < w; x++) {
    stack.push(x, (h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    stack.push(y * w, y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop() as number;
    if (outside[i] || wall[i]) {
      continue;
    }
    outside[i] = 1;
    const [x, y] = [i % w, Math.floor(i / w)];
    if (x > 0) stack.push(i - 1);
    if (x + 1 < w) stack.push(i + 1);
    if (y > 0) stack.push(i - w);
    if (y + 1 < h) stack.push(i + w);
  }
  const m = new Uint8Array(w * h);
  let n = 0;
  for (let i = 0; i < m.length; i++) {
    if (!outside[i]) {
      m[i] = 1;
      n++;
    }
  }
  return { ...mask, m, n };
}

/** The pixels of the grid on the edge of a shape (a neighbour belongs to something else), as 1s. */
export function shapeEdges(labels: ArrayLike<number>): Uint8Array {
  const edges = new Uint8Array(SHAPE_WIDTH * SHAPE_HEIGHT);
  for (let y = 0; y < SHAPE_HEIGHT; y++) {
    for (let x = 0; x < SHAPE_WIDTH; x++) {
      const i = y * SHAPE_WIDTH + x;
      const here = labels[i];
      if (
        here &&
        ((x > 0 && labels[i - 1] !== here) ||
          (x + 1 < SHAPE_WIDTH && labels[i + 1] !== here) ||
          (y > 0 && labels[i - SHAPE_WIDTH] !== here) ||
          (y + 1 < SHAPE_HEIGHT && labels[i + SHAPE_WIDTH] !== here))
      ) {
        edges[i] = 1;
      }
    }
  }
  return edges;
}

/** Where each label's shape is centred (its pixels' mean), with how many pixels it has, by label. */
export function shapeCentres(labels: ArrayLike<number>): Map<number, { u: number; v: number; size: number }> {
  const sums = new Map<number, [number, number, number]>();
  for (let i = 0; i < SHAPE_WIDTH * SHAPE_HEIGHT; i++) {
    const label = labels[i];
    if (label) {
      const sum = sums.get(label) ?? [0, 0, 0];
      sum[0] += i % SHAPE_WIDTH;
      sum[1] += Math.floor(i / SHAPE_WIDTH);
      sum[2]++;
      sums.set(label, sum);
    }
  }
  const centres = new Map<number, { u: number; v: number; size: number }>();
  sums.forEach(([x, y, n], label) => centres.set(label, { u: (x / n + 0.5) / SHAPE_WIDTH, v: (y / n + 0.5) / SHAPE_HEIGHT, size: n }));
  return centres;
}

/** The label at a point of the picture (0 outside it). */
export function labelAt(labels: ArrayLike<number>, point: GameMapPoint): number {
  const [x, y] = [Math.floor(point.u * SHAPE_WIDTH), Math.floor(point.v * SHAPE_HEIGHT)];
  return x < 0 || y < 0 || x >= SHAPE_WIDTH || y >= SHAPE_HEIGHT ? 0 : labels[y * SHAPE_WIDTH + x];
}

/** Draws a picture over another at its size, blending by its alpha. */
function draw(target: RgbaImage, { image, x: left, y: top }: GameMapPiece): void {
  for (let y = Math.max(0, -top); y < image.height && top + y < target.height; y++) {
    for (let x = Math.max(0, -left); x < image.width && left + x < target.width; x++) {
      const from = (y * image.width + x) * 4;
      const to = ((top + y) * target.width + left + x) * 4;
      const alpha = image.data[from + 3] / 255;
      for (let c = 0; c < 3; c++) {
        target.data[to + c] = Math.round(target.data[to + c] * (1 - alpha) + image.data[from + c] * alpha);
      }
    }
  }
}

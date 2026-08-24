import { TableRow } from '@keira/shared/constants';

export const MAP_CONFIG = {
  baseUrl: 'https://wow.zamimg.com/images/wow/wrath/maps/enus/original/',
  format: 'jpg' as const,
};

/**
 * WoW server coordinate axes (position_x / position_y in creature/gameobject tables):
 *
 *   x  →  North/South axis  (compared against LocTop / LocBottom)
 *   y  →  East/West  axis   (compared against LocLeft / LocRight)
 *   z  →  Height — not used for 2-D map projection
 *
 * WorldMapArea.dbc bounds (source: wowdev.wiki/DB/WorldMapArea):
 *   LocLeft   — Y upper bound  (LocLeft  > LocRight,  western  edge of tile)
 *   LocRight  — Y lower bound  (eastern  edge of tile)
 *   LocTop    — X upper bound  (LocTop   > LocBottom, northern edge of tile)
 *   LocBottom — X lower bound  (southern edge of tile)
 *
 * Projection:
 *   left% = (LocLeft − y) / (LocLeft − LocRight)
 *   top%  = (LocTop  − x) / (LocTop  − LocBottom)
 */

export interface MapPoint {
  mapId: number;
  x: number;
  y: number;
  orientation?: number;
  name?: string;
  level?: number;
  [key: string]: unknown;
}

export interface WorldMapArea extends TableRow {
  ID: number;
  MapID: number;
  AreaID: number;
  AreaName: string;
  LocLeft: number /** Y upper bound (western edge). Always > LocRight. */;
  LocRight: number /** Y lower bound (eastern edge). */;
  LocTop: number /** X upper bound (northern edge). Always > LocBottom. */;
  LocBottom: number /** X lower bound (southern edge). */;
  DisplayMapID: number;
}

export interface RenderedPoint extends MapPoint {
  left: string;
  top: string;
  icon?: string;
  // Horizontal pixel nudge so multiple pins sharing the exact same coordinate don't fully overlap.
  offsetX?: number;
}

/**
 * A WorldMapOverlay sub-area highlight, used to approximate a zone's real (irregular) footprint:
 * its placement rectangle on the parent zone's map covers actual land, not the empty "bleed" corners
 * of the rectangular map tile. Coordinates are pixels on the fixed MAP_CANVAS_W x MAP_CANVAS_H canvas.
 */
export interface WorldMapOverlay extends TableRow {
  mapAreaId: number; // -> WorldMapArea.ID (the parent zone map this overlay sits on)
  x: number;
  y: number;
  w: number;
  h: number;
}

// Fixed pixel size of a WoW zone-map canvas that WorldMapOverlay placement coords are relative to.
export const MAP_CANVAS_W = 1002;
export const MAP_CANVAS_H = 668;

// Capital-city AreaIDs. A capital takes precedence over its surrounding zone when matching spawns.
export enum CapitalCity {
  Undercity = 1497,
  Orgrimmar = 1637,
  ThunderBluff = 1638,
  SilvermoonCity = 3487,
  StormwindCity = 1519,
  Ironforge = 1537,
  Darnassus = 1657,
  TheExodar = 3557,
  ShattrathCity = 3703,
  Dalaran = 4395,
}

export const CAPITAL_AREA_IDS = new Set<number>([
  CapitalCity.Undercity,
  CapitalCity.Orgrimmar,
  CapitalCity.ThunderBluff,
  CapitalCity.SilvermoonCity,
  CapitalCity.StormwindCity,
  CapitalCity.Ironforge,
  CapitalCity.Darnassus,
  CapitalCity.TheExodar,
  CapitalCity.ShattrathCity,
  CapitalCity.Dalaran,
]);

export interface MapDisplayData {
  uid: string;
  mapId: number;
  imageUrl: string;
  area: WorldMapArea;
  points: RenderedPoint[];
}

/**
 * Projects (x, y) world coordinates onto a map tile image.
 * Returns fractions in [0, 1] for CSS left/top, or null if the point is
 * outside this area's bounds.
 *
 * @param x  position_x — North/South (mapped via LocTop / LocBottom)
 * @param y  position_y — East/West   (mapped via LocLeft / LocRight)
 */
export function worldToMapPercent(x: number, y: number, area: WorldMapArea): { left: number; top: number } | null {
  const left = (area.LocLeft - y) / (area.LocLeft - area.LocRight);
  const top = (area.LocTop - x) / (area.LocTop - area.LocBottom);

  // Small margin (aowow uses 0.1/99.9 on a 0-100 scale): points essentially on a shared box edge are
  // ambiguous between adjacent zones, so don't count them as in-bounds.
  const EPS = 0.001;
  if (left < EPS || left > 1 - EPS || top < EPS || top > 1 - EPS) return null;

  return { left, top };
}

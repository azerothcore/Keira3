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
}

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

  if (left < 0 || left > 1 || top < 0 || top > 1) return null;

  return { left, top };
}
